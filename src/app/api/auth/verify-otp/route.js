import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/jwt';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, phone, otp } = await request.json();

    if (!otp) {
      return NextResponse.json(
        { success: false, error: 'OTP code is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? phone.trim().replace(/\s+/g, '') : null;
    const identifier = cleanEmail || cleanPhone;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Email or mobile number is required.' },
        { status: 400 }
      );
    }

    // 1. Verify against Otp collection
    let otpRecord = await Otp.findOne({ identifier });
    let isOtpValid = false;

    if (otpRecord && otpRecord.otp === otp) {
      if (otpRecord.expiresAt && new Date() > new Date(otpRecord.expiresAt)) {
        return NextResponse.json(
          { success: false, error: 'OTP has expired. Please click Resend OTP to get a new code.' },
          { status: 400 }
        );
      }
      isOtpValid = true;
      otpRecord.verified = true;
      await otpRecord.save();
    } else {
      // Fallback check on User model for backward compatibility
      const query = cleanEmail ? { email: cleanEmail } : { phone: cleanPhone };
      const fallbackUser = await User.findOne(query);
      if (fallbackUser && fallbackUser.otp === otp) {
        if (fallbackUser.otpExpiresAt && new Date() > new Date(fallbackUser.otpExpiresAt)) {
          return NextResponse.json(
            { success: false, error: 'OTP has expired. Please click Resend OTP to get a new code.' },
            { status: 400 }
          );
        }
        isOtpValid = true;
      }
    }

    if (!isOtpValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP code. Please check the 6-digit code sent to you.' },
        { status: 400 }
      );
    }

    // 2. Check if user already exists in database
    const query = cleanEmail ? { email: cleanEmail } : { phone: cleanPhone };
    let user = await User.findOne(query);

    // CASE A: Existing User -> Auto-login with JWT session
    if (user) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      user.lastActiveAt = new Date();
      await user.save();

      const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role || 'customer',
      };

      const accessToken = await signAccessToken(payload, '15m');
      const refreshToken = await signRefreshToken(
        { ...payload, tokenVersion: user.tokenVersion || 0 },
        '7d'
      );

      const response = NextResponse.json({
        success: true,
        isNewUser: false,
        message: `Welcome back, ${user.name}!`,
        accessToken,
        refreshToken,
        token: accessToken,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role || 'customer',
          isVerified: true,
        },
      });

      setAuthCookies(response, { accessToken, refreshToken, isAdmin: false });
      return response;
    }

    // CASE B: New User -> Prompt for Profile Completion in same modal
    return NextResponse.json({
      success: true,
      isNewUser: true,
      message: 'OTP verified! Please complete your profile.',
      identifier: {
        type: cleanEmail ? 'email' : 'phone',
        value: cleanEmail || cleanPhone,
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
