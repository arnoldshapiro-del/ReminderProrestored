import { useState } from 'react';
import { 
  Plus,
  ExternalLink,
  GitBranch,
  Globe,
  Zap,
  Rocket,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import type { ProjectType } from "@/shared/types";

interface QuickActionsProps {
  project: ProjectType;
  onProjectUpdate?: (projectId: number, data: Partial<ProjectType>) => void;
}

export default function QuickActions({ project, onProjectUpdate }: QuickActionsProps) {
  const [showQuickLog, setShowQuickLog] = useState(false);

  const quickActionOptions = [
    { id: 'mocha_publish', label: 'Published to Mocha', platform: 'mocha', field: 'mocha_published_at' },
    { id: 'github_push', label: 'Pushed to GitHub', platform: 'github', field: 'github_pushed_at' },
    { id: 'netlify_deploy', label: 'Deployed to Netlify', platform: 'netlify', field: 'netlify_deployed_at' },
    { id: 'vercel_deploy', label: 'Deployed to Vercel', platform: 'vercel', field: 'vercel_deployed_at' },
    { id: 'twilio_config', label: 'Configured Twilio', platform: 'twilio', field: 'twilio_configured_at' },
  ];

  const handleQuickAction = async (action: any) => {
    // Close dropdown immediately to prevent flash
    setShowQuickLog(false);
    
    const now = new Date().toISOString();
    const updateData = { [action.field]: now };
    
    if (onProjectUpdate) {
      onProjectUpdate(project.id, updateData);
    }

    // Auto-log the action
    try {
      await fetch(`/api/projects/${project.id}/version-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          platform_name: action.platform,
          action_type: action.id.includes('deploy') ? 'deploy' : action.id.includes('push') ? 'push' : action.id.includes('publish') ? 'publish' : 'configure',
          notes: `Quick action: ${action.label} at ${new Date().toLocaleString()}`
        })
      });
    } catch (error) {
      console.error('Failed to log quick action:', error);
    }
  };

  const getStatusIndicator = (field: string) => {
    const value = (project as any)[field];
    if (value) {
      const date = new Date(value);
      const now = new Date();
      const hoursAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (hoursAgo < 1) return <CheckCircle className="w-4 h-4 text-green-500" />;
      if (hoursAgo < 24) return <Clock className="w-4 h-4 text-yellow-500" />;
      return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
    return <ExternalLink className="w-4 h-4 text-gray-300" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowQuickLog(true)}
        className="btn-secondary flex items-center space-x-2 text-sm"
        title="Quick deployment actions"
      >
        <Rocket className="w-4 h-4" />
        <span>Quick Actions</span>
      </button>

      {showQuickLog && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Quick Deployment Actions</h3>
              <button
                onClick={() => setShowQuickLog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              {quickActionOptions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      action.platform === 'mocha' ? 'bg-blue-500' :
                      action.platform === 'github' ? 'bg-gray-500' :
                      action.platform === 'netlify' ? 'bg-green-500' :
                      action.platform === 'vercel' ? 'bg-purple-500' :
                      'bg-red-500'
                    }`}>
                      {action.platform === 'mocha' && <Plus className="w-3 h-3 text-white" />}
                      {action.platform === 'github' && <GitBranch className="w-3 h-3 text-white" />}
                      {action.platform === 'netlify' && <Globe className="w-3 h-3 text-white" />}
                      {action.platform === 'vercel' && <Zap className="w-3 h-3 text-white" />}
                      {action.platform === 'twilio' && <AlertTriangle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  
                  {getStatusIndicator(action.field)}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Actions auto-update timestamps & logs</span>
                <span className="font-medium text-purple-600">✨ Smart tracking</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
