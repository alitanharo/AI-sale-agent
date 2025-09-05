
import { Product } from '../types';
import { SAMPLE_PRODUCTS } from '../constants';

// Simulate API delay
const delay = <T,>(ms: number, value: T): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(value), ms));

export const getProducts = async (): Promise<Product[]> => {
  console.log("Fetching all products (mocked)...");
  return delay(300, SAMPLE_PRODUCTS);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  console.log(`Fetching product by ID: ${id} (mocked)...`);
  const product = SAMPLE_PRODUCTS.find(p => p.id === id);
  return delay(200, product);
};
