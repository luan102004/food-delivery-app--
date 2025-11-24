// src/app/api/promotions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromotionModel from '@/models/Promotion';

// GET /api/promotions - Get all promotions
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const now = new Date();
    let query: any = {};

    if (activeOnly) {
      query = {
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $expr: { $lt: ['$usedCount', '$usageLimit'] },
      };
    }

    const promotions = await PromotionModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: promotions,
      count: promotions.length,
    });
  } catch (error: any) {
    console.error('GET /api/promotions error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/promotions - Create promotion
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const promotion = await PromotionModel.create(body);

    return NextResponse.json(
      { success: true, data: promotion },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/promotions error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT /api/promotions - Update promotion
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Promotion ID is required' },
        { status: 400 }
      );
    }

    const promotion = await PromotionModel.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!promotion) {
      return NextResponse.json(
        { success: false, error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: promotion });
  } catch (error: any) {
    console.error('PUT /api/promotions error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/promotions - Delete promotion
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Promotion ID is required' },
        { status: 400 }
      );
    }

    const promotion = await PromotionModel.findByIdAndDelete(id);

    if (!promotion) {
      return NextResponse.json(
        { success: false, error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: promotion });
  } catch (error: any) {
    console.error('DELETE /api/promotions error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
//