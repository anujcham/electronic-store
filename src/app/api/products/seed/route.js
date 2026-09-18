import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { products } from '@/data/products';

export async function GET() {
  try {
    await dbConnect();
    
    let count = 0;
    for (const prod of products) {
      const { id, ...prodData } = prod;
      await Product.findOneAndUpdate(
        { slug: prod.slug },
        { $set: prodData },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      count++;
    }

    // Ensure all products without reviews strictly have rating: 0 and reviewCount: 0
    await Product.updateMany(
      {
        $or: [
          { reviews: { $size: 0 } },
          { reviews: { $exists: false } },
        ],
      },
      {
        $set: { rating: 0, reviewCount: 0 },
      }
    );

    const totalCount = await Product.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Database successfully synced with ${count} catalog products!`,
      totalInDatabase: totalCount,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
