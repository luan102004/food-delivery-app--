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
    passwordHash: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(_doc, ret) {
        delete ret.passwordHash;
        return ret;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(_doc, ret) {
        delete ret.passwordHash;
        return ret;
      }
    },
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Instance method: Compare password
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  
  try {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.compare(password, this.passwordHash);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Static method: Hash password
UserSchema.statics.hashPassword = async function(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return await bcrypt.hash(password, 10);
};

// Handle duplicate email error
UserSchema.post('save', function(error: any, _doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

// Pre-save hook to hash password if modified
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  // Password should already be hashed by the static method
  next();
});

const UserModel: Model<User> = 
  mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;
//