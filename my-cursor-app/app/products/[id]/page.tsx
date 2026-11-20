import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductDetailClient from "@/components/commerce/ProductDetail/ProductDetailClient";
import { getProductById, products } from "@/data/products";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

function ProductDetailsFallback() {
  return (
    <div className="grid animate-pulse gap-8 md:grid-cols-2">
      <div className="aspect-square rounded-sm bg-zinc-200" />
      <div className="flex flex-col gap-4">
        <div className="h-9 w-2/3 rounded bg-zinc-200" />
        <div className="h-7 w-24 rounded bg-zinc-200" />
        <div className="h-12 w-full rounded bg-zinc-200" />
      </div>
    </div>
  );
}

async function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

export default function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10 font-sans text-black md:px-10">
      <Link href="/" className="text-sm text-zinc-500 hover:text-black">
        ← 목록으로
      </Link>

      <Suspense fallback={<ProductDetailsFallback />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}
