// Table component types
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

// Sample data types for demonstration
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalOrders: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  items: string[];
}

// Schedule types
export interface ScheduleData {
  blockedDates: string[]; // Array of blocked dates in YYYY-MM-DD format
} 