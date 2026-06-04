"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category, PaymentMethod } from "@/types";
import { Pencil, Trash2, Plus, Check, X, AlertTriangle } from "lucide-react";

// ─── local state types ───────────────────────────────────────────────────────

interface CatEdit { id: string; name: string }
interface CatAdd  { parentId: string | null; type: "income" | "expense"; name: string }
interface PmEdit  { id: string; name: string }

interface DeleteConfirm {
  id: string;
  name: string;
  childCount: number;
  txCount: number;
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading,       setLoading]       = useState(true);

  const [catEdit,   setCatEdit]   = useState<CatEdit | null>(null);
  const [catAdd,    setCatAdd]    = useState<CatAdd  | null>(null);
  const [pmEdit,    setPmEdit]    = useState<PmEdit  | null>(null);
  const [pmAdding,  setPmAdding]  = useState(false);
  const [pmNewName, setPmNewName] = useState("");

  const [delConfirm, setDelConfirm] = useState<DeleteConfirm | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [catRes, pmRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("payment_methods").select("*").order("name"),
    ]);
    if (catRes.data)  setCategories(catRes.data);
    if (pmRes.data)   setPaymentMethods(pmRes.data);
    setLoading(false);
  }

  // ── toggles ────────────────────────────────────────────────────────────────

  async function toggleCategory(id: string, current: boolean) {
    const { error } = await supabase.from("categories").update({ is_active: !current }).eq("id", id);
    if (!error) setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
  }

  async function togglePM(id: string, current: boolean) {
    const { error } = await supabase.from("payment_methods").update({ is_active: !current }).eq("id", id);
    if (!error) setPaymentMethods(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
  }

  // ── category edit ──────────────────────────────────────────────────────────

  async function saveCatEdit() {
    if (!catEdit || !catEdit.name.trim()) return;
    const { error } = await supabase.from("categories").update({ name: catEdit.name.trim() }).eq("id", catEdit.id);
    if (!error) {
      setCategories(prev => prev.map(c => c.id === catEdit.id ? { ...c, name: catEdit.name.trim() } : c));
      setCatEdit(null);
    }
  }

  // ── category add ───────────────────────────────────────────────────────────

  async function saveCatAdd() {
    if (!catAdd || !catAdd.name.trim()) return;
    const siblings = categories.filter(c => c.type === catAdd.type && c.parent_id === catAdd.parentId);
    const maxOrder = siblings.reduce((m, c) => Math.max(m, c.sort_order), 0);

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: catAdd.name.trim(), type: catAdd.type, parent_id: catAdd.parentId, sort_order: maxOrder + 1, is_active: true })
      .select()
      .single();

    if (!error && data) {
      setCategories(prev => [...prev, data]);
      setCatAdd(null);
    }
  }

  // ── category delete ────────────────────────────────────────────────────────

  async function requestCatDelete(id: string) {
    setErrorMsg("");
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const childIds = categories.filter(c => c.parent_id === id).map(c => c.id);
    const allIds   = [id, ...childIds];

    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .in("category_id", allIds);

    setDelConfirm({ id, name: cat.name, childCount: childIds.length, txCount: count ?? 0 });
  }

  async function confirmCatDelete() {
    if (!delConfirm) return;
    setDelLoading(true);

    const childIds = categories.filter(c => c.parent_id === delConfirm.id).map(c => c.id);
    if (childIds.length > 0) {
      await supabase.from("categories").delete().in("id", childIds);
    }
    const { error } = await supabase.from("categories").delete().eq("id", delConfirm.id);

    if (!error) {
      const removed = new Set([delConfirm.id, ...childIds]);
      setCategories(prev => prev.filter(c => !removed.has(c.id)));
    }
    setDelLoading(false);
    setDelConfirm(null);
  }

  // ── payment-method edit / add / delete ─────────────────────────────────────

  async function savePmEdit() {
    if (!pmEdit || !pmEdit.name.trim()) return;
    const { error } = await supabase.from("payment_methods").update({ name: pmEdit.name.trim() }).eq("id", pmEdit.id);
    if (!error) {
      setPaymentMethods(prev => prev.map(p => p.id === pmEdit.id ? { ...p, name: pmEdit.name.trim() } : p));
      setPmEdit(null);
    }
  }

  async function savePmAdd() {
    if (!pmNewName.trim()) return;
    const { data, error } = await supabase
      .from("payment_methods")
      .insert({ name: pmNewName.trim(), is_active: true })
      .select()
      .single();
    if (!error && data) {
      setPaymentMethods(prev => [...prev, data]);
      setPmAdding(false);
      setPmNewName("");
    }
  }

  async function deletePM(id: string) {
    const pm = paymentMethods.find(p => p.id === id);
    if (!pm) return;
    setDelConfirm({ id: `pm:${id}`, name: pm.name, childCount: 0, txCount: 0 });
  }

  async function confirmPmDelete(rawId: string) {
    const id = rawId.replace("pm:", "");
    await supabase.from("payment_methods").delete().eq("id", id);
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    setDelConfirm(null);
  }

  // ─── derived ────────────────────────────────────────────────────────────────

  const incomeCategories = categories
    .filter(c => c.type === "income" && c.parent_id === null)
    .sort((a, b) => a.sort_order - b.sort_order);

  const expenseParents = categories
    .filter(c => c.type === "expense" && c.parent_id === null)
    .sort((a, b) => a.sort_order - b.sort_order);

  // ─── render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-4">
        <div className="pt-2 mb-4"><h1 className="text-xl font-bold text-primary">Configuración</h1></div>
        <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400 shadow-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 pb-24">
      <div className="pt-2"><h1 className="text-xl font-bold text-primary">Configuración</h1></div>

      {/* error banner */}
      {errorMsg && (
        <div className="bg-expense/10 border border-expense/30 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle size={15} className="text-expense shrink-0 mt-0.5" />
          <p className="flex-1 text-sm text-expense">{errorMsg}</p>
          <button onClick={() => setErrorMsg("")}><X size={15} className="text-expense/70" /></button>
        </div>
      )}

      {/* ── delete confirmation modal ── */}
      {delConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-expense/20 flex items-center justify-center shrink-0">
                <Trash2 size={16} className="text-expense" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  ¿Eliminar &quot;{delConfirm.name}&quot;?
                </h3>
                {delConfirm.childCount > 0 && (
                  <p className="text-xs text-gray-500">
                    Se eliminarán también sus {delConfirm.childCount} subcategoría(s).
                  </p>
                )}
                {delConfirm.txCount > 0 && (
                  <div className="mt-1.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-1.5">
                    <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      Esta categoría tiene <strong>{delConfirm.txCount}</strong> transacción(es) registrada(s).
                      Si la eliminas, esas transacciones quedarán sin categoría.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDelConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  delConfirm.id.startsWith("pm:")
                    ? confirmPmDelete(delConfirm.id)
                    : confirmCatDelete()
                }
                disabled={delLoading}
                className="flex-1 py-2.5 rounded-xl bg-expense hover:bg-expense/90 text-sm font-semibold text-cream disabled:opacity-50"
              >
                {delLoading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── payment methods ── */}
      <section>
        <h2 className="section-heading">Medios de pago</h2>
        <div className="card">
          {paymentMethods.map(pm =>
            pmEdit?.id === pm.id ? (
              <EditRow
                key={pm.id}
                value={pmEdit.name}
                onChange={v => setPmEdit({ id: pm.id, name: v })}
                onSave={savePmEdit}
                onCancel={() => setPmEdit(null)}
              />
            ) : (
              <div key={pm.id} className="row">
                <span className="flex-1 text-sm text-gray-700">{pm.name}</span>
                <Toggle active={pm.is_active} onToggle={() => togglePM(pm.id, pm.is_active)} />
                <ActionBtns
                  onEdit={() => setPmEdit({ id: pm.id, name: pm.name })}
                  onDelete={() => deletePM(pm.id)}
                />
              </div>
            )
          )}
          {pmAdding ? (
            <AddRow
              value={pmNewName}
              onChange={setPmNewName}
              onSave={savePmAdd}
              onCancel={() => { setPmAdding(false); setPmNewName(""); }}
              placeholder="Nombre del medio de pago"
            />
          ) : (
            <AddBtn label="Agregar medio de pago" onClick={() => setPmAdding(true)} />
          )}
        </div>
      </section>

      {/* ── income categories ── */}
      <section>
        <h2 className="section-heading">Categorías de ingresos</h2>
        <div className="card">
          {incomeCategories.map(c =>
            catEdit?.id === c.id ? (
              <EditRow
                key={c.id}
                value={catEdit.name}
                onChange={v => setCatEdit({ id: c.id, name: v })}
                onSave={saveCatEdit}
                onCancel={() => setCatEdit(null)}
              />
            ) : (
              <div key={c.id} className="row">
                <span className="flex-1 text-sm text-gray-700">{c.name}</span>
                <Toggle active={c.is_active} onToggle={() => toggleCategory(c.id, c.is_active)} />
                <ActionBtns
                  onEdit={() => setCatEdit({ id: c.id, name: c.name })}
                  onDelete={() => requestCatDelete(c.id)}
                />
              </div>
            )
          )}
          {catAdd?.parentId === null && catAdd?.type === "income" ? (
            <AddRow
              value={catAdd.name}
              onChange={v => setCatAdd({ ...catAdd, name: v })}
              onSave={saveCatAdd}
              onCancel={() => setCatAdd(null)}
              placeholder="Nombre del ingreso"
            />
          ) : (
            <AddBtn label="Agregar ingreso" onClick={() => setCatAdd({ parentId: null, type: "income", name: "" })} />
          )}
        </div>
      </section>

      {/* ── expense categories ── */}
      <section>
        <h2 className="section-heading">Categorías de gastos</h2>
        <div className="space-y-3">
          {expenseParents.map(parent => {
            const children = categories
              .filter(c => c.parent_id === parent.id)
              .sort((a, b) => a.sort_order - b.sort_order);
            const addingHere = catAdd?.parentId === parent.id;

            return (
              <div key={parent.id} className="card overflow-hidden">
                {catEdit?.id === parent.id ? (
                  <EditRow
                    value={catEdit.name}
                    onChange={v => setCatEdit({ id: parent.id, name: v })}
                    onSave={saveCatEdit}
                    onCancel={() => setCatEdit(null)}
                    className="bg-gray-50 border-b border-gray-100"
                  />
                ) : (
                  <div className="row bg-gray-50 border-b border-gray-100">
                    <span className="flex-1 text-xs font-bold text-gray-600 uppercase tracking-wide">
                      {parent.name}
                    </span>
                    <Toggle active={parent.is_active} onToggle={() => toggleCategory(parent.id, parent.is_active)} />
                    <ActionBtns
                      onEdit={() => setCatEdit({ id: parent.id, name: parent.name })}
                      onDelete={() => requestCatDelete(parent.id)}
                    />
                  </div>
                )}

                {children.map(child =>
                  catEdit?.id === child.id ? (
                    <EditRow
                      key={child.id}
                      value={catEdit.name}
                      onChange={v => setCatEdit({ id: child.id, name: v })}
                      onSave={saveCatEdit}
                      onCancel={() => setCatEdit(null)}
                      indent
                    />
                  ) : (
                    <div key={child.id} className="row border-t border-gray-50">
                      <span className="flex-1 text-sm text-gray-600 pl-3">{child.name}</span>
                      <Toggle active={child.is_active} onToggle={() => toggleCategory(child.id, child.is_active)} />
                      <ActionBtns
                        onEdit={() => setCatEdit({ id: child.id, name: child.name })}
                        onDelete={() => requestCatDelete(child.id)}
                      />
                    </div>
                  )
                )}

                {addingHere ? (
                  <AddRow
                    value={catAdd!.name}
                    onChange={v => setCatAdd({ ...catAdd!, name: v })}
                    onSave={saveCatAdd}
                    onCancel={() => setCatAdd(null)}
                    placeholder="Nombre de la subcategoría"
                    indent
                  />
                ) : (
                  <button
                    onClick={() => setCatAdd({ parentId: parent.id, type: "expense", name: "" })}
                    className="w-full flex items-center gap-1.5 px-4 py-2.5 text-xs text-primary hover:bg-primary/10 transition-colors border-t border-gray-50"
                  >
                    <Plus size={13} />
                    Agregar subcategoría
                  </button>
                )}
              </div>
            );
          })}

          <div className="card overflow-hidden">
            {catAdd?.parentId === null && catAdd?.type === "expense" ? (
              <AddRow
                value={catAdd.name}
                onChange={v => setCatAdd({ ...catAdd, name: v })}
                onSave={saveCatAdd}
                onCancel={() => setCatAdd(null)}
                placeholder="Nombre de la categoría"
              />
            ) : (
              <AddBtn
                label="Agregar categoría de gasto"
                onClick={() => setCatAdd({ parentId: null, type: "expense", name: "" })}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── sub-components ──────────────────────────────────────────────────────────

function EditRow({
  value, onChange, onSave, onCancel, className, indent,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
  indent?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 ${indent ? "pl-7" : ""} ${className ?? ""}`}>
      <input
        autoFocus
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        className="flex-1 text-sm border border-primary/40 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/25"
      />
      <button
        onClick={onSave}
        disabled={!value.trim()}
        className="p-1.5 text-income hover:bg-income/10 rounded-lg disabled:opacity-30 transition-colors"
      >
        <Check size={15} />
      </button>
      <button onClick={onCancel} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
        <X size={15} />
      </button>
    </div>
  );
}

function AddRow({
  value, onChange, onSave, onCancel, placeholder, indent,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  indent?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 border-t border-gray-100 ${indent ? "pl-7" : ""}`}>
      <input
        autoFocus
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        placeholder={placeholder ?? "Nombre"}
        className="flex-1 text-sm border border-primary/40 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-gray-300"
      />
      <button
        onClick={onSave}
        disabled={!value.trim()}
        className="p-1.5 text-income hover:bg-income/10 rounded-lg disabled:opacity-30 transition-colors"
      >
        <Check size={15} />
      </button>
      <button onClick={onCancel} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
        <X size={15} />
      </button>
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition-colors"
    >
      <Plus size={15} />
      {label}
    </button>
  );
}

function ActionBtns({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-0.5 ml-1">
      <button onClick={onEdit} className="p-1.5 text-gray-300 hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
        <Pencil size={13} />
      </button>
      <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-expense transition-colors rounded-lg hover:bg-expense/10">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{ height: 22, minWidth: 40 }}
      className={`relative rounded-full transition-colors ${active ? "bg-primary" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          active ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
