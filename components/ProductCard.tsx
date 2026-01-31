
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl border border-[#efe6d6]">
      <Link to={`/products/${product.id}`} className="block hover:opacity-90">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-56 object-cover" 
          loading="lazy"
        />
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2 truncate">
          <Link to={`/products/${product.id}`} className="hover:text-[#8f8263] transition-colors">
            {product.name}
          </Link>
        </h3>
        <p className="text-[#6c5f47] text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <p className="text-2xl font-semibold text-[#8f8263]">${product.price.toFixed(2)}</p>
          <button
            onClick={() => onAddToCart(product.id)}
            className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#f2e6d0] font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>Add to cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
