import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/jwt';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Auto-migrate legacy plain text passwords to bcrypt
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      user.password = await hashPassword(password);
    }

    user.lastActiveAt = new Date();
    await user.save();

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'customer',
    };

    // Customer Token Lifecycles: 15-minute access token, 7-day refresh token
    const accessToken = await signAccessToken(payload, '15m');
    const refreshToken = await signRefreshToken(
      { ...payload, tokenVersion: user.tokenVersion || 0 },
      '7d'
    );

    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      accessToken,
      refreshToken,
      token: accessToken, // Backward compatibility
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'customer',
        isVerified: user.isVerified,
        memberSince: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : 'Recently',
      },
    });

    // Set secure HttpOnly cookies
    setAuthCookies(response, { accessToken, refreshToken, isAdmin: false });

    return response;
  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
