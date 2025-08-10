import { useState, useEffect } from 'react';
import { 
  Clock,
  GitBranch, 
  Globe, 
  Zap, 
  AlertTriangle, 
  Brain,
  Calendar,
  ArrowRight,
  CheckCircle,
  Circle,
  Rocket
} from 'lucide-react';
import type { ProjectType } from "@/shared/types";

interface DeploymentTimelineProps {
  projects: ProjectType[];
}

interface TimelineEvent {
  id: string;
  projectName: string;
  platform: string;
  action: string;
  date: string;
  url?: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function DeploymentTimeline({ projects }: DeploymentTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [timeFilter, setTimeFilter] = useState('7d');

  useEffect(() => {
    generateTimelineEvents();
  }, [projects, timeFilter]);

  const generateTimelineEvents = () => {
    const allEvents: TimelineEvent[] = [];

    projects.forEach(project => {
      // Mocha publish events
      if ((project as any).mocha_published_at) {
        allEvents.push({
          id: `mocha-${project.id}`,
          projectName: project.project_name,
          platform: 'mocha',
          action: 'publish',
          date: (project as any).mocha_published_at,
          url: (project as any).mocha_published_url,
          status: 'completed'
        });
      }

      // GitHub push events
      if ((project as any).github_pushed_at) {
        allEvents.push({
          id: `github-${project.id}`,
          projectName: project.project_name,
          platform: 'github',
          action: 'push',
          date: (project as any).github_pushed_at,
          url: project.github_repo_url,
          status: 'completed'
        });
      }

      // Netlify deploy events
      if ((project as any).netlify_deployed_at) {
        allEvents.push({
          id: `netlify-${project.id}`,
          projectName: project.project_name,
          platform: 'netlify',
          action: 'deploy',
          date: (project as any).netlify_deployed_at,
          url: project.netlify_url,
          status: 'completed'
        });
      }

      // Vercel deploy events
      if ((project as any).vercel_deployed_at) {
        allEvents.push({
          id: `vercel-${project.id}`,
          projectName: project.project_name,
          platform: 'vercel',
          action: 'deploy',
          date: (project as any).vercel_deployed_at,
          url: project.vercel_url,
          status: 'completed'
        });
      }

      // Twilio config events
      if ((project as any).twilio_configured_at) {
        allEvents.push({
          id: `twilio-${project.id}`,
          projectName: project.project_name,
          platform: 'twilio',
          action: 'configure',
          date: (project as any).twilio_configured_at,
          status: 'completed'
        });
      }
    });

    // Filter by time period
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeFilter) {
      case '1d':
        cutoff.setDate(now.getDate() - 1);
        break;
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(now.getDate() - 90);
        break;
      default:
        cutoff.setFullYear(2020); // Show all
    }

    const filtered = allEvents
      .filter(event => new Date(event.date) >= cutoff)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setEvents(filtered);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'mocha': return Brain;
      case 'github': return GitBranch;
      case 'netlify': return Globe;
      case 'vercel': return Zap;
      case 'twilio': return AlertTriangle;
      default: return Circle;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'mocha': return 'bg-blue-500';
      case 'github': return 'bg-gray-500';
      case 'netlify': return 'bg-green-500';
      case 'vercel': return 'bg-purple-500';
      case 'twilio': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays > 0) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    return 'Just now';
  };

  const getEventsByDate = () => {
    const grouped: { [date: string]: TimelineEvent[] } = {};
    
    events.forEach(event => {
      const date = new Date(event.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });

    return Object.entries(grouped).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  };

  const eventsByDate = getEventsByDate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Rocket className="w-6 h-6 mr-2" />
            Deployment Timeline
          </h2>
          <p className="text-gray-600">Visual timeline of all your deployments across platforms</p>
        </div>
        
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 3 months</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Timeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-600">
            {events.filter(e => e.platform === 'mocha').length}
          </div>
          <div className="text-blue-700 text-sm">Mocha Publishes</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-gray-600">
            {events.filter(e => e.platform === 'github').length}
          </div>
          <div className="text-gray-700 text-sm">GitHub Pushes</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600">
            {events.filter(e => e.platform === 'netlify').length}
          </div>
          <div className="text-green-700 text-sm">Netlify Deploys</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-600">
            {events.length}
          </div>
          <div className="text-purple-700 text-sm">Total Events</div>
        </div>
      </div>

      {/* Timeline */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deployment activity</h3>
          <p className="text-gray-600">Start deploying your projects to see the timeline here</p>
        </div>
      ) : (
        <div className="space-y-8">
          {eventsByDate.map(([date, dateEvents]) => (
            <div key={date} className="relative">
              {/* Date Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Events for this date */}
              <div className="space-y-4 pl-6">
                {dateEvents.map((event, index) => {
                  const PlatformIcon = getPlatformIcon(event.platform);
                  const platformColor = getPlatformColor(event.platform);
                  
                  return (
                    <div key={event.id} className="relative flex items-start space-x-4">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-2">
                        <div className={`w-4 h-4 ${platformColor} rounded-full flex items-center justify-center`}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        {index < dateEvents.length - 1 && (
                          <div className="absolute left-2 top-4 w-px h-12 bg-gray-200"></div>
                        )}
                      </div>

                      {/* Event Card */}
                      <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${platformColor} rounded-lg flex items-center justify-center`}>
                              <PlatformIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {event.projectName}
                              </h4>
                              <p className="text-sm text-gray-600 capitalize">
                                {event.platform} {event.action}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500">
                              {formatRelativeTime(event.date)}
                            </span>
                            {event.url && (
                              <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">Completed</span>
                          </div>
                          
                          <span className="text-xs text-gray-400">
                            {new Date(event.date).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
