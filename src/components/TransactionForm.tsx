"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { today } from "@/lib/utils";
import { Category, PaymentMethod, Transaction } from "@/types";
import CategorySelector from "./CategorySelector";
import AmountInput from "./AmountInput";

interface Props {
  initialData?: Transaction;
  onSave?: () => void;
}

export default function TransactionForm({ initialData, onSave }: Props = {}) {
  const router = useRouter();
  const [type, setType] = useState<"expense" | "income">(initialData?.type ?? "expense");
  const [date, setDate] = useState(initialData?.date ?? today());
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [paymentMethodId, setPaymentMethodId] = useState(initialData?.payment_method_id ?? "");
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [catRes, pmRes] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("payment_methods").select("*").eq("is_active", true).order("name"),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (pmRes.data) setPaymentMethods(pmRes.data);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) return setError("Selecciona una categoría");
    if (!amount || parseInt(amount) <= 0) return setError("Ingresa un monto válido");

    setLoading(true);
    setError("");

    const payload = {
      date,
      description: description || null,
      category_id: categoryId,
      payment_method_id: paymentMethodId || null,
      amount: parseInt(amount),
      type,
    };

    const { error: err } = initialData
      ? await supabase.from("transactions").update(payload).eq("id", initialData.id)
      : await supabase.from("transactions").insert(payload);

    setLoading(false);
    if (err) {
      setError("Error al guardar. Intenta de nuevo.");
    } else if (onSave) {
      onSave();
    } else {
      router.push("/transactions");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200">
        <button
          type="button"
          onClick={() => { setType("expense"); setCategoryId(""); }}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            type === "expense"
              ? "bg-expense text-cream"
              : "bg-white text-gray-500"
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => { setType("income"); setCategoryId(""); }}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            type === "income"
              ? "bg-income text-cream"
              : "bg-white text-gray-500"
          }`}
        >
          Ingreso
        </button>
      </div>

      {/* Monto */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Monto (CLP)</label>
        <AmountInput value={amount} onChange={setAmount} />
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
        <CategorySelector
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
          type={type}
        />
      </div>

      {/* Medio de pago */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Medio de pago (opcional)</label>
        <select
          value={paymentMethodId}
          onChange={(e) => setPaymentMethodId(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="">Sin especificar</option>
          {paymentMethods.map((pm) => (
            <option key={pm.id} value={pm.id}>{pm.name}</option>
          ))}
        </select>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Descripción (opcional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Compra en Jumbo"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {error && <p className="text-sm text-expense">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary text-cream font-semibold rounded-xl hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50"
      >
        {loading ? "Guardando..." : initialData ? "Actualizar transacción" : "Guardar transacción"}
      </button>
    </form>
  );
}
