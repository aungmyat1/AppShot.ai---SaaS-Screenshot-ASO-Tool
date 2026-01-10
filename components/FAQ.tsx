import React, { useState } from 'react';
import { PlusIcon, MinusIcon } from './Icons';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I find the App ID or link?',
    answer: 'You can find the App ID in the URL of the app store page. For App Store, it\'s the number after "id" in the URL. For Google Play, you can use the package name (e.g., com.google.android.gm) or the full URL of the app page.'
  },
  {
    question: 'Are the downloaded screenshots high quality?',
    answer: 'Yes! We download original, high-quality screenshots directly from the app stores. There\'s no compression or quality loss - you get exactly what\'s displayed in the store.'
  },
  {
    question: 'Can I use this for commercial projects?',
    answer: 'Yes, all downloaded screenshots can be used for commercial projects. However, please note that the screenshots themselves are the property of the app developers and are subject to their terms of use.'
  },
  {
    question: 'Do you offer a plan with more fetches?',
    answer: 'Yes! Our Enterprise plan offers unlimited fetches. If you need a custom plan tailored to your specific needs, please contact our sales team and we\'ll be happy to create a solution for you.'
  },
  {
    question: 'How does the Developer API work?',
    answer: 'Our REST API is simple and straightforward. You can make a POST request to our endpoint with the app store URL or ID, and receive a JSON response with all screenshot URLs. Check out our API documentation for detailed examples and authentication instructions.'
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white dark:bg-slate-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl">
          <dl className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-gray-200 dark:border-slate-800 pb-6"
              >
                <dt>
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-start justify-between text-left text-gray-900 dark:text-white"
                  >
                    <span className="text-base font-semibold leading-7">
                      {faq.question}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      {openIndex === index ? (
                        <MinusIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <PlusIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </span>
                  </button>
                </dt>
                {openIndex === index && (
                  <dd className="mt-4 pr-12">
                    <p className="text-base leading-7 text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </p>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
