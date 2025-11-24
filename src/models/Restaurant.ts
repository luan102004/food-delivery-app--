// src/models/Restaurant.ts
import mongoose, { Schema, Model } from 'mongoose';
import type { Restaurant } from '@/types';

const TimeSlotSchema = new Schema(
  { open: { type: String, required: true }, close: { type: String, required: true }, isClosed: { type: Boolean, default: false } },
  { _id: false }
);

const OpeningHoursSchema = new Schema(
  {
    monday: { type: TimeSlotSchema, required: true },
    tuesday: { type: TimeSlotSchema, required: true },
    wednesday: { type: TimeSlotSchema, required: true },
    thursday: { type: TimeSlotSchema, required: true },
    friday: { type: TimeSlotSchema, required: true },
    saturday: { type: TimeSlotSchema, required: true },
    sunday: { type: TimeSlotSchema, required: true },
  },
  { _id: false }
);

const AddressGeo = new Schema(
  {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { _id: false }
);

const RestaurantSchema = new Schema<Restaurant>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    address: { type: AddressGeo, required: true, default: {} },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    image: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    cuisine: [{ type: String }],
    openingHours: { type: OpeningHoursSchema, required: true, default: {} },
    isOpen: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) { ret.id = ret._id; delete ret._id; delete ret.__v; }
    },
  }
);

RestaurantSchema.index({ ownerId: 1 });
RestaurantSchema.index({ 'address.coordinates': '2dsphere' });
RestaurantSchema.index({ cuisine: 1 });
RestaurantSchema.index({ rating: -1 });

const RestaurantModel: Model<Restaurant> = mongoose.models.Restaurant || mongoose.model<Restaurant>('Restaurant', RestaurantSchema);
export default RestaurantModel;
