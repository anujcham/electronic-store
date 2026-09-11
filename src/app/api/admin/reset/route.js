import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST() {
  try {
    await dbConnect();

    // Remove all users from database
    await User.deleteMany({});

    // Create the single primary Super Admin account
    const superAdmin = await User.create({
      name: 'Anuj Thakur',
      email: 'anuj.chambyal@gmail.com',
      password: 'root',
      role: 'superadmin',
      isVerified: true,
      phone: '',
    });

    return NextResponse.json({
      success: true,
      message: 'Database cleared! Only Super Admin "Anuj Thakur" (anuj.chambyal@gmail.com) remains.',
      superAdmin: {
        id: superAdmin._id.toString(),
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    console.error('Error resetting admin users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

