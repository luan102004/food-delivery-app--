// src/models/MenuItem.ts
import mongoose, { Schema, Model } from 'mongoose';
import type { MenuItem } from '@/types';

const MenuItemSchema = new Schema<MenuItem>(
  {
    restaurantId: { type: Schema.Types.ObjectId, required: true, ref: 'Restaurant' },
    name: { type: String, required: true },
    description: { type: String, required: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    category: { type: String, required: true, default: 'other' },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, required: true, min: 0, default: 15 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform(_doc, ret) { ret.id = ret._id; delete ret._id; delete ret.__v; } }
  }
);

MenuItemSchema.index({ restaurantId: 1 });
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ isAvailable: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

const MenuItemModel: Model<MenuItem> = mongoose.models.MenuItem || mongoose.model<MenuItem>('MenuItem', MenuItemSchema);
export default MenuItemModel;
