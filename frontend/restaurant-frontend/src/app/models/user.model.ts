export interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'manager';
    contact_info?: string;
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
  }
  
  export interface Reservation {
    id: number;
    table_number: string;
    capacity: number;
    type: string;
    current_customer_name?: string;
    reservation_time: string;
  }