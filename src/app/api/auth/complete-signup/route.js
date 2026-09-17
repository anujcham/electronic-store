import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/jwt';

export async function POST(request) {
  try {
    await dbConnect();
    const { firstName, lastName, name, fullName: passedFullName, email, phone } = await request.json();

    const fullName = (name || passedFullName || `${firstName || ''} ${lastName || ''}`).trim();
    if (!fullName) {
      return NextResponse.json(
        { success: false, error: 'Please enter your full name.' },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.trim().replace(/\s+/g, '') : '';

    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, error: 'Email address is required to complete your account setup.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingByEmail = await User.findOne({ email: cleanEmail });
    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: `An account with email "${cleanEmail}" already exists. Please sign in with that email.` },
        { status: 400 }
      );
    }

    // Check if phone already registered (if provided)
    if (cleanPhone) {
      const existingByPhone = await User.findOne({ phone: cleanPhone });
      if (existingByPhone) {
        return NextResponse.json(
          { success: false, error: `An account with mobile number "${cleanPhone}" already exists.` },
          { status: 400 }
        );
      }
    }

    // Create new customer account in MongoDB Atlas
    const newUser = await User.create({
      name: fullName,
      email: cleanEmail,
      phone: cleanPhone || '',
      isVerified: true,
      role: 'customer',
      tokenVersion: 0,
      lastActiveAt: new Date(),
    });

    // Remove used OTP records
    await Otp.deleteMany({
      identifier: { $in: [cleanEmail, cleanPhone].filter(Boolean) },
    });

    // Generate JWT access & refresh tokens
    const payload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: 'customer',
    };

    const accessToken = await signAccessToken(payload, '15m');
    const refreshToken = await signRefreshToken(
      { ...payload, tokenVersion: newUser.tokenVersion || 0 },
      '7d'
    );

    const response = NextResponse.json({
      success: true,
      message: `Account created successfully! Welcome to ElectroVault, ${newUser.name}!`,
      accessToken,
      refreshToken,
      token: accessToken,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
        role: newUser.role || 'customer',
        isVerified: true,
      },
    });

    setAuthCookies(response, { accessToken, refreshToken, isAdmin: false });
    return response;
  } catch (error) {
    console.error('Error completing customer signup:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

