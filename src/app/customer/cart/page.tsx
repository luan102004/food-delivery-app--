'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/customer/CartItem';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { ShoppingCart, ArrowLeft, Tag, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const deliveryFee = 3.99;
  const tax = total * 0.08; // 8% tax
  const finalTotal = total + deliveryFee + tax - discount;

  const handleApplyPromo = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === 'SAVE30') {
      setDiscount(total * 0.3);
      setPromoApplied(true);
    } else if (promoCode.toUpperCase() === 'FREESHIP') {
      setDiscount(deliveryFee);
      setPromoApplied(true);
    } else {
      alert(t('promotion.invalidCode'));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link href="/customer/menu">
              <Button variant="primary" size="lg">
                <ShoppingCart className="w-5 h-5" />
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/customer/menu">
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-1">
              {t('nav.cart')} ({items.length})
            </h1>
            <p className="text-gray-600">Review your items before checkout</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Cart
                  </button>
                </div>
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem key={item.menuItemId} item={item} />
                  ))}
                </div>
              </div>
            </Card>

            {/* Promo Code */}
            <Card>
              <div className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {t('promotion.applyCode')}
                </h3>
                <div className="flex gap-3">
                  <Input
                    placeholder={t('promotion.enterCode')}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                    className="flex-1"
                  />
                  <Button
                    variant={promoApplied ? 'success' : 'primary'}
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode}
                  >
                    {promoApplied ? '✓ Applied' : t('promotion.apply')}
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-green-600 text-sm mt-2 font-semibold">
                    🎉 {t('promotion.codeApplied')}! You saved ${discount.toFixed(2)}
                  </p>
                )}
                
                {/* Available Promos */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Available codes:</p>
                  <div className="space-y-2">
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-primary-700">SAVE30</span>
                          <span className="text-sm text-gray-600 ml-2">30% off</span>
                        </div>
                        <button
                          onClick={() => {
                            setPromoCode('SAVE30');
                            handleApplyPromo();
                          }}
                          className="text-primary-600 text-sm font-semibold hover:text-primary-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-green-700">FREESHIP</span>
                          <span className="text-sm text-gray-600 ml-2">Free delivery</span>
                        </div>
                        <button
                          onClick={() => {
                            setPromoCode('FREESHIP');
                            handleApplyPromo();
                          }}
                          className="text-green-600 text-sm font-semibold hover:text-green-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('order.subtotal')}</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>{t('order.deliveryFee')}</span>
                    <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>{t('order.tax')} (8%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t('order.discount')}</span>
                      <span className="font-semibold">-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>{t('order.total')}</span>
                      <span className="text-primary-600">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mb-3"
                  onClick={() => router.push('/customer/checkout')}
                >
                  Proceed to Checkout
                </Button>

                <Link href="/customer/menu">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span>Secure payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span>30-minute delivery guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span>Quality assured</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}