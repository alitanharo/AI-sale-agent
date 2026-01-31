
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Product } from '../types';
import { getProductById as fetchProductById } from '../services/productService';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';

interface ProductDetailProps {
  products: Product[]; // Passed to find product faster if already loaded, or can use service
  addToCart: (productId: string, quantity?: number) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ products, addToCart }) => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      if (productId) {
        // Try finding in existing list first
        const foundProduct = products.find(p => p.id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          // Fallback to fetch if not in list (e.g., direct navigation)
          const fetchedProduct = await fetchProductById(productId);
          setProduct(fetchedProduct || null);
        }
      }
      setIsLoading(false);
    };
    loadProduct();
  }, [productId, products]);

  if (isLoading) {
    return <div className="text-center py-20 text-[#6c5f47]">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-[#8b2c2c] font-semibold">Product not found.</div>;
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    // Add some visual feedback if desired
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-[#efe6d6]">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div>
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-auto max-h-[500px] object-contain rounded-2xl shadow-md" 
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#1a1a1a] mb-4">{product.name}</h1>
            <p className="text-[#6c5f47] text-lg mb-6">{product.description}</p>
            <p className="text-4xl font-semibold text-[#8f8263] mb-8">${product.price.toFixed(2)}</p>
            
            <div className="flex items-center space-x-4 mb-8">
              <label htmlFor="quantity" className="font-semibold text-[#4a3f2f]">Quantity:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 p-2 border border-[#eadfca] rounded-md text-center focus:ring-[#bda77f] focus:border-[#bda77f]"
              />
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#f2e6d0] font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg flex items-center justify-center space-x-3"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
