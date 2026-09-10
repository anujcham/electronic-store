import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Wishlist from '@/models/Wishlist';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: true, items: [] });
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    return NextResponse.json({
      success: true,
      items: wishlist ? wishlist.items : [],
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
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
      return NextResponse.json({ success: true, items: [] });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: items || [] });
    } else {
      wishlist.items = items || [];
    }

    await wishlist.save();

    return NextResponse.json({
      success: true,
      message: 'Wishlist synchronized with MongoDB!',
      items: wishlist.items,
    });
  } catch (error) {
    console.error('Error syncing wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

