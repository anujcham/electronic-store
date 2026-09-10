import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, phone } = await request.json();

    const query = email ? { email: email.toLowerCase() } : phone ? { phone } : null;
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Email or phone is required.' },
        { status: 400 }
      );
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne(query);
    if (user) {
      user.otp = generatedOtp; // Overwrites old OTP - old OTP becomes invalid!
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    }

    console.log(`📲 [RESEND OTP SENT] New OTP for ${email || phone}: ${generatedOtp}`);

    return NextResponse.json({
      success: true,
      message: `A new 6-digit OTP has been sent!`,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
