import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RestaurantModel from '@/models/Restaurant';

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

    let query: any = { isOpen: true };

    // Filter by cuisine
    if (cuisine && cuisine !== 'all') {
      query.cuisine = cuisine;
    }

    // Search by name
    if (search) {
      query.$text = { $search: search };
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

// POST /api/restaurants - Create new restaurant
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const restaurant = await RestaurantModel.create(body);

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