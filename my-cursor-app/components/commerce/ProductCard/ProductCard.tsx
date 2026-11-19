"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import type { Product } from "@/types/product";

export interface ProductCardProps {
  product: Product;
  isLiked: boolean;
  onLikeToggle: (productId: string) => void;
}

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

function getDiscountRate(price: number, salePrice: number): number {
  return Math.round(((price - salePrice) / price) * 100);
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-3.5 fill-current"
    >
      <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.27 5.06 16.71l.94-5.5-4-3.9 5.53-.8L10 1.5z" />
    </svg>
  );
}

export default function ProductCard({
  product,
  isLiked,
  onLikeToggle,
}: ProductCardProps) {
  const { id, name, image_url, price, sale_price, rating = 5 } = product;
  const detailHref = `/products/${id}`;
  const hasSale =
    typeof sale_price === "number" && sale_price > 0 && sale_price < price;
  const displayPrice = hasSale ? sale_price : price;
  const discountRate = hasSale ? getDiscountRate(price, sale_price) : null;

  function handleLikeClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    onLikeToggle(id);
  }

  function handleAddToCartClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <article className="group flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-[#f5f5f5]">
        <Link href={detailHref} className="absolute inset-0 block">
          <Image
            src={image_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        <button
          type="button"
          aria-label={isLiked ? "찜 해제" : "찜하기"}
          aria-pressed={isLiked}
          onClick={handleLikeClick}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-black shadow-sm transition-colors hover:bg-white"
        >
          {isLiked ? (
            <FaHeart className="size-4 text-red-500" />
          ) : (
            <FaRegHeart className="size-4" />
          )}
        </button>

        <button
          type="button"
          onClick={handleAddToCartClick}
          className="absolute inset-x-3 bottom-3 z-10 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
        >
          Add to cart
        </button>
      </div>

      <Link href={detailHref} className="flex flex-col gap-1.5">
        <div
          className="flex items-center gap-0.5 text-black"
          aria-label={`평점 ${rating}점`}
        >
          {Array.from({ length: rating }, (_, index) => (
            <StarIcon key={index} />
          ))}
        </div>

        <h3 className="text-base font-semibold text-black">{name}</h3>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-black">
            {formatPrice(displayPrice)}
          </span>

          {hasSale && (
            <>
              <span className="text-sm text-zinc-400 line-through">
                {formatPrice(price)}
              </span>
              {discountRate !== null && (
                <span className="text-xs font-medium text-red-600">
                  {discountRate}% OFF
                </span>
              )}
            </>
          )}
        </div>
      </Link>
    </article>
  );
}
