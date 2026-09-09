"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShieldCheck, ShoppingCart, Trash2, Truck } from "lucide-react";

import { Badge, Button, Container } from "../../components/ui";
import { useCart } from "../../features/cart/useCart";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    totalPrice,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    setQuantity,
    clearCart,
  } = useCart();

  const hasItems = items.length > 0;

  return (
    <main className="py-5 py-lg-6 bg-soft">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-3">
          <div className="small text-primary">
            <Link href="/" className="text-decoration-none text-primary fw-medium">
              Home
            </Link>
            <span className="mx-2 text-muted">/</span>
            <span className="text-secondary fw-medium">Cart</span>
          </div>
        </nav>

        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="mb-2 text-primary">Your Cart</h1>
            <p className="mb-0 text-secondary">
              {itemCount} item{itemCount === 1 ? "" : "s"} in your cart
            </p>
          </div>

          {hasItems ? (
            <Button type="button" variant="outline" onClick={clearCart}>
              Clear cart
            </Button>
          ) : null}
        </div>

        {!hasItems ? (
          <div
            className="bg-white border rounded-4 p-4 p-lg-5 text-center shadow-sm"
            style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
          >
            <div
              className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary"
              style={{ width: "4rem", height: "4rem" }}
            >
              <ShoppingCart size={24} />
            </div>
            <h2 className="h4 mb-3 text-primary">Your cart is empty</h2>
            <p className="text-secondary mb-4">
              Add a premium refurbished phone to see it here.
            </p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Shop Phones
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div className="d-grid gap-3">
                {items.map((item) => (
                  <div
                    key={item.itemKey}
                    className="bg-white border rounded-4 p-3 p-lg-4 shadow-sm"
                    style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
                  >
                    <div className="row g-3 align-items-center">
                      <div className="col-12 col-md-3">
                        <Link
                          href={`/product/${item.slug}`}
                          className="d-block rounded-4 overflow-hidden position-relative text-decoration-none"
                          style={{ aspectRatio: "1 / 1", backgroundColor: "#f8fafc" }}
                          aria-label={`View ${item.name}`}
                        >
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 25vw"
                              style={{ objectFit: "cover" }}
                              unoptimized
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center w-100 h-100 text-muted">
                              Product
                            </div>
                          )}
                        </Link>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <Link href={`/product/${item.slug}`} className="h5 mb-0 text-primary text-decoration-none">
                            {item.name}
                          </Link>
                          <Badge variant="outline">{item.brand}</Badge>
                        </div>

                        <div className="d-grid gap-1 text-secondary small">
                          <div>
                            <span className="fw-semibold text-primary">Condition:</span> {item.condition || "Good"}
                          </div>
                          <div>
                            <span className="fw-semibold text-primary">Battery:</span> {item.battery || "Optimal"}
                          </div>
                          <div>
                            <span className="fw-semibold text-primary">Storage:</span> {item.storage || "N/A"}
                          </div>
                          <div>
                            <span className="fw-semibold text-primary">Colour:</span> {item.color || "N/A"}
                          </div>
                          <div>
                            <span className="fw-semibold text-primary">SIM:</span> {item.sim || "Single SIM"}
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2 mt-3 mb-2">
                          <span className="text-primary fw-semibold">£{Number(item.price).toFixed(2)}</span>
                          {item.originalPrice > item.price ? (
                            <span className="text-muted text-decoration-line-through small">
                              £{Number(item.originalPrice).toFixed(2)}
                            </span>
                          ) : null}
                        </div>

                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => decreaseQuantity(item.itemKey)}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity for ${item.name}`}
                          >
                            <Minus size={14} />
                          </Button>
                          <input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={item.quantity}
                            onChange={(event) =>
                              setQuantity(item.itemKey, Number(event.target.value))
                            }
                            className="form-control form-control-sm text-center"
                            style={{ width: "80px" }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => increaseQuantity(item.itemKey)}
                            disabled={item.quantity >= item.stock}
                            aria-label={`Increase quantity for ${item.name}`}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </div>

                      <div className="col-12 col-md-3 text-md-end">
                        <p className="mb-2 h5 text-primary">
                          £{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="text-danger border-danger-subtle"
                          onClick={() => removeItem(item.itemKey)}
                          startIcon={<Trash2 size={16} />}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div
                className="bg-white border rounded-4 p-4 shadow-sm"
                style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
              >
                <h2 className="h4 mb-3 text-primary">Order summary</h2>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-secondary">Subtotal</span>
                  <span className="fw-semibold text-primary">£{subtotal.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-secondary">Items</span>
                  <span className="fw-semibold text-primary">{itemCount}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-secondary">Shipping</span>
                  <span className="fw-semibold text-success">Free</span>
                </div>

                <div className="border-top pt-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold text-primary">Total</span>
                    <span className="h5 mb-0 text-primary">£{totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="d-flex flex-column gap-2 mt-3">
                    <Link href="/shop" className="btn btn-outline-primary btn-lg">
                      Continue Shopping
                    </Link>
                    <Link href="/checkout" className="btn btn-primary btn-lg">
                      Proceed to Checkout
                    </Link>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center gap-2 text-secondary small mb-2">
                    <Truck size={16} className="text-primary" />
                    <span>Estimated delivery: 2–4 working days</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-secondary small">
                    <ShieldCheck size={16} className="text-primary" />
                    <span>30-day free return guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
