"use client";

import { useState } from "react";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AmountInput({ value, onChange, placeholder = "0" }: AmountInputProps) {
  const [focused, setFocused] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(raw);
  }

  function formatDisplay(raw: string): string {
    if (!raw) return "";
    const num = parseInt(raw, 10);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("es-CL").format(num);
  }

  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-gray-500 font-medium">$</span>
      <input
        type="text"
        inputMode="numeric"
        value={focused ? value : formatDisplay(value)}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-right font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
}
