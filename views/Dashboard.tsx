import React, { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { SearchIcon, DownloadIcon, BrainIcon, LayersIcon, CheckIcon, ChartIcon } from '../components/Icons';
import { scrapeApp, validateUrl } from '../services/mockScraperService';
import { analyzeASO } from '../services/geminiService';
import { AppData, StoreType, AnalysisResult, UserProfile, Screenshot } from '../types';
import AnalysisChart from '../components/AnalysisChart';
import PricingModal from '../components/PricingModal';

// Mock Icons for Sidebar
const HomeIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const HistoryIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const SettingsIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

const Dashboard: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'screenshots' | 'analysis'>('screenshots');
  const [sidebarView, setSidebarView] = useState<'home' | 'history' | 'settings'>('home');
  const [isPricingOpen, setIsPricingOpen] = useState(false);

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

  const handleScrape = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check credits
    if (user.credits.used >= user.credits.total) {
      setIsPricingOpen(true);
      return;
    }

    setAppData(null);
    setAnalysis(null);
    
    const storeType = validateUrl(url);
    if (storeType === StoreType.UNKNOWN) {
      setError('Please enter a valid Google Play or Apple App Store URL');
      return;
    }

    setLoading(true);
    try {
      const data = await scrapeApp(url);
      setAppData(data);
      setHistory(prev => [data, ...prev]);
      setUser(prev => ({
        ...prev,
        credits: { ...prev.credits, used: prev.credits.used + 1 }
      }));
    } catch (err) {
      setError('Failed to fetch app data. Please try again.');
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
    } catch (err) {
      // Error handling managed in service
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
  };

  const handleDownloadImage = async (shot: Screenshot) => {
    try {
        // Use optimized URL if available, fallback to original
        const downloadUrl = shot.optimizedUrl || shot.url;
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Determine extension based on optimized status or original URL
        const extension = shot.optimized ? 'webp' : 'jpg';
        a.download = `screenshot-${shot.id}.${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (e) {
        console.error("Download failed", e);
    }
  };

  const handleDownloadZip = async () => {
    if (!appData || user.tier === 'free') {
        setIsPricingOpen(true);
        return;
    }

    setDownloading(true);
    try {
        const zip = new JSZip();
        const folder = zip.folder(`${appData.name.replace(/\s+/g, '_')}_assets`);

        // Add all screenshots to zip
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
        a.download = `${appData.name.replace(/\s+/g, '_')}_assets.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error("Failed to generate zip", error);
        setError("Failed to generate ZIP archive.");
    } finally {
        setDownloading(false);
    }
  };

  const renderContent = () => {
    if (sidebarView === 'settings') {
      return (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Profile Information</h3>
              <p className="mt-1 text-sm text-slate-500">Update your account details and email.</p>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Full name</label>
                  <input type="text" value={user.name} disabled className="mt-1 block w-full rounded-md border-slate-300 shadow-sm bg-slate-50 py-2 px-3 sm:text-sm" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Email address</label>
                  <input type="text" value={user.email} disabled className="mt-1 block w-full rounded-md border-slate-300 shadow-sm bg-slate-50 py-2 px-3 sm:text-sm" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-slate-900">Subscription</h3>
              <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                 <div>
                   <p className="font-semibold text-slate-900 capitalize">{user.tier} Plan</p>
                   <p className="text-sm text-slate-500">{user.credits.total - user.credits.used} credits remaining</p>
                 </div>
                 <button onClick={() => setIsPricingOpen(true)} className="text-sm font-medium text-brand-600 hover:text-brand-700">Manage Subscription</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (sidebarView === 'history') {
      return (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Download History</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {history.length === 0 ? (
               <div className="p-12 text-center">
                 <div className="mx-auto h-12 w-12 text-slate-300">
                   <HistoryIcon className="h-full w-full" />
                 </div>
                 <h3 className="mt-2 text-sm font-medium text-slate-900">No history yet</h3>
                 <p className="mt-1 text-sm text-slate-500">Scrape an app to see it here.</p>
               </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">App</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Store</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded-lg" src={item.icon} alt="" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{item.name}</div>
                            <div className="text-sm text-slate-500">{item.developer}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.store === StoreType.PLAY_STORE ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {item.store === StoreType.PLAY_STORE ? 'Play Store' : 'App Store'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(item.scrapedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => { setAppData(item); setSidebarView('home'); }} className="text-brand-600 hover:text-brand-900">View</button>
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
      <div className="max-w-7xl mx-auto w-full">
         {/* Search Input */}
         {!appData && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-2xl mx-auto mt-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Start a new analysis</h2>
              <p className="text-slate-500 mb-8">Enter an app store URL to download assets and get AI insights.</p>
              
              <form onSubmit={handleScrape} className="relative flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="Paste Play Store or App Store URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !url}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 'Scrape'}
                </button>
              </form>
              {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

              <div className="mt-8 flex justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><CheckIcon className="w-3 h-3"/> Play Store</span>
                <span className="flex items-center gap-1"><CheckIcon className="w-3 h-3"/> App Store</span>
              </div>
            </div>
         )}

         {appData && (
          <div className="space-y-6">
            <button onClick={() => setAppData(null)} className="text-sm text-slate-500 hover:text-slate-800 flex items-center mb-4">
              ← Back to search
            </button>

            {/* App Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={appData.icon} alt={appData.name} className="h-20 w-20 rounded-2xl shadow-sm" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{appData.name}</h2>
                  <p className="text-slate-500">{appData.developer}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {appData.store === StoreType.PLAY_STORE ? 'Play Store' : 'App Store'}
                    </span>
                    <span className="text-sm text-slate-600">★ {appData.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                 <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none"
                >
                  <BrainIcon className="mr-2 h-4 w-4 text-purple-500" />
                  {analyzing ? 'Thinking...' : 'AI Analysis'}
                </button>
                <button 
                  onClick={handleDownloadZip} 
                  disabled={downloading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none shadow-sm ${downloading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {downloading ? 'Zipping...' : 'Download ZIP'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('screenshots')}
                  className={`${activeTab === 'screenshots' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Screenshots ({appData.screenshots.length})
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`${activeTab === 'analysis' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  AI Optimization
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'screenshots' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {appData.screenshots.map((shot) => (
                  <div key={shot.id} className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-slate-100 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <img src={shot.optimizedUrl || shot.url} alt="Screenshot" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={() => handleDownloadImage(shot)}
                        className="bg-white p-2 rounded-full shadow-lg hover:bg-slate-100"
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
                  <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                    <BrainIcon className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No analysis generated</h3>
                    <p className="mt-1 text-sm text-slate-500">Click the "AI Analysis" button above to audit this app.</p>
                  </div>
                )}
                
                {analyzing && (
                   <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[300px]">
                      <div className="animate-pulse flex flex-col items-center w-full max-w-lg">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
                        <div className="grid grid-cols-3 gap-4 w-full">
                           <div className="h-32 bg-slate-200 rounded"></div>
                           <div className="h-32 bg-slate-200 rounded"></div>
                           <div className="h-32 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <p className="mt-6 text-slate-500 font-medium animate-bounce">Gemini is analyzing ASO potential...</p>
                   </div>
                )}

                {analysis && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score Card */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <h3 className="font-semibold text-slate-900 mb-4">ASO Health Score</h3>
                      <div className="flex items-center justify-center py-6">
                         <div className="relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-brand-100">
                           <span className="text-4xl font-bold text-brand-600">{analysis.score}</span>
                           <svg className="absolute inset-0 h-full w-full -rotate-90 text-brand-500" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${analysis.score * 2.9} 289`} strokeLinecap="round" className="drop-shadow-sm"></circle>
                           </svg>
                         </div>
                      </div>
                      <p className="text-center text-sm text-slate-500 mt-2">
                        Based on competitors in {appData.category}
                      </p>
                    </div>

                    {/* Competitor Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                       <h3 className="font-semibold text-slate-900 mb-4">Competitor Benchmarking</h3>
                       <AnalysisChart data={analysis.competitorComparison} />
                    </div>

                    {/* Insights Grid */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                          <h4 className="font-semibold text-green-800 mb-3">Strengths</h4>
                          <ul className="space-y-2">
                            {analysis.strengths.map((item, i) => (
                              <li key={i} className="flex items-start text-sm text-green-700">
                                <span className="mr-2">•</span> {item}
                              </li>
                            ))}
                          </ul>
                       </div>
                       <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                          <h4 className="font-semibold text-red-800 mb-3">Weaknesses</h4>
                          <ul className="space-y-2">
                            {analysis.weaknesses.map((item, i) => (
                              <li key={i} className="flex items-start text-sm text-red-700">
                                <span className="mr-2">•</span> {item}
                              </li>
                            ))}
                          </ul>
                       </div>
                       <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                          <h4 className="font-semibold text-blue-800 mb-3">AI Suggestions</h4>
                          <ul className="space-y-2">
                            {analysis.suggestions.map((item, i) => (
                              <li key={i} className="flex items-start text-sm text-blue-700">
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="bg-brand-600 p-1.5 rounded-lg mr-3">
            <LayersIcon className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-slate-900">AppShot.ai</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setSidebarView('home')}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${sidebarView === 'home' ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <HomeIcon className={`mr-3 h-5 w-5 ${sidebarView === 'home' ? 'text-brand-500' : 'text-slate-400'}`} />
            Analysis
          </button>
          <button
            onClick={() => setSidebarView('history')}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${sidebarView === 'history' ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <HistoryIcon className={`mr-3 h-5 w-5 ${sidebarView === 'history' ? 'text-brand-500' : 'text-slate-400'}`} />
            History
          </button>
          <button
            onClick={() => setSidebarView('settings')}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${sidebarView === 'settings' ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <SettingsIcon className={`mr-3 h-5 w-5 ${sidebarView === 'settings' ? 'text-brand-500' : 'text-slate-400'}`} />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Credits</span>
              <span className="text-xs font-bold text-slate-900">{user.credits.used}/{user.credits.total}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
              <div 
                className={`bg-brand-600 h-2 rounded-full transition-all duration-300`} 
                style={{ width: `${Math.min((user.credits.used / user.credits.total) * 100, 100)}%` }}
              ></div>
            </div>
            {user.tier === 'free' && (
              <button 
                onClick={() => setIsPricingOpen(true)}
                className="w-full text-center text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 md:hidden h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <LayersIcon className="text-brand-600 h-6 w-6" />
            <span className="font-bold text-xl text-slate-900">AppShot.ai</span>
          </div>
          <button className="text-slate-500">
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