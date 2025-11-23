// src/app/customer/orders/review/[orderId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import RatingStars from '@/components/shared/RatingStars';
import { Star, ThumbsUp, Camera, X } from 'lucide-react';

export default function ReviewOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [ratings, setRatings] = useState({
    food: 0,
    service: 0,
    delivery: 0,
  });
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setOrder(data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ratings.food === 0 || ratings.service === 0) {
      alert('Please provide ratings for food and service');
      return;
    }

    setSubmitting(true);

    try {
      const overallRating = ratings.delivery > 0
        ? (ratings.food + ratings.service + ratings.delivery) / 3
        : (ratings.food + ratings.service) / 2;

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          restaurantId: order.restaurantId,
          driverId: order.driverId,
          foodRating: ratings.food,
          serviceRating: ratings.service,
          deliveryRating: ratings.delivery || undefined,
          overallRating: Math.round(overallRating * 10) / 10,
          comment: comment.trim() || undefined,
          images: images.length > 0 ? images : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Thank you for your review!');
        router.push('/customer/orders');
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600">This order does not exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h1 className="text-3xl font-bold mb-2">Rate Your Order</h1>
          <p className="text-gray-600">
            Order #{order.orderNumber} • {order.items.length} items
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Rating */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">Food Quality</h3>
                  <p className="text-sm text-gray-600">How was the food?</p>
                </div>
                <div className="text-3xl">🍕</div>
              </div>
              <RatingStars
                rating={ratings.food}
                interactive
                onChange={(rating) => setRatings({ ...ratings, food: rating })}
                size="lg"
                showNumber
              />
            </div>
          </Card>

          {/* Service Rating */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">Restaurant Service</h3>
                  <p className="text-sm text-gray-600">How was the overall service?</p>
                </div>
                <div className="text-3xl">🏪</div>
              </div>
              <RatingStars
                rating={ratings.service}
                interactive
                onChange={(rating) => setRatings({ ...ratings, service: rating })}
                size="lg"
                showNumber
              />
            </div>
          </Card>

          {/* Delivery Rating */}
          {order.driverId && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Delivery Experience</h3>
                    <p className="text-sm text-gray-600">How was the delivery?</p>
                  </div>
                  <div className="text-3xl">🚗</div>
                </div>
                <RatingStars
                  rating={ratings.delivery}
                  interactive
                  onChange={(rating) => setRatings({ ...ratings, delivery: rating })}
                  size="lg"
                  showNumber
                />
              </div>
            </Card>
          )}

          {/* Comment */}
          <Card>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4">Additional Comments (Optional)</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this order..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={1000}
              />
              <div className="text-sm text-gray-500 mt-2 text-right">
                {comment.length}/1000 characters
              </div>
            </div>
          </Card>

          {/* Photos */}
          <Card>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4">Add Photos (Optional)</h3>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={img}
                        alt={`Review ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 5 && (
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 cursor-pointer transition-colors">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Add photos ({images.length}/5)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              isLoading={submitting}
              disabled={ratings.food === 0 || ratings.service === 0}
            >
              <ThumbsUp className="w-5 h-5" />
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}