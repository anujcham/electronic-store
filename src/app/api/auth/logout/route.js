import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { extractTokenFromRequest, verifyAccessToken, clearAuthCookies, COOKIE_NAMES } from '@/lib/jwt';

export async function POST(request) {
  try {
    await dbConnect();

    // Invalidate refresh token in database by incrementing tokenVersion
    const token = extractTokenFromRequest(request, COOKIE_NAMES.CUSTOMER_ACCESS);
    if (token) {
      const payload = await verifyAccessToken(token);
      if (payload && payload.userId) {
        await User.findByIdAndUpdate(payload.userId, {
          $inc: { tokenVersion: 1 },
          $set: { lastActiveAt: new Date() },
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    clearAuthCookies(response, { isAdmin: false });

    return response;
  } catch (error) {
    console.error('Error during customer logout:', error);
    const response = NextResponse.json({
      success: true,
      message: 'Logged out locally.',
    });
    clearAuthCookies(response, { isAdmin: false });
    return response;
  }
}

