"use client";

import { useCallback, useMemo, useState } from "react";
import OrderForm from "@/components/commerce/order/OrderForm";
import type { Product } from "@/types/product";

export interface AddToCartSectionProps {
  product: Product;
}

function getUnitPrice(product: Product): number {
  const salePrice = product.sale_price;

  if (
    typeof salePrice === "number" &&
    salePrice > 0 &&
    salePrice < product.price
  ) {
    return salePrice;
  }

  return product.price;
}

/**
 * 상품 상세 페이지의 수량 조절 및 바로 주문하기 영역.
 */
export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const unitPrice = useMemo(() => getUnitPrice(product), [product]);

  const handleDecrease = useCallback(() => {
    setQuantity((current) => Math.max(1, current - 1));
  }, []);

  const handleIncrease = useCallback(() => {
    setQuantity((current) => current + 1);
  }, []);

  const handleOpenOrder = useCallback(() => {
    setIsOrderOpen(true);
  }, []);

  const handleCloseOrder = useCallback(() => {
    setIsOrderOpen(false);
  }, []);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600">수량</span>
        <div className="flex items-center rounded-md border border-zinc-200">
          <button
            type="button"
            aria-label="수량 감소"
            onClick={handleDecrease}
            className="h-10 w-10 text-lg hover:bg-zinc-50"
          >
            −
          </button>
          <span className="min-w-10 text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="수량 증가"
            onClick={handleIncrease}
            className="h-10 w-10 text-lg hover:bg-zinc-50"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleOpenOrder}
        className="h-12 rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      >
        바로 주문하기
      </button>

      <OrderForm
        product={product}
        quantity={quantity}
        unitPrice={unitPrice}
        isOpen={isOrderOpen}
        onClose={handleCloseOrder}
      />
    </div>
  );
}
