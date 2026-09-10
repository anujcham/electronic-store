import { Suspense } from "react";
import { getProducts } from "@/services/productService";
import { ShopPage } from "@/components/shop/ShopPage";

export default async function ShopRoutePage({ searchParams }) {
  const resolvedParams = (await searchParams) || {};
  const serverData = await getProducts(resolvedParams);

  return (
    <Suspense fallback={<div className="container py-5 text-center">Loading shop...</div>}>
      <ShopPage
        initialProducts={serverData.products || []}
        totalCount={serverData.total || 0}
        page={serverData.page || 1}
        totalPages={serverData.totalPages || 1}
        initialSearchParams={resolvedParams}
      />
    </Suspense>
  );
}
