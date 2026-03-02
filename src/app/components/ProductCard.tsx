
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
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {quantity > 0 && (
          <div className="absolute top-2 right-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg animate-in zoom-in-50">
            {quantity}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col gap-1 min-h-[4.5rem]">
          <h3 className="text-lg font-bold line-clamp-1 text-primary">
            {language === 'en' ? product.name : product.nameAm}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">ETB {product.price}</span>
            <span className="text-xs text-muted-foreground">per {product.unit}</span>
          </div>

          <div className="flex items-center gap-2 bg-background p-1 rounded-full border shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-secondary/20"
              onClick={() => onUpdateQuantity(product.id, -1)}
              disabled={quantity === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-4 text-center font-bold text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-secondary/20 text-primary"
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
