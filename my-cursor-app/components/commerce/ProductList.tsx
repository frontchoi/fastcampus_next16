"use client";

import { useState } from "react";
import ProductCard from "@/components/commerce/ProductCard/ProductCard";
import type { Product } from "@/types/product";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const [likedIds, setLikedIds] = useState<string[]>([]);

  function handleLikeToggle(productId: string): void {
    setLikedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
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
