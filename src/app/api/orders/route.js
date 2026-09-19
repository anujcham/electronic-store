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
      activityLog: [
        {
          action: 'Order Placed & Payment Confirmed',
          newStatus: 'Processing',
          performedBy: shippingAddress?.fullName || 'Customer',
          performedByEmail: shippingAddress?.email || guestEmail || '',
          performedByRole: 'customer',
          note: `Initial order created with ${paymentMethod || 'Credit / Debit Card'}. Awaiting 50-point diagnostic inspection.`,
          timestamp: new Date(),
        },
      ],
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

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 0;

    const query = conditions.length > 0 ? { $and: conditions } : {};

    const totalOrders = await Order.countDocuments(query);
    const totalPages = limit > 0 ? Math.ceil(totalOrders / limit) || 1 : 1;

    let ordersQuery = Order.find(query).sort({ createdAt: -1 });
    if (limit > 0) {
      ordersQuery = ordersQuery.skip((page - 1) * limit).limit(limit);
    }
    const orders = await ordersQuery;

    return NextResponse.json({
      success: true,
      count: orders.length,
      totalOrders,
      page,
      totalPages,
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
    const {
      orderId,
      orderNumber,
      orderStatus,
      trackingNumber,
      courierName,
      estimatedDelivery,
      performedBy,
      performedByEmail,
      performedByRole,
      note,
    } = body;

    if (!orderId && !orderNumber) {
      return NextResponse.json(
        { success: false, error: 'orderId or orderNumber is required to update order status.' },
        { status: 400 }
      );
    }

    const query = orderId ? { _id: orderId } : { orderNumber };
    const existingOrder = await Order.findOne(query);

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    // Ensure activityLog array exists
    if (!Array.isArray(existingOrder.activityLog)) {
      existingOrder.activityLog = [];
    }

    // Synthesize initial placement event if log was empty
    if (existingOrder.activityLog.length === 0) {
      existingOrder.activityLog.push({
        action: 'Order Placed & Payment Confirmed',
        newStatus: 'Processing',
        performedBy: existingOrder.shippingAddress?.fullName || 'Customer',
        performedByEmail: existingOrder.shippingAddress?.email || existingOrder.guestEmail || '',
        performedByRole: 'customer',
        note: 'Order placed by customer via checkout.',
        timestamp: existingOrder.createdAt || new Date(),
      });
    }

    const performer = performedBy || 'Admin Staff';
    const performerEmail = performedByEmail || '';
    const performerRole = performedByRole || 'admin';

    // 1. Log order status changes
    if (orderStatus && orderStatus !== existingOrder.orderStatus) {
      const prevStatus = existingOrder.orderStatus;
      existingOrder.orderStatus = orderStatus;
      existingOrder.activityLog.push({
        action: `Status Changed to '${orderStatus}'`,
        previousStatus: prevStatus,
        newStatus: orderStatus,
        performedBy: performer,
        performedByEmail: performerEmail,
        performedByRole: performerRole,
        note: note || `Order status updated from '${prevStatus}' to '${orderStatus}'.`,
        timestamp: new Date(),
      });
    }

    // 2. Log tracking number updates
    if (trackingNumber !== undefined && trackingNumber !== existingOrder.trackingNumber) {
      const prevTracking = existingOrder.trackingNumber;
      existingOrder.trackingNumber = trackingNumber;
      existingOrder.activityLog.push({
        action: 'Tracking Reference Updated',
        previousStatus: prevTracking || 'Unassigned',
        newStatus: trackingNumber,
        performedBy: performer,
        performedByEmail: performerEmail,
        performedByRole: performerRole,
        note: `Tracking number set to '${trackingNumber}' (${courierName || existingOrder.courierName || 'Royal Mail'}).`,
        timestamp: new Date(),
      });
    }

    // 3. Log Courier partner updates
    if (courierName !== undefined && courierName.trim() !== (existingOrder.courierName || "").trim()) {
      const prevCourier = existingOrder.courierName || "Royal Mail Tracked 24";
      existingOrder.courierName = courierName;
      existingOrder.activityLog.push({
        action: `Courier Name Updated to '${courierName}'`,
        previousStatus: prevCourier,
        newStatus: courierName,
        performedBy: performer,
        performedByEmail: performerEmail,
        performedByRole: performerRole,
        note: `Fulfillment courier changed from '${prevCourier}' to '${courierName}'.`,
        timestamp: new Date(),
      });
    }

    // 4. Log estimated delivery updates
    if (estimatedDelivery !== undefined && estimatedDelivery.trim() !== (existingOrder.estimatedDelivery || "").trim()) {
      const prevEst = existingOrder.estimatedDelivery || "2-4 working days";
      existingOrder.estimatedDelivery = estimatedDelivery;
      existingOrder.activityLog.push({
        action: `Estimated Delivery Window Updated`,
        previousStatus: prevEst,
        newStatus: estimatedDelivery,
        performedBy: performer,
        performedByEmail: performerEmail,
        performedByRole: performerRole,
        note: `Estimated delivery updated from '${prevEst}' to '${estimatedDelivery}'.`,
        timestamp: new Date(),
      });
    }

    await existingOrder.save();

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully with activity logged!',
      order: existingOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
