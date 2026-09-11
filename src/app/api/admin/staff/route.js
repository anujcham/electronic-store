import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Ensure the primary account is superadmin
    await User.updateOne(
      { email: 'anuj.chambyal@gmail.com' },
      { $set: { role: 'superadmin' } }
    );

    // Normalize any other staff accounts that were accidentally given superadmin back to admin
    await User.updateMany(
      { email: { $ne: 'anuj.chambyal@gmail.com' }, role: 'superadmin' },
      { $set: { role: 'admin' } }
    );

    const staffList = await User.find({ role: { $in: ['superadmin', 'admin'] } })
      .select('-password -otp')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: staffList.length,
      staff: staffList,
    });
  } catch (error) {
    console.error('Error fetching admin staff list:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, password, phone, requesterEmail } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Staff name, email, and password are required.' },
        { status: 400 }
      );
    }

    // Role-based authorization: Only Super Admin can create staff accounts
    const cleanRequester = (requesterEmail || '').toLowerCase().trim();
    const requesterUser = await User.findOne({ email: cleanRequester });
    if (!requesterUser || requesterUser.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Permission Denied: Only Super Admin can create new admin staff accounts.' },
        { status: 403 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if account already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: `An account with email "${cleanEmail}" already exists in the system.` },
        { status: 400 }
      );
    }

    // Create new Staff Admin User (strictly role: 'admin')
    const newAdmin = await User.create({
      name,
      email: cleanEmail,
      password,
      phone: phone || '',
      role: 'admin',
      isVerified: true,
    });

    return NextResponse.json({
      success: true,
      message: `Staff Admin "${name}" created successfully with role: admin!`,
      staff: {
        id: newAdmin._id.toString(),
        name: newAdmin.name,
        email: newAdmin.email,
        role: 'admin',
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating admin staff user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
