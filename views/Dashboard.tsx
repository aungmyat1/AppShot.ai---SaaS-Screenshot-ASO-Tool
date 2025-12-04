import React, { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { SearchIcon, DownloadIcon, BrainIcon, LayersIcon, CheckIcon, ChartIcon, MoonIcon, SunIcon, SparklesIcon, TrendingUpIcon } from '../components/Icons';
import { scrapeApp, validateUrl } from '../services/mockScraperService';
import { analyzeASO } from '../services/geminiService';
import { AppData, StoreType, AnalysisResult, UserProfile, Screenshot } from '../types';
import AnalysisChart from '../components/AnalysisChart';
import PricingModal from '../components/PricingModal';
import ToastContainer, { ToastMessage } from '../components/Toast';

// Mock Icons for Sidebar
const HomeIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const HistoryIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const SettingsIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Dashboard: React.FC<Props> = ({ isDarkMode, toggleTheme }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'screenshots' | 'analysis'>('screenshots');
  const [sidebarView, setSidebarView] = useState<'home' | 'history' | 'settings'>('home');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Mock User State
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_123',
    name: 'Demo User',
    email: 'user@example.com',
    tier: 'free',
    credits: { used: 3, total: 5 },
    memberSince: 'Oct 2023'
  });

  // Mock History
  const [history, setHistory] = useState<AppData[]>([]);

  const handleScrape = useCallback(async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const targetUrl = typeof e === 'string' ? e : url;
    
    // Check credits
    if (user.credits.used >= user.credits.total) {
      setIsPricingOpen(true);
      return;
    }

    setAppData(null);
    setAnalysis(null);
    
    const storeType = validateUrl(targetUrl);
    if (storeType === StoreType.UNKNOWN) {
      addToast('Please enter a valid Google Play or Apple App Store URL', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await scrapeApp(targetUrl);
      setAppData(data);
      setHistory(prev => [data, ...prev]);
      setUser(prev => ({
        ...prev,
        credits: { ...prev.credits, used: prev.credits.used + 1 }
      }));
      addToast('App data loaded successfully', 'success');
    } catch (err) {
      addToast('Failed to fetch app data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [url, user.credits]);

  const handleAnalyze = useCallback(async () => {
    if (!appData) return;
    
    setAnalyzing(true);
    setActiveTab('analysis');
    try {
      const result = await analyzeASO(appData);
      setAnalysis(result);
      addToast('AI Analysis complete', 'success');
    } catch (err) {
      addToast('Analysis failed. Please try again.', 'error');
    } finally {
      setAnalyzing(false);
    }
  }, [appData]);

  const handleUpgrade = (tier: string) => {
    setUser(prev => ({
      ...prev,
      tier: tier as any,
      credits: { used: prev.credits.used, total: tier === 'pro' ? 100 : prev.credits.total }
    }));
    addToast(`Upgraded to ${tier.toUpperCase()} plan!`, 'success');
  };

  const handleDownloadImage = async (shot: Screenshot) => {
    try {
        const downloadUrl = shot.optimizedUrl || shot.url;
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = shot.optimized ? 'webp' : 'jpg';
        // Sanitize app name for filename
        const safeName = appData?.name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_') || 'app';
        a.download = `${safeName}_screenshot-${shot.id}.${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addToast('Image downloaded', 'success');
    } catch (e) {
        console.error("Download failed", e);
        addToast('Failed to download image', 'error');
    }
  };

  const handleDownloadZip = async () => {
    if (!appData || user.tier === 'free') {
        setIsPricingOpen(true);
        return;
    }

    setDownloading(true);
    addToast('Preparing ZIP archive...', 'info');
    try {
        const zip = new JSZip();
        // Create filename with App Name and App ID
        const safeName = appData.name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
        const fileName = `${safeName}_${appData.id}_assets`;
        
        const folder = zip.folder(fileName);

        const promises = appData.screenshots.map(async (shot, index) => {
            const downloadUrl = shot.optimizedUrl || shot.url;
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const extension = shot.optimized ? 'webp' : 'jpg';
            folder?.file(`screenshot_${index + 1}.${extension}`, blob);
        });

        await Promise.all(promises);

        const content = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addToast('ZIP downloaded successfully', 'success');
    } catch (error) {
        console.error("Failed to generate zip", error);
        addToast("Failed to generate ZIP archive.", 'error');
    } finally {
        setDownloading(false);
    }
  };

  const handleShare = () => {
    addToast('Analysis link copied to clipboard!', 'success');
  };

  const renderContent = () => {
    if (sidebarView === 'settings') {
      return (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Profile Information</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your account details and email.</p>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
                  <input type="text" value={user.name} disabled className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3 sm:text-sm" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
                  <input type="text" value={user.email} disabled className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 shadow-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3 sm:text-sm" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Subscription</h3>
              <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                 <div>
                   <p className="font-semibold text-slate-900 dark:text-white capitalize">{user.tier} Plan</p>
                   <p className="text-sm text-slate-500 dark:text-slate-400">{user.credits.total - user.credits.used} credits remaining</p>
                 </div>
                 <button onClick={() => setIsPricingOpen(true)} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">Manage Subscription</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (sidebarView === 'history') {
      return (
        <div className="max-w-6xl mx-auto animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Download History</h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {history.length === 0 ? (
               <div className="p-12 text-center">
                 <div className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600">
                   <HistoryIcon className="h-full w-full" />
                 </div>
                 <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No history yet</h3>
                 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Scrape an app to see it here.</p>
               </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">App</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Store</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded-lg" src={item.icon} alt="" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{item.developer}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.store === StoreType.PLAY_STORE ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                          {item.store === StoreType.PLAY_STORE ? 'Play Store' : 'App Store'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {new Date(item.scrapedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => { setAppData(item); setSidebarView('home'); setIsMobileMenuOpen(false); }} className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );
    }

    // Default Home View
    return (
      <div className="max-w-7xl mx-auto w-full animate-fade-in">
         {/* Search Input */}
         {!appData && (
            <>
              {/* Platform Overview Stats - New! */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
                   <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mr-4">
                      <ChartIcon className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Total Analyzed</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">12.4k</p>
                   </div>
                </div>
                 <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
                   <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 mr-4">
                      <BrainIcon className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">AI Insights</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">850k+</p>
                   </div>
                </div>
                 <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
                   <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 mr-4">
                      <DownloadIcon className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Assets Saved</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">2.1M</p>
                   </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Analyze any app instantly</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto">Enter an app store URL to download high-res assets and get AI-powered conversion insights.</p>
                
                <form onSubmit={handleScrape} className="relative flex gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-4 border border-slate-300 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-base transition duration-150 ease-in-out shadow-inner"
                      placeholder="Paste Play Store or App Store URL..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !url}
                    className={`inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 transition-transform'}`}
                  >
                    {loading ? 'Processing...' : 'Analyze'}
                  </button>
                </form>

                <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-green-500"/> Play Store</span>
                  <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-blue-500"/> App Store</span>
                </div>
              </div>

              {/* Trending Apps - New! */}
              <div className="mt-12 max-w-3xl mx-auto">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                       <TrendingUpIcon className="w-5 h-5 text-brand-500"/> Trending Now
                    </h3>
                    <span className="text-xs text-slate-500">Updated hourly</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                       { name: 'Instagram', cat: 'Social', icon: 'https://picsum.photos/id/1/100/100', url: 'https://play.google.com/store/apps/details?id=com.instagram.android' },
                       { name: 'Spotify', cat: 'Music', icon: 'https://picsum.photos/id/2/100/100', url: 'https://play.google.com/store/apps/details?id=com.spotify.music' },
                       { name: 'Notion', cat: 'Productivity', icon: 'https://picsum.photos/id/3/100/100', url: 'https://play.google.com/store/apps/details?id=notion.id' }
                    ].map((app) => (
                       <div key={app.name} onClick={() => { setUrl(app.url); handleScrape(app.url); }} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                          <img src={app.icon} className="w-10 h-10 rounded-lg bg-slate-200" alt={app.name}/>
                          <div>
                             <p className="text-sm font-medium text-slate-900 dark:text-white">{app.name}</p>
                             <p className="text-xs text-slate-500 dark:text-slate-400">{app.cat}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            </>
         )}

         {appData && (
          <div className="space-y-6 animate-fade-in">
            <button onClick={() => setAppData(null)} className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center mb-4">
              ← Back to search
            </button>

            {/* App Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={appData.icon} alt={appData.name} className="h-20 w-20 rounded-2xl shadow-sm bg-slate-100 dark:bg-slate-800" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{appData.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{appData.developer}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appData.store === StoreType.PLAY_STORE ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                      {appData.store === StoreType.PLAY_STORE ? 'Play Store' : 'App Store'}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">★ {appData.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                 <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className={`relative inline-flex items-center px-5 py-2.5 border text-sm font-bold rounded-lg transition-all
                     ${analyzing ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent hover:shadow-lg hover:from-purple-500 hover:to-indigo-500'}
                  `}
                >
                  <SparklesIcon className={`mr-2 h-4 w-4 ${analyzing ? '' : 'text-yellow-300'}`} />
                  {analyzing ? 'Thinking...' : 'AI Analysis'}
                </button>
                <button 
                  onClick={handleDownloadZip} 
                  disabled={downloading}
                  className={`inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none shadow-sm ${downloading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {downloading ? 'Zipping...' : 'Download ZIP'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('screenshots')}
                  className={`${activeTab === 'screenshots' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Screenshots ({appData.screenshots.length})
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`${activeTab === 'analysis' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  AI Optimization
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'screenshots' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {appData.screenshots.map((shot) => (
                  <div key={shot.id} className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                    <img src={shot.optimizedUrl || shot.url} alt="Screenshot" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={() => handleDownloadImage(shot)}
                        className="bg-white p-2 rounded-full shadow-lg hover:bg-slate-100 transition-transform hover:scale-110"
                        title="Download Image"
                      >
                        <DownloadIcon className="h-5 w-5 text-slate-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {!analysis && !analyzing && (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                    <BrainIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No analysis generated</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Click the "AI Analysis" button above to audit this app.</p>
                  </div>
                )}
                
                {analyzing && (
                   <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center min-h-[300px]">
                      <div className="animate-pulse flex flex-col items-center w-full max-w-lg">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-8"></div>
                        <div className="grid grid-cols-3 gap-4 w-full">
                           <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                           <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                           <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                      </div>
                      <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium animate-bounce">Gemini is analyzing ASO potential...</p>
                   </div>
                )}

                {analysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Score Card */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <ChartIcon className="w-24 h-24 text-brand-500" />
                      </div>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                         <h3 className="font-semibold text-slate-900 dark:text-white">ASO Health Score</h3>
                         <button onClick={handleShare} className="text-brand-600 dark:text-brand-400 text-xs font-medium hover:text-brand-700">Share</button>
                      </div>
                      <div className="flex items-center justify-center py-6 relative z-10">
                         <div className="relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-brand-100 dark:border-brand-900/30">
                           <span className="text-4xl font-bold text-brand-600 dark:text-brand-400">{analysis.score}</span>
                           <svg className="absolute inset-0 h-full w-full -rotate-90 text-brand-500" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${analysis.score * 2.9} 289`} strokeLinecap="round" className="drop-shadow-sm"></circle>
                           </svg>
                         </div>
                      </div>
                      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2 relative z-10">
                        Based on competitors in <span className="font-medium text-slate-700 dark:text-slate-300">{appData.category}</span>
                      </p>
                    </div>

                    {/* Competitor Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                       <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Competitor Benchmarking</h3>
                       <AnalysisChart data={analysis.competitorComparison} isDarkMode={isDarkMode} />
                    </div>

                    {/* Insights Grid */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-6 border border-green-100 dark:border-green-900/20">
                          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center"><CheckIcon className="w-4 h-4 mr-2"/> Strengths</h4>
                          <ul className="space-y-2">
                            {analysis.strengths.map((item, i) => (
                              <li key={i} className="flex items-start text-sm text-green-700 dark:text-green-400">
                                <span className="mr-2 opacity-60">•</span> {item}
                              </li>
                            ))}
                          </ul>
                       </div>
                       <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100 dark:border-red-900/20">
                          <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            Weaknesses
                          </h4>
                          <ul className="space-y-2">
                            {analysis.weaknesses.map((item, i) => (
                              <li key={i} className="flex items-start text-sm text-red-700 dark:text-red-400">
                                <span className="mr-2 opacity-60">•</span> {item}
                              </li>
                            ))}
                          </ul>
                       </div>
                       <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/20">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                            <SparklesIcon className="w-4 h-4 mr-2"/> AI Suggestions
                          </h4>
                          <ul className="space-y-2">
                            {analysis.suggestions.map((item, i) => (
                              <li key={i} className="flex items-start text-sm text-blue-700 dark:text-blue-400">
                                <span className="mr-2">→</span> {item}
                              </li>
                            ))}
                          </ul>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
         )}
      </div>
    );
  };

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center cursor-pointer" onClick={() => { setSidebarView('home'); setAppData(null); }}>
            <div className="bg-brand-600 p-1.5 rounded-lg mr-3">
            <LayersIcon className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">AppShot.ai</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <button
          onClick={() => { setSidebarView('home'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${sidebarView === 'home' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <HomeIcon className={`mr-3 h-5 w-5 ${sidebarView === 'home' ? 'text-brand-500' : 'text-slate-400'}`} />
          Analysis
        </button>
        <button
          onClick={() => { setSidebarView('history'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${sidebarView === 'history' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <HistoryIcon className={`mr-3 h-5 w-5 ${sidebarView === 'history' ? 'text-brand-500' : 'text-slate-400'}`} />
          History
        </button>
        <button
          onClick={() => { setSidebarView('settings'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${sidebarView === 'settings' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <SettingsIcon className={`mr-3 h-5 w-5 ${sidebarView === 'settings' ? 'text-brand-500' : 'text-slate-400'}`} />
          Settings
        </button>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        {/* Dark Mode Toggle for Sidebar */}
        <button 
           onClick={toggleTheme} 
           className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
            {isDarkMode ? <SunIcon className="mr-3 h-5 w-5 text-slate-400" /> : <MoonIcon className="mr-3 h-5 w-5 text-slate-400" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Credits</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{user.credits.used}/{user.credits.total}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
            <div 
              className={`bg-brand-600 h-2 rounded-full transition-all duration-300`} 
              style={{ width: `${Math.min((user.credits.used / user.credits.total) * 100, 100)}%` }}
            ></div>
          </div>
          {user.tier === 'free' && (
            <button 
              onClick={() => { setIsPricingOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full text-center text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200 font-sans">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
             <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 md:hidden h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <LayersIcon className="text-brand-600 h-6 w-6" />
            <span className="font-bold text-xl text-slate-900 dark:text-white">AppShot.ai</span>
          </div>
          <button 
            className="text-slate-500 dark:text-slate-400 p-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)} 
        onUpgrade={handleUpgrade}
      />
    </div>
  );
};

export default Dashboard;