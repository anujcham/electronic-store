import { Suspense } from "react";

import { ShopPage } from "../../components/shop/ShopPage";

export default function ShopRoutePage() {
  return (
    <Suspense fallback={<div className="container py-5">Loading shop...</div>}>
      <ShopPage />
    </Suspense>
  );
}
