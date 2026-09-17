import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  extractTokenFromRequest,
  setAuthCookies,
  COOKIE_NAMES,
} from '@/lib/jwt';

export async function POST(request) {
  try {
    await dbConnect();

    let refreshToken = extractTokenFromRequest(request, COOKIE_NAMES.CUSTOMER_REFRESH);

    // Fallback: check if passed in body
    if (!refreshToken) {
      try {
        const body = await request.json();
        refreshToken = body?.refreshToken;
      } catch {
        // No body
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token provided.' },
        { status: 401 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired refresh token. Please sign in again.' },
        { status: 401 }
      );
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User account no longer exists.' },
        { status: 401 }
      );
    }

    // Check token version to support server-side session revocation
    if ((user.tokenVersion || 0) !== (payload.tokenVersion || 0)) {
      return NextResponse.json(
        { success: false, error: 'Session has been invalidated. Please sign in again.' },
        { status: 401 }
      );
    }

    // Refresh last active timestamp
    user.lastActiveAt = new Date();
    await user.save();

    const newPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'customer',
    };

    // Issue new 15-minute access token & rotated 7-day refresh token
    const newAccessToken = await signAccessToken(newPayload, '15m');
    const newRefreshToken = await signRefreshToken(
      { ...newPayload, tokenVersion: user.tokenVersion || 0 },
      '7d'
    );

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      token: newAccessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'customer',
        isVerified: user.isVerified,
      },
    });

    setAuthCookies(response, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      isAdmin: false,
    });

    return response;
  } catch (error) {
    console.error('Error refreshing customer auth token:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

