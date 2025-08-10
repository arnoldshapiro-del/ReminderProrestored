import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Target,
  BarChart3,
  Calendar
} from 'lucide-react';
import type { ProjectType } from "@/shared/types";

interface DeploymentInsightsProps {
  projects: ProjectType[];
}

export default function DeploymentInsights({ projects }: DeploymentInsightsProps) {
  // Calculate deployment insights
  const getDeploymentStats = () => {
    const stats = {
      totalDeployments: 0,
      avgTimeToDeployHours: 0,
      fastestDeployHours: Infinity,
      slowestDeployHours: 0,
      mostActiveDay: '',
      recentActivity: 0
    };

    const deploymentTimes: number[] = [];
    const dayActivity: { [key: string]: number } = {};
    const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    projects.forEach(project => {
      // Count all deployment events
      if ((project as any).mocha_published_at) {
        stats.totalDeployments++;
        const date = new Date((project as any).mocha_published_at);
        if (date >= recentCutoff) stats.recentActivity++;
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        dayActivity[dayName] = (dayActivity[dayName] || 0) + 1;
      }
      
      if ((project as any).netlify_deployed_at) {
        stats.totalDeployments++;
        const date = new Date((project as any).netlify_deployed_at);
        if (date >= recentCutoff) stats.recentActivity++;
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        dayActivity[dayName] = (dayActivity[dayName] || 0) + 1;
      }

      if ((project as any).github_pushed_at) {
        stats.totalDeployments++;
        const date = new Date((project as any).github_pushed_at);
        if (date >= recentCutoff) stats.recentActivity++;
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        dayActivity[dayName] = (dayActivity[dayName] || 0) + 1;
      }

      // Time to deploy tracking
      if (project.time_to_deploy_hours && project.time_to_deploy_hours > 0) {
        deploymentTimes.push(project.time_to_deploy_hours);
        stats.fastestDeployHours = Math.min(stats.fastestDeployHours, project.time_to_deploy_hours);
        stats.slowestDeployHours = Math.max(stats.slowestDeployHours, project.time_to_deploy_hours);
      }
    });

    if (deploymentTimes.length > 0) {
      stats.avgTimeToDeployHours = deploymentTimes.reduce((sum, time) => sum + time, 0) / deploymentTimes.length;
    }

    // Find most active day
    let maxActivity = 0;
    Object.entries(dayActivity).forEach(([day, count]) => {
      if (count > maxActivity) {
        maxActivity = count;
        stats.mostActiveDay = day;
      }
    });

    if (stats.fastestDeployHours === Infinity) {
      stats.fastestDeployHours = 0;
    }

    return stats;
  };

  const stats = getDeploymentStats();

  return (
    <div className="card bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-purple-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Deployment Insights
          </h3>
          <p className="text-purple-700 text-sm">Smart analytics for your deployment workflow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="text-center p-4 bg-white bg-opacity-60 rounded-xl">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalDeployments}</div>
          <div className="text-blue-700 text-xs">Total Deployments</div>
        </div>

        <div className="text-center p-4 bg-white bg-opacity-60 rounded-xl">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.avgTimeToDeployHours.toFixed(1)}h
          </div>
          <div className="text-green-700 text-xs">Avg Deploy Time</div>
        </div>

        <div className="text-center p-4 bg-white bg-opacity-60 rounded-xl">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.fastestDeployHours.toFixed(1)}h
          </div>
          <div className="text-yellow-700 text-xs">Fastest Deploy</div>
        </div>

        <div className="text-center p-4 bg-white bg-opacity-60 rounded-xl">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {stats.slowestDeployHours.toFixed(1)}h
          </div>
          <div className="text-red-700 text-xs">Longest Deploy</div>
        </div>

        <div className="text-center p-4 bg-white bg-opacity-60 rounded-xl">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="text-lg font-bold text-purple-600">
            {stats.mostActiveDay || 'N/A'}
          </div>
          <div className="text-purple-700 text-xs">Most Active Day</div>
        </div>

        <div className="text-center p-4 bg-white bg-opacity-60 rounded-xl">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{stats.recentActivity}</div>
          <div className="text-indigo-700 text-xs">This Week</div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-purple-200 text-center">
        <p className="text-purple-700 text-sm">
          🎯 <strong>Pro Tip:</strong> Your fastest deployment was {stats.fastestDeployHours.toFixed(1)} hours. 
          Can you beat it with your next project?
        </p>
      </div>
    </div>
  );
}
