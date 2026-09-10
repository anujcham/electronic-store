import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, phone, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists.' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP for testing/verification
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password, // Note: For full prod, add bcrypt hash here
      otp: generatedOtp,
      otpExpiresAt,
      isVerified: true, // Auto-verify for smooth initial demo experience
    });

    console.log(`🔑 [AUTH REGISTER] Generated OTP for ${email}: ${generatedOtp}`);

    return NextResponse.json({
      success: true,
      message: 'User registered successfully!',
      otp: generatedOtp, // Included in response for testing without SMS provider!
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        memberSince: 'Just Now',
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

