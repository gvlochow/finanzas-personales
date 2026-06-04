"use client";

import { Category } from "@/types";

interface CategorySelectorProps {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
  type: "income" | "expense";
}

export default function CategorySelector({ categories, value, onChange, type }: CategorySelectorProps) {
  const filtered = categories.filter((c) => c.type === type && c.is_active);
  const parents = filtered.filter((c) => c.parent_id === null).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
    >
      <option value="">Seleccionar categoría</option>
      {parents.map((parent) => {
        const children = filtered
          .filter((c) => c.parent_id === parent.id)
          .sort((a, b) => a.sort_order - b.sort_order);

        if (children.length === 0) {
          return (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          );
        }

        return (
          <optgroup key={parent.id} label={parent.name}>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
