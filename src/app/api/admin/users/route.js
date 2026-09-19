import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Only regular customers/users should be returned - exclude admin and superadmin
    const conditions = [{ role: { $nin: ['admin', 'superadmin'] } }];

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

    const totalUsers = await User.countDocuments(query);
    const totalPages = limit > 0 ? Math.ceil(totalUsers / limit) || 1 : 1;

    let userQuery = User.find(query).select('-password').sort({ createdAt: -1 });
    if (limit > 0) {
      userQuery = userQuery.skip((page - 1) * limit).limit(limit);
    }
    const users = await userQuery;

    const userIds = users.map((u) => u._id);
    const userEmails = users.map((u) => u.email).filter(Boolean);
    const orders = await Order.find({
      $or: [{ user: { $in: userIds } }, { guestEmail: { $in: userEmails } }],
    });

    const formattedUsers = users.map((user) => {
      const userOrders = orders.filter(
        (o) => (o.user && o.user.toString() === user._id.toString()) || o.guestEmail === user.email
      );
      return {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        role: user.role || 'customer',
        createdAt: user.createdAt,
        addresses: user.addresses || [],
        orders: userOrders.map((o) => ({
          id: o._id,
          orderNumber: o.orderNumber,
          totalAmount: o.totalAmount,
          orderStatus: o.orderStatus,
          createdAt: o.createdAt,
          itemsCount: (o.items || []).length,
        })),
        totalOrders: userOrders.length,
        totalSpent: userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedUsers.length,
      totalUsers,
      page,
      totalPages,
      users: formattedUsers,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

