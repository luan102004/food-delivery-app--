// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import NotificationModel from '@/models/Notification';
import { requireAuth } from '@/lib/auth';
import { triggerNotification } from '@/lib/pusher';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query: any = { userId: user.id };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error: any) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, type, title, message, data } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await NotificationModel.create({
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
    });

    // Trigger real-time notification via Pusher
    await triggerNotification(userId, {
      id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      data: notification.data,
    });

    return NextResponse.json(
      { success: true, data: notification },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/mark-all-read - Mark all as read
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    await NotificationModel.updateMany(
      { userId: user.id, isRead: false },
      { isRead: true }
    );

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    console.error('PUT /api/notifications error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
//