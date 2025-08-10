import React from 'react';
import { Database, Cloud, Smartphone, GitBranch, Shield, CheckCircle } from 'lucide-react';

const DataStorageInfo: React.FC = () => {
  return (
    <div className="card space-y-6">
      <div className="flex items-center space-x-3">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Where is Your Data?</h3>
      </div>

      {/* Current Status */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-800">Currently Active</span>
        </div>
        <div className="space-y-2 text-sm text-green-700">
          <div className="flex items-center space-x-2">
            <Cloud className="w-4 h-4" />
            <span><strong>Database:</strong> Cloudflare D1 (Cloud Storage)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span><strong>Security:</strong> Enterprise-grade, Auto-backed up</span>
          </div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span><strong>Access:</strong> Any device, anywhere, always synced</span>
          </div>
        </div>
      </div>

      {/* Deployment Impact */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">GitHub Deploy</h4>
          <p className="text-sm text-blue-700">
            Stores your <strong>code files</strong> only. 
            Data stays in Cloudflare D1.
          </p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">Netlify Deploy</h4>
          <p className="text-sm text-purple-700">
            Makes your app <strong>publicly accessible</strong>. 
            Data still in Cloudflare D1.
          </p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2">Mobile Usage</h4>
          <p className="text-sm text-orange-700">
            Same data from <strong>any device</strong>. 
            Nothing stored locally.
          </p>
        </div>
      </div>

      {/* Version Control Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-2">
          <GitBranch className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Avoid Version Confusion</h4>
            <p className="text-sm text-yellow-700">
              <strong>Expert Tip:</strong> Make all changes in Mocha first, then deploy to GitHub/Netlify. 
              Don't edit in multiple places or you'll have different versions everywhere!
            </p>
          </div>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900">What You DON'T Need:</h5>
          <ul className="space-y-1 text-gray-600">
            <li>• Sign up for Cloudflare</li>
            <li>• Pay extra database fees</li>
            <li>• Worry about losing data</li>
            <li>• Set up local storage</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900">What's Automatic:</h5>
          <ul className="space-y-1 text-gray-600">
            <li>• Cloud database setup</li>
            <li>• Data synchronization</li>
            <li>• Security & backups</li>
            <li>• Mobile optimization</li>
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-200">
        <a 
          href="/DATA_STORAGE_EXPLAINED_SIMPLE.md" 
          target="_blank"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <span>Read Complete Data Storage Guide</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
};

export default DataStorageInfo;
