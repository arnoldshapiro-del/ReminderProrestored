import React from 'react';
import { ExternalLink } from 'lucide-react';

interface UrlFieldWithButtonProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  colorClass?: string;
  label?: string;
}

const UrlFieldWithButton: React.FC<UrlFieldWithButtonProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  colorClass = 'purple',
  label
}) => {
  const hasUrl = value && value.trim() !== '';
  
  const openUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUrl) {
      // Small delay to prevent flash popup
      setTimeout(() => {
        window.open(value.trim(), '_blank', 'noopener,noreferrer');
      }, 10);
    }
  };

  return (
    <div>
      {label && (
        <label className={`block text-sm font-medium text-${colorClass}-700 mb-1`}>
          {label}
        </label>
      )}
      <div className="flex items-center space-x-1">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-${colorClass}-500 focus:border-${colorClass}-500 text-sm ${
            hasUrl 
              ? `bg-${colorClass}-50 border-${colorClass}-300` 
              : 'bg-white border-gray-300'
          } ${className}`}
          placeholder={placeholder}
        />
        {hasUrl && (
          <button
            type="button"
            onClick={openUrl}
            className={`p-2 text-${colorClass}-600 hover:text-${colorClass}-800 hover:bg-${colorClass}-100 rounded-lg transition-colors flex-shrink-0 border border-${colorClass}-300`}
            title="Open URL in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UrlFieldWithButton;
