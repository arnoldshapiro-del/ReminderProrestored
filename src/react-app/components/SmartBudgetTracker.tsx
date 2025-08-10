import type { ProjectType } from '@/shared/types';
import { 
  DollarSign, 
  TrendingDown, 
  AlertCircle, 
  TrendingUp,
  Target,
  Award
} from 'lucide-react';

interface SmartBudgetTrackerProps {
  projects: ProjectType[];
  onProjectUpdate?: (projectId: number, data: Partial<ProjectType>) => void;
}

export default function SmartBudgetTracker({ projects }: SmartBudgetTrackerProps) {

  // Calculate budget statistics
  const totalBudget = projects.reduce((acc, p) => acc + (p.initial_budget_credits || 100), 0);
  const totalUsed = projects.reduce((acc, p) => acc + (p.credits_used || 0), 0);
  const totalRemaining = totalBudget - totalUsed;
  const budgetEfficiency = totalBudget > 0 ? ((totalUsed / totalBudget) * 100) : 0;

  // Find projects needing attention
  const projectsOverBudget = projects.filter(p => (p.credits_used || 0) > (p.initial_budget_credits || 100));
  const projectsNearLimit = projects.filter(p => {
    const used = p.credits_used || 0;
    const budget = p.initial_budget_credits || 100;
    const percentage = (used / budget) * 100;
    return percentage >= 80 && percentage < 100;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Smart Budget Tracker</h2>
          <p className="text-gray-600">Track and optimize your AI development credits</p>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Budget</p>
              <p className="text-2xl font-bold">{totalBudget}</p>
              <p className="text-blue-200 text-xs">credits allocated</p>
            </div>
            <Target className="w-6 h-6 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Credits Used</p>
              <p className="text-2xl font-bold">{totalUsed}</p>
              <p className="text-red-200 text-xs">{budgetEfficiency.toFixed(1)}% of budget</p>
            </div>
            <TrendingDown className="w-6 h-6 text-red-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Remaining</p>
              <p className="text-2xl font-bold">{totalRemaining}</p>
              <p className="text-green-200 text-xs">credits left</p>
            </div>
            <Award className="w-6 h-6 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Needs Attention</p>
              <p className="text-2xl font-bold">{projectsOverBudget.length + projectsNearLimit.length}</p>
              <p className="text-orange-200 text-xs">projects</p>
            </div>
            <AlertCircle className="w-6 h-6 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      {(projectsOverBudget.length > 0 || projectsNearLimit.length > 0) && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Budget Alerts</h3>
              {projectsOverBudget.length > 0 && (
                <p className="text-yellow-700 text-sm mt-1">
                  <strong>{projectsOverBudget.length} project(s)</strong> are over budget
                </p>
              )}
              {projectsNearLimit.length > 0 && (
                <p className="text-yellow-700 text-sm mt-1">
                  <strong>{projectsNearLimit.length} project(s)</strong> are approaching budget limits (80%+)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Budget Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Budget Breakdown</h3>
        
        <div className="space-y-4">
          {projects.map((project) => {
            const budget = project.initial_budget_credits || 100;
            const used = project.credits_used || 0;
            const percentage = (used / budget) * 100;
            const remaining = budget - used;
            
            let statusColor = 'bg-green-500';
            let statusText = 'On Track';
            
            if (percentage >= 100) {
              statusColor = 'bg-red-500';
              statusText = 'Over Budget';
            } else if (percentage >= 80) {
              statusColor = 'bg-yellow-500';
              statusText = 'Near Limit';
            }

            return (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{project.project_name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{project.ai_platform}</span>
                      <span>•</span>
                      <span>{project.completion_percentage}% complete</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${statusColor}`}>
                      {statusText}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget Progress</span>
                    <span className="font-medium">{used} / {budget} credits ({percentage.toFixed(1)}%)</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        percentage >= 100 ? 'bg-red-500' : 
                        percentage >= 80 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <span className="text-gray-600">Used</span>
                      <p className="font-medium text-red-600">{used}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Budget</span>
                      <p className="font-medium text-blue-600">{budget}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Remaining</span>
                      <p className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {remaining}
                      </p>
                    </div>
                  </div>

                  {/* Efficiency Score */}
                  {project.completion_percentage > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Efficiency Score</span>
                        <span className="font-medium">
                          {((project.completion_percentage / (used || 1)) * 10).toFixed(1)}/100
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No projects to track yet. Create your first project to see budget analytics!</p>
          </div>
        )}
      </div>

      {/* AI Budget Insights */}
      <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-indigo-900">AI Budget Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <h4 className="text-sm font-medium text-indigo-800 mb-2">Cost-Saving Tips:</h4>
                <ul className="text-indigo-700 text-sm space-y-1">
                  <li>• Use saved prompts from AI Prompt Library (-30% iterations)</li>
                  <li>• Compare platform costs with benchmark tool</li>
                  <li>• Start small features first to test efficiency</li>
                  <li>• Track time-to-deploy to optimize workflow</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-indigo-800 mb-2">Budget Alerts:</h4>
                <ul className="text-indigo-700 text-sm space-y-1">
                  <li>• Set 80% budget alerts to avoid overruns</li>
                  <li>• Monitor efficiency scores weekly</li>
                  <li>• Use templates for predictable costs</li>
                  <li>• Track version deployments for ROI analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Budget Efficiency */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Efficiency Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-green-900">Most Efficient</h4>
            <p className="text-green-700 text-sm mt-1">
              {(() => {
                const efficient = projects.filter(p => p.completion_percentage > 0)
                  .sort((a, b) => (b.completion_percentage / (b.credits_used || 1)) - (a.completion_percentage / (a.credits_used || 1)))[0];
                return efficient ? efficient.project_name : 'No data yet';
              })()}
            </p>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-yellow-900">Needs Attention</h4>
            <p className="text-yellow-700 text-sm mt-1">
              {projectsOverBudget.length + projectsNearLimit.length} project{projectsOverBudget.length + projectsNearLimit.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-blue-900">Average Cost per %</h4>
            <p className="text-blue-700 text-sm mt-1">
              {totalUsed > 0 && projects.length > 0 
                ? (totalUsed / projects.reduce((sum, p) => sum + p.completion_percentage, 0)).toFixed(2)
                : '0.00'
              } credits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
