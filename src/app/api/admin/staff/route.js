import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { extractTokenFromRequest, verifyAccessToken, COOKIE_NAMES } from '@/lib/jwt';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

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

    const conditions = [{ role: { $in: ['superadmin', 'admin'] } }];

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      conditions.push({
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { phone: { $regex: searchRegex } },
        ],
      });
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 0;

    const query = { $and: conditions };

    const totalStaff = await User.countDocuments(query);
    const totalPages = limit > 0 ? Math.ceil(totalStaff / limit) || 1 : 1;

    let staffQuery = User.find(query)
      .select('-password -otp')
      .sort({ createdAt: -1 });
    if (limit > 0) {
      staffQuery = staffQuery.skip((page - 1) * limit).limit(limit);
    }
    const staffList = await staffQuery;

    return NextResponse.json({
      success: true,
      count: staffList.length,
      totalStaff,
      page,
      totalPages,
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

    // Role-based authorization: Verify Super Admin permission via JWT or verified requester email
    let isSuperAdmin = false;
    const token = extractTokenFromRequest(request, COOKIE_NAMES.ADMIN_ACCESS);
    if (token) {
      const tokenPayload = await verifyAccessToken(token);
      if (tokenPayload && tokenPayload.role === 'superadmin') {
        isSuperAdmin = true;
      }
    }

    // Fallback verification for direct API callers with requesterEmail
    if (!isSuperAdmin && requesterEmail) {
      const cleanRequester = requesterEmail.toLowerCase().trim();
      const requesterUser = await User.findOne({ email: cleanRequester });
      if (requesterUser && requesterUser.role === 'superadmin') {
        isSuperAdmin = true;
      }
    }

    if (!isSuperAdmin) {
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

    // Securely hash new staff admin's password with bcrypt
    const hashedPassword = await hashPassword(password);

    // Create new Staff Admin User (strictly role: 'admin')
    const newAdmin = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'admin',
      isVerified: true,
      tokenVersion: 0,
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
