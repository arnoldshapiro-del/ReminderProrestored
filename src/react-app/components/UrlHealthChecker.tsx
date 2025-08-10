import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ExternalLink,
  Zap,
  TrendingUp
} from 'lucide-react';
import type { ProjectType } from "@/shared/types";

interface UrlHealthCheckerProps {
  project: ProjectType;
}

interface UrlInfo {
  platform: string;
  url: string;
  timestamp?: string;
  type: 'development' | 'live';
  priority: number;
}

export default function UrlHealthChecker({ project }: UrlHealthCheckerProps) {
  const [bestUrl, setBestUrl] = useState<UrlInfo | null>(null);
  const [allUrls, setAllUrls] = useState<UrlInfo[]>([]);

  useEffect(() => {
    const urls: UrlInfo[] = [];
    
    // Collect all URLs with their metadata
    const urlSources = [
      { platform: 'Mocha', url: (project as any).mocha_published_url, timestamp: (project as any).mocha_published_at, type: 'live' as const, priority: 10 },
      { platform: 'Mocha', url: (project as any).mocha_development_url, timestamp: (project as any).mocha_development_updated_at, type: 'development' as const, priority: 8 },
      { platform: 'Netlify', url: project.netlify_url, timestamp: (project as any).netlify_deployed_at, type: 'live' as const, priority: 9 },
      { platform: 'Netlify', url: (project as any).netlify_development_url, timestamp: (project as any).netlify_development_updated_at, type: 'development' as const, priority: 7 },
      { platform: 'Vercel', url: project.vercel_url, timestamp: (project as any).vercel_deployed_at, type: 'live' as const, priority: 9 },
      { platform: 'Vercel', url: (project as any).vercel_development_url, timestamp: (project as any).vercel_development_updated_at, type: 'development' as const, priority: 7 },
      { platform: 'GitHub', url: project.github_repo_url, timestamp: (project as any).github_pushed_at, type: 'live' as const, priority: 6 },
      { platform: 'GitHub', url: (project as any).github_development_url, timestamp: (project as any).github_development_updated_at, type: 'development' as const, priority: 5 }
    ];

    urlSources.forEach(source => {
      if (source.url && source.url.trim() !== '') {
        urls.push({
          platform: source.platform,
          url: source.url,
          timestamp: source.timestamp,
          type: source.type,
          priority: source.priority
        });
      }
    });

    // Sort by priority and recency
    urls.sort((a, b) => {
      // First by type (live URLs get priority)
      if (a.type === 'live' && b.type === 'development') return -1;
      if (a.type === 'development' && b.type === 'live') return 1;
      
      // Then by timestamp (more recent first)
      if (a.timestamp && b.timestamp) {
        const aTime = new Date(a.timestamp).getTime();
        const bTime = new Date(b.timestamp).getTime();
        if (aTime !== bTime) return bTime - aTime;
      }
      
      // Finally by priority
      return b.priority - a.priority;
    });

    setAllUrls(urls);
    setBestUrl(urls[0] || null);
  }, [project]);

  const getTimeDiff = (timestamp?: string) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return { text: 'Just now', color: 'text-green-600', isRecent: true };
    if (diffInHours < 24) return { text: `${Math.floor(diffInHours)}h ago`, color: 'text-blue-600', isRecent: true };
    if (diffInDays < 7) return { text: `${diffInDays}d ago`, color: 'text-yellow-600', isRecent: diffInDays <= 3 };
    return { text: `${diffInDays}d ago`, color: 'text-gray-500', isRecent: false };
  };

  const openUrl = (url: string) => {
    setTimeout(() => {
      window.open(url.trim(), '_blank', 'noopener,noreferrer');
    }, 10);
  };

  if (allUrls.length === 0) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <span className="font-bold text-red-800">NO WORKING URLs FOUND</span>
        </div>
        <p className="text-red-700 text-sm">
          This project has no URLs recorded. Add your working URLs to the edit form below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Best URL Highlight */}
      {bestUrl && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-4 border-green-400 rounded-lg p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="font-bold text-green-800 text-lg">🏆 RECOMMENDED URL</span>
              {bestUrl.type === 'live' && (
                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  LIVE
                </span>
              )}
            </div>
            <button
              onClick={() => openUrl(bestUrl.url)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
              <span>OPEN BEST URL</span>
            </button>
          </div>
          
          <div className="bg-white rounded border-2 border-green-300 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-green-800">{bestUrl.platform}</div>
                <div className="font-mono text-sm text-green-700 truncate max-w-md">{bestUrl.url}</div>
              </div>
              <div className="text-right">
                {bestUrl.timestamp && (() => {
                  const timeDiff = getTimeDiff(bestUrl.timestamp);
                  return (
                    <div className={`text-sm font-semibold ${timeDiff?.color}`}>
                      {timeDiff?.text}
                      {timeDiff?.isRecent && <Zap className="w-4 h-4 inline ml-1" />}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All URLs Summary */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-blue-800">ALL YOUR URLs ({allUrls.length} found)</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {allUrls.map((urlInfo, index) => {
            const timeDiff = getTimeDiff(urlInfo.timestamp);
            const isBest = index === 0;
            
            return (
              <div 
                key={`${urlInfo.platform}-${urlInfo.type}-${index}`}
                className={`p-2 rounded border-2 transition-all duration-200 ${
                  isBest 
                    ? 'bg-green-100 border-green-400' 
                    : 'bg-white border-blue-200 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold text-sm ${isBest ? 'text-green-800' : 'text-blue-700'}`}>
                      {urlInfo.platform}
                    </span>
                    <span className={`px-1 py-0.5 rounded text-xs font-bold ${
                      urlInfo.type === 'live' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-400 text-white'
                    }`}>
                      {urlInfo.type.toUpperCase()}
                    </span>
                    {isBest && <span className="text-green-600 text-xs">🏆 BEST</span>}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {timeDiff && (
                      <span className={`text-xs ${timeDiff.color}`}>
                        {timeDiff.text}
                      </span>
                    )}
                    <button
                      onClick={() => openUrl(urlInfo.url)}
                      className="p-1 hover:bg-blue-200 rounded transition-colors"
                      title="Open URL"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs font-mono text-gray-600 truncate mt-1">
                  {urlInfo.url}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Tips */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <span className="font-bold text-yellow-800 text-sm">QUICK TIPS</span>
        </div>
        <ul className="text-yellow-700 text-xs space-y-1">
          <li>• <strong>Green URLs</strong> = Most recent with timestamps (use these!)</li>
          <li>• <strong>LIVE URLs</strong> = Your actual deployed apps that users see</li>
          <li>• <strong>DEV URLs</strong> = Your development/console URLs for editing</li>
          <li>• <strong>🏆 BEST</strong> = The most recent live URL (recommended for sharing)</li>
        </ul>
      </div>
    </div>
  );
}
