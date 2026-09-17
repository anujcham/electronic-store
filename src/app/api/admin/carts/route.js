import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Cart from '@/models/Cart';
import User from '@/models/User';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Fetch active carts that have at least 1 item
    let carts = await Cart.find({ 'items.0': { $exists: true } })
      .populate('user', 'name email phone role addresses createdAt')
      .sort({ updatedAt: -1 });

    // If no carts with items exist, check if we should safely seed demo carts for rich admin dashboard preview
    if (carts.length === 0) {
      try {
        const totalCartsInDb = await Cart.countDocuments();
        if (totalCartsInDb === 0) {
          const sampleUsers = await User.find({ role: { $nin: ['admin', 'superadmin'] } }).limit(2);
          const sampleProducts = await Product.find({}).limit(3);

          if (sampleUsers.length > 0 && sampleProducts.length > 0) {
            for (let i = 0; i < sampleUsers.length; i++) {
              const u = sampleUsers[i];
              const p = sampleProducts[i % sampleProducts.length];
              await Cart.findOneAndUpdate(
                { user: u._id },
                {
                  $set: {
                    items: [
                      {
                        product: p._id,
                        name: p.name,
                        slug: p.slug,
                        image: p.images?.[0] || 'https://placehold.co/800x800/EEF2F7/0F172A?text=Phone',
                        price: p.price,
                        originalPrice: p.originalPrice || p.price * 1.15,
                        quantity: 1,
                        itemKey: `${p.slug}-128gb`,
                        selectedOptions: {
                          storage: '128GB',
                          color: 'Space Black',
                          condition: 'Excellent',
                        },
                      },
                    ],
                  },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );
            }

            carts = await Cart.find({ 'items.0': { $exists: true } })
              .populate('user', 'name email phone role addresses createdAt')
              .sort({ updatedAt: -1 });
          }
        }
      } catch (seedErr) {
        console.warn('Non-blocking cart preview seed warning:', seedErr);
      }
    }

    // Format cart response
    let formattedCarts = carts.map((cart) => {
      const items = cart.items || [];
      const totalQuantity = items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
      const totalValue = items.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
      );

      const userObj = cart.user || {
        name: cart.guestSessionId ? `Guest (${cart.guestSessionId.slice(0, 8)})` : 'Guest Shopper',
        email: 'guest@shopper.co.uk',
        phone: 'N/A',
      };

      return {
        _id: cart._id,
        id: cart._id,
        user: {
          id: userObj._id || userObj.id,
          name: userObj.name || 'Anonymous Shopper',
          email: userObj.email || 'N/A',
          phone: userObj.phone || 'N/A',
          role: userObj.role || 'customer',
          addresses: userObj.addresses || [],
        },
        items: items.map((it) => ({
          id: it._id,
          name: it.name,
          slug: it.slug,
          image: it.image,
          price: Number(it.price) || 0,
          originalPrice: Number(it.originalPrice) || 0,
          quantity: Number(it.quantity) || 1,
          itemKey: it.itemKey,
          selectedOptions: it.selectedOptions || {},
        })),
        totalItems: totalQuantity,
        cartTotal: totalValue,
        updatedAt: cart.updatedAt || cart.createdAt || new Date(),
        createdAt: cart.createdAt || new Date(),
      };
    });

    // Apply Search Filter
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      formattedCarts = formattedCarts.filter((c) => {
        const userName = (c.user.name || '').toLowerCase();
        const userEmail = (c.user.email || '').toLowerCase();
        const userPhone = (c.user.phone || '').toLowerCase();
        const hasMatchingProduct = c.items.some((it) => (it.name || '').toLowerCase().includes(term));
        return (
          userName.includes(term) ||
          userEmail.includes(term) ||
          userPhone.includes(term) ||
          hasMatchingProduct
        );
      });
    }

    return NextResponse.json({
      success: true,
      count: formattedCarts.length,
      carts: formattedCarts,
    });
  } catch (error) {
    console.error('Error fetching admin carts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
