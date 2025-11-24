// src/models/Restaurant.ts - UPDATED WITH REQUIRED ADDRESS
import mongoose, { Schema, Model } from 'mongoose';
import type { Restaurant } from '@/types';

const TimeSlotSchema = new Schema(
  { 
    open: { type: String, required: true, default: '09:00' }, 
    close: { type: String, required: true, default: '22:00' }, 
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

// GeoJSON Schema for geospatial queries
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
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[1] >= -90 && coords[1] <= 90 && // latitude
                 coords[0] >= -180 && coords[0] <= 180; // longitude
        },
        message: 'Invalid coordinates. Format: [longitude, latitude]'
      }
    }
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    street: { 
      type: String, 
      required: [true, 'Street address is required'],
      trim: true,
      minlength: [5, 'Street address must be at least 5 characters']
    },
    city: { 
      type: String, 
      required: [true, 'City is required'],
      trim: true
    },
    state: { 
      type: String, 
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: { 
      type: String, 
      required: [true, 'Zip code is required'],
      trim: true
    },
    coordinates: {
      type: LocationSchema,
      required: [true, 'Location coordinates are required for delivery service']
    }
  },
  { _id: false }
);

const RestaurantSchema = new Schema<Restaurant>(
  {
    name: { 
      type: String, 
      required: [true, 'Restaurant name is required'], 
      index: true,
      trim: true,
      minlength: [3, 'Restaurant name must be at least 3 characters']
    },
    description: { 
      type: String, 
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters']
    },
    ownerId: { 
      type: Schema.Types.ObjectId, 
      required: true, 
      ref: 'User', 
      index: true 
    },
    address: { 
      type: AddressSchema, 
      required: [true, 'Complete address with coordinates is required for delivery service']
    },
    phone: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[\d\s()+-]+$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    email: { 
      type: String, 
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    image: { type: String, default: '🍽️' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    cuisine: {
      type: [String],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one cuisine type is required'
      }
    },
    openingHours: { 
      type: OpeningHoursSchema, 
      required: true,
      default: () => ({
        monday: { open: '09:00', close: '22:00', isClosed: false },
        tuesday: { open: '09:00', close: '22:00', isClosed: false },
        wednesday: { open: '09:00', close: '22:00', isClosed: false },
        thursday: { open: '09:00', close: '22:00', isClosed: false },
        friday: { open: '09:00', close: '23:00', isClosed: false },
        saturday: { open: '09:00', close: '23:00', isClosed: false },
        sunday: { open: '10:00', close: '21:00', isClosed: false }
      })
    },
    isOpen: { type: Boolean, default: true },
    isAddressComplete: { 
      type: Boolean, 
      default: false,
      index: true 
    }
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

// Pre-save hook to validate address completeness
RestaurantSchema.pre('save', function(next) {
  // Check if address is complete with valid coordinates
  if (this.address && 
      this.address.coordinates && 
      this.address.coordinates.coordinates &&
      this.address.coordinates.coordinates.length === 2 &&
      this.address.coordinates.coordinates[0] !== 0 &&
      this.address.coordinates.coordinates[1] !== 0 &&
      this.address.street &&
      this.address.city) {
    this.isAddressComplete = true;
  } else {
    this.isAddressComplete = false;
  }
  next();
});

// Indexes for performance
RestaurantSchema.index({ ownerId: 1 });
RestaurantSchema.index({ 'address.coordinates': '2dsphere' }); // Geospatial index
RestaurantSchema.index({ cuisine: 1 });
RestaurantSchema.index({ rating: -1 });
RestaurantSchema.index({ isOpen: 1 });
RestaurantSchema.index({ isAddressComplete: 1 });
RestaurantSchema.index({ name: 'text', description: 'text' }); // Text search

// Virtual to check if restaurant can accept orders
RestaurantSchema.virtual('canAcceptOrders').get(function() {
  return this.isOpen && this.isAddressComplete;
});

const RestaurantModel: Model<Restaurant> = 
  mongoose.models.Restaurant || mongoose.model<Restaurant>('Restaurant', RestaurantSchema);

export default RestaurantModel;