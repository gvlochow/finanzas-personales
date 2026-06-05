"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatCLP, getCurrentMonthYear } from "@/lib/utils";
import { Transaction, Category } from "@/types";
import MonthSelector from "@/components/MonthSelector";
import TransactionForm from "@/components/TransactionForm";
import { Plus, Trash2, Pencil, X } from "lucide-react";

export default function TransactionsPage() {
  const init = getCurrentMonthYear();
  const [month, setMonth] = useState(init.month);
  const [year, setYear] = useState(init.year);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCat, setFilterCat] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  async function loadData() {
    setLoading(true);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const [txRes, catRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*, categories(id, name, type, parent_id), payment_methods(name)")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false }),
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    ]);

    if (txRes.data) setTransactions(txRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  }

  async function deleteTransaction(id: string) {
    if (!confirm("¿Eliminar esta transacción?")) return;
    await supabase.from("transactions").delete().eq("id", id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function handleEditSave() {
    setEditingTx(null);
    loadData();
  }

  function getCategoryLabel(t: Transaction): string {
    const cat = t.categories as { name: string; parent_id: string | null } | undefined;
    if (!cat) return "—";
    if (cat.parent_id) {
      const parent = categories.find((c) => c.id === cat.parent_id);
      return parent ? `${parent.name} › ${cat.name}` : cat.name;
    }
    return cat.name;
  }

  const filtered = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCat && t.category_id !== filterCat) return false;
    return true;
  });

  const visibleCats = categories.filter(
    (c) => filterType === "all" || c.type === filterType
  );

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-primary">Transacciones</h1>
      </div>

      <MonthSelector
        month={month}
        year={year}
        onChange={(m, y) => { setMonth(m); setYear(y); }}
      />

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {(["all", "expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setFilterType(t); setFilterCat(""); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === t
                  ? t === "income"
                    ? "bg-income text-cream"
                    : t === "expense"
                    ? "bg-expense text-cream"
                    : "bg-primary text-cream"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {t === "all" ? "Todos" : t === "income" ? "Ingresos" : "Gastos"}
            </button>
          ))}
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas las categorías</option>
          {visibleCats.filter((c) => c.parent_id === null).map((parent) => {
            const children = visibleCats.filter((c) => c.parent_id === parent.id);
            if (children.length === 0) {
              return <option key={parent.id} value={parent.id}>{parent.name}</option>;
            }
            return (
              <optgroup key={parent.id} label={parent.name}>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            No hay transacciones para este período
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-center px-4 py-3 gap-3">
                <div
                  className={`w-1.5 h-10 rounded-full shrink-0 ${
                    t.type === "income" ? "bg-income" : "bg-expense"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {getCategoryLabel(t)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t.date}{t.description ? ` · ${t.description}` : ""}
                    {(t.payment_methods as { name: string } | undefined)?.name
                      ? ` · ${(t.payment_methods as { name: string }).name}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold shrink-0 ${
                    t.type === "income" ? "text-income" : "text-expense"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}{formatCLP(t.amount)}
                </span>
                <button
                  onClick={() => setEditingTx(t)}
                  className="p-1.5 text-gray-300 hover:text-primary transition-colors shrink-0"
                  aria-label="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="p-1.5 text-gray-300 hover:text-expense transition-colors shrink-0"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/transactions/new"
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-cream rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
      >
        <Plus size={24} />
      </Link>

      {/* Edit modal */}
      {editingTx && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditingTx(null)}
          />
          <div className="relative w-full bg-cream rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-cream flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-primary">Editar transacción</h2>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <TransactionForm
                key={editingTx.id}
                initialData={editingTx}
                onSave={handleEditSave}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
