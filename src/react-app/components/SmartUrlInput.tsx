import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  XCircle, 
  Clock,
  Star,
  Zap,
  Shield
} from 'lucide-react';

interface SmartUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  colorName: string;
  timestamp?: string;
  platformName?: string;
}

export default function SmartUrlInput({ 
  value, 
  onChange, 
  placeholder, 
  label, 
  colorName, 
  timestamp,
  platformName 
}: SmartUrlInputProps) {
  const [isRecent, setIsRecent] = useState(false);
  
  const hasUrl = value && value.trim() !== '';
  const hasTimestamp = timestamp && timestamp.trim() !== '';
  
  // Check if URL was updated recently (within 7 days)
  useEffect(() => {
    if (hasTimestamp) {
      const updateDate = new Date(timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
      setIsRecent(daysDiff <= 7);
    }
  }, [timestamp, hasTimestamp]);

  // Determine the visual priority level
  const getPriorityLevel = () => {
    if (!hasUrl) return 'empty';
    if (hasTimestamp && isRecent) return 'high'; // Recent with timestamp = highest priority
    if (hasUrl && hasTimestamp) return 'medium'; // Has URL and timestamp = medium priority  
    if (hasUrl) return 'low'; // Has URL but no timestamp = low priority
    return 'empty';
  };

  const priority = getPriorityLevel();

  // Get styling based on priority level
  const getStyles = () => {
    switch (priority) {
      case 'high':
        return {
          container: `border-4 border-${colorName}-500 bg-gradient-to-r from-${colorName}-50 to-${colorName}-100 shadow-xl ring-4 ring-${colorName}-200`,
          input: `bg-white border-2 border-${colorName}-400 text-${colorName}-900 font-bold text-lg shadow-lg`,
          label: `text-${colorName}-800 font-bold text-sm flex items-center space-x-2`,
          badge: `bg-${colorName}-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-md`,
          button: `bg-${colorName}-600 hover:bg-${colorName}-700 text-white shadow-lg transform hover:scale-105`,
          priority: 'HIGH PRIORITY - RECENT & WORKING'
        };
      case 'medium':
        return {
          container: `border-2 border-${colorName}-400 bg-${colorName}-25 shadow-md`,
          input: `bg-white border border-${colorName}-300 text-${colorName}-800 font-semibold shadow-sm`,
          label: `text-${colorName}-700 font-semibold text-sm`,
          badge: `bg-${colorName}-500 text-white px-2 py-1 rounded text-xs font-medium`,
          button: `bg-${colorName}-500 hover:bg-${colorName}-600 text-white shadow-md`,
          priority: 'MEDIUM PRIORITY - HAS TIMESTAMP'
        };
      case 'low':
        return {
          container: `border border-${colorName}-300 bg-${colorName}-10`,
          input: `bg-white border border-${colorName}-200 text-${colorName}-700`,
          label: `text-${colorName}-600 font-medium text-sm`,
          badge: `bg-${colorName}-400 text-white px-2 py-1 rounded text-xs`,
          button: `bg-${colorName}-400 hover:bg-${colorName}-500 text-white`,
          priority: 'LOW PRIORITY - NO TIMESTAMP'
        };
      default:
        return {
          container: 'border border-gray-200 bg-gray-50',
          input: 'bg-gray-100 border border-gray-300 text-gray-500',
          label: 'text-gray-500 text-sm',
          badge: 'bg-gray-400 text-white px-2 py-1 rounded text-xs',
          button: 'bg-gray-400 hover:bg-gray-500 text-white',
          priority: 'EMPTY - ADD URL'
        };
    }
  };

  const styles = getStyles();

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUrl) {
      setTimeout(() => {
        window.open(value.trim(), '_blank', 'noopener,noreferrer');
      }, 10);
    }
  };

  const formatTimestamp = () => {
    if (!hasTimestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Updated: Just now';
    if (diffInHours < 24) return `Updated: ${Math.floor(diffInHours)}h ago`;
    if (diffInDays < 7) return `Updated: ${diffInDays}d ago`;
    return `Updated: ${date.toLocaleDateString()}`;
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'high': return <Star className="w-4 h-4" />;
      case 'medium': return <Zap className="w-4 h-4" />;
      case 'low': return <Clock className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg transition-all duration-300 ${styles.container}`}>
      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className={styles.badge}>
          {getPriorityIcon()}
          <span>{styles.priority}</span>
        </div>
        {hasTimestamp && (
          <div className="text-xs text-gray-600 font-medium">
            {formatTimestamp()}
          </div>
        )}
      </div>

      {/* Label */}
      <label className={`block mb-2 ${styles.label}`}>
        {platformName && <Shield className="w-4 h-4" />}
        <span>{label}</span>
        {priority === 'high' && <span className="text-green-600 font-bold">(✓ BEST URL)</span>}
      </label>

      {/* Input and Button */}
      <div className="flex items-center space-x-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 px-3 py-2 rounded-lg focus:ring-2 focus:ring-${colorName}-500 transition-all duration-200 ${styles.input}`}
          placeholder={placeholder}
        />
        {hasUrl && (
          <button
            type="button"
            onClick={handleOpenUrl}
            className={`p-2 rounded-lg transition-all duration-200 border-2 border-transparent flex-shrink-0 ${styles.button}`}
            title="🔗 Click to test this URL"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* URL Preview for High Priority */}
      {priority === 'high' && hasUrl && (
        <div className="mt-2 p-2 bg-white rounded border border-green-300">
          <div className="text-xs font-semibold text-green-800">ACTIVE URL:</div>
          <div className="text-sm font-mono text-green-700 truncate">{value}</div>
        </div>
      )}

      {/* Quick Tips */}
      {priority === 'empty' && (
        <div className="mt-2 text-xs text-gray-500">
          💡 Add a URL here to track this platform
        </div>
      )}
      {priority === 'low' && (
        <div className="mt-2 text-xs text-orange-600">
          ⚠️ Consider adding a timestamp to track when this was last updated
        </div>
      )}
    </div>
  );
}
