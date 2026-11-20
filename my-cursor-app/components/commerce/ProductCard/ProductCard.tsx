"use client";

import Image from "next/image";
import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import type { Product } from "@/types/product";

export interface ProductCardProps {
  /** 표시할 상품 정보 */
  product: Product;
  /** 찜 여부 */
  isLiked: boolean;
  /** 찜 토글 핸들러 */
  onLikeToggle: (productId: string) => void;
}

const IMAGE_LOADING_DELAY_MS = 1500;
const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

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

/**
 * 상품 카드 컴포넌트.
 * 이미지, 가격, 찜하기, 상세 페이지 이동을 제공합니다.
 *
 * @example
 * ```tsx
 * <ProductCard
 *   product={{
 *     id: "1",
 *     name: "Loveseat Sofa",
 *     image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
 *     price: 400,
 *     sale_price: 199,
 *     rating: 5,
 *   }}
 *   isLiked={false}
 *   onLikeToggle={(productId) => console.log(productId)}
 * />
 * ```
 */
function ProductCard({ product, isLiked, onLikeToggle }: ProductCardProps) {
  const { id, name, image_url, price, sale_price, rating = 5 } = product;
  const detailHref = `/products/${id}`;
  const hasSale =
    typeof sale_price === "number" && sale_price > 0 && sale_price < price;
  const displayPrice = hasSale ? sale_price : price;
  const discountRate = hasSale ? getDiscountRate(price, sale_price) : null;

  const [imageSrc, setImageSrc] = useState(image_url);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);
  const [imageMountKey, setImageMountKey] = useState(0);

  useEffect(() => {
    setImageSrc(image_url);
    setHasImageError(false);
    setShowSkeleton(true);
    setImageMountKey((current) => current + 1);

    const delayTimer = setTimeout(() => {
      setShowSkeleton(false);
    }, IMAGE_LOADING_DELAY_MS);

    return () => {
      clearTimeout(delayTimer);
    };
  }, [image_url]);

  const handleLikeClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      event.stopPropagation();
      onLikeToggle(id);
    },
    [id, onLikeToggle],
  );

  const handleAddToCartClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  const handleLoadingComplete = useCallback((_img: HTMLImageElement): void => {
    // 스켈레톤 타이머와 분리: 캐시 복귀 시에도 이미지는 항상 렌더링됨
  }, []);

  const handleImageError = useCallback((): void => {
    if (imageSrc === PLACEHOLDER_IMAGE) {
      setHasImageError(true);
      setShowSkeleton(false);
      return;
    }

    setHasImageError(true);
    setImageSrc(PLACEHOLDER_IMAGE);
  }, [imageSrc]);

  return (
    <article
      data-testid="product-card"
      className="group flex flex-col gap-3 rounded-sm shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden rounded-sm bg-[#f5f5f5]">
        <Link
          href={detailHref}
          className="absolute inset-0 block"
          aria-label={`${name} 상세 보기`}
        >
          <Image
            key={`${id}-${imageMountKey}-${imageSrc}`}
            src={imageSrc}
            alt={`${name} 상품 이미지`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            onLoadingComplete={handleLoadingComplete}
            onError={handleImageError}
          />
        </Link>

        {showSkeleton && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] animate-pulse bg-zinc-200"
          />
        )}

        {hasImageError && !showSkeleton && (
          <p
            role="status"
            className="pointer-events-none absolute inset-x-3 bottom-14 z-[2] rounded-md bg-black/70 px-3 py-2 text-center text-xs text-white"
          >
            이미지를 불러오지 못했습니다. 기본 이미지를 표시합니다.
          </p>
        )}

        <button
          type="button"
          data-testid="product-card-like-button"
          aria-label={isLiked ? `${name} 찜 해제` : `${name} 찜하기`}
          aria-pressed={isLiked}
          onClick={handleLikeClick}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-black shadow-sm transition-colors hover:bg-white"
        >
          {isLiked ? (
            <FaHeart
              data-testid="product-card-like-icon-filled"
              className="size-4 text-red-500"
              aria-hidden="true"
            />
          ) : (
            <FaRegHeart
              data-testid="product-card-like-icon-outline"
              className="size-4"
              aria-hidden="true"
            />
          )}
        </button>

        <button
          type="button"
          aria-label={`${name} 장바구니에 담기`}
          onClick={handleAddToCartClick}
          className="absolute inset-x-3 bottom-3 z-10 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
        >
          Add to cart
        </button>
      </div>

      <Link
        href={detailHref}
        data-testid="product-card-link"
        className="flex flex-col gap-1.5 px-1 pb-1"
      >
        <div
          className="flex items-center gap-0.5 text-black"
          aria-label={`평점 ${rating}점`}
        >
          {Array.from({ length: rating }, (_, index) => (
            <StarIcon key={index} />
          ))}
        </div>

        <h3
          data-testid="product-card-name"
          className="text-base font-semibold text-black"
        >
          {name}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <span data-testid="product-card-price">
            {hasSale ? (
              <span
                data-testid="product-card-sale-price"
                className="text-sm font-semibold text-black"
              >
                {formatPrice(displayPrice)}
              </span>
            ) : (
              <span className="text-sm font-semibold text-black">
                {formatPrice(displayPrice)}
              </span>
            )}
          </span>

          {hasSale && (
            <>
              <span
                data-testid="product-card-original-price"
                className="text-sm text-zinc-400 line-through"
              >
                {formatPrice(price)}
              </span>
              {discountRate !== null && (
                <span
                  data-testid="product-card-discount-badge"
                  className="text-xs font-medium text-red-600"
                >
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

export default memo(ProductCard);
