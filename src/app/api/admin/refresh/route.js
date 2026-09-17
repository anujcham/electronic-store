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

    let refreshToken = extractTokenFromRequest(request, COOKIE_NAMES.ADMIN_REFRESH);

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
        { success: false, error: 'Admin session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired admin refresh token.' },
        { status: 401 }
      );
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Admin account not found.' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Access Denied: Revoked administrative privileges.' },
        { status: 403 }
      );
    }

    // Server-side session invalidation check
    if ((user.tokenVersion || 0) !== (payload.tokenVersion || 0)) {
      return NextResponse.json(
        { success: false, error: 'Admin session revoked. Please log in again.' },
        { status: 401 }
      );
    }

    user.lastActiveAt = new Date();
    await user.save();

    const newPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isAdminPortal: true,
    };

    const newAccessToken = await signAccessToken(newPayload, '15m');
    const newRefreshToken = await signRefreshToken(
      { ...newPayload, tokenVersion: user.tokenVersion || 0 },
      '2h'
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
        phone: user.phone || '',
        role: user.role,
        isVerified: true,
      },
    });

    setAuthCookies(response, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      isAdmin: true,
    });

    return response;
  } catch (error) {
    console.error('Error refreshing admin auth token:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

