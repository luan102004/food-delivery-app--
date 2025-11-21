import mongoose, { Schema, Model } from 'mongoose';
import type { Order, OrderItem, OrderStatus, Address } from '@/types';

const OrderItemSchema = new Schema<OrderItem>(
  {
    menuItemId: { type: String, required: true, ref: 'MenuItem' },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String },
  },
  { _id: false }
);

const AddressSchema = new Schema<Address>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<Order>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: String, required: true, ref: 'User' },
    restaurantId: { type: String, required: true, ref: 'Restaurant' },
    driverId: { type: String, ref: 'User' },
    items: [{ type: OrderItemSchema, required: true }],
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
      default: 'pending',
      required: true,
    },
    deliveryAddress: { type: AddressSchema, required: true },
    promotionId: { type: String, ref: 'Promotion' },
    notes: { type: String },
    estimatedDeliveryTime: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ driverId: 1, status: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Generate order number before saving
OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const OrderModel: Model<Order> = mongoose.models.Order || mongoose.model<Order>('Order', OrderSchema);

export default OrderModel;