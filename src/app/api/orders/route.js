import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import Cart from '@/models/Cart';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, guestEmail, items, shippingAddress, paymentMethod, subtotal, shippingFee, tax, totalAmount, warrantyPlan, emiDetails } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart items are required to place an order.' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.email || !shippingAddress.addressLine1) {
      return NextResponse.json(
        { success: false, error: 'Complete shipping address is required.' },
        { status: 400 }
      );
    }

    const orderNumber = `EV-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `GB-EV-${Math.floor(10000000 + Math.random() * 90000000)}`;

    let mongoUserId = null;
    if (userId) {
      try {
        const existingUser = await User.findById(userId);
        if (existingUser) mongoUserId = existingUser._id;
      } catch {}
    }

    // Attach inspection certificate IDs to order items for diagnostic view
    const formattedItems = items.map((item) => ({
      name: item.name,
      slug: item.slug,
      image: item.image || item.images?.[0],
      price: item.price,
      quantity: item.quantity || 1,
      inspectionCertId: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      selectedOptions: item.selectedOptions || {
        storage: item.storage,
        color: item.color,
        condition: item.condition,
      },
    }));

    const newOrder = await Order.create({
      orderNumber,
      user: mongoUserId,
      guestEmail: guestEmail || shippingAddress.email,
      items: formattedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card / Debit Card',
      paymentStatus: 'Paid',
      orderStatus: 'Processing',
      subtotal: subtotal || totalAmount,
      shippingFee: shippingFee || 0,
      tax: tax || 0,
      totalAmount,
      warrantyPlan: warrantyPlan || { id: 'standard', title: '12-Month Standard Warranty', price: 0 },
      emiDetails: emiDetails || null,
      trackingNumber,
      estimatedDelivery: '2-4 working days',
    });

    // 1. Decrement product stock in MongoDB Atlas
    for (const item of items) {
      if (item.slug) {
        await Product.findOneAndUpdate(
          { slug: item.slug },
          { $inc: { stock: -Math.max(1, item.quantity || 1) } }
        ).catch(() => null);
      }
    }

    // 2. Clear user cart in MongoDB Atlas
    if (mongoUserId) {
      await Cart.findOneAndUpdate(
        { user: mongoUserId },
        { items: [] }
      ).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully!',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const conditions = [];

    if (userId) {
      conditions.push({ user: userId });
    } else if (email) {
      conditions.push({
        $or: [{ 'shippingAddress.email': email }, { guestEmail: email }],
      });
    }

    if (status && status !== 'all') {
      conditions.push({
        orderStatus: { $regex: new RegExp(`^${status.trim()}$`, 'i') },
      });
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      conditions.push({
        $or: [
          { orderNumber: { $regex: searchRegex } },
          { 'shippingAddress.fullName': { $regex: searchRegex } },
          { 'shippingAddress.email': { $regex: searchRegex } },
          { 'shippingAddress.phone': { $regex: searchRegex } },
          { guestEmail: { $regex: searchRegex } },
          { trackingNumber: { $regex: searchRegex } },
          { 'items.name': { $regex: searchRegex } },
        ],
      });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { orderId, orderNumber, orderStatus, trackingNumber, courierName, estimatedDelivery } = body;

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { success: false, error: 'orderId or orderNumber is required to update order status.' },
        { status: 400 }
      );
    }

    const query = orderId ? { _id: orderId } : { orderNumber };
    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (courierName !== undefined) update.courierName = courierName;
    if (estimatedDelivery !== undefined) update.estimatedDelivery = estimatedDelivery;

    const updatedOrder = await Order.findOneAndUpdate(query, { $set: update }, { new: true });

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully!',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
