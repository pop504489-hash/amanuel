
export type Product = {
  id: string;
  name: string;
  nameAm: string;
  description: string;
  price: number;
  imageUrl: string;
  unit: string;
  category: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type OrderStatus = 'Pending' | 'Out for Delivery' | 'Delivered';

export type Order = {
  id: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: OrderStatus;
};

export type Language = 'en' | 'am';

export interface Translation {
  shop: string;
  orders: string;
  insights: string;
  searchPlaceholder: string;
  addToCart: string;
  checkout: string;
  total: string;
  status: string;
  reorderTitle: string;
  reorderDesc: string;
  emptyCart: string;
  confirmOrder: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    shop: 'Shop Catalog',
    orders: 'Order History',
    insights: 'AI Predictions',
    searchPlaceholder: 'Smart Search (e.g. "2 crates of cola")',
    addToCart: 'Add to Cart',
    checkout: 'Checkout',
    total: 'Total',
    status: 'Status',
    reorderTitle: 'AI Reorder Suggestions',
    reorderDesc: 'Based on your recent shop trends',
    emptyCart: 'Your cart is empty',
    confirmOrder: 'Confirm Order',
  },
  am: {
    shop: 'የምርት ዝርዝር',
    orders: 'የትዕዛዝ ታሪክ',
    insights: 'AI ትንበያዎች',
    searchPlaceholder: 'ብልጥ ፍለጋ (ለምሳሌ "2 ክሬት ኮላ")',
    addToCart: 'ወደ ጋሪ ጨምር',
    checkout: 'ትዕዛዝ አጠናቅ',
    total: 'ጠቅላላ',
    status: 'ሁኔታ',
    reorderTitle: 'የ AI ዳግም ትዕዛዝ ጥቆማዎች',
    reorderDesc: 'ባለፉት ግዢዎችዎ ላይ በመመስረት',
    emptyCart: 'ጋሪዎ ባዶ ነው',
    confirmOrder: 'ትዕዛዝ አረጋግጥ',
  },
};
