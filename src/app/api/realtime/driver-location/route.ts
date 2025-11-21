// src/app/api/realtime/driver-location/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DriverLocationModel from '@/models/DriverLocation';
import OrderModel from '@/models/Order';
import { triggerDriverLocationUpdate } from '@/lib/pusher';
import { requireRole } from '@/lib/auth';

// POST /api/realtime/driver-location - Update driver location and broadcast
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['driver', 'admin']);
    await connectDB();

    const body = await request.json();
    const { driverId, coordinates, heading, speed } = body;

    // Validate input
    if (!driverId || !coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid driver location data' },
        { status: 400 }
      );
    }

    // Update driver location in database
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

    // Find active order for this driver
    const activeOrder = await OrderModel.findOne({
      driverId,
      status: { $in: ['picked_up', 'on_the_way'] },
    }).sort({ createdAt: -1 });

    // Broadcast location update via Pusher
    if (activeOrder) {
      await triggerDriverLocationUpdate(driverId, activeOrder.orderNumber, {
        lat: coordinates.lat,
        lng: coordinates.lng,
        heading,
        speed,
      });
    }

    return NextResponse.json({
      success: true,
      data: location,
      broadcastedTo: activeOrder ? activeOrder.orderNumber : null,
    });
  } catch (error: any) {
    console.error('POST /api/realtime/driver-location error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/realtime/driver-location - Get current driver location
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
    console.error('GET /api/realtime/driver-location error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}