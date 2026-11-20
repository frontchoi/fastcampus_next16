"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import OrderForm from "@/components/commerce/order/OrderForm";
import type { Product } from "@/types/product";

export interface ProductDetailClientProps {
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
 * 상품 상세 클라이언트 영역 (수량, 주문, Playwright 식별자 포함)
 */
export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const unitPrice = useMemo(() => getUnitPrice(product), [product]);
  const hasSale = unitPrice < product.price;
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

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
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-[#f5f5f5]">
        <Image
          src={product.image_url}
          alt={`${product.name} 상품 이미지`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-6"
          priority
          data-testid="product-detail-image"
        />
      </div>

      <div className="flex flex-col gap-4">
        <h1
          data-testid="product-detail-name"
          className="text-3xl font-semibold tracking-tight"
        >
          {product.name}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <span
            data-testid="product-detail-price"
            className="text-xl font-semibold"
          >
            ${unitPrice.toFixed(2)}
          </span>
          {hasSale && (
            <span
              data-testid="product-detail-original-price"
              className="text-base text-zinc-400 line-through"
            >
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600">수량</span>
            <div className="flex items-center rounded-md border border-zinc-200">
              <button
                type="button"
                data-testid="product-detail-quantity-decrease"
                aria-label="수량 감소"
                onClick={handleDecrease}
                className="h-10 w-10 text-lg hover:bg-zinc-50"
              >
                −
              </button>
              <span
                data-testid="product-detail-quantity"
                className="min-w-10 text-center text-sm font-medium"
              >
                {quantity}
              </span>
              <button
                type="button"
                data-testid="product-detail-quantity-increase"
                aria-label="수량 증가"
                onClick={handleIncrease}
                className="h-10 w-10 text-lg hover:bg-zinc-50"
              >
                +
              </button>
            </div>
          </div>

          <p
            data-testid="product-detail-total-price"
            className="text-sm font-medium text-black"
          >
            총 금액 ${totalPrice.toFixed(2)}
          </p>

          <button
            type="button"
            data-testid="product-detail-add-to-cart"
            className="h-12 rounded-lg border border-black text-sm font-medium text-black transition-colors hover:bg-zinc-50"
          >
            장바구니 담기
          </button>

          <button
            type="button"
            data-testid="product-detail-order-button"
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
      </div>
    </div>
  );
}
