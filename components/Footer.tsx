
import React from 'react';
import { APP_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1a1a1a] text-[#c9b58f] py-10 text-center border-t border-[#2a2a2a]">
      <div className="container mx-auto px-4">
        <p className="tracking-wide">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p className="text-sm mt-2 text-[#8f8263]">Premium voice‑guided shopping experience.</p>
      </div>
    </footer>
  );
};

export default Footer;
