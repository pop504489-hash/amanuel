
'use client';

import { Product, Language } from '@/app/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import Image from 'next/image';

interface Props {
  product: Product;
  quantity: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  language: Language;
}

export function ProductCard({ product, quantity, onUpdateQuantity, language }: Props) {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 rounded-3xl">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {quantity > 0 && (
          <div className="absolute top-3 right-3 bg-secondary text-secondary-foreground w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg animate-in zoom-in-50 border-2 border-white">
            {quantity}
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex flex-col gap-0.5 min-h-[3.5rem]">
          <h3 className="text-sm font-black line-clamp-1 text-primary">
            {language === 'en' ? product.name : product.nameAm}
          </h3>
          <p className="text-[10px] text-muted-foreground line-clamp-1 uppercase tracking-tighter">{product.category}</p>
        </div>
        
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-lg font-black text-foreground">ETB {product.price}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{product.unit}</span>
          </div>

          <div className="flex items-center justify-between bg-muted/30 p-1.5 rounded-2xl border">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-white bg-white/50 shadow-sm"
              onClick={() => onUpdateQuantity(product.id, -1)}
              disabled={quantity === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-6 text-center font-black text-base">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white bg-white/50 shadow-sm text-primary"
              onClick={() => onUpdateQuantity(product.id, 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
