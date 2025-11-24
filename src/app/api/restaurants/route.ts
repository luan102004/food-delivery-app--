// src/app/api/restaurants/route.ts - COMPLETE GEOSPATIAL VERSION
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RestaurantModel from '@/models/Restaurant';
import { requireRole } from '@/lib/auth';

// GET /api/restaurants - Get restaurants with geospatial search
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const cuisine = searchParams.get('cuisine');
    const search = searchParams.get('search');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const maxDistance = parseInt(searchParams.get('maxDistance') || '10000'); // meters
    const isOpen = searchParams.get('isOpen');

    let query: any = {};

    // 🔥 GEOSPATIAL QUERY - Find restaurants near user
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        query['address.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude] // [lng, lat] order!
            },
            $maxDistance: maxDistance
          }
        };
      }
    }

    // Filter by cuisine
    if (cuisine && cuisine !== 'all') {
      query.cuisine = cuisine;
    }

    // Filter by open status
    if (isOpen === 'true') {
      query.isOpen = true;
    }

    // Text search by name/description
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const restaurants = await RestaurantModel.find(query)
      .sort({ rating: -1 }) // Sort by rating if no location
      .limit(50)
      .lean();

    // Calculate distance for each restaurant if user location provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      restaurants.forEach((restaurant: any) => {
        if (restaurant.address?.coordinates?.coordinates) {
          const [restLng, restLat] = restaurant.address.coordinates.coordinates;
          const distance = calculateDistance(
            { lat: userLat, lng: userLng },
            { lat: restLat, lng: restLng }
          );
          
          restaurant.distance = distance < 1 
            ? `${Math.round(distance * 1000)}m` 
            : `${distance.toFixed(1)}km`;
        }
      });
    }

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

// POST /api/restaurants - Create restaurant
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['admin', 'restaurant']);
    await connectDB();

    const body = await request.json();
    
    // Validate coordinates
    if (!body.address?.coordinates?.coordinates) {
      return NextResponse.json(
        { success: false, error: 'Restaurant coordinates are required' },
        { status: 400 }
      );
    }

    const [lng, lat] = body.address.coordinates.coordinates;
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Format coordinates as GeoJSON
    const restaurantData = {
      ...body,
      ownerId: user.role === 'restaurant' ? user.id : body.ownerId,
      address: {
        ...body.address,
        coordinates: {
          type: 'Point',
          coordinates: [lng, lat] // [longitude, latitude]
        }
      }
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
      if (!existing || existing.ownerId.toString() !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    // Format coordinates if provided
    if (updateData.address?.coordinates?.coordinates) {
      const [lng, lat] = updateData.address.coordinates.coordinates;
      updateData.address.coordinates = {
        type: 'Point',
        coordinates: [lng, lat]
      };
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

// DELETE /api/restaurants
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

// Helper: Calculate distance using Haversine formula
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}