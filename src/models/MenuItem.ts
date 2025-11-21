import mongoose, { Schema, Model } from 'mongoose';
import type { MenuItem } from '@/types';

const MenuItemSchema = new Schema<MenuItem>(
  {
    restaurantId: { type: String, required: true, ref: 'Restaurant' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    category: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, required: true, min: 0 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
MenuItemSchema.index({ restaurantId: 1 });
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ isAvailable: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

const MenuItemModel: Model<MenuItem> =
  mongoose.models.MenuItem || mongoose.model<MenuItem>('MenuItem', MenuItemSchema);

export default MenuItemModel;