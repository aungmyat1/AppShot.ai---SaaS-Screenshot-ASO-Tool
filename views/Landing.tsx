import React from 'react';
import { CheckIcon, DownloadIcon, ChartIcon, BrainIcon, MoonIcon, SunIcon, LayersIcon, GlobeIcon } from '../components/Icons';

interface Props {
  onGetStarted: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Landing: React.FC<Props> = ({ onGetStarted, isDarkMode, toggleTheme }) => {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200 flex flex-col min-h-screen">
      {/* Header with Theme Toggle */}
      <nav className="absolute top-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayersIcon className="text-brand-600 h-8 w-8" />
            <span className="font-bold text-xl text-slate-900 dark:text-white">AppShot.ai</span>
          </div>
          <button 
             onClick={toggleTheme} 
             className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
             aria-label="Toggle Dark Mode"
           >
             {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 dark:text-gray-300 ring-1 ring-gray-900/10 dark:ring-gray-100/10 hover:ring-gray-900/20 dark:hover:ring-gray-100/20">
              Announcing our new Gemini 2.5 Integration. <a href="#" className="font-semibold text-brand-600 dark:text-brand-400"><span className="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></a>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Analyze App Assets with <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400">AI Precision</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            The ultimate SaaS platform for ASO experts. Download high-res screenshots, analyze competitors, and optimize your conversion rate with Google Gemini.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={onGetStarted}
              className="rounded-full bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all hover:scale-105"
            >
              Get started for free
            </button>
            <a href="#features" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">Learn more <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="py-12 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold leading-8 text-gray-900 dark:text-white">Trusted by modern product teams</h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5 opacity-60 dark:opacity-40 grayscale">
            {/* Mock Logos */}
            <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-2xl font-bold text-center">Acme Corp</div>
            <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-2xl font-bold text-center">Stark Ind</div>
            <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-2xl font-bold text-center">Wayne Ent</div>
            <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-2xl font-bold text-center">Cyberdyne</div>
            <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-2xl font-bold text-center">Umbrella</div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div id="features" className="bg-white dark:bg-slate-950 py-24 sm:py-32 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-600 dark:text-brand-400">Deploy faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Everything you need for ASO</p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Stop manually saving images. Automate your workflow and gain insights that drive downloads.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {[
                {
                  name: 'Bulk Downloads',
                  description: 'Download all screenshots from any App Store or Google Play Store listing in one click.',
                  icon: DownloadIcon,
                },
                {
                  name: 'AI Analysis',
                  description: 'Leverage Gemini models to analyze your visual assets against guidelines and best practices.',
                  icon: BrainIcon,
                },
                {
                  name: 'Competitor Tracking',
                  description: 'Compare your ASO score against top competitors in your category.',
                  icon: ChartIcon,
                },
                {
                  name: 'Cross-Platform',
                  description: 'Works seamlessly for both iOS and Android apps with automatic store detection.',
                  icon: CheckIcon,
                },
              ].map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 mt-auto border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
                  <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                      <li><a href="#" className="hover:text-brand-600">Features</a></li>
                      <li><a href="#" className="hover:text-brand-600">Pricing</a></li>
                      <li><a href="#" className="hover:text-brand-600">API</a></li>
                  </ul>
              </div>
              <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Company</h3>
                  <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                      <li><a href="#" className="hover:text-brand-600">About</a></li>
                      <li><a href="#" className="hover:text-brand-600">Blog</a></li>
                      <li><a href="#" className="hover:text-brand-600">Careers</a></li>
                  </ul>
              </div>
               <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
                  <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                      <li><a href="#" className="hover:text-brand-600">Documentation</a></li>
                      <li><a href="#" className="hover:text-brand-600">Help Center</a></li>
                      <li><a href="#" className="hover:text-brand-600">Community</a></li>
                  </ul>
              </div>
              <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
                  <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                      <li><a href="#" className="hover:text-brand-600">Privacy</a></li>
                      <li><a href="#" className="hover:text-brand-600">Terms</a></li>
                  </ul>
              </div>
           </div>
           <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
             <div className="flex items-center gap-2 mb-4 md:mb-0">
               <LayersIcon className="text-brand-600 h-6 w-6" />
               <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">&copy; 2024 AppShot.ai, Inc. All rights reserved.</p>
             </div>
             <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                   <GlobeIcon className="h-5 w-5" />
                </a>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;