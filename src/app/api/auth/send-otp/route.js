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
      user.otp = generatedOtp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    }

    console.log(`📲 [OTP SENT] Sent OTP ${generatedOtp} to ${email || phone}`);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully!`,
      otp: generatedOtp, // Returned in JSON response for instant testing without SMS gateway!
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
