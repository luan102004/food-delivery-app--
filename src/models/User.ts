import mongoose, { Schema, Model } from 'mongoose';
import type { User, UserRole, Address } from '@/types';

const AddressSchema = new Schema<Address>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }
);

const UserSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['customer', 'restaurant', 'driver', 'admin'],
      default: 'customer',
      required: true,
    },
    avatar: { type: String },
    address: { type: AddressSchema },
    passwordHash: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;