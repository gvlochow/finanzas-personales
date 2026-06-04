export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string | null;
  category_id: string;
  payment_method_id: string | null;
  amount: number;
  type: "income" | "expense";
  created_at: string;
  categories?: Category;
  payment_methods?: PaymentMethod;
}

export interface Budget {
  id: string;
  category_id: string;
  year: number;
  month: number;
  amount: number;
  categories?: Category;
}
