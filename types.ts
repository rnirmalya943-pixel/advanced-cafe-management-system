export interface User {
  id: number;
  username: string;
  role: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category?: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: number;
  customer: string;
  item: string;
  qty: number;
  total: number;
  date: string;
  status?: string;
  created_at?: string;
  items?: OrderItem[];
}

export interface ReportData {
  totalSales: number | null;
  totalOrders: number | null;
  topItems?: { name: string, value: number }[];
  peakHours?: { time: string, orders: number }[];
}
