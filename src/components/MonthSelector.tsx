"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthName } from "@/lib/utils";

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export default function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  function prev() {
    if (month === 1) {
      onChange(12, year - 1);
    } else {
      onChange(month - 1, year);
    }
  }

  function next() {
    if (month === 12) {
      onChange(1, year + 1);
    } else {
      onChange(month + 1, year);
    }
  }

  return (
    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
      <button onClick={prev} className="p-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
        <ChevronLeft size={20} className="text-gray-600" />
      </button>
      <span className="font-semibold text-primary text-sm">
        {getMonthName(month)} {year}
      </span>
      <button onClick={next} className="p-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
        <ChevronRight size={20} className="text-gray-600" />
      </button>
    </div>
  );
}
