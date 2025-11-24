// src/app/api/driver/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DriverLocationModel from '@/models/DriverLocation';

// PUT /api/driver/status - Update driver availability status
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { driverId, isAvailable } = body;

    if (!driverId || isAvailable === undefined) {
      return NextResponse.json(
        { success: false, error: 'Driver ID and availability status are required' },
        { status: 400 }
      );
    }

    const location = await DriverLocationModel.findOneAndUpdate(
      { driverId },
      { isAvailable },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: location });
  } catch (error: any) {
    console.error('PUT /api/driver/status error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
//