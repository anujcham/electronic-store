import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;

    const product = await Product.findOne({ slug }).select('reviews rating reviewCount name');
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      rating: product.rating,
      reviewCount: product.reviewCount || (product.reviews ? product.reviews.length : 0),
      reviews: product.reviews || [],
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    const body = await request.json();

    const { userName, rating, comment } = body;

    if (!userName || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required review fields (userName, rating, comment)' },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ slug });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const newReview = {
      userName: userName.trim(),
      rating: numRating,
      comment: comment.trim(),
      createdAt: new Date(),
      verifiedPurchase: true,
    };

    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    product.reviews.push(newReview);

    // Recalculate average rating & review count
    const totalRatingSum = product.reviews.reduce((acc, curr) => acc + Number(curr.rating), 0);
    product.reviewCount = product.reviews.length;
    product.rating = Number((totalRatingSum / product.reviews.length).toFixed(1));

    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully!',
      rating: product.rating,
      reviewCount: product.reviewCount,
      reviews: product.reviews,
    });
  } catch (error) {
    console.error('Error adding product review:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

