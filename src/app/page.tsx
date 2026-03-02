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
import { LayoutGrid, ClipboardList, Sparkles, ShieldCheck, Loader2, Bot } from 'lucide-react';

export default function Home() {
  const [language, setLanguage] = useState<Language>('am');
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
        title: language === 'en' ? "Inventory Updated" : "ትዕዛዙ ተጨምሯል", 
        description: language === 'en' ? `${itemsAdded} items handled by Assistant.` : `${itemsAdded} እቃዎች በረዳቱ ተጨምረዋል።` 
      });
    }
  };

  const handleCheckout = () => {
    toast({ 
      title: language === 'en' ? "Order Submitted" : "ትዕዛዝ ተልኳል", 
      description: language === 'en' ? "The warehouse is reviewing your request." : "ትዕዛዝዎን እያዘጋጀን ነው።" 
    });
    setCart([]);
    setIsCartOpen(false);
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = user && !user.isAnonymous;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0 font-body">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        cartCount={totalItemsInCart}
        availableProducts={products || []}
        onSearch={handleSmartSearchResults}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="max-w-7xl mx-auto">
        <Tabs defaultValue="shop" className="w-full">
          <TabsContent value="shop" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none p-4 pb-20">
            {productsLoading || isUserLoading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-black text-primary tracking-widest uppercase text-xs">Connecting / በመገናኘት ላይ...</p>
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
              <div className="text-center py-40 bg-muted/30 rounded-[3rem] border-4 border-dashed border-primary/10">
                <LayoutGrid className="h-16 w-16 text-primary/20 mx-auto mb-4" />
                <p className="text-primary/40 font-black uppercase text-sm tracking-widest">Catalog Empty / ዝርዝሩ ባዶ ነው</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none max-w-2xl mx-auto p-4 pb-20">
            <OrderHistory orders={[]} language={language} />
          </TabsContent>

          <TabsContent value="assistant" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
            <AIAssistant 
              language={language} 
              availableProducts={products || []} 
              onItemsFound={handleSmartSearchResults}
            />
          </TabsContent>

          <TabsContent value="admin" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none p-4 pb-20">
            {isAdmin ? <AdminPanel /> : <LoginForm />}
          </TabsContent>

          {/* Fixed Bottom Navigation for Mobile */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-t border-primary/10 px-4 pb-safe">
            <TabsList className="flex h-20 bg-transparent p-0 w-full max-w-lg mx-auto gap-1">
              <TabsTrigger 
                value="shop" 
                className="flex-1 flex flex-col gap-1 rounded-2xl h-16 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30 transition-all duration-300"
              >
                <LayoutGrid className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{t.shop}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="assistant" 
                className="flex-1 flex flex-col gap-1 rounded-2xl h-16 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-secondary/30 transition-all duration-300"
              >
                <div className="relative">
                  <Bot className="h-6 w-6" />
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-destructive rounded-full border-2 border-background" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{t.assistant}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="flex-1 flex flex-col gap-1 rounded-2xl h-16 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30 transition-all duration-300"
              >
                <ClipboardList className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{t.orders}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="flex-1 flex flex-col gap-1 rounded-2xl h-16 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30 transition-all duration-300"
              >
                <ShieldCheck className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{t.admin}</span>
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
