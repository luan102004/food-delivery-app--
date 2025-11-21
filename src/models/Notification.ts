import mongoose, { Schema, Model } from 'mongoose';

export interface Notification {
  _id: string;
  userId: string;
  type: 'order_update' | 'promotion' | 'system' | 'driver_assigned';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<Notification>(
  {
    userId: { type: String, required: true, ref: 'User' },
    type: {
      type: String,
      enum: ['order_update', 'promotion', 'system', 'driver_assigned'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1 });

const NotificationModel: Model<Notification> =
  mongoose.models.Notification || mongoose.model<Notification>('Notification', NotificationSchema);

export default NotificationModel;