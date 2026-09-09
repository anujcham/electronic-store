import Link from "next/link";
import { Container } from "../../components/ui";
import { Heart, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  return (
    <main className="py-5 py-lg-6 bg-soft">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-3">
          <div className="small text-primary">
            <Link href="/" className="text-decoration-none text-primary fw-medium">
              Home
            </Link>
            <span className="mx-2 text-muted">/</span>
            <span className="text-secondary fw-medium">Wishlist</span>
          </div>
        </nav>

        <div className="mb-4">
          <h1 className="display-6 fw-bold mb-2 text-primary">Your Wishlist</h1>
          <p className="mb-0 text-secondary">Saved refurbished smartphones and devices for later.</p>
        </div>

        <div className="bg-white border rounded-4 p-5 text-center shadow-sm">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary p-3 rounded-circle mb-3">
            <Heart size={32} />
          </div>
          <h3 className="fw-bold text-primary mb-2">No Saved Items Yet</h3>
          <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: "24rem" }}>
            Click the heart icon on any product page to save refurbished smartphones to your wishlist.
          </p>
          <Link href="/shop" className="btn btn-primary btn-lg px-4 d-inline-flex align-items-center gap-2">
            <ShoppingBag size={18} /> Explore Phones
          </Link>
        </div>
      </Container>
    </main>
  );
}
