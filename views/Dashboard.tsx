import React from 'react';
import { DownloadIcon, BrainIcon, CheckIcon, ChartIcon, SparklesIcon, XIcon, HistoryIcon, SettingsIcon, TrendingUpIcon } from '../components/Icons';
import { AppData, AnalysisResult, StoreType, Screenshot, UserProfile } from '../types';
import AnalysisChart from '../components/AnalysisChart';

/**
 * RESULTS VIEW
 * Displays the App Details, Screenshots Grid, and AI Analysis results.
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
  appData,
  analysis,
  analyzing,
  downloading,
  activeTab,
  setActiveTab,
  onAnalyze,
  onDownloadZip,
  onDownloadImage,
  onClose,
  isDarkMode
}) => {
  return (
    <div className="space-y-6 animate-fade-in w-full max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center">
          ← Back to Search
        </button>
      </div>

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
            onClick={onAnalyze}
            disabled={analyzing}
            className={`relative inline-flex items-center px-5 py-2.5 border text-sm font-bold rounded-lg transition-all
                ${analyzing ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent hover:shadow-lg hover:from-purple-500 hover:to-indigo-500'}
            `}
            >
            <SparklesIcon className={`mr-2 h-4 w-4 ${analyzing ? '' : 'text-yellow-300'}`} />
            {analyzing ? 'Thinking...' : 'AI Analysis'}
            </button>
            <button 
            onClick={onDownloadZip} 
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
                  onClick={() => onDownloadImage(shot)}
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
                    <button onClick={() => {}} className="text-brand-600 dark:text-brand-400 text-xs font-medium hover:text-brand-700">Share</button>
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
  );
};

/**
 * HISTORY MODAL
 * Displays previously analyzed apps.
 */
interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AppData[];
  onSelect: (app: AppData) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white dark:bg-slate-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border dark:border-slate-800">
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
               <HistoryIcon className="w-5 h-5"/> History
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
             {history.length === 0 ? (
               <div className="p-12 text-center">
                 <p className="text-slate-500 dark:text-slate-400">No apps analyzed yet.</p>
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
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => onSelect(item)}>
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
                        <button onClick={() => onSelect(item)} className="text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SETTINGS MODAL
 */
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpgradeClick: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onUpgradeClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white dark:bg-slate-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border dark:border-slate-800">
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
               <SettingsIcon className="w-5 h-5"/> Settings
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Profile</h3>
              <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Full name</label>
                    <input type="text" value={user.name} disabled className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Email address</label>
                    <input type="text" value={user.email} disabled className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-2 px-3 text-sm" />
                  </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Subscription</h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                 <div>
                   <p className="font-semibold text-slate-900 dark:text-white capitalize">{user.tier} Plan</p>
                   <p className="text-sm text-slate-500 dark:text-slate-400">{user.credits.total - user.credits.used} credits remaining</p>
                 </div>
                 <button onClick={onUpgradeClick} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">Upgrade</button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-950 px-4 py-3 sm:px-6 flex justify-end border-t border-gray-100 dark:border-slate-800">
             <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrendingApps = ({ onSelect }: { onSelect: (url: string) => void }) => (
  <div className="mt-12 max-w-3xl mx-auto w-full px-6">
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
            <div key={app.name} onClick={() => onSelect(app.url)} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
              <img src={app.icon} className="w-10 h-10 rounded-lg bg-slate-200" alt={app.name}/>
              <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{app.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{app.cat}</p>
              </div>
            </div>
        ))}
      </div>
  </div>
);