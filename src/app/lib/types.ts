
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
  assistant: string;
  searchPlaceholder: string;
  addToCart: string;
  checkout: string;
  total: string;
  status: string;
  emptyCart: string;
  confirmOrder: string;
  aiAssistantTitle: string;
  aiAssistantDesc: string;
  aiChatPlaceholder: string;
  aiChatWelcome: string;
  admin: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    shop: 'Shop',
    orders: 'Orders',
    assistant: 'Assistant',
    searchPlaceholder: 'Search products...',
    addToCart: 'Add to Cart',
    checkout: 'Checkout',
    total: 'Total',
    status: 'Status',
    emptyCart: 'Your cart is empty',
    confirmOrder: 'Confirm Order',
    aiAssistantTitle: 'Smart Assistant',
    aiAssistantDesc: 'Order by typing naturally',
    aiChatPlaceholder: 'e.g. "I want 3 crates of water"',
    aiChatWelcome: 'Hello! Tell me what you need, and I will add it to your cart.',
    admin: 'Admin',
  },
  am: {
    shop: 'ምርቶች',
    orders: 'ትዕዛዞች',
    assistant: 'ረዳት',
    searchPlaceholder: 'ምርቶችን ይፈልጉ...',
    addToCart: 'ወደ ጋሪ ጨምር',
    checkout: 'ትዕዛዝ አጠናቅ',
    total: 'ጠቅላላ',
    status: 'ሁኔታ',
    emptyCart: 'ጋሪዎ ባዶ ነው',
    confirmOrder: 'ትዕዛዝ አረጋግጥ',
    aiAssistantTitle: 'ብልጥ ረዳት',
    aiAssistantDesc: 'በመጻፍ ብቻ እቃዎችን ይዘዙ',
    aiChatPlaceholder: 'ለምሳሌ "3 የታሸገ ውሃ እፈልጋለሁ"',
    aiChatWelcome: 'ሰላም! የሚፈልጉትን ይንገሩኝ፣ እኔ ወደ ጋሪዎ እጨምራለሁ።',
    admin: 'አስተዳዳሪ',
  },
};
