// src/models/User.ts - FIXED VERSION
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
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      index: true 
    },
    name: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['customer', 'restaurant', 'driver', 'admin'],
      default: 'customer',
      required: true,
      index: true
    },
    avatar: { type: String },
    address: { type: AddressSchema },
    passwordHash: { type: String, select: false }, // Added passwordHash field
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.passwordHash; // Remove passwordHash from JSON output
        return ret;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.passwordHash;
        return ret;
      }
    },
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Ensure unique email index
UserSchema.post('save', function(error: any, doc: any, next: any) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

const UserModel: Model<User> = 
  mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;