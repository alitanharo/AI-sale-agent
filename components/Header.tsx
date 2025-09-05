
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon'; 

interface HeaderProps {
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount }) => {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold tracking-tight hover:text-sky-400 transition-colors">
          {APP_NAME}
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Home</Link>
          <Link to="/faq" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">FAQ</Link>
          <Link to="/cart" className="relative text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
            <ShoppingCartIcon className="h-6 w-6 inline-block" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
            <span className="sr-only">View Cart</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
