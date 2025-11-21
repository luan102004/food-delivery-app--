'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language, Translations } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('language') as Language;
    if (saved) setLanguageState(saved);
  }, []);

  useEffect(() => {
    // Load translations
    fetch(`/locales/${language}.json`)
      .then(res => res.json())
      .then(data => setTranslations(data))
      .catch(err => console.error('Failed to load translations:', err));
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}