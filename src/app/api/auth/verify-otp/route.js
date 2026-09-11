import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, phone, otp } = await request.json();

    if (!otp) {
      return NextResponse.json(
        { success: false, error: 'OTP is required.' },
        { status: 400 }
      );
    }

    const query = email ? { email: email.toLowerCase() } : phone ? { phone } : null;
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Email or phone is required.' },
        { status: 400 }
      );
    }

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    // Strictly verify OTP matching stored latest OTP in database
    if (!user.otp || user.otp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP code. Please enter the latest OTP sent to you.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please click Resend OTP to get a new code.' },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user',
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
