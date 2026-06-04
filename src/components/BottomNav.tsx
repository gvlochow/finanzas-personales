"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, BarChart2, Wallet } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/transactions", icon: Receipt, label: "Gastos" },
  { href: "/summary", icon: BarChart2, label: "Resumen" },
  { href: "/budgets", icon: Wallet, label: "Presupuesto" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-charcoal z-50">
      <div className="max-w-md mx-auto flex">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${
                active ? "text-cream" : "text-cream/50"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className={active ? "font-semibold" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
