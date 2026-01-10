import React from 'react';
// Added missing XIcon import
import { CheckIcon, SparklesIcon, XIcon } from './Icons';
import { PricingPlan } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: string) => void;
  isInline?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: '$0',
    limit: '5 Fetches / mo',
    features: ['Single image downloads', 'Standard resolution', '7-day History', 'Basic metadata scraping'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    limit: '100 Fetches / mo',
    recommended: true,
    features: ['Gemini 3 Pro Audit', 'ZIP Batch Export', 'Unlimited History', 'Full-res WebP optimization', 'Priority ASO queue'],
  },
  {
    id: 'enterprise',
    name: 'Business',
    price: '$99',
    limit: 'Unlimited',
    features: ['Multi-user teams', 'White-label PDF reports', 'API Access (v2)', 'Custom Webhooks', 'Dedicated Support'],
  },
];

const PricingModal: React.FC<Props> = ({ isOpen, onClose, onUpgrade, isInline = false }) => {
  if (!isOpen) return null;

  const content = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
      {plans.map((plan) => (
        <div 
          key={plan.id} 
          className={`relative rounded-[2.5rem] border ${plan.recommended ? 'border-brand-500 bg-slate-900 shadow-2xl shadow-brand-500/10' : 'border-white/5 bg-slate-900/50'} p-10 flex flex-col transition-all hover:scale-[1.02]`}
        >
          {plan.recommended && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl">
              Most Popular
            </div>
          )}
          
          <div className="mb-8">
            <h4 className="text-xl font-black text-white mb-2">{plan.name}</h4>
            <div className="flex items-baseline gap-1 text-white">
              <span className="text-4xl font-black">{plan.price}</span>
              <span className="text-slate-500 font-bold text-sm">/mo</span>
            </div>
            <p className="mt-2 text-xs font-black text-brand-400 uppercase tracking-widest">{plan.limit}</p>
          </div>
          
          <ul className="space-y-4 mb-10 flex-1">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckIcon className="flex-shrink-0 w-5 h-5 text-brand-500" />
                <span className="text-sm text-slate-400 font-medium leading-tight">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => {
                onUpgrade(plan.id);
                if (!isInline) onClose();
            }}
            className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
              plan.recommended 
                ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20' 
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            {plan.price === '$0' ? 'Current Plan' : `Get Started`}
          </button>
        </div>
      ))}
    </div>
  );

  if (isInline) return content;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className="relative w-full max-w-6xl animate-fade-in-up">
           <button onClick={onClose} className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors">
              <XIcon className="w-8 h-8" />
           </button>
           <div className="text-center mb-16">
              <h3 className="text-4xl font-black text-white mb-4">Upgrade Your Strategy</h3>
              <p className="text-slate-500 max-w-lg mx-auto">Get full access to Gemini 3 Pro audits and batch asset exports.</p>
           </div>
           {content}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;