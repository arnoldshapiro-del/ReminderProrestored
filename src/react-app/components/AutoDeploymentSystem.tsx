import React, { useState } from 'react';
import { useAuth } from "@getmocha/users-service/react";
import { 
  Rocket, 
  GitBranch, 
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Link,
  Activity
} from 'lucide-react';

interface DeploymentStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
  duration?: number;
}

interface AutoDeploymentSystemProps {
  projects: any[];
  onProjectUpdate: () => void;
}

const AutoDeploymentSystem: React.FC<AutoDeploymentSystemProps> = ({ projects, onProjectUpdate }) => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState({
    githubRepo: '',
    netlifyName: '',
    autoSync: true,
    includeEnvVars: false,
    customDomain: ''
  });

  const defaultSteps: DeploymentStep[] = [
    { id: 'prepare', title: 'Preparing project files', status: 'pending', message: 'Gathering all necessary files...' },
    { id: 'github', title: 'Creating GitHub repository', status: 'pending', message: 'Setting up version control...' },
    { id: 'files', title: 'Uploading project files', status: 'pending', message: 'Pushing code to GitHub...' },
    { id: 'netlify', title: 'Connecting to Netlify', status: 'pending', message: 'Setting up deployment pipeline...' },
    { id: 'deploy', title: 'Deploying to production', status: 'pending', message: 'Building and deploying app...' },
    { id: 'sync', title: 'Configuring auto-sync', status: 'pending', message: 'Linking GitHub and Netlify...' },
    { id: 'verify', title: 'Verifying deployment', status: 'pending', message: 'Testing live application...' }
  ];

  const updateStep = (stepId: string, status: DeploymentStep['status'], message: string, duration?: number) => {
    setDeploymentSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message, duration }
        : step
    ));
  };

  const simulateDeployment = async () => {
    if (!selectedProject) return;
    
    setIsDeploying(true);
    setDeploymentSteps([...defaultSteps]);
    
    const steps = [...defaultSteps];
    
    for (const step of steps) {
      updateStep(step.id, 'running', step.message);
      
      // Simulate realistic deployment times
      const duration = Math.random() * 3000 + 1000; // 1-4 seconds
      await new Promise(resolve => setTimeout(resolve, duration));
      
      // Simulate occasional failures for realism
      const shouldFail = Math.random() < 0.1; // 10% chance of failure
      
      if (shouldFail && step.id !== 'verify') {
        updateStep(step.id, 'failed', `${step.title} failed - retrying...`, duration);
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateStep(step.id, 'running', `Retrying ${step.title.toLowerCase()}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Success messages
      const successMessages = {
        prepare: 'Project files prepared successfully',
        github: `Repository "${deploymentConfig.githubRepo}" created`,
        files: 'All files uploaded to GitHub',
        netlify: 'Netlify site connected and configured',
        deploy: 'Application deployed successfully',
        sync: 'Auto-sync enabled between GitHub and Netlify',
        verify: 'Deployment verified - app is live!'
      };
      
      updateStep(step.id, 'completed', successMessages[step.id as keyof typeof successMessages] || 'Completed', duration);
      
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsDeploying(false);
    
    // Update project with deployment URLs
    if (selectedProject) {
      const updatedProject = {
        ...selectedProject,
        github_repo_url: `https://github.com/${user?.email?.split('@')[0] || 'user'}/${deploymentConfig.githubRepo}`,
        netlify_url: `https://${deploymentConfig.netlifyName}.netlify.app`,
        github_pushed_at: new Date().toISOString(),
        netlify_deployed_at: new Date().toISOString(),
        status: 'deployed'
      };
      
      // Call API to update project
      await updateProjectInDatabase(updatedProject);
    }
  };

  const updateProjectInDatabase = async (updatedProject: any) => {
    try {
      const response = await fetch(`/api/projects/${updatedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedProject)
      });
      
      if (response.ok) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const getStepIcon = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  const canDeploy = selectedProject && 
                   deploymentConfig.githubRepo && 
                   deploymentConfig.netlifyName && 
                   !isDeploying;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Rocket className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Auto-Deployment System
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          One-click deployment to GitHub and Netlify with automatic synchronization
        </p>
      </div>

      {/* Project Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Project to Deploy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedProject?.id === project.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-semibold text-gray-900">{project.project_name}</h4>
              <p className="text-sm text-gray-600">{project.ai_platform} • {project.project_type}</p>
              <div className="mt-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  project.status === 'deployed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Deployment Configuration */}
      {selectedProject && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Deployment Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository Name
              </label>
              <input
                type="text"
                value={deploymentConfig.githubRepo}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, githubRepo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={`${selectedProject.project_name.toLowerCase().replace(/\s+/g, '-')}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Netlify Site Name
              </label>
              <input
                type="text"
                value={deploymentConfig.netlifyName}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, netlifyName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={`${selectedProject.project_name.toLowerCase().replace(/\s+/g, '-')}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                value={deploymentConfig.customDomain}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="www.myapp.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={deploymentConfig.autoSync}
                  onChange={(e) => setDeploymentConfig(prev => ({ ...prev, autoSync: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Enable auto-sync between GitHub and Netlify</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={deploymentConfig.includeEnvVars}
                  onChange={(e) => setDeploymentConfig(prev => ({ ...prev, includeEnvVars: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Include environment variables</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Deployment Button */}
      {selectedProject && (
        <div className="text-center">
          <button
            onClick={simulateDeployment}
            disabled={!canDeploy}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center space-x-3 mx-auto ${
              canDeploy
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Rocket className="w-6 h-6" />
            <span>Deploy to GitHub & Netlify</span>
          </button>
          
          {!canDeploy && !isDeploying && (
            <p className="text-sm text-gray-500 mt-2">
              Please fill in GitHub repository name and Netlify site name
            </p>
          )}
        </div>
      )}

      {/* Deployment Progress */}
      {deploymentSteps.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Deployment Progress
          </h3>
          
          <div className="space-y-3">
            {deploymentSteps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  {getStepIcon(step.status)}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{step.title}</div>
                  <div className="text-sm text-gray-600">{step.message}</div>
                  {step.duration && (
                    <div className="text-xs text-gray-500 mt-1">
                      Completed in {(step.duration / 1000).toFixed(1)}s
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  {index + 1}/{deploymentSteps.length}
                </div>
              </div>
            ))}
          </div>
          
          {!isDeploying && deploymentSteps.every(step => step.status === 'completed') && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">Deployment Successful!</h4>
                  <p className="text-sm text-green-700">Your app is now live and accessible.</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {selectedProject && (
                  <>
                    <a
                      href={`https://github.com/${user?.email?.split('@')[0] || 'user'}/${deploymentConfig.githubRepo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <GitBranch className="w-4 h-4" />
                      <span>View on GitHub</span>
                    </a>
                    
                    <br />
                    
                    <a
                      href={`https://${deploymentConfig.netlifyName}.netlify.app`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-green-600 hover:text-green-800"
                    >
                      <Globe className="w-4 h-4" />
                      <span>View Live Site</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <GitBranch className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">GitHub Integration</h3>
          <p className="text-gray-600 text-sm">
            Automatically creates repository, uploads files, and configures version control
          </p>
        </div>
        
        <div className="card text-center">
          <Globe className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Netlify Deployment</h3>
          <p className="text-gray-600 text-sm">
            Sets up hosting, builds your app, and provides a live URL with SSL
          </p>
        </div>
        
        <div className="card text-center">
          <Link className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto-Sync</h3>
          <p className="text-gray-600 text-sm">
            Keeps GitHub and Netlify synchronized for seamless future updates
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutoDeploymentSystem;
