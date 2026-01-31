
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
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-[#8f8263]">Verona Voice Collection</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-[#1a1a1a] mt-3">Curated for Modern Elegance</h1>
        <p className="text-[#6c5f47] mt-4 max-w-2xl mx-auto">
          Discover premium essentials and seasonal highlights. Speak to Luca anytime for recommendations or to add items to your cart.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
