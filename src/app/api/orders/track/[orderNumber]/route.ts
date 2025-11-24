// src/app/api/orders/track/[orderNumber]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import DriverLocationModel from "@/models/DriverLocation";
import RestaurantModel from "@/models/Restaurant";

// GET /api/orders/track/[orderNumber]
export async function GET(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    await connectDB();

    const { orderNumber } = params;

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required" },
        { status: 400 }
      );
    }

    // --- Fetch order ---
    const order = await OrderModel.findOne({ orderNumber }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // --- Fetch restaurant ---
    const restaurant = await RestaurantModel.findById(order.restaurantId)
      .select("name address location")
      .lean();

    // --- Fetch driver location (optional) ---
    let driverLocation = null;

    if (order.driverId) {
      driverLocation = await DriverLocationModel.findOne({
        driverId: order.driverId,
      })
        .select("driverId coords updatedAt")
        .lean();
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
    console.error("GET /api/orders/track error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}
//