import mongoose, { Schema, Model } from 'mongoose';
import type { DriverLocation } from '@/types';

const DriverLocationSchema = new Schema<DriverLocation>(
  {
    driverId: { type: String, required: true, ref: 'User', unique: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    heading: { type: Number, min: 0, max: 360 },
    speed: { type: Number, min: 0 },
    isAvailable: { type: Boolean, default: false },
    currentOrderId: { type: String, ref: 'Order' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
DriverLocationSchema.index({ driverId: 1 });
DriverLocationSchema.index({ coordinates: '2dsphere' });
DriverLocationSchema.index({ isAvailable: 1 });

const DriverLocationModel: Model<DriverLocation> =
  mongoose.models.DriverLocation || mongoose.model<DriverLocation>('DriverLocation', DriverLocationSchema);

export default DriverLocationModel;