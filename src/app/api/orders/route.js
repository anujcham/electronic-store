import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, guestEmail, items, shippingAddress, paymentMethod, subtotal, shippingFee, tax, totalAmount } = body;

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
      const existingUser = await User.findById(userId);
      if (existingUser) mongoUserId = existingUser._id;
    }

    const newOrder = await Order.create({
      orderNumber,
      user: mongoUserId,
      guestEmail: guestEmail || shippingAddress.email,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card / Debit Card',
      paymentStatus: 'Paid',
      orderStatus: 'Processing',
      subtotal: subtotal || totalAmount,
      shippingFee: shippingFee || 0,
      tax: tax || 0,
      totalAmount,
      trackingNumber,
      estimatedDelivery: '2-4 working days',
    });

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

    let query = {};
    if (userId) {
      query.user = userId;
    } else if (email) {
      query.$or = [{ 'shippingAddress.email': email }, { guestEmail: email }];
    }

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

