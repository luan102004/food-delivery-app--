'use client';

import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Power, Zap } from 'lucide-react';

interface StatusToggleProps {
  isOnline: boolean;
  onToggle: (status: boolean) => void;
}

export default function StatusToggle({ isOnline, onToggle }: StatusToggleProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1">Driver Status</h3>
          <p className="text-sm text-gray-600">
            {isOnline ? 'You are online and receiving orders' : 'You are offline'}
          </p>
        </div>
        <div className={`p-3 rounded-full ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
          {isOnline ? (
            <Zap className="w-8 h-8 text-green-600" />
          ) : (
            <Power className="w-8 h-8 text-gray-400" />
          )}
        </div>
      </div>

      <button
        onClick={() => onToggle(!isOnline)}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          isOnline
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
            : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
        }`}
      >
        {isOnline ? (
          <>
            <Power className="w-5 h-5 inline-block mr-2" />
            {t('driver.goOffline')}
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 inline-block mr-2" />
            {t('driver.goOnline')}
          </>
        )}
      </button>

      {/* Stats */}
      {isOnline && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">4</div>
            <div className="text-xs text-gray-600">Today's Deliveries</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">$68</div>
            <div className="text-xs text-gray-600">Today's Earnings</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">4.9</div>
            <div className="text-xs text-gray-600">Your Rating</div>
          </div>
        </div>
      )}
    </div>
  );
}