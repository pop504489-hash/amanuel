'use client';

import { useState, useRef, useEffect } from 'react';
import { businessAdvisor } from '@/ai/flows/business-advisor-flow';
import { Product, Language, translations } from '@/app/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Bot, User, Loader2, TrendingUp, ShoppingBag } from 'lucide-react';
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
    setMessages([{ 
      role: 'assistant', 
      content: language === 'en' 
        ? "Hello! I am your Business Advisor. I can help you order stock or give you advice on growing your kiosk sales. What's on your mind today?" 
        : "ሰላም! እኔ የእርስዎ የንግድ አማካሪ ነኝ። እቃዎችን እንዲያዝዙ ወይም የሽያጭ መጠንዎን እንዴት እንደሚጨምሩ ምክር ልሰጥዎ እችላለሁ። ዛሬ ምን ላግዝዎት?" 
    }]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
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
      const result = await businessAdvisor({
        query: userMessage,
        language: language,
        availableProducts: availableProducts.map(p => ({
          id: p.id,
          name: p.name,
          nameAm: p.nameAm,
          category: p.category,
          price: p.price
        }))
      });

      if (result.identifiedItems && result.identifiedItems.length > 0) {
        onItemsFound(result.identifiedItems.map(item => ({ id: item.productId, quantity: item.quantity })));
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.response
      }]);

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
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto px-4 pb-4">
      <div className="py-4 text-center">
        <h2 className="text-2xl font-black text-primary flex items-center justify-center gap-2">
          <TrendingUp className="h-6 w-6 text-secondary" />
          {t.aiAssistantTitle}
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{t.aiAssistantDesc}</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-2 rounded-[2.5rem] shadow-2xl bg-background">
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2 rounded-2xl shrink-0 ${m.role === 'assistant' ? 'bg-primary text-white shadow-lg' : 'bg-secondary text-secondary-foreground shadow-md'}`}>
                  {m.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                  m.role === 'assistant' 
                    ? 'bg-muted/50 border-l-4 border-primary' 
                    : 'bg-primary/5 border-r-4 border-secondary'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-primary font-bold animate-pulse px-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-[10px] uppercase tracking-tighter">Advisor is thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="p-4 border-t bg-muted/20 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.aiChatPlaceholder}
            className="rounded-[1.5rem] h-14 bg-background border-2 border-primary/10 shadow-inner px-6 text-base focus-visible:ring-primary/20"
            disabled={loading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading || !input.trim()}
            className="h-14 w-14 rounded-[1.5rem] shadow-xl shadow-primary/20 shrink-0 bg-primary hover:bg-primary/90"
          >
            <Send className="h-6 w-6" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
