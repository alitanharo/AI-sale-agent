
import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  addToCart: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, addToCart }) => {
  if (products.length === 0) {
    return <div className="text-center py-12 text-gray-500">Loading products or no products available...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-slate-800 mb-10 text-center">Explore Our Collection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
