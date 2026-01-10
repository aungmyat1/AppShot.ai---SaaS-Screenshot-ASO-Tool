import React from 'react';
// Added missing AppleIcon and GooglePlayIcon imports
import { DownloadIcon, BrainIcon, CheckIcon, ChartIcon, SparklesIcon, XIcon, HistoryIcon, SettingsIcon, TrendingUpIcon, UserIcon, LightningIcon, AppleIcon, GooglePlayIcon } from '../components/Icons';
import { AppData, AnalysisResult, StoreType, Screenshot, UserProfile } from '../types';
import AnalysisChart from '../components/AnalysisChart';

/**
 * RESULTS VIEW
 */
interface ResultsViewProps {
  appData: AppData;
  analysis: AnalysisResult | null;
  analyzing: boolean;
  downloading: boolean;
  activeTab: 'screenshots' | 'analysis';
  setActiveTab: (tab: 'screenshots' | 'analysis') => void;
  onAnalyze: () => void;
  onDownloadZip: () => void;
  onDownloadImage: (shot: Screenshot) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  appData, analysis, analyzing, downloading, activeTab, setActiveTab,
  onAnalyze, onDownloadZip, onDownloadImage, onClose, isDarkMode
}) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          <span className="text-lg">←</span> Search Another App
        </button>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-brand-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <img src={appData.icon} alt={appData.name} className="relative h-24 w-24 rounded-[1.8rem] shadow-2xl bg-slate-800 object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">{appData.name}</h2>
            <p className="text-slate-400 font-medium mb-3">{appData.developer}</p>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${appData.store === StoreType.PLAY_STORE ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                {appData.store === StoreType.PLAY_STORE ? 'Google Play' : 'App Store'}
              </span>
              <span className="text-sm font-bold text-yellow-500">★ {appData.rating}</span>
              <span className="text-xs text-slate-500 font-medium">{appData.category}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <button
              onClick={onAnalyze}
              disabled={analyzing}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 ${analyzing ? 'opacity-70 animate-pulse' : ''}`}
            >
              <SparklesIcon className="w-5 h-5 text-yellow-300" />
              {analyzing ? 'AI Analyzing...' : 'Gemini Audit'}
            </button>
            <button 
              onClick={onDownloadZip} 
              disabled={downloading}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-2xl transition-all"
            >
              <DownloadIcon className="w-5 h-5" />
              {downloading ? 'Packing...' : 'Export ZIP'}
            </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
        <button
          onClick={() => setActiveTab('screenshots')}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'screenshots' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Screenshots ({appData.screenshots.length})
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'analysis' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          AI ASO Strategy
        </button>
      </div>

      {activeTab === 'screenshots' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {appData.screenshots.map((shot) => (
            <div key={shot.id} className="group relative aspect-[9/18] rounded-3xl overflow-hidden bg-slate-900 border border-white/5 hover:border-brand-500/50 transition-all hover:-translate-y-1">
              <img src={shot.optimizedUrl || shot.url} alt="Screenshot" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => onDownloadImage(shot)}
                  className="bg-white text-slate-900 p-4 rounded-full font-bold shadow-2xl hover:scale-110 transition-transform"
                >
                  <DownloadIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {!analysis && !analyzing && (
            <div className="text-center py-20 bg-slate-900 rounded-3xl border-2 border-dashed border-white/10">
              <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-400 mx-auto mb-6">
                <BrainIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Strategy Generated</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">Run the Gemini Audit to analyze metadata, keywords, and competitor benchmarks.</p>
              <button onClick={onAnalyze} className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all">Start AI Audit</button>
            </div>
          )}
          
          {analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-bold text-slate-400 mb-8 uppercase tracking-widest">ASO Performance</h3>
                <div className="relative h-48 w-48 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#scoreGradient)" strokeWidth="8" strokeDasharray={`${analysis.score * 2.82} 283`} strokeLinecap="round" />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="text-center">
                    <span className="text-6xl font-black text-white">{analysis.score}</span>
                    <p className="text-sm font-bold text-slate-500 uppercase">Score</p>
                  </div>
                </div>
                <p className="mt-8 text-sm text-slate-400 leading-relaxed font-medium">This app performs better than <span className="text-brand-400">{analysis.score}%</span> of competitors in the {appData.category} category.</p>
              </div>

              <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">Market Benchmarking</h3>
                  <AnalysisChart data={analysis.competitorComparison} isDarkMode={true} />
              </div>

              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-emerald-500/5 rounded-3xl p-8 border border-emerald-500/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                        <CheckIcon className="w-6 h-6" />
                      </div>
                      <h4 className="font-black text-emerald-400 uppercase tracking-widest">Strengths</h4>
                    </div>
                    <ul className="space-y-4">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-slate-300 leading-relaxed pl-4 border-l-2 border-emerald-500/20">{s}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-red-500/5 rounded-3xl p-8 border border-red-500/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400">
                        <XIcon className="w-6 h-6" />
                      </div>
                      <h4 className="font-black text-red-400 uppercase tracking-widest">Weaknesses</h4>
                    </div>
                    <ul className="space-y-4">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm text-slate-300 leading-relaxed pl-4 border-l-2 border-red-500/20">{w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-brand-500/5 rounded-3xl p-8 border border-brand-500/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400">
                        <SparklesIcon className="w-6 h-6" />
                      </div>
                      <h4 className="font-black text-brand-400 uppercase tracking-widest">Growth Plan</h4>
                    </div>
                    <ul className="space-y-4">
                      {analysis.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-slate-300 leading-relaxed pl-4 border-l-2 border-brand-500/20">{s}</li>
                      ))}
                    </ul>
                  </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * HISTORY VIEW
 */
export const HistoryView = ({ history, onSelect }: { history: AppData[], onSelect: (app: AppData) => void }) => (
  <div className="pt-28 pb-32 px-6 max-w-7xl mx-auto animate-fade-in">
    <div className="flex justify-between items-end mb-12">
      <div>
        <h2 className="text-4xl font-black text-white mb-2">Fetch History</h2>
        <p className="text-slate-500">Access your previously analyzed apps and assets.</p>
      </div>
      <div className="bg-slate-900 p-1 rounded-xl border border-white/5 flex gap-1">
        <button className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg">All</button>
        <button className="px-4 py-2 text-slate-500 hover:text-white text-xs font-bold rounded-lg transition-colors">Play Store</button>
        <button className="px-4 py-2 text-slate-500 hover:text-white text-xs font-bold rounded-lg transition-colors">App Store</button>
      </div>
    </div>

    {history.length === 0 ? (
      <div className="py-32 text-center bg-slate-900 rounded-3xl border border-white/5">
         <HistoryIcon className="w-16 h-16 text-slate-800 mx-auto mb-6" />
         <p className="text-slate-500 font-bold">No apps in your history yet.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((app) => (
          <div 
            key={app.id} 
            onClick={() => onSelect(app)}
            className="group bg-slate-900 p-6 rounded-3xl border border-white/5 hover:border-brand-500/50 transition-all cursor-pointer hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <img src={app.icon} className="w-14 h-14 rounded-2xl bg-slate-800 shadow-xl" />
              <div className="flex-1 overflow-hidden">
                <h3 className="text-lg font-bold text-white truncate">{app.name}</h3>
                <p className="text-xs text-slate-500 font-medium truncate">{app.developer}</p>
              </div>
              <div className={`p-2 rounded-lg ${app.store === StoreType.APP_STORE ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                {app.store === StoreType.APP_STORE ? <AppleIcon className="w-4 h-4" /> : <GooglePlayIcon className="w-4 h-4" />}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">{new Date(app.scrapedAt).toLocaleDateString()}</span>
              <button className="text-brand-400 text-xs font-black uppercase tracking-widest group-hover:underline">View Analysis →</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * SETTINGS VIEW
 */
export const SettingsView = ({ user, navigate }: { user: UserProfile, navigate: (v: any) => void }) => (
  <div className="pt-28 pb-32 px-6 max-w-3xl mx-auto animate-fade-in">
    <h2 className="text-4xl font-black text-white mb-12">Settings</h2>
    
    <div className="space-y-8">
      <div className="bg-slate-900 rounded-3xl p-8 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-brand-400" /> Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
            <p className="text-white font-bold">{user.name}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</label>
            <p className="text-white font-bold">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <LightningIcon className="w-32 h-32 text-brand-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <LightningIcon className="w-5 h-5 text-brand-400" /> Subscription
        </h3>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{user.tier} Plan</span>
              <span className="text-xs text-slate-500 font-bold">Since {user.memberSince}</span>
            </div>
            <p className="text-slate-400 text-sm">You've used <span className="text-white font-bold">{user.credits.used}</span> of your <span className="text-white font-bold">{user.credits.total}</span> monthly credits.</p>
          </div>
          <button 
            onClick={() => navigate('pricing')}
            className="w-full md:w-auto px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-brand-50 transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
        <div className="mt-8 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-1000"
            style={{ width: `${(user.credits.used / user.credits.total) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-brand-400" /> Preferences
        </h3>
        <div className="flex items-center justify-between py-4 border-b border-white/5">
          <span className="text-sm font-bold text-slate-300">Email Notifications</span>
          <div className="w-12 h-6 bg-brand-600 rounded-full relative cursor-pointer">
            <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-sm font-bold text-slate-300">Auto-optimize images</span>
          <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const TrendingApps = ({ onSelect }: { onSelect: (url: string) => void }) => (
  <div className="mt-16 w-full animate-fade-in-up delay-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4"/> Suggested Apps
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
            { name: 'Instagram', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/31/6d/04/316d042f-e89c-a81d-e59f-d3900259b10f/AppIcon-0-0-1x_U007emarketing-0-5-0-85-220.png/512x512bb.jpg', url: 'https://apps.apple.com/us/app/instagram/id389801252' },
            { name: 'CapCut', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/05/29/4a/05294a8f-287c-3f5a-3e81-22920253f86e/AppIcon-1x_U007emarketing-0-10-0-85-220.png/512x512bb.jpg', url: 'https://apps.apple.com/us/app/capcut-video-editor/id1491092771' },
            { name: 'Uber', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/44/21/5c/44215cf2-83e8-71e3-8559-0f622439c27f/AppIcon-0-0-1x_U007emarketing-0-10-0-85-220.png/512x512bb.jpg', url: 'https://apps.apple.com/us/app/uber-request-a-ride/id368677368' }
        ].map((app) => (
            <div 
              key={app.name} 
              onClick={() => onSelect(app.url)} 
              className="group bg-slate-900 p-4 rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:border-brand-500 transition-all hover:-translate-y-1"
            >
              <img src={app.icon} className="w-12 h-12 rounded-xl bg-slate-800" alt={app.name}/>
              <div>
                  <p className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{app.name}</p>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">App Store</p>
              </div>
            </div>
        ))}
      </div>
  </div>
);