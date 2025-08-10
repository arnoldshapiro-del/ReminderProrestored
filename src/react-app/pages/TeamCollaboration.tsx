import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  Users,
  MessageSquare,
  Share2,
  Clock,
  GitBranch,
  Brain,
  Zap,
  Star,
  Settings,
  Eye,
  Edit,
  Calendar,
  Bell,
  Activity
} from "lucide-react";

const TEAM_FEATURES = [
  {
    id: 'project_sharing',
    title: 'Project Sharing',
    description: 'Share projects with team members and control access levels',
    icon: Share2,
    color: 'blue',
    status: 'coming_soon'
  },
  {
    id: 'collaborative_notes',
    title: 'Collaborative Notes',
    description: 'Add comments and notes on projects with team discussions',
    icon: MessageSquare,
    color: 'green',
    status: 'coming_soon'
  },
  {
    id: 'real_time_updates',
    title: 'Real-time Updates',
    description: 'See live changes when team members update project status',
    icon: Activity,
    color: 'purple',
    status: 'coming_soon'
  },
  {
    id: 'team_analytics',
    title: 'Team Analytics',
    description: 'Track team productivity and project success rates',
    icon: Users,
    color: 'orange',
    status: 'coming_soon'
  }
];

const WORKFLOW_INTEGRATIONS = [
  {
    name: 'Slack Integration',
    description: 'Get project updates in your Slack channels',
    icon: MessageSquare,
    color: 'green',
    available: false
  },
  {
    name: 'Discord Bot',
    description: 'Track deployments and share wins with your dev team',
    icon: Users,
    color: 'purple',
    available: false
  },
  {
    name: 'Email Notifications',
    description: 'Stay updated on project milestones and issues',
    icon: Bell,
    color: 'blue',
    available: true
  },
  {
    name: 'Calendar Sync',
    description: 'Sync project deadlines with Google Calendar',
    icon: Calendar,
    color: 'red',
    available: false
  }
];

export default function TeamCollaboration() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState('project_sharing');

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Team Collaboration</h1>
              <p className="text-blue-100">
                Work together on AI projects with advanced collaboration tools
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Coming Soon!</h3>
              <p className="text-gray-600">
                Team collaboration features are in development. Get early access by joining our beta program.
              </p>
            </div>
            <div className="ml-auto">
              <button className="btn-primary">
                Join Beta
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEAM_FEATURES.map((feature) => {
            const FeatureIcon = feature.icon;
            
            return (
              <div 
                key={feature.id}
                className={`card cursor-pointer transition-all hover:shadow-lg ${
                  activeFeature === feature.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setActiveFeature(feature.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-${feature.color}-500 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <FeatureIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                    
                    {/* Feature Preview */}
                    {feature.id === 'project_sharing' && activeFeature === feature.id && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-gray-900 mb-2">Preview:</p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <Eye className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-xs">Viewer access - can see project details</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <Edit className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-xs">Editor access - can modify projects</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                              <Settings className="w-3 h-3 text-purple-600" />
                            </div>
                            <span className="text-xs">Admin access - full control</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {feature.id === 'collaborative_notes' && activeFeature === feature.id && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-gray-900 mb-2">Features:</p>
                        <ul className="space-y-1 text-xs text-gray-600">
                          <li>• Thread-based discussions on specific features</li>
                          <li>• @mention team members for notifications</li>
                          <li>• File attachments and screenshots</li>
                          <li>• Comment history and version tracking</li>
                        </ul>
                      </div>
                    )}

                    {feature.id === 'real_time_updates' && activeFeature === feature.id && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-gray-900 mb-2">Live Updates:</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Sarah updated "Medical App" status to Deployed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Mike added 3 new bugs to "Dashboard Project"</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Alex completed "User Authentication" feature</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {feature.id === 'team_analytics' && activeFeature === feature.id && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-gray-900 mb-2">Analytics Dashboard:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 rounded">
                            <span className="text-gray-600">Team Velocity</span>
                            <div className="font-bold text-green-600">↗ +23%</div>
                          </div>
                          <div className="bg-white p-2 rounded">
                            <span className="text-gray-600">Success Rate</span>
                            <div className="font-bold text-blue-600">87%</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow Integrations */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORKFLOW_INTEGRATIONS.map((integration, index) => {
              const IntegrationIcon = integration.icon;
              
              return (
                <div key={index} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-${integration.color}-500 rounded-lg flex items-center justify-center`}>
                        <IntegrationIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      integration.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {integration.available ? 'Available' : 'Coming Soon'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{integration.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Beta Access */}
        <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Get Early Access</h3>
                <p className="text-gray-600">
                  Be among the first to try team collaboration features when they launch
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn-secondary">
                Learn More
              </button>
              <button className="btn-primary">
                Join Beta Program
              </button>
            </div>
          </div>
        </div>

        {/* Individual Productivity Until Team Features */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Maximize Your Individual Productivity</h2>
          <p className="text-gray-600 mb-6">
            While team features are in development, here's how to get the most out of DevTracker Pro:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track All Platforms</h3>
              <p className="text-gray-600 text-sm">
                Monitor projects across Mocha, Bolt, Cursor, Claude, and more in one place
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Optimize Credit Usage</h3>
              <p className="text-gray-600 text-sm">
                Analyze which platforms give you the best value and results
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Streamline Deployment</h3>
              <p className="text-gray-600 text-sm">
                Track GitHub → Netlify workflows and catch issues early
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
