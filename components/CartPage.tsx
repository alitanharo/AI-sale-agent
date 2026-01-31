
import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface CartPageProps {
  cartItems: CartItem[];
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
}

const CartPage: React.FC<CartPageProps> = ({ cartItems, removeFromCart, updateCartQuantity }) => {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-semibold text-[#1a1a1a] mb-4">Your cart is empty</h1>
        <p className="text-[#6c5f47] mb-8">Browse the collection or ask Luca to recommend something tailored to you.</p>
        <Link
          to="/"
          className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#f2e6d0] font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-semibold text-[#1a1a1a] mb-10 text-center">Your cart</h1>
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-[#efe6d6]">
        {cartItems.map(item => (
          <div key={item.id} className="flex flex-col md:flex-row items-center justify-between py-6 border-b border-gray-200 last:border-b-0">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg shadow" />
              <div>
                <h2 className="text-lg font-semibold text-[#1a1a1a] hover:text-[#8f8263]">
                  <Link to={`/products/${item.id}`}>{item.name}</Link>
                </h2>
                <p className="text-sm text-[#6c5f47]">${item.price.toFixed(2)} each</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value, 10))}
                className="w-20 p-2 border border-[#eadfca] rounded-md text-center focus:ring-[#bda77f] focus:border-[#bda77f]"
                aria-label={`Quantity for ${item.name}`}
              />
              <p className="text-lg font-semibold text-[#1a1a1a] w-24 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-[#8b2c2c] hover:text-[#6e1f1f] p-2 rounded-md transition-colors"
                aria-label={`Remove ${item.name} from cart`}
              >
                <TrashIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        ))}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className="flex justify-end items-center">
            <span className="text-2xl font-semibold text-[#1a1a1a] mr-4">Total:</span>
            <span className="text-3xl font-semibold text-[#8f8263]">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="mt-8 text-right">
            <button 
              className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#f2e6d0] font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              onClick={() => alert('Proceeding to checkout (not implemented).')}
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
