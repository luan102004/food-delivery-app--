// src/app/api/menu/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, parseRequestBody, castToObjectId, formatError } from '@/lib/apiHelpers';
import MenuItemModel from '@/models/MenuItem';
import { requireRole } from '@/lib/auth';

// GET menu items
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const available = searchParams.get('available');

    const query: any = {};
    if (restaurantId) {
      try { query.restaurantId = castToObjectId(restaurantId); } catch (e) { return NextResponse.json({ success: false, error: 'Invalid restaurantId' }, { status: 400 }); }
    }
    if (category && category !== 'all') query.category = category;
    if (available === 'true') query.isAvailable = true;
    if (search) query.$text = { $search: search };

    const menuItems = await MenuItemModel.find(query).sort({ category: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, data: menuItems, count: menuItems.length });
  } catch (error: any) {
    console.error('GET /api/menu error:', error);
    return NextResponse.json({ success: false, error: formatError(error).message }, { status: 500 });
  }
}

// POST create menu item
export async function POST(request: NextRequest) {
  try {
    await requireRole(['restaurant', 'admin']);
    await connectDB();
    const body = await parseRequestBody(request);

    if (!body.restaurantId || !body.name || body.price === undefined) {
      return NextResponse.json({ success: false, error: 'restaurantId, name and price are required' }, { status: 400 });
    }

    try { body.restaurantId = castToObjectId(body.restaurantId); } catch (e) { return NextResponse.json({ success: false, error: 'Invalid restaurantId' }, { status: 400 }); }

    const menuItem = await MenuItemModel.create({
      restaurantId: body.restaurantId,
      name: body.name,
      description: body.description || '',
      price: Number(body.price),
      category: body.category || 'other',
      image: body.image || '',
      preparationTime: Number(body.preparationTime || 15),
      isAvailable: body.isAvailable ?? true,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? [body.tags] : []),
    });

    return NextResponse.json({ success: true, data: menuItem }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/menu error:', error);
    return NextResponse.json({ success: false, error: formatError(error).message }, { status: 400 });
  }
}

// PUT update
export async function PUT(request: NextRequest) {
  try {
    await requireRole(['restaurant', 'admin']);
    await connectDB();
    const body = await parseRequestBody(request);
    const { _id, ...updateData } = body;
    if (!_id) return NextResponse.json({ success: false, error: 'Menu item ID is required' }, { status: 400 });

    if (updateData.restaurantId) {
      try { updateData.restaurantId = castToObjectId(updateData.restaurantId); } catch (e) { return NextResponse.json({ success: false, error: 'Invalid restaurantId' }, { status: 400 }); }
    }

    const menuItem = await MenuItemModel.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });
    if (!menuItem) return NextResponse.json({ success: false, error: 'Menu item not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: menuItem });
  } catch (error: any) {
    console.error('PUT /api/menu error:', error);
    return NextResponse.json({ success: false, error: formatError(error).message }, { status: 400 });
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  try {
    await requireRole(['restaurant', 'admin']);
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Menu item ID is required' }, { status: 400 });

    const menuItem = await MenuItemModel.findByIdAndDelete(id);
    if (!menuItem) return NextResponse.json({ success: false, error: 'Menu item not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: menuItem });
  } catch (error: any) {
    console.error('DELETE /api/menu error:', error);
    return NextResponse.json({ success: false, error: formatError(error).message }, { status: 400 });
  }
}
