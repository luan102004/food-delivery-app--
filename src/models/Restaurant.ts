// src/models/Restaurant.ts - FIXED with GeoJSON
import mongoose, { Schema, Model } from 'mongoose';
import type { Restaurant } from '@/types';

const TimeSlotSchema = new Schema(
  { 
    open: { type: String, required: true }, 
    close: { type: String, required: true }, 
    isClosed: { type: Boolean, default: false } 
  },
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

// GeoJSON Schema for proper geospatial queries
const LocationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere' // Enable geospatial queries
    }
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      type: LocationSchema,
      required: true
    }
  },
  { _id: false }
);

const RestaurantSchema = new Schema<Restaurant>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    address: { 
      type: AddressSchema, 
      required: true 
    },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    image: { type: String, default: '🍽️' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    cuisine: [{ type: String }],
    openingHours: { 
      type: OpeningHoursSchema, 
      required: true,
      default: {
        monday: { open: '09:00', close: '22:00', isClosed: false },
        tuesday: { open: '09:00', close: '22:00', isClosed: false },
        wednesday: { open: '09:00', close: '22:00', isClosed: false },
        thursday: { open: '09:00', close: '22:00', isClosed: false },
        friday: { open: '09:00', close: '23:00', isClosed: false },
        saturday: { open: '09:00', close: '23:00', isClosed: false },
        sunday: { open: '10:00', close: '21:00', isClosed: false }
      }
    },
    isOpen: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) { 
        ret.id = ret._id; 
        delete ret._id; 
        delete ret.__v; 
        return ret;
      }
    },
  }
);

// Indexes for performance
RestaurantSchema.index({ ownerId: 1 });
RestaurantSchema.index({ 'address.coordinates': '2dsphere' }); // Geospatial index
RestaurantSchema.index({ cuisine: 1 });
RestaurantSchema.index({ rating: -1 });
RestaurantSchema.index({ isOpen: 1 });
RestaurantSchema.index({ name: 'text', description: 'text' }); // Text search

const RestaurantModel: Model<Restaurant> = 
  mongoose.models.Restaurant || mongoose.model<Restaurant>('Restaurant', RestaurantSchema);

export default RestaurantModel;