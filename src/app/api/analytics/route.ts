import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OrderModel from '@/models/Order';
import AnalyticsCacheModel from '@/models/AnalyticsCache';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(['restaurant', 'admin']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const entityId = searchParams.get('entityId') || user.id;

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 12));
        break;
      case 'yearly':
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Try to get from cache first
    const cached = await AnalyticsCacheModel.find({
      entityId,
      period,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    if (cached.length > 0) {
      return NextResponse.json({
        success: true,
        data: cached,
        source: 'cache',
      });
    }

    // Calculate analytics from orders
    const orders = await OrderModel.find({
      restaurantId: entityId,
      createdAt: { $gte: startDate },
      status: { $in: ['delivered', 'completed'] },
    });

    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;

    // Get top items
    const itemCounts: Record<string, number> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const topItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const analytics = {
      revenue,
      orders: orders.length,
      customers: new Set(orders.map(o => o.customerId)).size,
      avgOrderValue,
      topItems,
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      source: 'realtime',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}