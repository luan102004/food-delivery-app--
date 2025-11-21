'use client';

import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { MapPin, Clock, DollarSign, Package, Navigation } from 'lucide-react';
import type { Order } from '@/types';

interface OrderAcceptCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

export default function OrderAcceptCard({ order, onAccept, onReject }: OrderAcceptCardProps) {
  const { t } = useLanguage();
  
  const estimatedDistance = 3.2; // Mock data - km
  const estimatedTime = 12; // Mock data - minutes
  const earnings = 8.50; // Mock data - $

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">#{order.orderNumber}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Ready in {order.items[0]?.name ? '15' : '10'} min</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">${earnings.toFixed(2)}</div>
            <div className="text-xs text-gray-600">Earnings</div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">Pickup Location</div>
              <div className="text-sm text-gray-600">Restaurant Name</div>
              <div className="text-sm text-gray-500">123 Restaurant St, District 1</div>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">Delivery Location</div>
              <div className="text-sm text-gray-600">
                {order.deliveryAddress.street}, {order.deliveryAddress.city}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-3">Order Items ({order.items.length})</h4>
          <div className="space-y-2">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  <span className="font-medium">{item.quantity}x</span> {item.name}
                </span>
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="text-sm text-gray-500 italic">+{order.items.length - 3} more items</div>
            )}
          </div>
          <div className="border-t mt-3 pt-3">
            <div className="flex items-center justify-between font-bold">
              <span>Total Order</span>
              <span className="text-primary-600">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Trip Info */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Navigation className="w-5 h-5 mx-auto mb-1 text-primary-600" />
            <div className="text-lg font-bold">{estimatedDistance} km</div>
            <div className="text-xs text-gray-600">Distance</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold">{estimatedTime} min</div>
            <div className="text-xs text-gray-600">Est. Time</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-bold">${earnings.toFixed(2)}</div>
            <div className="text-xs text-gray-600">You Earn</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={() => onReject(order._id)}>
            Decline
          </Button>
          <Button variant="success" size="lg" onClick={() => onAccept(order._id)}>
            {t('driver.acceptOrder')}
          </Button>
        </div>
      </div>
    </Card>
  );
}