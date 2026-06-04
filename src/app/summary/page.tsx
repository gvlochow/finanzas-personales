"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCLP, getCurrentMonthYear } from "@/lib/utils";
import { Category, Budget, Transaction } from "@/types";
import MonthSelector from "@/components/MonthSelector";

interface SummaryRow {
  parent: Category;
  children: {
    category: Category;
    executed: number;
    budget: number;
  }[];
  executed: number;
  budget: number;
}

export default function SummaryPage() {
  const init = getCurrentMonthYear();
  const [month, setMonth] = useState(init.month);
  const [year, setYear] = useState(init.year);
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  async function loadData() {
    setLoading(true);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const [catRes, budgetRes, txRes] = await Promise.all([
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("budgets").select("*").eq("year", year).eq("month", month),
      supabase.from("transactions").select("*").gte("date", startDate).lte("date", endDate),
    ]);

    const categories: Category[] = catRes.data ?? [];
    const budgets: Budget[] = budgetRes.data ?? [];
    const transactions: Transaction[] = txRes.data ?? [];

    const incomeTotal = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    setTotalIncome(incomeTotal);

    const expenseParents = categories.filter((c) => c.type === "expense" && c.parent_id === null);

    const summaryRows: SummaryRow[] = expenseParents.map((parent) => {
      const children = categories
        .filter((c) => c.parent_id === parent.id)
        .sort((a, b) => a.sort_order - b.sort_order);

      let parentExecuted = 0;
      let parentBudget = 0;

      const childRows = children.map((child) => {
        const executed = transactions
          .filter((t) => t.type === "expense" && t.category_id === child.id)
          .reduce((s, t) => s + t.amount, 0);
        const budget = budgets.find((b) => b.category_id === child.id)?.amount ?? 0;
        parentExecuted += executed;
        parentBudget += budget;
        return { category: child, executed, budget };
      });

      if (children.length === 0) {
        const executed = transactions
          .filter((t) => t.type === "expense" && t.category_id === parent.id)
          .reduce((s, t) => s + t.amount, 0);
        const budget = budgets.find((b) => b.category_id === parent.id)?.amount ?? 0;
        parentExecuted = executed;
        parentBudget = budget;
      }

      return {
        parent,
        children: childRows,
        executed: parentExecuted,
        budget: parentBudget,
      };
    });

    setRows(summaryRows.filter((r) => r.executed > 0 || r.budget > 0 || r.children.length > 0));
    setLoading(false);
  }

  const totalExpense = rows.reduce((s, r) => s + r.executed, 0);
  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);

  function diffColor(exec: number, budget: number): string {
    if (budget === 0) return "text-gray-500";
    return exec <= budget ? "text-income" : "text-expense";
  }

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-primary">Resumen mensual</h1>
      </div>

      <MonthSelector
        month={month}
        year={year}
        onChange={(m, y) => { setMonth(m); setYear(y); }}
      />

      {/* Totals */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Ingresos</p>
          <p className="text-sm font-bold text-income">{formatCLP(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Gastos</p>
          <p className="text-sm font-bold text-expense">{formatCLP(totalExpense)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Presupuesto</p>
          <p className="text-sm font-bold text-primary">{formatCLP(totalBudget)}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400 shadow-sm">
          Cargando...
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-4 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
            <span className="col-span-2">Categoría</span>
            <span className="text-right">Ejecutado</span>
            <span className="text-right">Presupuesto</span>
          </div>

          {rows.map((row) => (
            <div key={row.parent.id}>
              {/* Parent row */}
              <div className="grid grid-cols-4 px-4 py-2.5 border-b border-gray-50 bg-gray-50">
                <span className="col-span-2 text-xs font-bold text-gray-700">{row.parent.name}</span>
                <span className={`text-xs font-semibold text-right ${diffColor(row.executed, row.budget)}`}>
                  {formatCLP(row.executed)}
                </span>
                <span className="text-xs text-gray-500 text-right">
                  {row.budget > 0 ? formatCLP(row.budget) : "—"}
                </span>
              </div>

              {/* Child rows */}
              {row.children.map(({ category, executed, budget }) => (
                <div
                  key={category.id}
                  className="grid grid-cols-4 px-4 py-2 border-b border-gray-50"
                >
                  <span className="col-span-2 text-xs text-gray-600 pl-3">
                    {category.name}
                  </span>
                  <span className={`text-xs text-right ${diffColor(executed, budget)}`}>
                    {executed > 0 ? formatCLP(executed) : "—"}
                  </span>
                  <span className="text-xs text-gray-400 text-right">
                    {budget > 0 ? formatCLP(budget) : "—"}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {rows.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">
              Sin datos para este período
            </div>
          )}
        </div>
      )}
    </div>
  );
}
