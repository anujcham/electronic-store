import "./globals.css";

import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { CartProvider } from "../features/cart/CartContext";
import { WishlistProvider } from "../features/wishlist/WishlistContext";
import { ToastProvider } from "../components/common/Toast";

export const metadata = {
  title: "Electronics Store",
  description: "Refurbished Smartphones & Tech Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              <Header />
              {children}
              <Footer />
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
