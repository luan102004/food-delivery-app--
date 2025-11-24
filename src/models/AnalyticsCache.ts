// src/models/AnalyticsCache.ts
import mongoose, { Schema, Model } from 'mongoose';

export interface AnalyticsCache {
  _id: string;
  entityId: string;
  entityType: 'restaurant' | 'driver' | 'system';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
  metrics: {
    revenue: number;
    orders: number;
    customers: number;
    avgOrderValue: number;
    topItems?: Array<{ name: string; count: number }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsCacheSchema = new Schema<AnalyticsCache>(
  {
    entityId: { type: String, required: true },
    entityType: { type: String, enum: ['restaurant', 'driver', 'system'], required: true },
    period: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
    date: { type: Date, required: true },
    metrics: {
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      customers: { type: Number, default: 0 },
      avgOrderValue: { type: Number, default: 0 },
      topItems: [{ name: String, count: Number }],
    },
  },
  { timestamps: true }
);

AnalyticsCacheSchema.index({ entityId: 1, period: 1, date: -1 });

const AnalyticsCacheModel: Model<AnalyticsCache> =
  mongoose.models.AnalyticsCache || mongoose.model<AnalyticsCache>('AnalyticsCache', AnalyticsCacheSchema);

export default AnalyticsCacheModel;
//