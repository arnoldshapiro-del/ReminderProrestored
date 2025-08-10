import React, { useState, useEffect } from 'react';
import { useAuth } from "@getmocha/users-service/react";
import {
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CreditCard
} from 'lucide-react';

interface PlatformCredit {
  id: string;
  platformName: string;
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  monthlyCost: number;
  renewalDate: string;
  status: 'active' | 'warning' | 'critical' | 'expired';
  planType: 'free' | 'basic' | 'pro' | 'enterprise' | 'custom';
  lastUpdated: string;
}

const PLATFORM_PRESETS = [
  { name: 'Mocha', defaultCredits: 10000, defaultCost: 50, color: 'blue' },
  { name: 'Lovable', defaultCredits: 5000, defaultCost: 30, color: 'pink' },
  { name: 'Bolt', defaultCredits: 8000, defaultCost: 40, color: 'yellow' },
  { name: 'Cursor', defaultCredits: 15000, defaultCost: 60, color: 'slate' },
  { name: 'Claude', defaultCredits: 12000, defaultCost: 55, color: 'orange' },
  { name: 'ChatGPT Plus', defaultCredits: 20000, defaultCost: 20, color: 'green' },
  { name: 'GitHub Copilot', defaultCredits: 999999, defaultCost: 10, color: 'gray' },
  { name: 'Replit', defaultCredits: 5000, defaultCost: 25, color: 'cyan' },
];

interface CreditTrackerProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const CreditTracker: React.FC<CreditTrackerProps> = ({ isMinimized = false, onToggleMinimize }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<PlatformCredit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCredit, setEditingCredit] = useState<PlatformCredit | null>(null);
  
  const [newCredit, setNewCredit] = useState({
    platformName: '',
    creditsTotal: 10000,
    creditsUsed: 0,
    monthlyCost: 50,
    renewalDate: '',
    planType: 'pro' as const
  });

  useEffect(() => {
    loadCredits();
  }, [user]);

  const loadCredits = () => {
    const savedCredits = localStorage.getItem(`credits-${user?.id}`);
    if (savedCredits) {
      const parsed = JSON.parse(savedCredits);
      // Update status for all credits
      const updated = parsed.map((credit: PlatformCredit) => ({
        ...credit,
        creditsRemaining: credit.creditsTotal - credit.creditsUsed,
        status: getStatusForCredit(credit.creditsTotal, credit.creditsUsed, credit.renewalDate)
      }));
      setCredits(updated);
    }
  };

  const saveCredits = (newCredits: PlatformCredit[]) => {
    localStorage.setItem(`credits-${user?.id}`, JSON.stringify(newCredits));
    setCredits(newCredits);
  };

  const getStatusForCredit = (total: number, used: number, renewalDate: string): 'active' | 'warning' | 'critical' | 'expired' => {
    const percentageUsed = (used / total) * 100;
    const renewal = new Date(renewalDate);
    const now = new Date();
    
    if (renewal < now) return 'expired';
    if (percentageUsed >= 90) return 'critical';
    if (percentageUsed >= 75) return 'warning';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      case 'expired': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDaysUntilRenewal = (renewalDate: string) => {
    const renewal = new Date(renewalDate);
    const now = new Date();
    const diffTime = renewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatRenewalText = (renewalDate: string) => {
    const days = getDaysUntilRenewal(renewalDate);
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `${days} days`;
    return new Date(renewalDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: new Date(renewalDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const handleAddCredit = () => {
    const credit: PlatformCredit = {
      id: Date.now().toString(),
      platformName: newCredit.platformName,
      creditsTotal: newCredit.creditsTotal,
      creditsUsed: newCredit.creditsUsed,
      creditsRemaining: newCredit.creditsTotal - newCredit.creditsUsed,
      monthlyCost: newCredit.monthlyCost,
      renewalDate: newCredit.renewalDate,
      planType: newCredit.planType,
      status: getStatusForCredit(newCredit.creditsTotal, newCredit.creditsUsed, newCredit.renewalDate),
      lastUpdated: new Date().toISOString()
    };

    const newCredits = [...credits, credit];
    saveCredits(newCredits);
    setShowAddModal(false);
    setNewCredit({
      platformName: '',
      creditsTotal: 10000,
      creditsUsed: 0,
      monthlyCost: 50,
      renewalDate: '',
      planType: 'pro'
    });
  };

  const handleUpdateCredit = () => {
    if (!editingCredit) return;
    
    const updatedCredits = credits.map(credit => 
      credit.id === editingCredit.id 
        ? {
            ...editingCredit,
            creditsRemaining: editingCredit.creditsTotal - editingCredit.creditsUsed,
            status: getStatusForCredit(editingCredit.creditsTotal, editingCredit.creditsUsed, editingCredit.renewalDate),
            lastUpdated: new Date().toISOString()
          }
        : credit
    );
    
    saveCredits(updatedCredits);
    setEditingCredit(null);
  };

  const handleDeleteCredit = (id: string) => {
    if (confirm('Are you sure you want to delete this credit tracker?')) {
      const newCredits = credits.filter(credit => credit.id !== id);
      saveCredits(newCredits);
    }
  };

  const totalMonthlySpend = credits.reduce((sum, credit) => sum + credit.monthlyCost, 0);
  const totalCreditsRemaining = credits.reduce((sum, credit) => sum + credit.creditsRemaining, 0);
  const criticalPlatforms = credits.filter(credit => credit.status === 'critical' || credit.status === 'expired').length;

  if (isMinimized) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <div className="text-xs">
              <div className="font-medium text-gray-900">${totalMonthlySpend}/mo</div>
              <div className="text-gray-500">{totalCreditsRemaining.toLocaleString()} left</div>
            </div>
          </div>
          <button
            onClick={onToggleMinimize}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
        
        {criticalPlatforms > 0 && (
          <div className="mt-2 text-xs text-red-600 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {criticalPlatforms} need attention
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Platform Credits</h3>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-blue-50 p-2 rounded-lg text-center">
          <div className="font-bold text-blue-600">${totalMonthlySpend}</div>
          <div className="text-blue-700">Monthly</div>
        </div>
        <div className="bg-green-50 p-2 rounded-lg text-center">
          <div className="font-bold text-green-600">{totalCreditsRemaining.toLocaleString()}</div>
          <div className="text-green-700">Remaining</div>
        </div>
        <div className="bg-purple-50 p-2 rounded-lg text-center">
          <div className="font-bold text-purple-600">{credits.length}</div>
          <div className="text-purple-700">Platforms</div>
        </div>
      </div>

      {/* Credits List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {credits.map((credit) => (
          <div key={credit.id} className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 truncate">{credit.platformName}</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setEditingCredit(credit)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteCredit(credit.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Credits</span>
                <span className="font-medium">
                  {credit.creditsRemaining.toLocaleString()} of {credit.creditsTotal.toLocaleString()}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${
                    credit.status === 'critical' ? 'bg-red-500' :
                    credit.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${((credit.creditsTotal - credit.creditsUsed) / credit.creditsTotal) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">${credit.monthlyCost}/mo</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(credit.status)}`}>
                  {formatRenewalText(credit.renewalDate)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {credits.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-xs">
          <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p>No platforms tracked yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-blue-600 hover:text-blue-700 mt-1"
          >
            Add your first platform
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Platform Credits</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                <select
                  value={newCredit.platformName}
                  onChange={(e) => {
                    const preset = PLATFORM_PRESETS.find(p => p.name === e.target.value);
                    if (preset) {
                      setNewCredit(prev => ({
                        ...prev,
                        platformName: preset.name,
                        creditsTotal: preset.defaultCredits,
                        monthlyCost: preset.defaultCost
                      }));
                    } else {
                      setNewCredit(prev => ({ ...prev, platformName: e.target.value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select platform...</option>
                  {PLATFORM_PRESETS.map(preset => (
                    <option key={preset.name} value={preset.name}>{preset.name}</option>
                  ))}
                  <option value="custom">Custom Platform</option>
                </select>
                
                {newCredit.platformName === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter platform name"
                    value={newCredit.platformName === 'custom' ? '' : newCredit.platformName}
                    onChange={(e) => setNewCredit(prev => ({ ...prev, platformName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm mt-2"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Credits</label>
                  <input
                    type="number"
                    value={newCredit.creditsTotal}
                    onChange={(e) => setNewCredit(prev => ({ ...prev, creditsTotal: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Used</label>
                  <input
                    type="number"
                    value={newCredit.creditsUsed}
                    onChange={(e) => setNewCredit(prev => ({ ...prev, creditsUsed: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Cost</label>
                  <input
                    type="number"
                    value={newCredit.monthlyCost}
                    onChange={(e) => setNewCredit(prev => ({ ...prev, monthlyCost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
                  <select
                    value={newCredit.planType}
                    onChange={(e) => setNewCredit(prev => ({ ...prev, planType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Renewal Date</label>
                <input
                  type="date"
                  value={newCredit.renewalDate}
                  onChange={(e) => setNewCredit(prev => ({ ...prev, renewalDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddCredit}
                disabled={!newCredit.platformName || !newCredit.renewalDate}
                className="flex-1 btn-primary text-sm"
              >
                Add Platform
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit {editingCredit.platformName}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Credits</label>
                  <input
                    type="number"
                    value={editingCredit.creditsTotal}
                    onChange={(e) => setEditingCredit(prev => prev ? ({ ...prev, creditsTotal: parseInt(e.target.value) || 0 }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Used</label>
                  <input
                    type="number"
                    value={editingCredit.creditsUsed}
                    onChange={(e) => setEditingCredit(prev => prev ? ({ ...prev, creditsUsed: parseInt(e.target.value) || 0 }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Cost</label>
                  <input
                    type="number"
                    value={editingCredit.monthlyCost}
                    onChange={(e) => setEditingCredit(prev => prev ? ({ ...prev, monthlyCost: parseFloat(e.target.value) || 0 }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
                  <select
                    value={editingCredit.planType}
                    onChange={(e) => setEditingCredit(prev => prev ? ({ ...prev, planType: e.target.value as any }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Renewal Date</label>
                <input
                  type="date"
                  value={editingCredit.renewalDate}
                  onChange={(e) => setEditingCredit(prev => prev ? ({ ...prev, renewalDate: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  <strong>Remaining:</strong> {(editingCredit.creditsTotal - editingCredit.creditsUsed).toLocaleString()} credits
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Usage:</strong> {Math.round((editingCredit.creditsUsed / editingCredit.creditsTotal) * 100)}%
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateCredit}
                className="flex-1 btn-primary text-sm"
              >
                Update Platform
              </button>
              <button
                onClick={() => setEditingCredit(null)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditTracker;
