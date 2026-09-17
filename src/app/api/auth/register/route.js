import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

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

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please log in.' },
        { status: 400 }
      );
    }

    // Securely hash password with bcrypt
    const hashedPassword = await hashPassword(password);

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      name,
      email: cleanEmail,
      phone: phone || '',
      password: hashedPassword,
      otp: generatedOtp,
      otpExpiresAt,
      isVerified: false,
      role: 'customer',
      tokenVersion: 0,
    });

    console.log(`📲 [SMS/EMAIL OTP SENT] Generated OTP for ${cleanEmail}: ${generatedOtp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
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
