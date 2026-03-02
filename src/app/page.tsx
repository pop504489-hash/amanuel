
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { ProductCard } from '@/app/components/ProductCard';
import { OrderHistory } from '@/app/components/OrderHistory';
import { AIAssistant } from '@/app/components/AIAssistant';
import { AdminPanel } from '@/app/components/AdminPanel';
import { LoginForm } from '@/app/components/LoginForm';
import { CartSidebar } from '@/app/components/CartSidebar';
import { useFirestore, useCollection, useMemoFirebase, useUser, useAuth, initiateAnonymousSignIn } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Language, CartItem, Order, translations, Product } from '@/app/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { LayoutGrid, ClipboardList, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState<Language>('am'); // Default to Amharic
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const t = translations[language];

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'products'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

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
    let itemsAdded = 0;
    results.forEach(res => {
      const product = products?.find(p => p.id === res.id);
      if (product) {
        updateQuantity(res.id, res.quantity || 1);
        itemsAdded++;
      }
    });
    
    if (itemsAdded > 0) {
      toast({ 
        title: language === 'en' ? "Cart Updated" : "ጋሪው ተሻሽሏል", 
        description: language === 'en' ? `${itemsAdded} items added successfully.` : `${itemsAdded} እቃዎች በተሳካ ሁኔታ ተጨምረዋል።` 
      });
    }
  };

  const handleCheckout = () => {
    toast({ 
      title: language === 'en' ? "Order Placed" : "ትዕዛዝ ተልኳል", 
      description: language === 'en' ? "We are processing your order." : "ትዕዛዝዎን እያዘጋጀን ነው።" 
    });
    setCart([]);
    setIsCartOpen(false);
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = user && !user.isAnonymous;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        cartCount={totalItemsInCart}
        availableProducts={products || []}
        onSearch={handleSmartSearchResults}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="shop" className="space-y-6">
          <TabsContent value="shop" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            {productsLoading || isUserLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-bold">Syncing / በመጫን ላይ...</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <p className="text-muted-foreground font-medium">No products found / ምርቶች አልተገኙም</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none max-w-2xl mx-auto">
            <OrderHistory orders={[]} language={language} />
          </TabsContent>

          <TabsContent value="assistant" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <AIAssistant 
              language={language} 
              availableProducts={products || []} 
              onItemsFound={handleSmartSearchResults}
            />
          </TabsContent>

          <TabsContent value="admin" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            {isAdmin ? <AdminPanel /> : <LoginForm />}
          </TabsContent>

          {/* Fixed Bottom Navigation for Mobile */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t pb-safe">
            <TabsList className="flex h-20 bg-transparent p-0 w-full max-w-3xl mx-auto">
              <TabsTrigger 
                value="shop" 
                className="flex-1 flex flex-col gap-1 rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <LayoutGrid className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t.shop}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="assistant" 
                className="flex-1 flex flex-col gap-1 rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:text-secondary"
              >
                <div className="relative">
                  <Sparkles className="h-6 w-6" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-secondary rounded-full animate-ping" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{t.assistant}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="flex-1 flex flex-col gap-1 rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <ClipboardList className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t.orders}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="flex-1 flex flex-col gap-1 rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <ShieldCheck className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{t.admin}</span>
              </TabsTrigger>
            </TabsList>
          </div>
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
