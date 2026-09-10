import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { products } from '@/data/products';

export async function GET() {
  try {
    await dbConnect();
    
    // Clear existing products to prevent duplicates during initial setup
    await Product.deleteMany({});
    const createdProducts = await Product.insertMany(products);

    return NextResponse.json({
      success: true,
      message: `Database successfully seeded with ${createdProducts.length} products!`,
      count: createdProducts.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

