
import React, { useState, useCallback } from 'react';
import { 
  CheckIcon, DownloadIcon, MoonIcon, SunIcon, 
  LayersIcon, SparklesIcon, LightningIcon, SearchIcon, 
  AppleIcon, GooglePlayIcon, AppIcon, GlobeIcon, TwitterIcon, GithubIcon
} from '../components/Icons';
import { ResultsView, HistoryView, SettingsView, TrendingApps } from './Dashboard';
import PricingModal from '../components/PricingModal';
import ToastContainer, { ToastMessage } from '../components/Toast';
import { AppData, AnalysisResult, StoreType, UserProfile, AppView } from '../types';
import { scrapeApp } from '../services/mockScraperService';
import { analyzeASO } from '../services/geminiService';

const BrandLogos = () => (
  <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 text-slate-500 opacity-40 grayscale transition-all hover:opacity-70">
    {/* Stripe */}
    <svg className="h-6 md:h-8" viewBox="0 0 60 25" fill="currentColor">
      <path d="M54.08 14.82c0-3.34-1.84-4.84-4.64-4.84-2.88 0-4.9 2-4.9 5.2 0 3.76 2.3 5 5 5 1.34 0 2.5-.2 3.4-.64v-2.38c-.8.36-1.74.52-2.6.52-1.26 0-2.14-.4-2.14-1.86h5.88v-.04zm-5.88-1.78c0-1.18.72-1.78 1.62-1.78.88 0 1.62.6 1.62 1.78h-3.24zm-8.82 7.14V10.22h-3.64v1.14c-.6-.74-1.54-1.38-2.9-1.38-2.6 0-4.32 2.12-4.32 5.08s1.64 5.22 4.32 5.22c1.46 0 2.34-.64 2.9-1.38v1.14h3.64zm-3.64-4.8c0 1.78-.96 2.68-2.14 2.68-1.22 0-2.18-.9-2.18-2.68 0-1.74.96-2.68 2.18-2.68 1.18 0 2.14.94 2.14 2.68zM31.22 10.22c-1.54 0-2.42.72-2.98 1.48V10.22h-3.64v10.04h3.64v-5.68c0-1.66 1.12-2.68 2.68-2.68.22 0 .42.02.66.06V8.34c-.42-.08-.82-.12-1.16-.12zm-8.38-1.42V1.18L19.2.66v6.24h-2.14V10h2.14v6.86c0 2.6 1.36 3.66 3.48 3.66.72 0 1.46-.1 2.06-.32V17.3c-.38.12-.76.18-1.16.18-.84 0-1.18-.4-1.18-1.5V10h2.62V6.9h-2.26zm-9.08-1.92c-.82 0-1.54.18-2.1.5l.58 2.72c.48-.22 1.02-.38 1.58-.38.82 0 1.28.3 1.28.98 0 1.94-5.32 1-5.32 4.4 0 2.1 1.62 3.4 3.96 3.4 1.42 0 2.4-.54 2.94-1.22v1h3.64v-6.72c0-3.32-2.3-4.68-4.56-4.68zm.08 10.2c-.88 0-1.56-.4-1.56-1.14 0-1.04 1.36-1.34 2.82-1.74.04.5.04.9.04 1.22 0 1.1-.48 1.66-1.3 1.66zM4.7 6.84V10h2.26v2.96H4.7v12.3h3.58V12.96h2.24V10H8.28V6.84c0-.82.46-1.1 1.26-1.1.4 0 .78.06 1.16.18V3.04c-.6-.18-1.3-.26-2.02-.26-2.34 0-4 1.3-4 4.06z"/>
    </svg>
    {/* Spotify */}
    <svg className="h-6 md:h-8" viewBox="0 0 167 50" fill="currentColor">
      <path d="M25 0C11.19 0 0 11.19 0 25s11.19 25 25 25 25-11.19 25-25S38.81 0 25 0zm11.48 36.06c-.45.74-1.41.97-2.15.52-5.91-3.61-13.36-4.43-22.12-2.43-.84.19-1.68-.33-1.87-1.18s.33-1.68 1.18-1.87c9.6-2.19 17.84-1.24 24.44 2.8.74.45.97 1.41.52 2.15zm3.06-6.8c-.57.92-1.77 1.22-2.69.66-6.77-4.16-17.09-5.37-25.1-2.94-1.04.32-2.14-.26-2.46-1.3-.32-1.04.26-2.14 1.3-2.46 9.15-2.78 20.53-1.42 28.29 3.35.92.56 1.22 1.77.66 2.69zm.27-7.05c-8.11-4.82-21.5-5.27-29.28-2.91-1.24.38-2.58-.32-2.95-1.56s.32-2.58 1.56-2.95c9-2.73 23.79-2.21 33.1 3.32 1.12.66 1.5 2.1.84 3.22s-2.11 1.53-3.23.86z"/>
      <text x="60" y="38" fontSize="30" fontWeight="800">Spotify</text>
    </svg>
    {/* Slack */}
    <svg className="h-6 md:h-8" viewBox="0 0 100 25" fill="currentColor">
      <circle cx="10" cy="12" r="8" fillOpacity="0.8"/>
      <text x="25" y="19" fontSize="20" fontWeight="900">slack</text>
    </svg>
    {/* Netflix */}
    <svg className="h-6 md:h-8" viewBox="0 0 100 25" fill="currentColor">
      <path d="M5.5 0h4v25h-4z" fillOpacity="0.9"/>
      <path d="M15.5 0h4v25h-4z" fillOpacity="0.9"/>
      <path d="M5.5 0l14 25h-4l-14-25z" fillOpacity="1"/>
      <text x="25" y="19" fontSize="20" fontWeight="900">NETFLIX</text>
    </svg>
  </div>
);

interface Props {
  view: AppView;
  navigate: (view: AppView) => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  history: AppData[];
  setHistory: React.Dispatch<React.SetStateAction<AppData[]>>;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Landing: React.FC<Props> = ({ 
  view, navigate, user, setUser, history, setHistory, isDarkMode, toggleTheme 
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'screenshots' | 'analysis'>('screenshots');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [storeType, setStoreType] = useState<StoreType>(StoreType.APP_STORE);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const data = await scrapeApp(url);
      setAppData(data);
      setHistory(prev => [data, ...prev]);
      navigate('dashboard');
      addToast('Assets fetched successfully!', 'success');
    } catch (err) {
      addToast('Failed to fetch app assets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!appData) return;
    setAnalyzing(true);
    setActiveTab('analysis');
    try {
      const result = await analyzeASO(appData);
      setAnalysis(result);
      addToast('AI Audit Complete', 'success');
    } catch (err) {
      addToast('AI analysis failed.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (view === 'dashboard' && appData) {
    return (
      <div className="bg-[#020617] min-h-screen text-white pt-24 pb-20 px-6">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <ResultsView 
          appData={appData} 
          analysis={analysis}
          analyzing={analyzing}
          downloading={false}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAnalyze={handleAnalyze}
          onDownloadZip={() => addToast('Batch export coming soon', 'info')}
          onDownloadImage={() => addToast('Downloading...', 'info')}
          onClose={() => { setAppData(null); navigate('home'); }}
          isDarkMode={isDarkMode}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#020617] text-white selection:bg-blue-600/30">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
            <AppIcon className="text-blue-500 w-6 h-6" />
            <span className="font-bold text-lg tracking-tight">getappshots</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => navigate('pricing')} className="hover:text-white transition-colors">Pricing</button>
            <button className="hover:text-white transition-colors">How it Works</button>
            <button className="hover:text-white transition-colors">Contact</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-white transition-colors">
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2 rounded-lg transition-all">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 max-w-4xl mx-auto text-center animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
          App Screenshots, <span className="text-blue-500">Instantly.</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Paste any App Store or Google Play link/ID to download all screenshots in seconds. Perfect for designers, marketers, and developers.
        </p>

        {/* Platform Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-900/50 p-1 rounded-full border border-white/10 flex gap-1">
            <button 
              onClick={() => setStoreType(StoreType.APP_STORE)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${storeType === StoreType.APP_STORE ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              <AppleIcon className="w-3.5 h-3.5" /> App Store
            </button>
            <button 
              onClick={() => setStoreType(StoreType.PLAY_STORE)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${storeType === StoreType.PLAY_STORE ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              <GooglePlayIcon className="w-3.5 h-3.5" /> Google Play
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleFetch} className="max-w-2xl mx-auto mb-20 group">
          <div className="relative flex items-center bg-slate-900/80 border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-blue-500/50 transition-all">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., Instagram or com.google.android.gm"
              className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder-slate-600"
            />
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
              {loading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            <a href="#" className="underline">Sign up</a> to get 5 free fetches.
          </p>
        </form>

        {/* Trusted By */}
        <div className="mt-12">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-10">Trusted by teams at</p>
          <BrandLogos />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">Everything you need, nothing you don't.</h2>
          <p className="text-slate-500">Our powerful features are designed to streamline your workflow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Blazing Fast', desc: 'Get all screenshots for any app in seconds.', icon: <LightningIcon /> },
            { title: 'High Resolution', desc: 'Download original, high-quality screenshots directly.', icon: <SparklesIcon /> },
            { title: 'Bulk Downloads', desc: 'Select all or specific screenshots in a ZIP file.', icon: <LayersIcon /> },
            { title: 'AI Optimized', desc: 'Automatically optimized assets for faster load times.', icon: <GlobeIcon /> }
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
      <section className="max-w-7xl mx-auto px-6 py-40 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">Loved by Professionals Worldwide</h2>
          <p className="text-slate-500">Don't just take our word for it.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah Johnson', role: 'Marketing Manager, Innovate Co', text: "This tool saved me hours of manual work. A must-have for any app marketer!" },
            { name: 'Michael Chen', role: 'Lead Developer, AppMasters', text: "The assets are clean and easy to use. It's reliable and incredibly fast." },
            { name: 'Emily Rodriguez', role: 'UI/UX Designer, PixelPerfect', text: "Getting high-quality assets is crucial. getappshots delivers every time." }
          ].map((t, i) => (
            <div key={i} className="bg-slate-900/30 border border-white/5 p-8 rounded-3xl">
              <p className="text-slate-400 italic mb-8 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt={t.name} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{t.name}</h4>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-6 py-40 border-t border-white/5" id="pricing">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-500">Choose the plan that's right for you.</p>
        </div>
        <PricingModal isOpen={true} isInline onClose={() => {}} onUpgrade={() => addToast('Upgraded!', 'success')} />
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-40">
        <h2 className="text-3xl font-black text-center mb-16">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {[
            "How do I find the App ID or link?",
            "Are the downloaded screenshots high quality?",
            "Can I use this for commercial projects?",
            "Do you offer a plan with more fetches?",
            "Can I export all assets at once?"
          ].map((q, i) => (
            <div key={i} className="border-b border-white/5 py-6 flex justify-between items-center group cursor-pointer hover:bg-white/5 transition-colors px-4 rounded-xl">
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
              <AppIcon className="text-blue-500 w-5 h-5" />
              <span className="font-bold text-lg">getappshots</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs">Download app screenshots, instantly. Built for the modern app ecosystem.</p>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-300">Product</h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Success Stories</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-300">Company</h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-slate-300">Legal</h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-white">Terms</a></li>
              <li><a href="#" className="hover:text-white">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5 text-slate-600 text-xs font-bold">
          <p>© 2025 getappshots. All Rights Reserved.</p>
          <div className="flex gap-6">
            <TwitterIcon className="w-4 h-4 hover:text-white cursor-pointer" />
            <GithubIcon className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
