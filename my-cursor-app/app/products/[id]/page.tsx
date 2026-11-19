import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, products } from "@/data/products";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const salePrice = product.sale_price;
  const hasSale =
    typeof salePrice === "number" &&
    salePrice > 0 &&
    salePrice < product.price;
  const displayPrice = hasSale ? salePrice : product.price;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10 font-sans text-black md:px-10">
      <Link href="/" className="text-sm text-zinc-500 hover:text-black">
        ← 목록으로
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-[#f5f5f5]">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-6"
            priority
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-semibold">
              ${displayPrice.toFixed(2)}
            </span>
            {hasSale && (
              <span className="text-base text-zinc-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
