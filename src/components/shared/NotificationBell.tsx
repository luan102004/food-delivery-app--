// src/components/shared/NotificationBell.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useRouter } from 'next/navigation';
import { Bell, X, Package, ShoppingBag, Truck, Tag, Info } from 'lucide-react';

export default function NotificationBell() {
  const router = useRouter();
  const { notifications, markNotificationRead, clearNotifications } = useRealtime();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play sound on new notification
  useEffect(() => {
    if (notifications.length > 0) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Ignore if autoplay is blocked
      });
    }
  }, [notifications.length]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <ShoppingBag className="w-5 h-5 text-green-600" />;
      case 'order_update':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'driver_assigned':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'promotion':
        return <Tag className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_order':
        return 'bg-green-50 border-green-200';
      case 'order_update':
        return 'bg-blue-50 border-blue-200';
      case 'driver_assigned':
        return 'bg-purple-50 border-purple-200';
      case 'promotion':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleNotificationClick = (notification: any) => {
    markNotificationRead(notification.id);
    setIsOpen(false);

    // Navigate based on notification type
    if (notification.type === 'new_order' || notification.type === 'order_update') {
      if (notification.data?.orderNumber) {
        router.push(`/customer/track/${notification.data.orderNumber}`);
      }
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 animate-slide-in-up">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Notifications</h3>
              <p className="text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} new` : 'No new notifications'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={clearNotifications}
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  We'll notify you when something arrives
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-sm">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationRead(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          
                          {notification.data && (
                            <span className="text-xs text-primary-600 font-semibold">
                              View Details →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/customer/notifications');
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}