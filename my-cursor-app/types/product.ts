export interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  sale_price?: number;
  rating?: number;
}
