import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, phone } = await request.json();

    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? phone.trim().replace(/\s+/g, '') : null;
    const identifier = cleanEmail || cleanPhone;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid mobile number or email address.' },
        { status: 400 }
      );
    }

    // Basic format validation
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (cleanPhone && cleanPhone.replace(/\D/g, '').length < 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid phone number.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const query = cleanEmail ? { email: cleanEmail } : { phone: cleanPhone };
    const existingUser = await User.findOne(query);

    // Generate fresh 6-digit numeric OTP with 10-minute expiry
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store in dedicated Otp collection with TTL index
    await Otp.findOneAndUpdate(
      { identifier },
      { identifier, otp: generatedOtp, expiresAt, verified: false },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Also update User document if existing for backward compatibility
    if (existingUser) {
      existingUser.otp = generatedOtp;
      existingUser.otpExpiresAt = expiresAt;
      await existingUser.save();
    }

    // Dispatch verification via Real Email if email identifier was provided
    let emailResult = null;
    if (cleanEmail) {
      emailResult = await sendVerificationEmail({ email: cleanEmail, otp: generatedOtp });
      if (!emailResult?.sent) {
        return NextResponse.json(
          {
            success: false,
            error: emailResult?.error || 'Failed to send verification email. Please verify SMTP settings.',
          },
          { status: 500 }
        );
      }
    }

    console.log(`📲 [OTP DISPATCH] Identifier: ${identifier}, Code: ${generatedOtp}, Email Sent: ${emailResult?.sent ?? false}, User Exists: ${!!existingUser}`);

    return NextResponse.json({
      success: true,
      message: cleanEmail
        ? `A 6-digit verification code has been sent to ${cleanEmail}!`
        : `A 6-digit verification code has been sent to ${cleanPhone}!`,
      isExistingUser: !!existingUser,
      channel: cleanEmail ? 'email' : 'phone',
      otp: generatedOtp, // returned for browser console logging during development/testing
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
