
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, ShoppingBag } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { Language, translations, Product } from '@/app/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { smartProductSearch } from '@/ai/flows/smart-product-search-flow';

interface Props {
  language: Language;
  setLanguage: (lang: Language) => void;
  cartCount: number;
  availableProducts: Product[];
  onSearch: (results: { id: string, quantity?: number }[]) => void;
  onCartClick: () => void;
}

export function Header({ language, setLanguage, cartCount, availableProducts, onSearch, onCartClick }: Props) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const t = translations[language];

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await smartProductSearch({
        query,
        availableProducts: availableProducts.map(p => ({ id: p.id, name: p.name, description: p.description }))
      });
      onSearch(results.foundProducts);
      setQuery('');
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm px-4 md:px-8">
      <div className="flex h-20 items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-primary hidden sm:block">Wholesale Connect</h1>
        </div>

        <form onSubmit={handleSmartSearch} className="flex-1 max-w-xl relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="pl-10 h-12 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:ring-primary/20 shadow-sm text-lg"
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 text-primary p-1.5 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {isSearching ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Sparkles className="h-5 w-5" />}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <LanguageToggle language={language} setLanguage={setLanguage} />
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-12 w-12 hover:bg-primary/10 rounded-2xl"
            onClick={onCartClick}
          >
            <ShoppingBag className="h-7 w-7 text-primary" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center p-0 bg-secondary text-secondary-foreground border-2 border-background animate-in bounce-in">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
