'use client';

import { useState } from 'react';
import { Header } from '@/app/components/Header';
import { ProductCard } from '@/app/components/ProductCard';
import { OrderHistory } from '@/app/components/OrderHistory';
import { AIInsights } from '@/app/components/AIInsights';
import { AdminPanel } from '@/app/components/AdminPanel';
import { CartSidebar } from '@/app/components/CartSidebar';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Language, CartItem, Order, translations, Product } from '@/app/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { LayoutGrid, ClipboardList, BrainCircuit, ShieldCheck, Loader2 } from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  
  // Fix: useFirestore returns the instance directly, do not destructure
  const firestore = useFirestore();
  const t = translations[language];

  // 1. Fetch Real Products from Firestore
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  // 2. Cart Logic
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
      const product = products?.find(p => p.id === res.id);
      if (product) {
        updateQuantity(res.id, res.quantity || 1);
        toast({ title: `Added to cart`, description: `${res.quantity || 1}x ${product.name} added.` });
      }
    });
    setIsCartOpen(true);
  };

  const handleCheckout = () => {
    toast({ title: "Order Recording Implemented", description: "In a full app, this would save to /users/{uid}/orders in Firestore." });
    setCart([]);
    setIsCartOpen(false);
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        cartCount={totalItemsInCart}
        availableProducts={products || []}
        onSearch={handleSmartSearchResults}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="shop" className="space-y-8">
          <TabsList className="grid grid-cols-4 h-14 p-1 bg-muted/50 rounded-2xl w-full sm:w-[640px] mx-auto border shadow-sm">
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
            <TabsTrigger value="admin" className="rounded-xl data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground font-bold gap-2">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            {productsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-bold">Syncing with warehouse...</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    language={language}
                    quantity={cart.find(item => item.productId === product.id)?.quantity || 0}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed">
                <LayoutGrid className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No products available yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none max-w-4xl mx-auto">
            <OrderHistory orders={[]} language={language} />
            <p className="text-center text-muted-foreground mt-8 italic">Order history is currently static for this demo.</p>
          </TabsContent>

          <TabsContent value="insights" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none max-w-4xl mx-auto">
            <AIInsights 
              pastOrders={[]} 
              language={language} 
              onApplySuggestion={(pid, qty) => {
                updateQuantity(pid, qty);
                setIsCartOpen(true);
              }} 
            />
          </TabsContent>

          <TabsContent value="admin" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </main>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <CartSidebar 
          cart={cart} 
          products={products || []} 
          language={language}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onCheckout={handleCheckout}
        />
      </Sheet>
    </div>
  );
}