export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Beef' | 'Chicken' | 'Cheese' | 'Vegetarian' | 'Fries' | 'Drinks' | 'Desserts';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  prepTime: string;
  calories: string;
  image: string;
  badge?: string;
  ingredients: string[];
  allergens: string[];
  spiceLevel?: number;
  isAvailable?: boolean;
  addOns?: { name: string; price: number }[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  customizations: string[];
  price: number;
}

export interface Order {
  id: string;
  table: string;
  customerName: string;
  type: 'Dine-in' | 'Pickup' | 'Delivery' | 'Walk-in';
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Cooking' | 'Ready' | 'Completed' | 'Delayed';
  items: OrderItem[];
  total: number;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded' | 'Pending Approval';
  paymentMethod: 'Cash' | 'Card' | 'Mobile Money' | 'Wallet' | '';
  createdAt: string;
  chef?: string;
  notes?: string;
  waiter?: string;
  priority: boolean;
  delayReason?: string;
  timeRemaining?: number; // In seconds
}

export interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  tags: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  photo: string;
  bio: string;
}

export interface InventoryItem {
  item: string;
  current: number;
  min: number;
  status: 'OK' | 'Low' | 'Critical';
}

export interface AttendanceLog {
  date: string;
  timeIn: string;
  timeOut?: string;
  type: 'Auto' | 'Manual';
  onTime: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'On duty' | 'Off' | 'Break' | 'Late';
  performance: number;
  shiftTime?: string;
  pin?: string;
  password?: string;
  isAccessEnabled?: boolean;
  attendanceLogs?: AttendanceLog[];
}

export interface CustomerIssue {
  id: string;
  customerName: string;
  type: 'Wrong Order' | 'Late Delivery' | 'Refund Request' | 'Food Quality' | 'Staff Complaint' | 'Technical';
  time: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  priority: 1 | 2 | 3 | 4 | 5;
  message: string;
  assignedTo?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
