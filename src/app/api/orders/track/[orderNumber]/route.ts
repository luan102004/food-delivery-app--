import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OrderModel from '@/models/Order';
import DriverLocationModel from '@/models/DriverLocation';
import RestaurantModel from '@/models/Restaurant';

// GET /api/orders/track/[orderNumber] - Track order
export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    await connectDB();

    const { orderNumber } = params;

    // Get order details
    const order = await OrderModel.findOne({ orderNumber }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get restaurant location
    const restaurant = await RestaurantModel.findById(order.restaurantId)
      .select('name address')
      .lean();

    // Get driver location if driver assigned
    let driverLocation = null;
    if (order.driverId) {
      driverLocation = await DriverLocationModel.findOne({
        driverId: order.driverId,
      }).lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        order,
        restaurant,
        driverLocation,
      },
    });
  } catch (error: any) {
    console.error('GET /api/orders/track error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}