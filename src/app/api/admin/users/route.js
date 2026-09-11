import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET() {
  try {
    await dbConnect();

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    const orders = await Order.find({});

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
        totalOrders: userOrders.length,
        totalSpent: userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
