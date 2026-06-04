import Link from "next/link";
import TransactionForm from "@/components/TransactionForm";
import { ArrowLeft } from "lucide-react";

export default function NewTransactionPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/transactions"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-primary">Nueva transacción</h1>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <TransactionForm />
      </div>
    </div>
  );
}
