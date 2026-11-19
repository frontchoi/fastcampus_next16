import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "1",
    name: "Loveseat Sofa",
    image_url:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    price: 400,
    sale_price: 199,
    rating: 5,
  },
  {
    id: "2",
    name: "Table Lamp",
    image_url:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    price: 24.99,
    rating: 5,
  },
  {
    id: "3",
    name: "Beige Table Lamp",
    image_url:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
    price: 24.99,
    rating: 5,
  },
  {
    id: "4",
    name: "Bamboo basket",
    image_url:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80",
    price: 24.99,
    rating: 5,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}
