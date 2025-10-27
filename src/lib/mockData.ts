import { Product, Order } from "@/types/product";

export const mockProducts: Product[] = [];

export const mockOrders: Order[] = [];

export const addProduct = (product: Product) => {
  mockProducts.push(product);
};

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const deleteProduct = (id: string) => {
  const index = mockProducts.findIndex(p => p.id === id);
  if (index > -1) {
    mockProducts.splice(index, 1);
  }
};
