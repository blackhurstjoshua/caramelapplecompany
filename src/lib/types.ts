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
export interface DateAvailability {
  date: string; // YYYY-MM-DD format
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  reason?: string;
}

export interface ScheduleData {
  dateAvailability: DateAvailability[]; // Array of date availability settings
  // Legacy support - will be removed
  blockedDates?: string[];
} 