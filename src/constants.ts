import { Product, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'dresses', name: 'Dresses', image: 'https://images.unsplash.com/photo-1539008835270-30356e79c490?w=400&h=600&fit=crop' },
  { id: 'tops', name: 'Tops', image: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=400&h=600&fit=crop' },
  { id: 'bottoms', name: 'Bottoms', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop' },
  { id: 'shoes', name: 'Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=600&fit=crop' },
  { id: 'accessories', name: 'Accessories', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=600&fit=crop' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Glacious Pink Satin Dress',
    price: 45.99,
    originalPrice: 65.00,
    description: 'A stunning hot pink satin dress perfect for any party.',
    category: 'dresses',
    images: [
      'https://images.unsplash.com/photo-1539008835270-30356e79c490?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Hot Pink', 'White'],
    inStock: true,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 124,
  },
  {
    id: '2',
    name: 'Trendy White Crop Top',
    price: 19.99,
    description: 'Minimalist white crop top for a clean look.',
    category: 'tops',
    images: [
      'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop'
    ],
    sizes: ['XS', 'S', 'M'],
    colors: ['White'],
    inStock: true,
    isFeatured: true,
    rating: 4.5,
    reviewsCount: 89,
  },
  {
    id: '3',
    name: 'High-Waist Flare Jeans',
    price: 34.99,
    originalPrice: 49.99,
    description: 'Classic flare jeans with a modern high-waist fit.',
    category: 'bottoms',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=800&fit=crop'
    ],
    sizes: ['26', '28', '30', '32'],
    colors: ['Blue', 'Black'],
    inStock: true,
    rating: 4.2,
    reviewsCount: 56,
  },
  {
    id: '4',
    name: 'Glacious Sparkle Heels',
    price: 59.99,
    description: 'Elegant sparkle heels to complete your outfit.',
    category: 'shoes',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=800&fit=crop'
    ],
    sizes: ['36', '37', '38', '39', '40'],
    colors: ['Silver', 'Pink'],
    inStock: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 210,
  },
  {
    id: '5',
    name: 'Summer Breeze Linen Shirt',
    price: 29.99,
    description: 'Lightweight and breathable linen shirt for hot summer days.',
    category: 'tops',
    collection: 'summer-essentials',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523381235312-3a1647fa9917?w=600&h=800&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Beige', 'Light Blue'],
    inStock: true,
    rating: 4.7,
    reviewsCount: 45,
  },
  {
    id: '6',
    name: 'Midnight Glamour Mini Dress',
    price: 54.99,
    originalPrice: 75.00,
    description: 'A chic black mini dress for an unforgettable night out.',
    category: 'dresses',
    collection: 'night-out',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Emerald'],
    inStock: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 156,
  },
  {
    id: '7',
    name: 'Tropical Print Swim Trunks',
    price: 24.99,
    description: 'Vibrant tropical print swim trunks for your next beach trip.',
    category: 'bottoms',
    collection: 'summer-essentials',
    images: [
      'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1534126416832-a88fdf2911c2?w=600&h=800&fit=crop'
    ],
    sizes: ['M', 'L', 'XL'],
    colors: ['Multi'],
    inStock: true,
    rating: 4.4,
    reviewsCount: 32,
  },
  {
    id: '8',
    name: 'Glacious Leather Clutch',
    price: 39.99,
    description: 'Sleek leather clutch to carry your essentials for a night out.',
    category: 'accessories',
    collection: 'night-out',
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fd15dcb4?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop'
    ],
    sizes: ['One Size'],
    colors: ['Black', 'Gold'],
    inStock: true,
    rating: 4.8,
    reviewsCount: 78,
  },
  {
    id: '9',
    name: 'Baby Summer Romper',
    price: 14.99,
    description: 'Adorable cotton romper for babies, perfect for summer days.',
    category: 'tops',
    collection: 'summer-essentials',
    images: [
      'https://images.unsplash.com/photo-1522771935876-249711cdca47?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1519235106638-30cc49b4f434?w=600&h=800&fit=crop'
    ],
    sizes: ['0-3M', '3-6M', '6-12M'],
    colors: ['Yellow', 'White'],
    inStock: true,
    rating: 4.9,
    reviewsCount: 42,
  },
  {
    id: '10',
    name: 'Baby Party Suit',
    price: 24.99,
    description: 'A tiny formal suit for your baby\'s first night out.',
    category: 'bottoms',
    collection: 'night-out',
    images: [
      'https://images.unsplash.com/photo-1519706824391-0947707371f0?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1519278406113-5930e639e4a4?w=600&h=800&fit=crop'
    ],
    sizes: ['6-12M', '12-18M', '18-24M'],
    colors: ['Blue', 'Grey'],
    inStock: true,
    rating: 5.0,
    reviewsCount: 15,
  },
];

export const COMPANY_INFO = {
  phone: '+263 774 711 615',
  address: 'Shop D1 Sunset Mall, Corner Mbuya Nehanda and Speke',
  email: 'glacioustrendy@gmail.com',
};
