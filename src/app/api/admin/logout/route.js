import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { extractTokenFromRequest, verifyAccessToken, clearAuthCookies, COOKIE_NAMES } from '@/lib/jwt';

export async function POST(request) {
  try {
    await dbConnect();

    // Invalidate admin token in DB if accessible
    const token = extractTokenFromRequest(request, COOKIE_NAMES.ADMIN_ACCESS);
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
      message: 'Admin session ended successfully.',
    });

    clearAuthCookies(response, { isAdmin: true });

    return response;
  } catch (error) {
    console.error('Error during admin logout:', error);
    const response = NextResponse.json({
      success: true,
      message: 'Admin session cleared locally.',
    });
    clearAuthCookies(response, { isAdmin: true });
    return response;
  }
}

