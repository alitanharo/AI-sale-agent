
import React, { useState } from 'react';
import { FaqItem } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';

interface FaqPageProps {
  faqs: FaqItem[];
}

const FaqPage: React.FC<FaqPageProps> = ({ faqs }) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-[#8f8263]">Voice Concierge Guide</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-[#1a1a1a] mt-3">How to shop with Luca</h1>
        <p className="text-[#6c5f47] mt-4 max-w-2xl mx-auto">
          Use the voice concierge to get recommendations, add items, and navigate the store hands‑free.
        </p>
      </div>
      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#efe6d6]">
            <button
              onClick={() => toggleFaq(faq.id)}
              className="w-full flex justify-between items-center p-6 text-left text-lg font-semibold text-[#1a1a1a] hover:bg-[#f9f5ef] transition-colors focus:outline-none"
              aria-expanded={openFaqId === faq.id}
              aria-controls={`faq-answer-${faq.id}`}
            >
              <span>{faq.question}</span>
              {openFaqId === faq.id ? <ChevronUpIcon className="h-6 w-6 text-[#8f8263]" /> : <ChevronDownIcon className="h-6 w-6 text-[#bda77f]" />}
            </button>
            {openFaqId === faq.id && (
              <div id={`faq-answer-${faq.id}`} className="p-6 border-t border-[#efe6d6]">
                <p className="text-[#6c5f47] leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;
