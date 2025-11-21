import mongoose, { Schema, Model } from 'mongoose';
import type { Restaurant, Address, OpeningHours, TimeSlot } from '@/types';

const TimeSlotSchema = new Schema<TimeSlot>(
  {
    open: { type: String, required: true },
    close: { type: String, required: true },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const OpeningHoursSchema = new Schema<OpeningHours>(
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

const AddressSchema = new Schema<Address>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { _id: false }
);

const RestaurantSchema = new Schema<Restaurant>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    ownerId: { type: String, required: true, ref: 'User' },
    address: { type: AddressSchema, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    cuisine: [{ type: String }],
    openingHours: { type: OpeningHoursSchema, required: true },
    isOpen: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
RestaurantSchema.index({ ownerId: 1 });
RestaurantSchema.index({ 'address.coordinates': '2dsphere' });
RestaurantSchema.index({ cuisine: 1 });
RestaurantSchema.index({ rating: -1 });

const RestaurantModel: Model<Restaurant> =
  mongoose.models.Restaurant || mongoose.model<Restaurant>('Restaurant', RestaurantSchema);

export default RestaurantModel;