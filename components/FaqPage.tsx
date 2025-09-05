
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
      <h1 className="text-4xl font-bold text-slate-800 mb-10 text-center">Frequently Asked Questions</h1>
      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => toggleFaq(faq.id)}
              className="w-full flex justify-between items-center p-6 text-left text-lg font-semibold text-slate-700 hover:bg-gray-50 transition-colors focus:outline-none"
              aria-expanded={openFaqId === faq.id}
              aria-controls={`faq-answer-${faq.id}`}
            >
              <span>{faq.question}</span>
              {openFaqId === faq.id ? <ChevronUpIcon className="h-6 w-6 text-sky-500" /> : <ChevronDownIcon className="h-6 w-6 text-gray-400" />}
            </button>
            {openFaqId === faq.id && (
              <div id={`faq-answer-${faq.id}`} className="p-6 border-t border-gray-200">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;
