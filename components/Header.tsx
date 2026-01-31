
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon'; 

interface HeaderProps {
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount }) => {
  return (
    <header className="bg-[#0f0f0f] text-[#f2e6d0] shadow-xl border-b border-[#2a2a2a]">
      <div className="container mx-auto px-4 py-5 flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-[#bda77f] flex items-center justify-center text-[#bda77f] font-semibold">
            VV
          </div>
          <div>
            <Link to="/" className="text-3xl font-semibold tracking-[0.15em] uppercase hover:text-[#bda77f] transition-colors">
          {APP_NAME}
            </Link>
            <p className="text-sm text-[#8f8263] mt-1">Premium voice concierge for elegant shopping</p>
          </div>
        </div>
        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-[#d8c8a4] hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Collection</Link>
          <Link to="/faq" className="text-[#d8c8a4] hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Guide</Link>
          <Link to="/cart" className="relative text-[#d8c8a4] hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
            <ShoppingCartIcon className="h-6 w-6 inline-block" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#bda77f] text-[#1a1a1a] text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
