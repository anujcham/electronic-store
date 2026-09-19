import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import Cart from '@/models/Cart';

export async function GET() {
  try {
    await dbConnect();

    // 1. Orders and Revenue Aggregations
    const [totalOrdersCount, pendingDispatchCount, revenueResult] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({
        orderStatus: { $in: ['Processing', 'Placed'] },
      }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    // 2. Products Metrics
    const [totalProductsCount, featuredCount] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ featured: true }),
    ]);

    // 3. User & Staff Metrics
    const [customersCount, staffCount] = await Promise.all([
      User.countDocuments({ role: { $nin: ['admin', 'superadmin'] } }),
      User.countDocuments({ role: { $in: ['admin', 'superadmin'] } }),
    ]);

    // 4. Cart Metrics
    const activeCarts = await Cart.find({ 'items.0': { $exists: true } });
    const activeCartsCount = activeCarts.length;
    const cartPipelineValue = activeCarts.reduce((total, cart) => {
      const items = cart.items || [];
      const cartVal = items.reduce(
        (sub, it) => sub + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
      );
      return total + cartVal;
    }, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrdersCount,
        pendingDispatchCount,
        totalProductsCount,
        featuredCount,
        staffCount,
        customersCount,
        avgOrderValue,
        activeCartsCount,
        cartPipelineValue,
      },
    });
  } catch (error) {
    console.error('Error fetching admin KPI stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

