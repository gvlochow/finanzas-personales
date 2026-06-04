"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCLP, getCurrentMonthYear } from "@/lib/utils";
import { Category } from "@/types";
import MonthSelector from "@/components/MonthSelector";
import { Save } from "lucide-react";

interface BudgetEntry {
  categoryId: string;
  value: string;
  saved: boolean;
}

export default function BudgetsPage() {
  const init = getCurrentMonthYear();
  const [month, setMonth] = useState(init.month);
  const [year, setYear] = useState(init.year);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Record<string, BudgetEntry>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  async function loadData() {
    setLoading(true);
    const [catRes, budgetRes] = await Promise.all([
      supabase.from("categories").select("*").eq("type", "expense").eq("is_active", true).order("sort_order"),
      supabase.from("budgets").select("*").eq("year", year).eq("month", month),
    ]);

    const cats: Category[] = catRes.data ?? [];
    setCategories(cats);

    const map: Record<string, BudgetEntry> = {};
    cats.forEach((c) => {
      const existing = budgetRes.data?.find((b) => b.category_id === c.id);
      map[c.id] = {
        categoryId: c.id,
        value: existing ? String(existing.amount) : "",
        saved: !!existing,
      };
    });
    setBudgets(map);
    setLoading(false);
  }

  async function saveBudget(categoryId: string) {
    const entry = budgets[categoryId];
    const amount = parseInt(entry.value);
    if (!entry.value || isNaN(amount) || amount < 0) return;

    setSaving(categoryId);
    const { error } = await supabase.from("budgets").upsert(
      { category_id: categoryId, year, month, amount },
      { onConflict: "category_id,year,month" }
    );

    if (!error) {
      setBudgets((prev) => ({
        ...prev,
        [categoryId]: { ...prev[categoryId], saved: true },
      }));
    }
    setSaving(null);
  }

  const parents = categories.filter((c) => c.parent_id === null);

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-primary">Presupuestos</h1>
      </div>

      <MonthSelector
        month={month}
        year={year}
        onChange={(m, y) => { setMonth(m); setYear(y); }}
      />

      {loading ? (
        <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400 shadow-sm">Cargando...</div>
      ) : (
        <div className="space-y-4">
          {parents.map((parent) => {
            const children = categories
              .filter((c) => c.parent_id === parent.id)
              .sort((a, b) => a.sort_order - b.sort_order);

            const rows = children.length > 0 ? children : [parent];
            const isParentOnly = children.length === 0;

            return (
              <div key={parent.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    {isParentOnly ? parent.name : parent.name}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {rows.map((cat) => {
                    const entry = budgets[cat.id];
                    if (!entry) return null;
                    return (
                      <div key={cat.id} className="flex items-center px-4 py-3 gap-3">
                        <span className="flex-1 text-sm text-gray-700">
                          {isParentOnly ? cat.name : cat.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              value={entry.value}
                              onChange={(e) =>
                                setBudgets((prev) => ({
                                  ...prev,
                                  [cat.id]: { ...prev[cat.id], value: e.target.value, saved: false },
                                }))
                              }
                              placeholder="0"
                              className="w-32 pl-6 pr-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <button
                            onClick={() => saveBudget(cat.id)}
                            disabled={saving === cat.id || !entry.value}
                            className={`p-1.5 rounded-lg transition-colors ${
                              entry.saved
                                ? "text-income"
                                : "text-primary hover:bg-primary/10"
                            } disabled:opacity-40`}
                          >
                            <Save size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {children.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Total:{" "}
                      <span className="font-semibold text-primary">
                        {formatCLP(
                          children.reduce((s, c) => {
                            const v = parseInt(budgets[c.id]?.value ?? "0");
                            return s + (isNaN(v) ? 0 : v);
                          }, 0)
                        )}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
