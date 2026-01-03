export interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'manager' | 'admin';
    contact_info?: string;
    created_at?: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    message?: string;
  }
  
  export interface Table {
    id: number;
    table_number: string;
    capacity: number;
    type: 'regular' | 'vip';
    status: 'available' | 'occupied' | 'reserved';
    current_customer_name?: string;
    reservation_time?: string;
    queue_position?: number;
  }
  
  export interface QueueItem {
    id: number;
    table_number: string;
    capacity: number;
    type: string;
    current_customer_name: string;
    queue_position: number;
    customer_email?: string;
    contact_info?: string;
  }
  
  export interface Reservation {
    id: number;
    table_number: string;
    capacity: number;
    type: string;
    current_customer_name?: string;
    reservation_time: string;
    customer_email?: string;
    contact_info?: string;
  }
  
  export interface AnalyticsData {
    users: { role: string; count: number }[];
    tables: {
      total_tables: number;
      available: number;
      occupied: number;
      reserved: number;
      vip_tables: number;
      regular_tables: number;
    };
    queue: { queue_count: number };
    reservations: { reservation_count: number };
    recentActivity: any[];
  }