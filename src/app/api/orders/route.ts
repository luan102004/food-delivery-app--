
// ============================================
// 🔧 FILE 1: src/app/api/orders/route.ts
// ============================================
// FIXED: Trigger Pusher events khi tạo/update order

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import OrderModel from '@/models/Order';
import { triggerOrderStatusUpdate, triggerNewOrderNotification } from '@/lib/pusher';

async function getAuthUser(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }
  
  return { user: session.user };
}

// ===================== GET ORDERS =====================
export async function GET(request: NextRequest) {
  const authResult = await getAuthUser(request);
  if (authResult.error) return authResult.error;
  
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const restaurantId = searchParams.get('restaurantId');
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query: any = {};

    if (customerId) query.customerId = customerId;
    if (restaurantId) query.restaurantId = restaurantId;
    if (driverId) query.driverId = driverId;
    if (status) query.status = status;

    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ===================== CREATE ORDER =====================
export async function POST(request: NextRequest) {
  const authResult = await getAuthUser(request);
  if (authResult.error) return authResult.error;
  
  const { user } = authResult;

  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    if (!body.restaurantId || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order data' },
        { status: 400 }
      );
    }

    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 30);

    const orderData = {
      ...body,
      customerId: user.id,
      estimatedDeliveryTime,
      status: 'pending',
    };

    const order = await OrderModel.create(orderData);

    // ✅ TRIGGER PUSHER: Notify restaurant about new order
    await triggerNewOrderNotification(order.restaurantId, {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      items: order.items,
      total: order.total,
      createdAt: order.createdAt,
    });

    // ✅ TRIGGER PUSHER: Notify customer that order was created
    await triggerOrderStatusUpdate(
      order._id.toString(),
      order.orderNumber,
      'pending',
      order.customerId,
      order.restaurantId
    );

    console.log('✅ Order created and notifications sent:', order.orderNumber);

    return NextResponse.json(
      { success: true, data: order },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// ===================== UPDATE ORDER =====================
export async function PUT(request: NextRequest) {
  const authResult = await getAuthUser(request);
  if (authResult.error) return authResult.error;

  try {
    await connectDB();

    const body = await request.json();
    const { _id, status, driverId } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get current order before update
    const currentOrder = await OrderModel.findById(_id);
    if (!currentOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (driverId) updateData.driverId = driverId;

    const order = await OrderModel.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // ✅ TRIGGER PUSHER: Notify all parties about status change
    await triggerOrderStatusUpdate(
      order._id.toString(),
      order.orderNumber,
      order.status,
      order.customerId,
      order.restaurantId,
      order.driverId
    );

    console.log('✅ Order updated and notifications sent:', order.orderNumber, '→', order.status);

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('PUT /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}