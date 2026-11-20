"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ProductCard from "@/components/commerce/ProductCard/ProductCard";
import type { Product } from "@/types/product";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const pathname = usePathname();
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [listMountKey, setListMountKey] = useState(0);

  useEffect(() => {
    // 목록 재진입 시 카드 이미지를 새로 마운트
    setListMountKey((current) => current + 1);
  }, [pathname]);

  const handleLikeToggle = useCallback((productId: string): void => {
    setLikedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <li key={`${product.id}-${listMountKey}`}>
          <ProductCard
            product={product}
            isLiked={likedIds.includes(product.id)}
            onLikeToggle={handleLikeToggle}
          />
        </li>
      ))}
    </ul>
  );
}
