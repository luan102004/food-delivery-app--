// src/app/api/promotions/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromotionModel from '@/models/Promotion';

// POST /api/promotions/validate - Validate promo code
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code || orderAmount === undefined) {
      return NextResponse.json(
        { success: false, error: 'Code and order amount are required' },
        { status: 400 }
      );
    }

    // Find promotion
    const promotion = await PromotionModel.findOne({
      code: code.toUpperCase(),
    }).lean();

    if (!promotion) {
      return NextResponse.json(
        { success: false, error: 'Invalid promotion code' },
        { status: 404 }
      );
    }

    // Check if active
    if (!promotion.isActive) {
      return NextResponse.json(
        { success: false, error: 'This promotion is not active' },
        { status: 400 }
      );
    }

    // Check dates
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return NextResponse.json(
        { success: false, error: 'This promotion has expired' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (promotion.usedCount >= promotion.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'This promotion has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (orderAmount < promotion.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount is $${promotion.minOrderAmount}`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (promotion.type === 'percentage') {
      discount = (orderAmount * promotion.value) / 100;
      if (promotion.maxDiscount && discount > promotion.maxDiscount) {
        discount = promotion.maxDiscount;
      }
    } else if (promotion.type === 'fixed') {
      discount = promotion.value;
    } else if (promotion.type === 'free_delivery') {
      // Delivery fee discount will be handled separately
      discount = 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        promotion,
        discount,
        isValid: true,
      },
    });
  } catch (error: any) {
    console.error('POST /api/promotions/validate error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
//