import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/auth/redirect - Get redirect URL based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ redirectUrl: '/' });
    }

    const roleRedirects: Record<string, string> = {
      customer: '/customer',
      restaurant: '/restaurant',
      driver: '/driver',
      admin: '/admin/users',
    };

    const redirectUrl = roleRedirects[session.user.role as string] || '/customer';

    return NextResponse.json({ 
      redirectUrl,
      user: session.user 
    });
  } catch (error) {
    return NextResponse.json({ redirectUrl: '/' });
  }
}