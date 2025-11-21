import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MenuItemModel from '@/models/MenuItem';

// GET /api/menu - Get menu items
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const available = searchParams.get('available');

    let query: any = {};

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (available === 'true') {
      query.isAvailable = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const menuItems = await MenuItemModel.find(query)
      .sort({ category: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: menuItems,
      count: menuItems.length,
    });
  } catch (error: any) {
    console.error('GET /api/menu error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/menu - Create menu item
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const menuItem = await MenuItemModel.create(body);

    return NextResponse.json(
      { success: true, data: menuItem },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/menu error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT /api/menu - Update menu item
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    const menuItem = await MenuItemModel.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: menuItem });
  } catch (error: any) {
    console.error('PUT /api/menu error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/menu - Delete menu item
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    const menuItem = await MenuItemModel.findByIdAndDelete(id);

    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: menuItem });
  } catch (error: any) {
    console.error('DELETE /api/menu error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}