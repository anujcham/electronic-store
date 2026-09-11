import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select('-password -otp');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user',
        isVerified: user.isVerified,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const { userId, name, phone, currentPassword, newPassword, role, passkey } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    // Handle Admin role elevation if passkey provided
    if (role === 'admin' && (passkey === 'admin123' || passkey === 'admin')) {
      user.role = 'admin';
    }

    // Handle password update if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required to set a new password.' },
          { status: 400 }
        );
      }

      if (user.password !== currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Incorrect current password.' },
          { status: 400 }
        );
      }

      user.password = newPassword;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user',
        isVerified: user.isVerified,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

