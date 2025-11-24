// src/app/api/restaurants/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RestaurantModel from '@/models/Restaurant';
import { requireRole } from '@/lib/auth';

// GET /api/restaurants - Get all restaurants
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const cuisine = searchParams.get('cuisine');
    const search = searchParams.get('search');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const maxDistance = parseInt(searchParams.get('maxDistance') || '10000'); // meters

    let query: any = {};

    // Filter by cuisine
    if (cuisine && cuisine !== 'all') {
      query.cuisine = cuisine;
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Geo-spatial query
    if (lat && lng) {
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: maxDistance,
        },
      };
    }

    const restaurants = await RestaurantModel.find(query)
      .sort({ rating: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      data: restaurants,
      count: restaurants.length,
    });
  } catch (error: any) {
    console.error('GET /api/restaurants error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/restaurants - Create new restaurant (Admin/Restaurant owner)
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['admin', 'restaurant']);
    await connectDB();

    const body = await request.json();
    
    // Set ownerId to current user if restaurant role
    const restaurantData = {
      ...body,
      ownerId: user.role === 'restaurant' ? user.id : body.ownerId,
    };

    const restaurant = await RestaurantModel.create(restaurantData);

    return NextResponse.json(
      { success: true, data: restaurant },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/restaurants error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT /api/restaurants - Update restaurant
export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(['admin', 'restaurant']);
    await connectDB();

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Check ownership for restaurant role
    if (user.role === 'restaurant') {
      const existing = await RestaurantModel.findById(_id);
      if (!existing || existing.ownerId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    const restaurant = await RestaurantModel.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: restaurant });
  } catch (error: any) {
    console.error('PUT /api/restaurants error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/restaurants - Delete restaurant
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireRole(['admin']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    const restaurant = await RestaurantModel.findByIdAndDelete(id);

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Restaurant deleted successfully',
      data: restaurant,
    });
  } catch (error: any) {
    console.error('DELETE /api/restaurants error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}