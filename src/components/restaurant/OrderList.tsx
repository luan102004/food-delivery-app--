'use client';

import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Clock, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

interface OrderListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export default function OrderList({ orders, onUpdateStatus }: OrderListProps) {
  const { t } = useLanguage();

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      picked_up: 'bg-indigo-100 text-indigo-800',
      on_the_way: 'bg-cyan-100 text-cyan-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: null,
      picked_up: null,
      on_the_way: null,
      delivered: null,
      cancelled: null,
    };
    return flow[currentStatus];
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-8xl mb-4">📦</div>
        <h3 className="text-2xl font-bold mb-2">No orders yet</h3>
        <p className="text-gray-600">New orders will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const nextStatus = getNextStatus(order.status);
        const timeAgo = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

        return (
          <Card key={order._id} hover>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">#{order.orderNumber}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {t(`order.${order.status}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{timeAgo} minutes ago</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">${order.total.toFixed(2)}</div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-3">Order Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.quantity}x</span>{' '}
                        <span className="text-gray-700">{item.name}</span>
                        {item.notes && <div className="text-gray-500 text-xs italic ml-6">Note: {item.notes}</div>}
                      </div>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Delivery Address:</div>
                    <div className="text-gray-600">
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {nextStatus && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onUpdateStatus(order._id, 'cancelled')}
                  >
                    Cancel Order
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => onUpdateStatus(order._id, nextStatus)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as {t(`order.${nextStatus}`)}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}