export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  image: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}
