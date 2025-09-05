
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl">
      <Link to={`/products/${product.id}`} className="block hover:opacity-90">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-56 object-cover" 
          loading="lazy"
        />
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-slate-800 mb-2 truncate">
          <Link to={`/products/${product.id}`} className="hover:text-sky-600 transition-colors">
            {product.name}
          </Link>
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <p className="text-2xl font-bold text-sky-600">${product.price.toFixed(2)}</p>
          <button
            onClick={() => onAddToCart(product.id)}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
