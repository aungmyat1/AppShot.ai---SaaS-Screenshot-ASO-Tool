import React from 'react';
import { CheckIcon, DownloadIcon, ChartIcon, BrainIcon } from '../components/Icons';

interface Props {
  onGetStarted: () => void;
}

const Landing: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Announcing our new Gemini 2.5 Integration. <a href="#" className="font-semibold text-brand-600"><span className="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></a>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Download & Analyze App Store Assets
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            The ultimate tool for ASO experts and developers. Download high-res screenshots, analyze competitors, and optimize your conversion rate with AI.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={onGetStarted}
              className="rounded-md bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Get started for free
            </button>
            <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">Learn more <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div id="features" className="bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-600">Deploy faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need for ASO</p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
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
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;