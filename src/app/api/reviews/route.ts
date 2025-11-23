// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReviewModel from '@/models/Review';
import { requireAuth } from '@/lib/auth';

// GET /api/reviews - Get reviews
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query: any = {};
    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    const reviews = await ReviewModel.find(query)
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: reviews,
      count: reviews.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const body = await request.json();
    const review = await ReviewModel.create({
      ...body,
      customerId: user.id,
    });

    return NextResponse.json(
      { success: true, data: review },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}