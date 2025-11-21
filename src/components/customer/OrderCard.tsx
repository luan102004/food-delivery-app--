'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Clock, MapPin, Package } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const { t } = useLanguage();

  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    on_the_way: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusIcons: Record<OrderStatus, React.ReactNode> = {
    pending: <Clock className="w-4 h-4" />,
    confirmed: <Package className="w-4 h-4" />,
    preparing: <Package className="w-4 h-4" />,
    ready: <Package className="w-4 h-4" />,
    picked_up: <MapPin className="w-4 h-4" />,
    on_the_way: <MapPin className="w-4 h-4" />,
    delivered: <Package className="w-4 h-4" />,
    cancelled: <Package className="w-4 h-4" />,
  };

  return (
    <Card hover>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              {t('order.orderNumber')}
            </div>
            <div className="text-xl font-bold text-gray-900">
              #{order.orderNumber}
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
              statusColors[order.status]
            }`}
          >
            {statusIcons[order.status]}
            {t(`order.${order.status}`)}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.quantity}x</span>
                <span className="text-gray-700">{item.name}</span>
              </div>
              <span className="font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="text-sm text-gray-500 italic">
              +{order.items.length - 3} more items
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">{t('order.subtotal')}</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">{t('order.deliveryFee')}</span>
            <span>${order.deliveryFee.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex items-center justify-between text-sm mb-2 text-green-600">
              <span>{t('order.discount')}</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between font-bold text-lg pt-2 border-t">
            <span>{t('order.total')}</span>
            <span className="text-primary-600">${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Clock className="w-4 h-4" />
          <span>
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(
          order.status
        ) && (
          <Link href={`/customer/track/${order.orderNumber}`}>
            <Button variant="primary" size="sm" className="w-full">
              <MapPin className="w-4 h-4" />
              {t('customer.trackOrder')}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}