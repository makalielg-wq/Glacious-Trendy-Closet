export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewsCount: number;
  createdAt?: any;
  collection?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface CartItem extends Product {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  address?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
  shippingAddress: string;
  paymentMethod?: string;
}
