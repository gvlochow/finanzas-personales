"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatCLP, getCurrentMonthYear, getMonthName } from "@/lib/utils";
import { Transaction } from "@/types";
import { TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";

export default function Dashboard() {
  const { month, year } = getCurrentMonthYear();
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const { data } = await supabase
        .from("transactions")
        .select("*, categories(name, type, parent_id), payment_methods(name)")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      if (data) {
        setIncome(data.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0));
        setExpense(data.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0));
        setRecent(data.slice(0, 5));
      }
      setLoading(false);
    }
    load();
  }, [month, year]);

  const balance = income - expense;

  function getCategoryLabel(t: Transaction): string {
    const cat = t.categories as { name: string; parent_id: string | null } | undefined;
    return cat?.name ?? "—";
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Balance</p>
        <h1 className="text-2xl font-bold text-primary">
          {getMonthName(month)} {year}
        </h1>
      </div>

      {/* Balance card */}
      <div
        className={`rounded-2xl p-5 text-cream ${
          balance >= 0 ? "bg-primary" : "bg-expense"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={16} className="opacity-70" />
          <span className="text-sm opacity-70">Balance del mes</span>
        </div>
        <p className="text-3xl font-bold">{loading ? "..." : formatCLP(balance)}</p>
      </div>

      {/* Income / Expense cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={16} className="text-income" />
            <span className="text-xs text-gray-500">Ingresos</span>
          </div>
          <p className="text-lg font-bold text-income">{loading ? "..." : formatCLP(income)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown size={16} className="text-expense" />
            <span className="text-xs text-gray-500">Gastos</span>
          </div>
          <p className="text-lg font-bold text-expense">{loading ? "..." : formatCLP(expense)}</p>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <h2 className="font-semibold text-sm text-gray-700">Últimas transacciones</h2>
          <Link href="/transactions" className="text-xs text-primary font-medium">Ver todas</Link>
        </div>
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-400">Cargando...</div>
        ) : recent.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">Sin transacciones este mes</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {getCategoryLabel(t)}
                  </p>
                  <p className="text-xs text-gray-400">{t.date}</p>
                </div>
                <span
                  className={`text-sm font-semibold ml-3 shrink-0 ${
                    t.type === "income" ? "text-income" : "text-expense"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}{formatCLP(t.amount)}
                </span>
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
    </div>
  );
}
