import mongoose, { Schema, Model } from 'mongoose';

export interface UserPromotion {
  _id: string;
  userId: string;
  promotionId: string;
  orderId: string;
  discountAmount: number;
  usedAt: Date;
}

const UserPromotionSchema = new Schema<UserPromotion>(
  {
    userId: { type: String, required: true, ref: 'User' },
    promotionId: { type: String, required: true, ref: 'Promotion' },
    orderId: { type: String, required: true, ref: 'Order' },
    discountAmount: { type: Number, required: true },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

UserPromotionSchema.index({ userId: 1, promotionId: 1 });
UserPromotionSchema.index({ orderId: 1 });

const UserPromotionModel: Model<UserPromotion> =
  mongoose.models.UserPromotion || mongoose.model<UserPromotion>('UserPromotion', UserPromotionSchema);

export default UserPromotionModel;