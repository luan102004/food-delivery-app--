import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OrderModel from '@/models/Order';
import jwt from "jsonwebtoken";

// Middleware xác thực token
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return { error: "No token provided" };
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return { error: "Invalid token format" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return { decoded };
  } catch (e) {
    return { error: "Token invalid or expired" };
  }
}

// ===================== GET ORDERS ===================== //
export async function GET(request: NextRequest) {
  try {
    const verify = await verifyToken(request);
    if (verify.error) {
      return NextResponse.json({ success: false, error: verify.error }, { status: 401 });
    }

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

// ===================== CREATE ORDER ===================== //
export async function POST(request: NextRequest) {
  try {
    const verify = await verifyToken(request);
    if (verify.error) {
      return NextResponse.json({ success: false, error: verify.error }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 30);

    const orderData = {
      ...body,
      customerId: verify.decoded._id,  // Lấy ID trong token
      estimatedDeliveryTime,
      status: 'pending',
    };

    const order = await OrderModel.create(orderData);

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

// ===================== UPDATE ORDER ===================== //
export async function PUT(request: NextRequest) {
  try {
    const verify = await verifyToken(request);
    if (verify.error) {
      return NextResponse.json({ success: false, error: verify.error }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { _id, status, driverId } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
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

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('PUT /api/orders error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
