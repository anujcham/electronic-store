import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const brandParam = searchParams.get('brand');
    const conditionParam = searchParams.get('condition');
    const storageParam = searchParams.get('storage');
    const categoryParam = searchParams.get('category');
    const featuredParam = searchParams.get('featured');
    const hotDealsParam = searchParams.get('hotDeals') || searchParams.get('isHotDeal');
    const searchParam = searchParams.get('search');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const sortByParam = searchParams.get('sortBy') || searchParams.get('sort') || 'featured';
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    let query = {};

    // Brand filter (supports comma-separated values or single brand)
    if (brandParam && brandParam !== 'all') {
      const brands = brandParam.split(',').map((b) => b.trim()).filter(Boolean);
      if (brands.length === 1) {
        query.brand = { $regex: new RegExp(`^${brands[0]}$`, 'i') };
      } else if (brands.length > 1) {
        query.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, 'i')) };
      }
    }

    // Condition filter (e.g. Like New, Excellent, Very Good, Good, Fair)
    if (conditionParam && conditionParam !== 'all') {
      const conditions = conditionParam.split(',').map((c) => c.trim()).filter(Boolean);
      if (conditions.length === 1) {
        query.condition = { $regex: new RegExp(`^${conditions[0]}$`, 'i') };
      } else if (conditions.length > 1) {
        query.condition = { $in: conditions.map((c) => new RegExp(`^${c}$`, 'i')) };
      }
    }

    // Storage filter (e.g. 128GB, 256GB)
    if (storageParam && storageParam !== 'all') {
      const storages = storageParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (storages.length > 0) {
        query.$or = query.$or || [];
        query.$or.push(
          { storage: { $in: storages } },
          { availableStorage: { $in: storages } }
        );
      }
    }

    // Category filter
    if (categoryParam && categoryParam !== 'all') {
      query.category = { $regex: new RegExp(`^${categoryParam}$`, 'i') };
    }

    // Featured filter
    if (featuredParam === 'true') {
      query.featured = true;
    }

    // Hot deals filter
    if (hotDealsParam === 'true') {
      query.isHotDeal = true;
    }

    // Price range filter
    if (minPriceParam || maxPriceParam) {
      query.price = {};
      if (minPriceParam && !isNaN(Number(minPriceParam))) {
        query.price.$gte = Number(minPriceParam);
      }
      if (maxPriceParam && !isNaN(Number(maxPriceParam))) {
        query.price.$lte = Number(maxPriceParam);
      }
    }

    // Keyword search filter across name, brand, slug, shortDescription, description
    if (searchParam) {
      const searchOr = [
        { name: { $regex: searchParam, $options: 'i' } },
        { brand: { $regex: searchParam, $options: 'i' } },
        { slug: { $regex: searchParam, $options: 'i' } },
        { shortDescription: { $regex: searchParam, $options: 'i' } },
        { description: { $regex: searchParam, $options: 'i' } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    // Sorting options
    let sortOptions = {};
    switch (sortByParam) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'featured':
      default:
        sortOptions = { featured: -1, rating: -1 };
        break;
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      count: products.length,
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit) || 1,
      products,
    });
  } catch (error) {
    console.error('Error fetching products from database:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      name,
      brand,
      category,
      subcategory,
      price,
      originalPrice,
      condition,
      stock,
      storage,
      color,
      images,
      shortDescription,
      description,
      featured,
      availableStorage,
      availableColors,
    } = body;

    if (!name || !brand || !price) {
      return NextResponse.json(
        { success: false, error: 'Product name, brand, and price are required.' },
        { status: 400 }
      );
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${randomSuffix}`;

    const newProduct = await Product.create({
      slug,
      name,
      brand,
      category: category || 'Smartphones',
      subcategory: subcategory || brand,
      price: Number(price),
      originalPrice: Number(originalPrice || price * 1.2),
      condition: condition || 'Good',
      stock: Number(stock !== undefined ? stock : 10),
      storage: storage || '128GB',
      color: color || 'Standard',
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'],
      shortDescription: shortDescription || `${name} (${condition}) - Certified Refurbished with 12-Month Seller Warranty`,
      description: description || `${name} pre-owned handset in ${condition} condition. 50-point diagnostic inspection completed.`,
      featured: Boolean(featured),
      availableStorage: availableStorage || ['128GB', '256GB'],
      availableColors: availableColors || ['Black', 'Silver'],
      rating: 4.8,
      reviewCount: 12,
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully!',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
