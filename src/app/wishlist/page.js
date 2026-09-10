"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Container, Badge, Button } from "../../components/ui";
import { useWishlist } from "../../features/wishlist/useWishlist";
import { useCart } from "../../features/cart/useCart";

export default function WishlistPage() {
  const router = useRouter();
  const { items, removeItem, clearWishlist, wishlistCount } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item) => {
    addItem(item, {
      condition: item.condition || "Superb",
      storage: item.storage || "128GB",
      color: item.color || "Black",
      price: item.price,
      originalPrice: item.originalPrice,
    });
  };

  return (
    <main className="py-5 py-lg-6 bg-soft min-vh-100">
      <Container>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-3">
          <div className="small text-primary">
            <Link href="/" className="text-decoration-none text-primary fw-medium">
              Home
            </Link>
            <span className="mx-2 text-muted">/</span>
            <span className="text-secondary fw-medium">Wishlist</span>
          </div>
        </nav>

        {/* Header Title Bar */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h1 className="display-6 fw-bold mb-0 text-primary">Your Wishlist</h1>
              {wishlistCount > 0 && (
                <Badge variant="primary" className="rounded-pill px-3 py-1 fs-6">
                  {wishlistCount} {wishlistCount === 1 ? "phone" : "phones"}
                </Badge>
              )}
            </div>
            <p className="mb-0 text-secondary">
              Saved refurbished smartphones and devices for later.
            </p>
          </div>

          {wishlistCount > 0 && (
            <button
              onClick={clearWishlist}
              className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2 self-start self-sm-auto"
            >
              <Trash2 size={16} /> Clear Wishlist
            </button>
          )}
        </div>

        {/* Content Body */}
        {wishlistCount === 0 ? (
          <div className="bg-white border rounded-4 p-5 text-center shadow-sm my-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary p-4 rounded-circle mb-3">
              <Heart size={36} />
            </div>
            <h3 className="fw-bold text-primary mb-2">No Saved Items Yet</h3>
            <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: "26rem" }}>
              Click the heart icon on any smartphone page to save refurbished phones to your wishlist and monitor price drops!
            </p>
            <Link href="/shop" className="btn btn-primary btn-lg px-4 d-inline-flex align-items-center gap-2 rounded-3">
              <ShoppingBag size={18} /> Explore Phones <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {items.map((item) => {
              const itemKey = item.slug || item.id;
              const imageUrl = item.image || item.images?.[0] || "https://placehold.co/800x800/EEF2F7/0F172A?text=Product";

              return (
                <div key={itemKey} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm overflow-hidden bg-white rounded-4 transition-all">
                    <div className="position-relative" style={{ aspectRatio: "1 / 1" }}>
                      <Image
                        src={imageUrl}
                        alt={item.name || "Wishlisted Product"}
                        fill
                        className="object-fit-cover"
                        unoptimized
                      />
                      <button
                        onClick={() => removeItem(item)}
                        className="btn btn-light btn-sm position-absolute top-0 end-0 m-3 rounded-circle d-flex align-items-center justify-content-center shadow-sm p-2 text-danger"
                        style={{ width: "2.5rem", height: "2.5rem" }}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="card-body d-flex flex-column p-4">
                      <div className="mb-2">
                        <Link
                          href={`/product/${item.slug || item.id}`}
                          className="h5 text-decoration-none text-dark fw-bold d-block hover-primary"
                        >
                          {item.name}
                        </Link>
                      </div>

                      <div className="d-flex align-items-baseline gap-2 mb-3">
                        <span className="fs-4 fw-bold text-primary">£{item.price}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-muted text-decoration-line-through small">
                            £{item.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto d-flex gap-2 pt-2">
                        <Button
                          variant="primary"
                          className="w-100 d-flex align-items-center justify-content-center gap-2 rounded-3"
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart size={16} /> Add to Cart
                        </Button>

                        <Link
                          href={`/product/${item.slug || item.id}`}
                          className="btn btn-outline-secondary d-flex align-items-center justify-content-center rounded-3 px-3"
                          title="View Details"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
