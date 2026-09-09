import "./globals.css";

import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { CartProvider } from "../features/cart/CartContext";

export const metadata = {
  title: "Electronics Store",
  description: "Project setup successful",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
