import { useState, useEffect } from "react";
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Clock,
  Shield,
  Zap,
  Activity,
  TrendingUp
} from "lucide-react";
import type { ProjectType, DeploymentTrackingType } from "@/shared/types";

interface AutoDeploymentDetectorProps {
  projects: ProjectType[];
  onProjectUpdate?: (projectId: number, data: Partial<ProjectType>) => void;
}

export default function AutoDeploymentDetector({ projects, onProjectUpdate }: AutoDeploymentDetectorProps) {
  const [deploymentStatus, setDeploymentStatus] = useState<{[key: number]: DeploymentTrackingType}>({});
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Auto-check deployments every 5 minutes
  useEffect(() => {
    checkAllDeployments();
    const interval = setInterval(checkAllDeployments, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [projects]);

  const checkDeploymentStatus = async (url: string): Promise<{
    status: 'online' | 'offline' | 'error';
    responseTime: number;
    sslStatus: 'valid' | 'invalid' | 'unknown';
    statusCode?: number;
  }> => {
    try {
      const startTime = Date.now();
      
      // Use a proxy endpoint to check the deployment
      const response = await fetch('/api/check-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'online',
          responseTime,
          sslStatus: url.startsWith('https://') ? 'valid' : 'unknown',
          statusCode: data.statusCode
        };
      } else {
        return {
          status: 'offline',
          responseTime,
          sslStatus: 'unknown'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        responseTime: 0,
        sslStatus: 'unknown'
      };
    }
  };

  const checkAllDeployments = async () => {
    setChecking(true);
    const newStatus: {[key: number]: DeploymentTrackingType} = {};

    for (const project of projects) {
      const urls = [
        { url: project.netlify_url, platform: 'netlify' },
        { url: project.vercel_url, platform: 'vercel' },
        { url: project.platform_url, platform: project.ai_platform }
      ].filter(item => item.url);

      for (const { url, platform } of urls) {
        if (url && project.id) {
          const status = await checkDeploymentStatus(url);
          
          newStatus[project.id] = {
            project_id: project.id,
            deployment_url: url,
            deployment_platform: platform,
            status: status.status,
            last_checked_at: new Date().toISOString(),
            uptime_percentage: status.status === 'online' ? 100 : 0,
            response_time_ms: status.responseTime,
            ssl_status: status.sslStatus,
            auto_detected: true
          };

          // Update project status if it changed
          if (onProjectUpdate && status.status === 'online' && project.status !== 'deployed') {
            onProjectUpdate(project.id, { status: 'deployed' });
            
            // Auto-log deployment detection
            try {
              await fetch(`/api/projects/${project.id}/version-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  platform_name: platform,
                  action_type: 'deploy',
                  platform_url: url,
                  notes: `Auto-detected deployment - Site is now live (${status.responseTime}ms response)`
                })
              });
            } catch (error) {
              console.error('Failed to auto-log deployment:', error);
            }
          }
        }
      }
    }

    setDeploymentStatus(newStatus);
    setLastCheck(new Date());
    setChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUptimeStats = () => {
    const statuses = Object.values(deploymentStatus);
    const onlineCount = statuses.filter(s => s.status === 'online').length;
    const totalCount = statuses.length;
    const avgResponseTime = statuses.reduce((sum, s) => sum + (s.response_time_ms || 0), 0) / totalCount;
    
    return {
      uptime: totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0,
      avgResponseTime: Math.round(avgResponseTime),
      onlineCount,
      totalCount
    };
  };

  const uptimeStats = getUptimeStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Auto-Deployment Detection</h2>
          <p className="text-gray-600">Real-time monitoring of your deployed projects</p>
        </div>
        <button
          onClick={checkAllDeployments}
          disabled={checking}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          <span>Check Now</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Overall Uptime</p>
              <p className="text-3xl font-bold">{uptimeStats.uptime}%</p>
              <p className="text-green-100 text-xs">{uptimeStats.onlineCount}/{uptimeStats.totalCount} sites online</p>
            </div>
            <Activity className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Avg Response</p>
              <p className="text-3xl font-bold">{uptimeStats.avgResponseTime}ms</p>
              <p className="text-blue-100 text-xs">Average load time</p>
            </div>
            <Zap className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">SSL Secured</p>
              <p className="text-3xl font-bold">
                {Object.values(deploymentStatus).filter(s => s.ssl_status === 'valid').length}
              </p>
              <p className="text-purple-100 text-xs">HTTPS enabled</p>
            </div>
            <Shield className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Last Check</p>
              <p className="text-lg font-bold">
                {lastCheck ? lastCheck.toLocaleTimeString() : 'Never'}
              </p>
              <p className="text-indigo-100 text-xs">
                {checking ? 'Checking now...' : 'Auto-check every 5min'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Deployment Status List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Status</h3>
        
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No projects to monitor</p>
            <p className="text-sm text-gray-500">Add projects with deployment URLs to start monitoring</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const status = deploymentStatus[project.id!];
              const hasDeploymentUrl = project.netlify_url || project.vercel_url || project.platform_url;
              
              return (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{project.project_name}</h4>
                      <p className="text-sm text-gray-600">
                        {hasDeploymentUrl ? 'Monitoring active' : 'No deployment URL'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {status ? (
                      <>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Status</p>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(status.status)}
                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(status.status)}`}>
                              {status.status}
                            </span>
                          </div>
                        </div>

                        {status.response_time_ms !== undefined && (
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Response</p>
                            <p className="font-semibold text-blue-600">{status.response_time_ms}ms</p>
                          </div>
                        )}

                        <div className="text-center">
                          <p className="text-sm text-gray-500">SSL</p>
                          <div className="flex items-center space-x-1">
                            {status.ssl_status === 'valid' ? (
                              <Shield className="w-4 h-4 text-green-500" />
                            ) : (
                              <Shield className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm">
                              {status.ssl_status === 'valid' ? 'Secure' : 'Unknown'}
                            </span>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-500">Platform</p>
                          <p className="font-medium text-gray-900 capitalize">{status.deployment_platform}</p>
                        </div>

                        {status.deployment_url && (
                          <a
                            href={status.deployment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary flex items-center space-x-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Visit</span>
                          </a>
                        )}
                      </>
                    ) : hasDeploymentUrl ? (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500">Checking...</p>
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mt-1"></div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">No URL configured</p>
                        <p className="text-xs text-gray-400">Add deployment URL to monitor</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-green-900">Fastest Site</h4>
            <p className="text-green-700">
              {uptimeStats.totalCount > 0 ? (
                (() => {
                  const fastest = Object.values(deploymentStatus).reduce((prev, current) => 
                    (prev.response_time_ms || Infinity) < (current.response_time_ms || Infinity) ? prev : current
                  );
                  return `${fastest.response_time_ms}ms`;
                })()
              ) : 'No data'}
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-blue-900">SSL Coverage</h4>
            <p className="text-blue-700">
              {uptimeStats.totalCount > 0 ? 
                Math.round((Object.values(deploymentStatus).filter(s => s.ssl_status === 'valid').length / uptimeStats.totalCount) * 100)
                : 0
              }%
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-purple-900">Monitoring Score</h4>
            <p className="text-purple-700">
              {uptimeStats.uptime >= 95 ? 'Excellent' : 
               uptimeStats.uptime >= 85 ? 'Good' : 
               uptimeStats.uptime >= 70 ? 'Fair' : 'Poor'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
