'use client';

import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <button
        onClick={() => setLanguage('vi')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
          language === 'vi'
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        VI
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
          language === 'en'
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
    </div>
  );
}