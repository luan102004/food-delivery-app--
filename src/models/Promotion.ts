import mongoose, { Schema, Model } from 'mongoose';
import type { Promotion, PromotionType } from '@/types';

const PromotionSchema = new Schema<Promotion>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_delivery'],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, required: true, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
PromotionSchema.index({ code: 1 });
PromotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Validation
PromotionSchema.path('endDate').validate(function (value: Date) {
  return value > this.startDate;
}, 'End date must be after start date');

const PromotionModel: Model<Promotion> =
  mongoose.models.Promotion || mongoose.model<Promotion>('Promotion', PromotionSchema);

export default PromotionModel;