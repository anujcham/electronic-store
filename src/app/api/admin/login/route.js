import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

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
      user = await User.create({
        name: 'Anuj Thakur',
        email: 'anuj.chambyal@gmail.com',
        password: 'root',
        role: 'superadmin',
        isVerified: true,
      });
    }

    // Ensure the primary account anuj.chambyal@gmail.com is superadmin
    if (user && cleanEmail === 'anuj.chambyal@gmail.com' && user.role !== 'superadmin') {
      user.role = 'superadmin';
      await user.save();
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Account not found. Please check your email.' },
        { status: 401 }
      );
    }

    // Verify Password: exact match only
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid password entered.' },
        { status: 401 }
      );
    }

    // Verify Staff / Superadmin permissions
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Access Denied: Your account does not have Staff Admin or Super Admin privileges.' },
        { status: 403 }
      );
    }

    // Return the user's authentic role directly from database
    return NextResponse.json({
      success: true,
      message: `${user.role === 'superadmin' ? 'Super Admin' : 'Staff Admin'} login successful!`,
      token: `admin_token_${user._id}_${Date.now()}`,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role, // 'superadmin' or 'admin'
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
