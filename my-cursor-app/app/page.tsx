import ProductList from "@/components/commerce/ProductList";
import { products } from "@/data/products";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white font-sans text-black">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <p className="text-lg font-semibold tracking-tight">Cursor Commerce</p>
        <div className="flex items-center gap-4 text-black" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-5 stroke-current" fill="none">
            <circle cx="11" cy="11" r="7" strokeWidth="1.5" />
            <path d="M20 20l-3.5-3.5" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <svg viewBox="0 0 24 24" className="size-5 stroke-current" fill="none">
            <circle cx="12" cy="8" r="3.5" strokeWidth="1.5" />
            <path
              d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="relative">
            <svg viewBox="0 0 24 24" className="size-5 stroke-current" fill="none">
              <path
                d="M6 8h12l-1 12H7L6 8z"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9 8V7a3 3 0 0 1 6 0v1"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
              2
            </span>
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 pb-16 md:px-10">
        <form className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm">
          <svg
            viewBox="0 0 24 24"
            className="size-4 shrink-0 stroke-zinc-400"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" strokeWidth="1.5" />
            <path d="M20 20l-3.5-3.5" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search for products..."
            aria-label="Search for products"
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Search
          </button>
        </form>

        <section className="flex flex-col gap-8">
          <h1 className="text-center text-4xl font-semibold tracking-tight">
            All
          </h1>

          <ProductList products={products} />
        </section>
      </main>
    </div>
  );
}
