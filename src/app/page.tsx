
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { ProductCard } from '@/app/components/ProductCard';
import { OrderHistory } from '@/app/components/OrderHistory';
import { AIInsights } from '@/app/components/AIInsights';
import { CartSidebar } from '@/app/components/CartSidebar';
import { MOCK_PRODUCTS, MOCK_ORDERS } from '@/app/lib/mock-data';
import { Language, CartItem, Order, translations } from '@/app/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { LayoutGrid, ClipboardList, BrainCircuit } from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  const t = translations[language];

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + delta);
        if (newQty === 0) return prev.filter(item => item.productId !== productId);
        return prev.map(item => item.productId === productId ? { ...item, quantity: newQty } : item);
      }
      if (delta > 0) return [...prev, { productId, quantity: delta }];
      return prev;
    });
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleSmartSearchResults = (results: { id: string, quantity?: number }[]) => {
    if (results.length === 0) {
      toast({ title: "No items found", description: "Try searching with different keywords.", variant: "destructive" });
      return;
    }

    results.forEach(res => {
      const product = MOCK_PRODUCTS.find(p => p.id === res.id);
      if (product) {
        updateQuantity(res.id, res.quantity || 1);
        toast({ title: `Added to cart`, description: `${res.quantity || 1}x ${product.name} added.` });
      }
    });
    setIsCartOpen(true);
  };

  const handleCheckout = () => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      items: cart.map(item => {
        const p = MOCK_PRODUCTS.find(prod => prod.id === item.productId)!;
        return { productId: item.productId, productName: p.name, quantity: item.quantity, price: p.price };
      }),
      total: cart.reduce((sum, item) => sum + (MOCK_PRODUCTS.find(p => p.id === item.productId)!.price * item.quantity), 0),
      status: 'Pending',
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsCartOpen(false);
    toast({ title: "Order Placed Successfully", description: "You can track it in your dashboard." });
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        cartCount={totalItemsInCart}
        availableProducts={MOCK_PRODUCTS}
        onSearch={handleSmartSearchResults}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="shop" className="space-y-8">
          <TabsList className="grid grid-cols-3 h-14 p-1 bg-muted/50 rounded-2xl w-full sm:w-[500px] mx-auto border shadow-sm">
            <TabsTrigger value="shop" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2">
              <LayoutGrid className="h-4 w-4" />
              {t.shop}
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2">
              <ClipboardList className="h-4 w-4" />
              {t.orders}
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold gap-2">
              <BrainCircuit className="h-4 w-4" />
              {t.insights}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {MOCK_PRODUCTS.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  language={language}
                  quantity={cart.find(item => item.productId === product.id)?.quantity || 0}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none max-w-4xl mx-auto">
            <OrderHistory orders={orders} language={language} />
          </TabsContent>

          <TabsContent value="insights" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none max-w-4xl mx-auto">
            <AIInsights 
              pastOrders={orders} 
              language={language} 
              onApplySuggestion={(pid, qty) => {
                updateQuantity(pid, qty);
                setIsCartOpen(true);
                toast({ title: "Suggestion Added", description: `Added predicted quantity to your cart.` });
              }} 
            />
          </TabsContent>
        </Tabs>
      </main>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <CartSidebar 
          cart={cart} 
          products={MOCK_PRODUCTS} 
          language={language}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onCheckout={handleCheckout}
        />
      </Sheet>
    </div>
  );
}
