import { useState, useEffect } from "react";
import { 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Play,
  Pause,
  Calendar,
  BarChart3,
  Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { ProjectType } from "@/shared/types";

interface TimeToDeployTrackerProps {
  projects: ProjectType[];
  onProjectUpdate?: (projectId: number, data: Partial<ProjectType>) => void;
}

interface TimeEntry {
  id: number;
  project_id: number;
  task_description: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  task_type: 'development' | 'debugging' | 'deployment' | 'testing' | 'planning';
}

export default function TimeToDeployTracker({ projects, onProjectUpdate }: TimeToDeployTrackerProps) {
  const [activeTimers, setActiveTimers] = useState<{[projectId: number]: TimeEntry}>({});
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    description: '',
    type: 'development' as const
  });

  // Update active timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => ({ ...prev })); // Force re-render to update display
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startTimer = (projectId: number, description: string, type: TimeEntry['task_type']) => {
    const newEntry: TimeEntry = {
      id: Date.now(),
      project_id: projectId,
      task_description: description,
      start_time: new Date().toISOString(),
      task_type: type
    };

    setActiveTimers(prev => ({ ...prev, [projectId]: newEntry }));
  };

  const stopTimer = (projectId: number) => {
    const activeTimer = activeTimers[projectId];
    if (!activeTimer) return;

    const endTime = new Date();
    const startTime = new Date(activeTimer.start_time);
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    const completedEntry: TimeEntry = {
      ...activeTimer,
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes
    };

    setTimeEntries(prev => [completedEntry, ...prev]);
    setActiveTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[projectId];
      return newTimers;
    });

    // Update project total time
    const project = projects.find(p => p.id === projectId);
    if (project && onProjectUpdate) {
      const newTotalHours = (project.time_to_deploy_hours || 0) + (durationMinutes / 60);
      onProjectUpdate(projectId, { time_to_deploy_hours: newTotalHours });
    }
  };

  const getActiveTimerDuration = (timer: TimeEntry) => {
    const now = new Date();
    const start = new Date(timer.start_time);
    const durationMs = now.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProjectTimeStats = (projectId: number) => {
    const entries = timeEntries.filter(e => e.project_id === projectId);
    const totalMinutes = entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
    const byType = entries.reduce((acc, e) => {
      acc[e.task_type] = (acc[e.task_type] || 0) + (e.duration_minutes || 0);
      return acc;
    }, {} as {[key: string]: number});

    return {
      totalHours: totalMinutes / 60,
      totalMinutes,
      entriesCount: entries.length,
      byType
    };
  };

  const getOverallStats = () => {
    const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
    const avgMinutesPerProject = projects.length > 0 ? totalMinutes / projects.length : 0;
    const completedProjects = projects.filter(p => p.status === 'deployed');
    const avgTimeToDeployHours = completedProjects.length > 0 
      ? completedProjects.reduce((sum, p) => sum + (p.time_to_deploy_hours || 0), 0) / completedProjects.length
      : 0;

    return {
      totalHours: totalMinutes / 60,
      avgHoursPerProject: avgMinutesPerProject / 60,
      avgTimeToDeployHours,
      activeTimers: Object.keys(activeTimers).length
    };
  };

  const getTimelineData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayEntries = timeEntries.filter(e => 
        e.end_time && e.end_time.startsWith(date)
      );
      const totalMinutes = dayEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        hours: totalMinutes / 60,
        entries: dayEntries.length
      };
    });
  };

  const getTaskTypeStats = () => {
    const typeStats = timeEntries.reduce((acc, entry) => {
      const type = entry.task_type;
      acc[type] = (acc[type] || 0) + (entry.duration_minutes || 0);
      return acc;
    }, {} as {[key: string]: number});

    return Object.entries(typeStats).map(([type, minutes]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      hours: minutes / 60,
      percentage: timeEntries.length > 0 ? (minutes / timeEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0)) * 100 : 0
    }));
  };

  const overallStats = getOverallStats();
  const timelineData = getTimelineData();
  const taskTypeStats = getTaskTypeStats();

  const getTaskTypeColor = (type: string) => {
    const colors = {
      development: 'blue',
      debugging: 'red',
      deployment: 'green',
      testing: 'yellow',
      planning: 'purple'
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  const getTaskTypeIcon = (type: string) => {
    const icons = {
      development: Play,
      debugging: AlertTriangle,
      deployment: CheckCircle,
      testing: Target,
      planning: Calendar
    };
    return icons[type as keyof typeof icons] || Clock;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Time-to-Deploy Tracker</h2>
          <p className="text-gray-600">Monitor development time and optimize your workflow</p>
        </div>
        <button
          onClick={() => setShowTaskModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Start Timer</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Time</p>
              <p className="text-3xl font-bold">{overallStats.totalHours.toFixed(1)}h</p>
              <p className="text-blue-100 text-xs">Across all projects</p>
            </div>
            <Clock className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Avg per Project</p>
              <p className="text-3xl font-bold">{overallStats.avgHoursPerProject.toFixed(1)}h</p>
              <p className="text-green-100 text-xs">Development time</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Deploy Time</p>
              <p className="text-3xl font-bold">{overallStats.avgTimeToDeployHours.toFixed(1)}h</p>
              <p className="text-purple-100 text-xs">From start to live</p>
            </div>
            <Zap className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Active Timers</p>
              <p className="text-3xl font-bold">{overallStats.activeTimers}</p>
              <p className="text-orange-100 text-xs">Currently running</p>
            </div>
            <Play className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Active Timers */}
      {Object.keys(activeTimers).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Timers</h3>
          <div className="space-y-3">
            {Object.entries(activeTimers).map(([projectId, timer]) => {
              const project = projects.find(p => p.id === parseInt(projectId));
              const TaskIcon = getTaskTypeIcon(timer.task_type);
              
              return (
                <div key={projectId} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 bg-${getTaskTypeColor(timer.task_type)}-500 rounded-xl flex items-center justify-center`}>
                      <TaskIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{project?.project_name}</h4>
                      <p className="text-sm text-gray-600">{timer.task_description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Running Time</p>
                      <p className="text-xl font-bold text-blue-600">
                        {getActiveTimerDuration(timer)}
                      </p>
                    </div>
                    <button
                      onClick={() => stopTimer(parseInt(projectId))}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Stop</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Tracking Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Time Tracking</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value.toFixed(1)} hours`, 'Development Time']} />
              <Line type="monotone" dataKey="hours" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Task Type Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time by Task Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskTypeStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value.toFixed(1)} hours`, 'Time Spent']} />
              <Bar dataKey="hours" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Time Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Time Breakdown</h3>
        
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No projects to track</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const stats = getProjectTimeStats(project.id!);
              const isActive = activeTimers[project.id!];
              
              return (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'} rounded-xl flex items-center justify-center`}>
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{project.project_name}</h4>
                      <p className="text-sm text-gray-600">
                        {stats.entriesCount} time entries • {project.completion_percentage}% complete
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Tracked Time</p>
                      <p className="font-semibold text-blue-600">{stats.totalHours.toFixed(1)}h</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Time</p>
                      <p className="font-semibold text-purple-600">
                        {(project.time_to_deploy_hours || 0).toFixed(1)}h
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-500">Efficiency</p>
                      <p className="font-semibold text-green-600">
                        {project.completion_percentage > 0 
                          ? ((project.completion_percentage / ((project.time_to_deploy_hours || 1) * 10))).toFixed(1)
                          : '0.0'
                        }
                      </p>
                    </div>

                    {isActive ? (
                      <button
                        onClick={() => stopTimer(project.id!)}
                        className="btn-secondary text-sm"
                      >
                        Stop Timer
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedProject(project.id!);
                          setShowTaskModal(true);
                        }}
                        className="btn-primary text-sm"
                      >
                        Start Timer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Start Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Start Time Tracking</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Description</label>
                <input
                  type="text"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({...prev, description: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="What are you working on?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask(prev => ({...prev, type: e.target.value as any}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="development">Development</option>
                  <option value="debugging">Debugging</option>
                  <option value="testing">Testing</option>
                  <option value="deployment">Deployment</option>
                  <option value="planning">Planning</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    if (selectedProject && newTask.description) {
                      // Close modal immediately to prevent flash
                      setShowTaskModal(false);
                      startTimer(selectedProject, newTask.description, newTask.type);
                      setNewTask({ description: '', type: 'development' });
                      setSelectedProject(null);
                    }
                  }}
                  disabled={!selectedProject || !newTask.description}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Start Timer
                </button>
                <button
                  onClick={() => {
                    // Close modal immediately to prevent flash
                    setShowTaskModal(false);
                    setNewTask({ description: '', type: 'development' });
                    setSelectedProject(null);
                  }}
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
