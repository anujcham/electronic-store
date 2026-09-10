import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Cart from '@/models/Cart';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: true, items: [] });
    }

    const cart = await Cart.findOne({ user: userId });
    return NextResponse.json({
      success: true,
      items: cart ? cart.items : [],
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { userId, items } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: true });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: items || [] });
    } else {
      cart.items = items || [];
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Cart synchronized with MongoDB!',
      items: cart.items,
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

