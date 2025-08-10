import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  GitBranch,
  Globe,
  Zap,
  Brain,
  Phone
} from 'lucide-react';
import type { ProjectType } from "@/shared/types";

interface VersionStatusBadgeProps {
  project: ProjectType;
  platform: 'mocha' | 'github' | 'netlify' | 'vercel' | 'twilio';
}

export default function VersionStatusBadge({ project, platform }: VersionStatusBadgeProps) {
  const getTimestamp = () => {
    switch (platform) {
      case 'mocha': return (project as any).mocha_published_at;
      case 'github': return (project as any).github_pushed_at;
      case 'netlify': return (project as any).netlify_deployed_at;
      case 'vercel': return (project as any).vercel_deployed_at;
      case 'twilio': return (project as any).twilio_configured_at;
      default: return null;
    }
  };

  const getIcon = () => {
    switch (platform) {
      case 'mocha': return Brain;
      case 'github': return GitBranch;
      case 'netlify': return Globe;
      case 'vercel': return Zap;
      case 'twilio': return Phone;
    }
  };

  const getUrl = () => {
    switch (platform) {
      case 'mocha': return (project as any).mocha_published_url;
      case 'github': return project.github_repo_url;
      case 'netlify': return project.netlify_url;
      case 'vercel': return project.vercel_url;
      case 'twilio': return null;
      default: return null;
    }
  };

  const timestamp = getTimestamp();
  const Icon = getIcon();
  const url = getUrl();
  
  if (!timestamp) {
    return (
      <div className="flex items-center space-x-1 text-gray-400">
        <XCircle className="w-3 h-3" />
        <span className="text-xs">Not {platform === 'twilio' ? 'configured' : platform === 'github' ? 'pushed' : platform === 'mocha' ? 'published' : 'deployed'}</span>
      </div>
    );
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  const diffInDays = Math.floor(diffInHours / 24);

  const getStatusColor = () => {
    if (diffInHours < 1) return 'text-green-600 bg-green-50 border-green-200';
    if (diffInHours < 24) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (diffInDays < 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusIcon = () => {
    if (diffInHours < 1) return CheckCircle;
    if (diffInHours < 24) return Clock;
    return AlertTriangle;
  };

  const formatTime = () => {
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${diffInDays}d ago`;
  };

  const StatusIcon = getStatusIcon();

  const badge = (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor()}`}>
      <Icon className="w-3 h-3" />
      <StatusIcon className="w-3 h-3" />
      <span>{formatTime()}</span>
    </div>
  );

  if (url && url.trim() !== '') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Small delay to prevent flash popup
          setTimeout(() => {
            window.open(url.trim(), '_blank', 'noopener,noreferrer');
          }, 10);
        }}
        className="hover:opacity-80 transition-opacity cursor-pointer"
        title={`Open ${platform} - Last updated ${date.toLocaleString()}`}
      >
        {badge}
      </button>
    );
  }

  return (
    <div title={`Last updated ${date.toLocaleString()}`}>
      {badge}
    </div>
  );
}
