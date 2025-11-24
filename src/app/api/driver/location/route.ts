// src/app/api/driver/location/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DriverLocationModel from '@/models/DriverLocation';

// GET /api/driver/location - Get driver location
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    const location = await DriverLocationModel.findOne({ driverId }).lean();

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Driver location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: location });
  } catch (error: any) {
    console.error('GET /api/driver/location error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/driver/location - Update driver location
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { driverId, coordinates, heading, speed } = body;

    if (!driverId || !coordinates) {
      return NextResponse.json(
        { success: false, error: 'Driver ID and coordinates are required' },
        { status: 400 }
      );
    }

    const location = await DriverLocationModel.findOneAndUpdate(
      { driverId },
      {
        coordinates,
        heading,
        speed,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: location });
  } catch (error: any) {
    console.error('POST /api/driver/location error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
//