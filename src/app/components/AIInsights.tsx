
'use client';

import { useState, useEffect } from 'react';
import { inventoryReorderSuggestion, InventoryReorderSuggestionOutput } from '@/ai/flows/inventory-reorder-suggestion';
import { Order, Language, translations } from '@/app/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles, ShoppingCart, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  pastOrders: Order[];
  language: Language;
  onApplySuggestion: (productId: string, quantity: number) => void;
}

export function AIInsights({ pastOrders, language, onApplySuggestion }: Props) {
  const [suggestions, setSuggestions] = useState<InventoryReorderSuggestionOutput['suggestions']>([]);
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const data = await inventoryReorderSuggestion({
        pastOrders: pastOrders.map(o => ({
          orderId: o.id,
          orderDate: o.date,
          items: o.items.map(i => ({ productId: i.productId, productName: i.productName, quantity: i.quantity }))
        })),
        periodInDays: 30
      });
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Failed to get suggestions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pastOrders.length > 0) {
      fetchSuggestions();
    }
  }, [pastOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-secondary fill-secondary/20" />
            {t.reorderTitle}
          </h2>
          <p className="text-muted-foreground">{t.reorderDesc}</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchSuggestions} 
          disabled={loading}
          className="rounded-xl"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse border-2">
              <div className="h-40 bg-muted rounded-lg" />
            </Card>
          ))
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, idx) => (
            <Card key={idx} className="border-2 border-secondary/20 hover:border-secondary transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary">{suggestion.productName}</CardTitle>
                <CardDescription className="italic font-medium text-secondary-foreground/70">
                  "{suggestion.reason}"
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4 pt-2">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-primary">{suggestion.suggestedQuantity}</span>
                  <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Suggested Order</span>
                </div>
                <Button 
                  onClick={() => onApplySuggestion(suggestion.productId, suggestion.suggestedQuantity)}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold gap-2 rounded-xl"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t.addToCart}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed">
            <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground font-medium">Place more orders to unlock smart suggestions!</p>
          </div>
        )}
      </div>
    </div>
  );
}
