'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How are premiums calculated?',
    answer: 'Premiums are dynamically calculated based on pool utilization, market risk, and coverage duration. Typically ranges from 2-10% of coverage amount.',
  },
  {
    question: 'What happens if insurance pool runs out of funds?',
    answer: 'Each pool has a maximum capacity. When utilization is high, premiums increase to attract more liquidity providers and balance risk.',
  },
  {
    question: 'How quickly are claims processed?',
    answer: 'Claims are processed automatically via smart contracts when Chainlink oracles confirm market resolution. Payouts typically complete in under 3 seconds.',
  },
  {
    question: 'Can I cancel my insurance policy?',
    answer: 'Policies are active until market resolution. You can transfer your policy NFT to another wallet, but premiums are non-refundable once paid.',
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden transition-shadow hover:shadow-xl"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none"
              aria-expanded={isOpen}
            >
              <h3 className="text-xl font-bold text-gray-900 pr-4">
                {faq.question}
              </h3>
              <svg
                className={`w-6 h-6 shrink-0 text-gray-600 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isOpen && (
              <div className="px-8 pb-6 border-t border-gray-100">
                <p className="text-gray-600 pt-4">{faq.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
