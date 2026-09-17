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
        { success: false, error: 'Staff email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists in database
    let user = await User.findOne({ email: cleanEmail });

    // Seed default Super Admin account "Anuj Thakur" ONLY if the primary email does not exist
    if (!user && cleanEmail === 'anuj.chambyal@gmail.com') {
      const hashedDefaultPassword = await hashPassword('root');
      user = await User.create({
        name: 'Anuj Thakur',
        email: 'anuj.chambyal@gmail.com',
        password: hashedDefaultPassword,
        role: 'superadmin',
        isVerified: true,
        tokenVersion: 0,
      });
    }

    // Ensure the primary account anuj.chambyal@gmail.com is superadmin
    if (user && cleanEmail === 'anuj.chambyal@gmail.com' && user.role !== 'superadmin') {
      user.role = 'superadmin';
      await user.save();
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Account not found. Please check your staff email.' },
        { status: 401 }
      );
    }

    // Verify Password using bcrypt (with legacy plain-text fallback)
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid password entered.' },
        { status: 401 }
      );
    }

    // Auto-migrate plain text password to bcrypt
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      user.password = await hashPassword(password);
    }

    // Verify Staff / Superadmin permissions
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Access Denied: Your account does not have Staff Admin or Super Admin privileges.' },
        { status: 403 }
      );
    }

    user.lastActiveAt = new Date();
    await user.save();

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role, // 'admin' or 'superadmin'
      isAdminPortal: true,
    };

    // Admin Token Lifecycles: 15-minute access token, 2-hour refresh token
    const accessToken = await signAccessToken(payload, '15m');
    const refreshToken = await signRefreshToken(
      { ...payload, tokenVersion: user.tokenVersion || 0 },
      '2h'
    );

    const response = NextResponse.json({
      success: true,
      message: `${user.role === 'superadmin' ? 'Super Admin' : 'Staff Admin'} login successful!`,
      accessToken,
      refreshToken,
      token: accessToken, // Backward compatibility
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role, // 'superadmin' or 'admin'
        isVerified: true,
        expiresIn: 15 * 60, // 15 minutes
        sessionLifetime: 2 * 60 * 60, // 2 hours
      },
    });

    // Set HttpOnly cookies for admin
    setAuthCookies(response, { accessToken, refreshToken, isAdmin: true });

    return response;
  } catch (error) {
    console.error('Error logging in admin:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
