import "./globals.css";

import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { CartProvider } from "../features/cart/CartContext";
import { ToastProvider } from "../components/common/Toast";

export const metadata = {
  title: "Electronics Store",
  description: "Project setup successful",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ToastProvider>
          <CartProvider>
            <Header />
            {children}
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
