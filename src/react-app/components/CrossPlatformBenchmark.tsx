import { useState } from 'react';
import type { ProjectType } from '@/shared/types';
import { 
  BarChart3, 
  DollarSign, 
  Target,
  Zap,
  Award,
  AlertCircle
} from 'lucide-react';

interface CrossPlatformBenchmarkProps {
  projects: ProjectType[];
}

interface BenchmarkResult {
  platform: string;
  cost: number;
  time_hours: number;
  quality_score: number;
  ease_of_use: number;
  feature_completeness: number;
}

interface Comparison {
  id: number;
  project_concept: string;
  platforms_tested: string[];
  results: BenchmarkResult[];
  winner: string;
  created_at: string;
}

export default function CrossPlatformBenchmark({ projects }: CrossPlatformBenchmarkProps) {
  const [comparisons] = useState<Comparison[]>([
    {
      id: 1,
      project_concept: 'Medical Reminder System',
      platforms_tested: ['Mocha', 'Lovable', 'Bolt'],
      results: [
        {
          platform: 'Mocha',
          cost: 65,
          time_hours: 2.5,
          quality_score: 9,
          ease_of_use: 9,
          feature_completeness: 8
        },
        {
          platform: 'Lovable',
          cost: 80,
          time_hours: 3.2,
          quality_score: 8,
          ease_of_use: 7,
          feature_completeness: 9
        },
        {
          platform: 'Bolt',
          cost: 45,
          time_hours: 4.1,
          quality_score: 7,
          ease_of_use: 8,
          feature_completeness: 7
        }
      ],
      winner: 'Mocha',
      created_at: '2024-01-15'
    }
  ]);

  const [showNewComparison, setShowNewComparison] = useState(false);

  // Calculate platform averages from projects
  const platformStats = projects.reduce((acc: any, project) => {
    if (!acc[project.ai_platform]) {
      acc[project.ai_platform] = {
        totalCredits: 0,
        totalTime: 0,
        projects: 0,
        avgCompletion: 0
      };
    }
    
    acc[project.ai_platform].totalCredits += project.credits_used || 0;
    acc[project.ai_platform].totalTime += project.time_to_deploy_hours || 0;
    acc[project.ai_platform].projects += 1;
    acc[project.ai_platform].avgCompletion += project.completion_percentage || 0;
    
    return acc;
  }, {});

  // Calculate averages
  Object.keys(platformStats).forEach(platform => {
    const stats = platformStats[platform];
    stats.avgCredits = Math.round(stats.totalCredits / stats.projects);
    stats.avgTime = Math.round((stats.totalTime / stats.projects) * 10) / 10;
    stats.avgCompletion = Math.round(stats.avgCompletion / stats.projects);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cross-Platform Benchmark</h2>
          <p className="text-gray-600">Compare AI platforms for cost, speed, and quality</p>
        </div>
        <button 
          onClick={() => setShowNewComparison(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <BarChart3 className="w-4 h-4" />
          <span>New Comparison</span>
        </button>
      </div>

      {/* Platform Performance Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Platform Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(platformStats).map(([platform, stats]: [string, any]) => (
            <div key={platform} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{platform}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects:</span>
                  <span className="font-medium">{stats.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Credits:</span>
                  <span className="font-medium">{stats.avgCredits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Time:</span>
                  <span className="font-medium">{stats.avgTime || 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion:</span>
                  <span className="font-medium">{stats.avgCompletion || 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Benchmark Comparisons</h3>
        
        {comparisons.map((comparison) => (
          <div key={comparison.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">{comparison.project_concept}</h4>
                <p className="text-sm text-gray-600">
                  Tested: {comparison.platforms_tested.join(', ')} • {comparison.created_at}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-gray-900">Winner: {comparison.winner}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparison.results.map((result) => (
                <div 
                  key={result.platform} 
                  className={`p-4 border-2 rounded-lg ${
                    result.platform === comparison.winner 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">{result.platform}</h5>
                    {result.platform === comparison.winner && (
                      <Award className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3 text-gray-400" />
                        <span>Cost:</span>
                      </span>
                      <span className="font-medium">${result.cost}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-gray-400" />
                        <span>Time:</span>
                      </span>
                      <span className="font-medium">{result.time_hours}h</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Target className="w-3 h-3 text-gray-400" />
                        <span>Quality:</span>
                      </span>
                      <span className="font-medium">{result.quality_score}/10</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Ease of Use:</span>
                      <span className="font-medium">{result.ease_of_use}/10</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Features:</span>
                      <span className="font-medium">{result.feature_completeness}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Recommendation:</p>
                  <p className="text-blue-700">
                    {comparison.winner} offers the best balance of cost, speed, and quality for this type of project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Comparison Modal */}
      {showNewComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">New Platform Comparison</h3>
            <p className="text-gray-600 mb-4">
              Feature coming soon! Automated benchmarking will compare platforms based on your project requirements.
            </p>
            <button 
              onClick={() => {
                // Close immediately to prevent flash
                setShowNewComparison(false);
              }}
              className="w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
