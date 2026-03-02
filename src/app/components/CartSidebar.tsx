
'use client';

import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { CartItem, Product, Language, translations } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import Image from 'next/image';

interface Props {
  cart: CartItem[];
  products: Product[];
  language: Language;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export function CartSidebar({ cart, products, language, onUpdateQuantity, onRemoveItem, onCheckout }: Props) {
  const t = translations[language];
  
  const cartWithDetails = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(item => item.product);

  const total = cartWithDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
      <SheetHeader className="p-6 border-b bg-muted/30">
        <SheetTitle className="flex items-center gap-2 text-2xl font-black text-primary">
          <ShoppingBag className="h-6 w-6" />
          {t.checkout}
        </SheetTitle>
      </SheetHeader>

      <ScrollArea className="flex-1 px-6 py-4">
        {cartWithDetails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 opacity-40">
            <ShoppingBag className="h-16 w-16" />
            <p className="text-lg font-bold">{t.emptyCart}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cartWithDetails.map((item) => (
              <div key={item.productId} className="flex gap-4 group">
                <div className="relative h-20 w-20 rounded-xl overflow-hidden border bg-muted shrink-0 shadow-sm">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-lg leading-none mb-1">
                      {language === 'en' ? item.product.name : item.product.nameAm}
                    </h4>
                    <p className="text-sm text-muted-foreground">ETB {item.product.price} / {item.product.unit}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-1 border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md hover:bg-white"
                        onClick={() => onUpdateQuantity(item.productId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md hover:bg-white"
                        onClick={() => onUpdateQuantity(item.productId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
                      onClick={() => onRemoveItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <SheetFooter className="p-6 border-t bg-muted/30">
        <div className="w-full space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">{t.total}</span>
            <span className="text-3xl font-black text-primary">ETB {total.toLocaleString()}</span>
          </div>
          <Button 
            className="w-full h-14 text-lg font-bold rounded-2xl gap-3 shadow-lg shadow-primary/20"
            disabled={cart.length === 0}
            onClick={onCheckout}
          >
            <CreditCard className="h-6 w-6" />
            {t.confirmOrder}
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  );
}
