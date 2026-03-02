
'use client';

import { Button } from '@/components/ui/button';
import { Language } from '@/app/lib/types';
import { Globe } from 'lucide-react';

interface Props {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export function LanguageToggle({ language, setLanguage }: Props) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 font-medium"
      onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
    >
      <Globe className="h-4 w-4 text-primary" />
      {language === 'en' ? 'አማርኛ' : 'English'}
    </Button>
  );
}
