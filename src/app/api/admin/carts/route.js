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

    // Only fetch carts that have at least 1 item
    let carts = await Cart.find({ 'items.0': { $exists: true } })
      .populate('user', 'name email phone role addresses createdAt')
      .sort({ updatedAt: -1 });

    // If no carts exist in DB yet, create demo carts with existing users and products for rich preview
    if (carts.length === 0) {
      const sampleUsers = await User.find({ role: { $nin: ['admin', 'superadmin'] } }).limit(3);
      const sampleProducts = await Product.find({}).limit(4);

      if (sampleUsers.length > 0 && sampleProducts.length > 0) {
        const demoCarts = [
          {
            user: sampleUsers[0]._id,
            items: [
              {
                product: sampleProducts[0]._id,
                name: sampleProducts[0].name,
                slug: sampleProducts[0].slug,
                image: sampleProducts[0].images?.[0] || 'https://placehold.co/800x800/EEF2F7/0F172A?text=Phone',
                price: sampleProducts[0].price,
                originalPrice: sampleProducts[0].originalPrice || sampleProducts[0].price * 1.15,
                quantity: 1,
                itemKey: `${sampleProducts[0].slug}-128gb-spaceblack`,
                selectedOptions: {
                  storage: '128GB',
                  color: 'Space Black',
                  condition: 'Excellent',
                },
              },
              ...(sampleProducts[1]
                ? [
                    {
                      product: sampleProducts[1]._id,
                      name: sampleProducts[1].name,
                      slug: sampleProducts[1].slug,
                      image: sampleProducts[1].images?.[0] || 'https://placehold.co/800x800/EEF2F7/0F172A?text=Phone',
                      price: sampleProducts[1].price,
                      originalPrice: sampleProducts[1].originalPrice || sampleProducts[1].price * 1.15,
                      quantity: 2,
                      itemKey: `${sampleProducts[1].slug}-256gb-silver`,
                      selectedOptions: {
                        storage: '256GB',
                        color: 'Silver',
                        condition: 'Pristine',
                      },
                    },
                  ]
                : []),
            ],
          },
        ];

        if (sampleUsers[1] && sampleProducts[2]) {
          demoCarts.push({
            user: sampleUsers[1]._id,
            items: [
              {
                product: sampleProducts[2]._id,
                name: sampleProducts[2].name,
                slug: sampleProducts[2].slug,
                image: sampleProducts[2].images?.[0] || 'https://placehold.co/800x800/EEF2F7/0F172A?text=Phone',
                price: sampleProducts[2].price,
                originalPrice: sampleProducts[2].originalPrice || sampleProducts[2].price * 1.15,
                quantity: 1,
                itemKey: `${sampleProducts[2].slug}-512gb-titanium`,
                selectedOptions: {
                  storage: '512GB',
                  color: 'Natural Titanium',
                  condition: 'Good',
                },
              },
            ],
          });
        }

        await Cart.insertMany(demoCarts);
        carts = await Cart.find({ 'items.0': { $exists: true } })
          .populate('user', 'name email phone role addresses createdAt')
          .sort({ updatedAt: -1 });
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
