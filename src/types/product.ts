export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  digitalFileUrl?: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  customerEmail: string;
  purchaseDate: Date;
}
