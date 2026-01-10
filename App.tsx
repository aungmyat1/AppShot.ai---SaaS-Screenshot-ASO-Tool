
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { StoreType, AppData, AnalysisResult, ViewState, Screenshot } from './types';
import { 
  SearchIcon, SparklesIcon, DownloadIcon, 
  AppleIcon, GooglePlayIcon, AppShotLogo, 
  CheckIcon, XIcon, LightningIcon, MoonIcon, 
  SunIcon, LayersIcon, GlobeIcon, TrendingUpIcon,
  TwitterIcon, GithubIcon
} from './components/Icons';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [url, setUrl] = useState('');
  const [store, setStore] = useState<StoreType>(StoreType.APP_STORE);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setView('loading');
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockData: AppData = {
        id: Math.random().toString(36).substr(2, 9),
        name: store === StoreType.APP_STORE ? "Instagram" : "Google Keep",
        developer: store === StoreType.APP_STORE ? "Instagram, Inc." : "Google LLC",
        icon: `https://picsum.photos/200/200?random=${Math.random()}`,
        rating: 4.8,
        reviews: 1200000,
        category: "Social Media",
        store: store,
        screenshots: Array.from({ length: 6 }).map((_, i) => ({
          id: `shot-${i}`,
          url: `https://picsum.photos/400/800?random=${i + 10}`
        })),
        description: "A popular app for sharing photos and videos.",
        scrapedAt: new Date().toISOString()
      };
      setAppData(mockData);
      setView('results');
    } catch (err) {
      setError("Failed to fetch app data.");
      setView('landing');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-600/30">
      {/* Dynamic Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <AppShotLogo className="text-blue-500 w-6 h-6" />
            <span className="font-bold text-lg tracking-tight">getappshots</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">API Docs</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-white transition-colors">
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {view === 'landing' ? (
        <main className="pt-32 pb-20">
          {/* Hero Section */}
          <section className="max-w-4xl mx-auto text-center px-6 mb-32 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
              App Screenshots, <span className="text-blue-500">Instantly.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
              Paste any App Store or Google Play link/ID to download all screenshots in seconds. Perfect for designers, marketers, and developers.
            </p>

            {/* Platform Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-slate-900/50 p-1 rounded-full border border-white/10 flex gap-1">
                <button 
                  onClick={() => setStore(StoreType.APP_STORE)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${store === StoreType.APP_STORE ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  <AppleIcon className="w-3.5 h-3.5" /> App Store
                </button>
                <button 
                  onClick={() => setStore(StoreType.PLAY_STORE)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${store === StoreType.PLAY_STORE ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  <GooglePlayIcon className="w-3.5 h-3.5" /> Google Play
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto group">
              <div className="relative flex items-center bg-slate-900/80 border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-blue-500/50 transition-all">
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g., Instagram or com.google.android.gm"
                  className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder-slate-500"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                  Fetch
                </button>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                <a href="#" className="underline">Sign up</a> to get 5 free fetches.
              </p>
            </form>

            {/* Trusted By */}
            <div className="mt-20">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] mb-8">Trusted by teams at</p>
              <div className="flex justify-center items-center gap-12 opacity-30 grayscale contrast-125">
                 <div className="w-8 h-8 bg-white rounded-full"></div>
                 <div className="w-8 h-8 bg-white rotate-45"></div>
                 <div className="w-10 h-6 bg-white rounded-sm"></div>
                 <div className="w-6 h-6 border-4 border-white rounded-full"></div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="max-w-7xl mx-auto px-6 mb-40">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black mb-4">Everything you need, nothing you don't.</h2>
              <p className="text-slate-500">Our powerful features are designed to streamline your workflow and save you valuable time.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Blazing Fast', desc: 'Get all screenshots for any app in seconds.', icon: <LightningIcon className="w-5 h-5"/> },
                { title: 'High Resolution', desc: 'Download original, high-quality screenshots directly.', icon: <SparklesIcon className="w-5 h-5"/> },
                { title: 'Bulk Downloads', desc: 'Select all or specific screenshots in a ZIP file.', icon: <LayersIcon className="w-5 h-5"/> },
                { title: 'Developer API', desc: 'Integrate our fetching capabilities into your workflows.', icon: <GlobeIcon className="w-5 h-5"/> }
              ].map((f, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:border-blue-500/30 transition-all">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="max-w-7xl mx-auto px-6 mb-40">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black mb-4">Loved by Professionals Worldwide</h2>
              <p className="text-slate-500">Don't just take our word for it. Here's what our users are saying.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Sarah Johnson', role: 'Marketing Manager, Innovate Co', text: "This tool saved me hours of manual work. A must-have for any app marketer!" },
                { name: 'Michael Chen', role: 'Lead Developer, AppMasters', text: "The API is clean and easy to integrate. It's reliable and incredibly fast." },
                { name: 'Emily Rodriguez', role: 'UI/UX Designer, PixelPerfect', text: "Getting high-quality assets is crucial. getappshots delivers every time." }
              ].map((t, i) => (
                <div key={i} className="bg-slate-900/30 border border-white/5 p-8 rounded-3xl">
                  <p className="text-slate-400 italic mb-8 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt={t.name} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{t.name}</h4>
                      <p className="text-[10px] font-medium text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="max-w-7xl mx-auto px-6 mb-40">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black mb-4">Simple, Transparent Pricing</h2>
              <p className="text-slate-500">Choose the plan that's right for you. No hidden fees.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-slate-900/20 border border-white/5 p-10 rounded-[2.5rem] flex flex-col">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <p className="text-slate-500 text-sm mb-6">For individuals starting out.</p>
                <div className="mb-8">
                  <span className="text-4xl font-black">$0</span><span className="text-slate-500">/ month</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['5 fetches / month', 'Standard quality', 'Single downloads', 'Community support'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                      <CheckIcon className="w-4 h-4 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">Sign Up Free</button>
              </div>

              {/* Pro Plan */}
              <div className="bg-slate-900 border border-blue-600 p-10 rounded-[2.5rem] flex flex-col relative scale-105 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Most Popular</div>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-slate-500 text-sm mb-6">For professionals and small teams.</p>
                <div className="mb-8">
                  <span className="text-4xl font-black">$29</span><span className="text-slate-500">/ month</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['200 fetches / month', 'High quality downloads', 'Bulk ZIP downloads', 'Developer API access', 'Email support'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                      <CheckIcon className="w-4 h-4 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/20">Get Started</button>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-slate-900/20 border border-white/5 p-10 rounded-[2.5rem] flex flex-col">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <p className="text-slate-500 text-sm mb-6">For large organizations.</p>
                <div className="mb-8">
                  <span className="text-3xl font-black">Contact Us</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['Unlimited fetches', 'Highest quality available', 'Custom integrations', 'Dedicated account manager', 'Priority support'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                      <CheckIcon className="w-4 h-4 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">Contact Sales</button>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-4xl mx-auto px-6 mb-40">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-500">Have questions? We have answers.</p>
            </div>
            <div className="space-y-2">
              {[
                "How do I find the App ID or link?",
                "Are the downloaded screenshots high quality?",
                "Can I use this for commercial projects?",
                "Do you offer a plan with more fetches?",
                "How does the Developer API work?"
              ].map((q, i) => (
                <div key={i} className="border-b border-white/5 py-6 flex justify-between items-center group cursor-pointer">
                  <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{q}</span>
                  <span className="text-slate-600 text-xl font-light">+</span>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <AppShotLogo className="text-blue-500 w-5 h-5" />
                  <span className="font-bold text-lg">getappshots</span>
                </div>
                <p className="text-slate-500 text-sm max-w-xs">Download app screenshots, instantly. Built for the modern app ecosystem.</p>
              </div>
              <div>
                <h5 className="font-bold text-sm mb-6">Product</h5>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-sm mb-6">Company</h5>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-sm mb-6">Legal</h5>
                <ul className="space-y-4 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5 text-slate-600 text-xs">
              <p>© 2025 getappshots. All Rights Reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors"><TwitterIcon className="w-4 h-4" /></a>
                <a href="#" className="hover:text-white transition-colors"><GithubIcon className="w-4 h-4" /></a>
              </div>
            </div>
          </footer>
        </main>
      ) : view === 'loading' ? (
        <div className="flex flex-col items-center justify-center min-h-screen py-32 animate-fade-in">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold">Fetching App Assets...</h2>
          <p className="text-slate-500 mt-2">Connecting to the {store === StoreType.APP_STORE ? 'App Store' : 'Play Store'}</p>
        </div>
      ) : (
        <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
          {/* Results View logic... simplified here for brevirty */}
          {appData && (
            <div className="animate-fade-in-up">
              <button onClick={() => setView('landing')} className="mb-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                ← Back to Home
              </button>
              <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 mb-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-8">
                    <img src={appData.icon} className="w-24 h-24 rounded-3xl shadow-2xl" alt="App Icon" />
                    <div>
                      <h2 className="text-3xl font-black mb-1">{appData.name}</h2>
                      <p className="text-slate-400 font-medium">{appData.developer}</p>
                    </div>
                 </div>
                 <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center gap-2">
                   <DownloadIcon className="w-5 h-5" /> Download All
                 </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {appData.screenshots.map(shot => (
                  <div key={shot.id} className="group relative aspect-[9/18] rounded-3xl overflow-hidden bg-slate-900 border border-white/5 hover:border-blue-500/50 transition-all">
                    <img src={shot.url} className="w-full h-full object-cover" alt="Screenshot" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="p-3 bg-white text-slate-900 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                        <DownloadIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default App;
