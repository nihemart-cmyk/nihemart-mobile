export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  brand?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  deliveryAddress: string;
  riderId?: string;
  riderName?: string;
}

export interface DeliveryOrder extends Order {
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryFee: number;
  distance: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  totalDeliveries: number;
  earnings: number;
}

export type AppMode = 'user' | 'rider';
