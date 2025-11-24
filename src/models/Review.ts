// src/models/Review.ts
import mongoose, { Schema, Model } from 'mongoose';

export interface Review {
  _id: string;
  orderId: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  
  // Ratings (1-5)
  foodRating: number;
  serviceRating: number;
  deliveryRating?: number;
  
  // Overall
  overallRating: number;
  
  // Review content
  comment?: string;
  images?: string[];
  
  // Response from restaurant
  response?: {
    text: string;
    respondedAt: Date;
  };
  
  // Status
  isVerified: boolean;
  isHelpful?: number; // Count of helpful votes
  
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<Review>(
  {
    orderId: { type: String, required: true, ref: 'Order', unique: true },
    customerId: { type: String, required: true, ref: 'User' },
    restaurantId: { type: String, required: true, ref: 'Restaurant' },
    driverId: { type: String, ref: 'User' },
    
    foodRating: { type: Number, required: true, min: 1, max: 5 },
    serviceRating: { type: Number, required: true, min: 1, max: 5 },
    deliveryRating: { type: Number, min: 1, max: 5 },
    
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    
    comment: { type: String, maxlength: 1000 },
    images: [{ type: String }],
    
    response: {
      text: { type: String },
      respondedAt: { type: Date },
    },
    
    isVerified: { type: Boolean, default: true },
    isHelpful: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ReviewSchema.index({ restaurantId: 1, createdAt: -1 });
ReviewSchema.index({ customerId: 1 });
ReviewSchema.index({ orderId: 1 });
ReviewSchema.index({ overallRating: -1 });

// Virtual populate customer
ReviewSchema.virtual('customer', {
  ref: 'User',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true,
});

// Update restaurant rating after review is saved
ReviewSchema.post('save', async function() {
  const RestaurantModel = mongoose.model('Restaurant');
  
  // Calculate average rating for restaurant
  const reviews = await mongoose.model('Review').find({ 
    restaurantId: this.restaurantId 
  });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length;
    
    await RestaurantModel.findByIdAndUpdate(this.restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
    });
  }
});

const ReviewModel: Model<Review> =
  mongoose.models.Review || mongoose.model<Review>('Review', ReviewSchema);

export default ReviewModel;
//