import React from 'react';
import { CheckIcon } from './Icons';
import { PricingPlan } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: string) => void;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: '$0',
    limit: '5 Apps / mo',
    features: ['Standard Resolution', '7-day History', 'Community Support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    limit: '100 Apps / mo',
    recommended: true,
    features: ['High-Res Downloads', 'AI Analysis (GPT-4)', 'Unlimited History', 'Priority Support', 'ZIP Export'],
  },
  {
    id: 'enterprise',
    name: 'Agency',
    price: '$99',
    limit: 'Unlimited',
    features: ['API Access', 'White-label Reports', 'Team Seats', 'Dedicated Manager', 'SSO'],
  },
];

const PricingModal: React.FC<Props> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="text-center mb-10">
              <h3 className="text-2xl leading-6 font-bold text-gray-900" id="modal-title">Upgrade your plan</h3>
              <p className="mt-2 text-gray-500">Unlock AI analysis, higher limits, and export features.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className={`relative rounded-2xl border ${plan.recommended ? 'border-brand-600 shadow-lg ring-1 ring-brand-600' : 'border-gray-200'} p-6 flex flex-col`}>
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full shadow-sm">
                      Recommended
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                  <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                    <span className="ml-1 text-sm font-semibold text-gray-500">/month</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{plan.limit}</p>
                  
                  <ul className="mt-6 space-y-4 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex">
                        <CheckIcon className="flex-shrink-0 w-5 h-5 text-brand-600" />
                        <span className="ml-3 text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                        onUpgrade(plan.id);
                        onClose();
                    }}
                    className={`mt-8 w-full block rounded-md py-2.5 px-3 text-center text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      plan.recommended 
                        ? 'bg-brand-600 text-white hover:bg-brand-500 focus-visible:outline-brand-600' 
                        : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                    }`}
                  >
                    {plan.price === '$0' ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={onClose}>
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;