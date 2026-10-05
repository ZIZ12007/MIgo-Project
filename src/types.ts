export type UserRole = "admin" | "sales" | "technician" | "customer";

export interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  gender?: string;
  phone_number?: string;
  date_registered: string;
}

export type CustomerType = "retail" | "wholesale";

export interface Customer {
  customer_id: number;
  customer_name: string;
  customer_type: CustomerType;
  phone_number: string;
  email?: string;
  telegram?: string;
  date_registered: string;
  total_spent: number;
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_number: string;
  email: string;
  address?: string;
}

export interface Gadget {
  gadget_id: number;
  gadget_name: string;
  branch: string;
  model: string;
  unit_price: number;
  quantity_in_stock: number;
  supplier_id: number;
}

export type OrderStatus = "pending" | "shipped" | "delivered";

export interface OrderItem {
  gadget_id: number;
  gadget_name: string;
  quantity_ordered: number;
  sub_total: number;
}

export type PaymentMethod = "cash" | "card" | "transfer";

export interface Payment {
  payment_amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
}

export interface SalesOrder {
  sales_order_id: number;
  customer_id: number;
  customer_name: string;
  order_date: string;
  order_status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  payment?: Payment;
}

export interface Technician {
  technician_id: number;
  name: string;
  specialization: string;
  phone: string;
  status: "active" | "inactive";
}

export type RepairStatus = "received" | "in_progress" | "ready" | "delivered";

export interface RepairJob {
  repair_job_id: number;
  customer_id: number;
  customer_name: string;
  device_name: string;
  device_model: string;
  defect_description: string;
  status: RepairStatus;
  cost_estimate: number;
  actual_cost?: number;
  assigned_technician_id?: number;
  date_created: string;
  date_completed?: string;
  notes?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockItems: number;
  activeRepairs: number;
}
