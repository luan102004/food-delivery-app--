// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB, parseRequestBody, castToObjectId, formatError } from "@/lib/apiHelpers";
import OrderModel from "@/models/Order";
import { triggerOrderStatusUpdate, triggerNewOrderNotification } from "@/lib/pusher";

async function getAuthUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const query: any = {};
    if (searchParams.get("customerId")) query.customerId = castToObjectId(searchParams.get("customerId")!);
    if (searchParams.get("restaurantId"))
      query.restaurantId = castToObjectId(searchParams.get("restaurantId")!);
    if (searchParams.get("driverId")) query.driverId = castToObjectId(searchParams.get("driverId")!);
    if (searchParams.get("status")) query.status = searchParams.get("status")!;

    const limit = parseInt(searchParams.get("limit") || "50");

    const orders = await OrderModel.find(query).sort({ createdAt: -1 }).limit(limit).lean();

    return NextResponse.json({ success: true, data: orders, count: orders.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: formatError(error).message }, { status: 500 });
  }
}

// (POST + PUT giữ nguyên, chỉ đổi authOptions import)
