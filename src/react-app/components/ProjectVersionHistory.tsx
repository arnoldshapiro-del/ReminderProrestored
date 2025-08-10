import { useState, useEffect } from 'react';
import { 
  Clock, 
  GitBranch, 
  Globe, 
  Zap, 
  AlertTriangle, 
  Brain, 
  Plus,
  ExternalLink,
  Calendar,
  Hash,
  MapPin,
  Activity,
  Trash2,
  Filter,
  Download
} from 'lucide-react';

interface VersionLog {
  id: number;
  project_id: number;
  platform_name: string;
  action_type: string;
  version_number?: string;
  platform_url?: string;
  commit_hash?: string;
  deployment_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectVersionHistoryProps {
  projectId: number;
  projectName: string;
}

export default function ProjectVersionHistory({ projectId, projectName }: ProjectVersionHistoryProps) {
  const [versionLogs, setVersionLogs] = useState<VersionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [newLog, setNewLog] = useState({
    platform_name: '',
    action_type: '',
    version_number: '',
    platform_url: '',
    commit_hash: '',
    deployment_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchVersionLogs();
  }, [projectId]);

  const fetchVersionLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/version-logs`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setVersionLogs(data);
      }
    } catch (error) {
      console.error('Error fetching version logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!newLog.platform_name || !newLog.action_type) {
      alert('Please fill in platform name and action type');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/version-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newLog)
      });

      if (response.ok) {
        await fetchVersionLogs();
        setShowAddLogModal(false);
        setNewLog({
          platform_name: '',
          action_type: '',
          version_number: '',
          platform_url: '',
          commit_hash: '',
          deployment_id: '',
          notes: ''
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to add version log: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding version log:', error);
      alert('Error adding version log. Please try again.');
    }
  };

  const handleDeleteLog = async (logId: number) => {
    if (!confirm('Are you sure you want to delete this version log?')) return;

    try {
      const response = await fetch(`/api/version-logs/${logId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchVersionLogs();
      } else {
        alert('Failed to delete version log');
      }
    } catch (error) {
      console.error('Error deleting version log:', error);
      alert('Error deleting version log');
    }
  };

  const getFilteredAndSortedLogs = () => {
    let filtered = versionLogs;
    
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(log => log.platform_name.toLowerCase() === filterPlatform);
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'platform') {
      filtered.sort((a, b) => a.platform_name.localeCompare(b.platform_name));
    }

    return filtered;
  };

  const exportVersionHistory = () => {
    const csvContent = [
      'Platform,Action,Version,URL,Date,Notes',
      ...versionLogs.map(log => 
        `"${log.platform_name}","${log.action_type}","${log.version_number || ''}","${log.platform_url || ''}","${formatDateTime(log.created_at)}","${log.notes || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}_version_history.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uniquePlatforms = [...new Set(versionLogs.map(log => log.platform_name.toLowerCase()))];
  const filteredLogs = getFilteredAndSortedLogs();

  const getPlatformIcon = (platformName: string) => {
    const platform = platformName.toLowerCase();
    if (platform.includes('mocha')) return Brain;
    if (platform.includes('github') || platform.includes('git')) return GitBranch;
    if (platform.includes('netlify')) return Globe;
    if (platform.includes('vercel')) return Zap;
    if (platform.includes('twilio')) return AlertTriangle;
    return Plus;
  };

  const getPlatformColor = (platformName: string) => {
    const platform = platformName.toLowerCase();
    if (platform.includes('mocha')) return 'bg-blue-500';
    if (platform.includes('github') || platform.includes('git')) return 'bg-gray-500';
    if (platform.includes('netlify')) return 'bg-green-500';
    if (platform.includes('vercel')) return 'bg-purple-500';
    if (platform.includes('twilio')) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Version History - {projectName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Track all deployments, pushes, and configurations across platforms
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportVersionHistory}
            className="btn-secondary flex items-center space-x-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowAddLogModal(true)}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Filters and Stats */}
      {versionLogs.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{versionLogs.length}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{uniquePlatforms.length}</div>
                <div className="text-sm text-gray-600">Platforms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {versionLogs.filter(log => log.action_type === 'deploy').length}
                </div>
                <div className="text-sm text-gray-600">Deployments</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Platforms</option>
                  {uniquePlatforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="platform">By Platform</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Version Timeline */}
      {versionLogs.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No version history yet</p>
          <p className="text-sm text-gray-500">Version tracking will automatically log when you update deployment info</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, index) => {
            const PlatformIcon = getPlatformIcon(log.platform_name);
            const platformColor = getPlatformColor(log.platform_name);
            
            return (
              <div key={log.id} className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 ${platformColor} rounded-full flex items-center justify-center`}>
                    <PlatformIcon className="w-5 h-5 text-white" />
                  </div>
                  {index < filteredLogs.length - 1 && (
                    <div className="w-0.5 h-6 bg-gray-200 mt-2"></div>
                  )}
                </div>

                {/* Log Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {log.platform_name} {log.action_type}
                      </h4>
                      {log.platform_url && (
                        <a
                          href={log.platform_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatRelativeTime(log.created_at)}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Version Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                    {log.version_number && (
                      <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <div>
                          <span className="text-xs text-gray-500 block">Version</span>
                          <span className="font-mono font-medium">{log.version_number}</span>
                        </div>
                      </div>
                    )}
                    {log.commit_hash && (
                      <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-2">
                        <Hash className="w-4 h-4 mr-2" />
                        <div>
                          <span className="text-xs text-gray-500 block">Commit</span>
                          <span className="font-mono font-medium">{log.commit_hash.substring(0, 8)}...</span>
                        </div>
                      </div>
                    )}
                    {log.deployment_id && (
                      <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-2">
                        <Zap className="w-4 h-4 mr-2" />
                        <div>
                          <span className="text-xs text-gray-500 block">Deploy ID</span>
                          <span className="font-mono font-medium">{log.deployment_id}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Platform URL if available */}
                  {log.platform_url && (
                    <div className="mb-3">
                      <a
                        href={log.platform_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Deployment
                      </a>
                    </div>
                  )}

                  {/* Notes */}
                  {log.notes && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-200">
                      {log.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end mt-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Delete this entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Log Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Version Entry</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
                  <select
                    value={newLog.platform_name}
                    onChange={(e) => setNewLog(prev => ({...prev, platform_name: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select Platform</option>
                    <option value="mocha">Mocha</option>
                    <option value="github">GitHub</option>
                    <option value="netlify">Netlify</option>
                    <option value="vercel">Vercel</option>
                    <option value="twilio">Twilio</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action *</label>
                  <select
                    value={newLog.action_type}
                    onChange={(e) => setNewLog(prev => ({...prev, action_type: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select Action</option>
                    <option value="publish">Publish</option>
                    <option value="deploy">Deploy</option>
                    <option value="push">Push</option>
                    <option value="configure">Configure</option>
                    <option value="update">Update</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Version/ID</label>
                <input
                  type="text"
                  value={newLog.version_number}
                  onChange={(e) => setNewLog(prev => ({...prev, version_number: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="v1.0.0 or deployment ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={newLog.platform_url}
                  onChange={(e) => setNewLog(prev => ({...prev, platform_url: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commit Hash</label>
                <input
                  type="text"
                  value={newLog.commit_hash}
                  onChange={(e) => setNewLog(prev => ({...prev, commit_hash: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="a1b2c3d4..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newLog.notes}
                  onChange={(e) => setNewLog(prev => ({...prev, notes: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Additional notes about this deployment..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={handleAddLog}
                  className="flex-1 btn-primary"
                >
                  Add Entry
                </button>
                <button 
                  onClick={() => setShowAddLogModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
