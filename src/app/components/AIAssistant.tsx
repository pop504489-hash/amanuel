
'use client';

import { useState, useRef, useEffect } from 'react';
import { smartProductSearch } from '@/ai/flows/smart-product-search-flow';
import { Product, Language, translations } from '@/app/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  language: Language;
  availableProducts: Product[];
  onItemsFound: (results: { id: string, quantity?: number }[]) => void;
}

export function AIAssistant({ language, availableProducts, onItemsFound }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    setMessages([{ role: 'assistant', content: t.aiChatWelcome }]);
  }, [language, t.aiChatWelcome]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const result = await smartProductSearch({
        query: userMessage,
        availableProducts: availableProducts.map(p => ({ id: p.id, name: p.name, description: p.description }))
      });

      if (result.foundProducts && result.foundProducts.length > 0) {
        onItemsFound(result.foundProducts);
        const productNames = result.foundProducts.map(res => {
          const p = availableProducts.find(ap => ap.id === res.id);
          return `${res.quantity || 1}x ${language === 'en' ? p?.name : p?.nameAm}`;
        }).join(', ');
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: language === 'en' 
            ? `Done! I've added ${productNames} to your cart.` 
            : `ተከናውኗል! ${productNames} ወደ ጋሪዎ ጨምሬያለሁ።` 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: language === 'en' 
            ? "I couldn't find those items. Could you try being more specific?" 
            : "እነዚያን እቃዎች ማግኘት አልቻልኩም። እባክዎ በበለጠ ግልጽ ያድርጉት?" 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: language === 'en' 
          ? "Sorry, I had a bit of trouble processing that. Please try again." 
          : "ይቅርታ፣ ያንን ለማስተናገድ ትንሽ ችግር አጋጥሞኛል። እባክዎ እንደገና ይሞክሩ።" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-2xl mx-auto">
      <div className="p-4 text-center">
        <h2 className="text-2xl font-black text-primary flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-secondary" />
          {t.aiAssistantTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{t.aiAssistantDesc}</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-2 rounded-3xl shadow-xl">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2 rounded-2xl ${m.role === 'assistant' ? 'bg-primary text-white' : 'bg-muted border shadow-sm'}`}>
                  {m.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium ${
                  m.role === 'assistant' 
                    ? 'bg-primary/5 text-primary border-l-4 border-primary' 
                    : 'bg-muted/50'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground italic text-xs animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                Assistant is thinking...
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="p-4 border-t bg-muted/30 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.aiChatPlaceholder}
            className="rounded-2xl h-12 bg-background border-none shadow-inner focus-visible:ring-primary/20"
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !input.trim()}
            className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
