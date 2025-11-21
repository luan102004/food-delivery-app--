'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import {
  MapPin,
  CreditCard,
  Wallet,
  Building2,
  ArrowLeft,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '123 Main Street',
    city: 'Ho Chi Minh City',
    district: 'District 1',
    phone: '+84 123 456 789',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [scheduledTime, setScheduledTime] = useState('asap');

  const deliveryFee = 3.99;
  const tax = total * 0.08;
  const finalTotal = total + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderNumber = 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase();
    clearCart();
    setIsProcessing(false);
    router.push(`/customer/track/${orderNumber}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Add items to your cart before checkout
            </p>
            <Link href="/customer/menu">
              <Button variant="primary" size="lg">
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
          <Link href="/customer/cart">
            <button className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-1">{t('customer.checkout')}</h1>
            <p className="text-gray-600">Complete your order</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                  </div>
                  <span
                    className={`font-semibold ${
                      step >= s ? 'text-primary-600' : 'text-gray-500'
                    }`}
                  >
                    {s === 1 ? 'Address' : s === 2 ? 'Payment' : 'Review'}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-24 ${
                      step > s ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-primary-600" />
                    Delivery Address
                  </h2>
                  <div className="space-y-4">
                    <Input
                      label="Street Address"
                      value={deliveryAddress.street}
                      onChange={(e) =>
                        setDeliveryAddress({ ...deliveryAddress, street: e.target.value })
                      }
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="City"
                        value={deliveryAddress.city}
                        onChange={(e) =>
                          setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                        }
                      />
                      <Input
                        label="District"
                        value={deliveryAddress.district}
                        onChange={(e) =>
                          setDeliveryAddress({ ...deliveryAddress, district: e.target.value })
                        }
                      />
                    </div>
                    <Input
                      label="Phone Number"
                      value={deliveryAddress.phone}
                      onChange={(e) =>
                        setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })
                      }
                    />
                  </div>

                  {/* Delivery Time */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Delivery Time
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <button
                        onClick={() => setScheduledTime('asap')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          scheduledTime === 'asap'
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">ASAP</div>
                        <div className="text-sm text-gray-600">20-30 minutes</div>
                      </button>
                      <button
                        onClick={() => setScheduledTime('scheduled')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          scheduledTime === 'scheduled'
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">Schedule</div>
                        <div className="text-sm text-gray-600">Choose time</div>
                      </button>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full mt-6"
                    onClick={() => setStep(2)}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-primary-600" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-primary-600" />
                      <div className="text-left flex-1">
                        <div className="font-semibold">Credit/Debit Card</div>
                        <div className="text-sm text-gray-600">Visa, Mastercard, etc.</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === 'card'
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === 'card' && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('wallet')}
                      className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${
                        paymentMethod === 'wallet'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Wallet className="w-6 h-6 text-green-600" />
                      <div className="text-left flex-1">
                        <div className="font-semibold">E-Wallet</div>
                        <div className="text-sm text-gray-600">Momo, ZaloPay, etc.</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === 'wallet'
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === 'wallet' && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`w-full p-4 border-2 rounded-lg flex items-center gap-4 transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building2 className="w-6 h-6 text-yellow-600" />
                      <div className="text-left flex-1">
                        <div className="font-semibold">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === 'cash'
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === 'cash' && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(3)}
                    >
                      Review Order
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6">Review Your Order</h2>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center justify-between py-3 border-b"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{item.image}</div>
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Delivery Address
                    </h3>
                    <p className="text-gray-700">
                      {deliveryAddress.street}, {deliveryAddress.district},{' '}
                      {deliveryAddress.city}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Phone: {deliveryAddress.phone}
                    </p>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Method
                    </h3>
                    <p className="text-gray-700 capitalize">{paymentMethod}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      onClick={handlePlaceOrder}
                      isLoading={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('order.subtotal')}</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('order.deliveryFee')}</span>
                    <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('order.tax')}</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>{t('order.total')}</span>
                      <span className="text-primary-600">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-semibold text-green-800 mb-1">
                        Safe & Secure
                      </div>
                      <div className="text-green-700">
                        Your payment information is protected with encryption
                      </div>
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