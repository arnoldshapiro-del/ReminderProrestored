import React, { useState, useEffect } from 'react';
import { useAuth } from "@getmocha/users-service/react";
import { 
  TrendingUp, 
  Plus,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';

interface CreditSession {
  id: string;
  projectId: number;
  projectName: string;
  platform: string;
  startTime: string;
  endTime?: string;
  creditsAtStart: number;
  creditsAtEnd?: number;
  creditsUsed: number;
  sessionNotes: string;
  date: string;
}

interface DailyTotal {
  date: string;
  totalCreditsUsed: number;
  sessions: CreditSession[];
  platforms: string[];
}

interface SmartCreditsTrackerProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const SmartCreditsTracker: React.FC<SmartCreditsTrackerProps> = ({ isMinimized = false, onToggleMinimize }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CreditSession[]>([]);
  const [activeSession, setActiveSession] = useState<CreditSession | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [showStartSession, setShowStartSession] = useState(false);

  useEffect(() => {
    loadSessions();
    loadProjects();
  }, [user]);

  const loadSessions = () => {
    const savedSessions = localStorage.getItem(`credit-sessions-${user?.id}`);
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const saveSessions = (newSessions: CreditSession[]) => {
    localStorage.setItem(`credit-sessions-${user?.id}`, JSON.stringify(newSessions));
    setSessions(newSessions);
  };

  const startSession = () => {
    if (!selectedProject) return;

    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;

    const newSession: CreditSession = {
      id: Date.now().toString(),
      projectId: selectedProject,
      projectName: project.project_name,
      platform: project.ai_platform,
      startTime: new Date().toISOString(),
      creditsAtStart: currentCredits,
      creditsUsed: 0,
      sessionNotes: '',
      date: new Date().toLocaleDateString()
    };

    setActiveSession(newSession);
    setShowStartSession(false);
  };

  const endSession = (creditsAtEnd: number, notes: string = '') => {
    if (!activeSession) return;

    const creditsUsed = Math.max(0, activeSession.creditsAtStart - creditsAtEnd);
    const completedSession: CreditSession = {
      ...activeSession,
      endTime: new Date().toISOString(),
      creditsAtEnd,
      creditsUsed,
      sessionNotes: notes
    };

    const newSessions = [completedSession, ...sessions];
    saveSessions(newSessions);
    setActiveSession(null);
  };

  const getTodaysSessions = () => {
    const today = new Date().toLocaleDateString();
    return sessions.filter(session => session.date === today);
  };

  const getDailyTotals = (): DailyTotal[] => {
    const dailyMap = new Map<string, DailyTotal>();

    sessions.forEach(session => {
      if (!dailyMap.has(session.date)) {
        dailyMap.set(session.date, {
          date: session.date,
          totalCreditsUsed: 0,
          sessions: [],
          platforms: []
        });
      }

      const daily = dailyMap.get(session.date)!;
      daily.totalCreditsUsed += session.creditsUsed;
      daily.sessions.push(session);
      if (!daily.platforms.includes(session.platform)) {
        daily.platforms.push(session.platform);
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getCumulativeTotal = () => {
    return sessions.reduce((total, session) => total + session.creditsUsed, 0);
  };

  const getProjectTotal = (projectId: number) => {
    return sessions
      .filter(session => session.projectId === projectId)
      .reduce((total, session) => total + session.creditsUsed, 0);
  };

  if (isMinimized) {
    const todaysUsage = getTodaysSessions().reduce((sum, session) => sum + session.creditsUsed, 0);
    const cumulativeTotal = getCumulativeTotal();

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <div className="text-xs">
              <div className="font-medium text-gray-900">Today: {todaysUsage}</div>
              <div className="text-gray-500">Total: {cumulativeTotal}</div>
            </div>
          </div>
          <button
            onClick={onToggleMinimize}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
        
        {activeSession && (
          <div className="mt-2 text-xs text-blue-600 flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            Active: {activeSession.projectName}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Smart Credits Tracker</h3>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowStartSession(true)}
          className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-blue-50 p-2 rounded-lg text-center">
          <div className="font-bold text-blue-600">{getTodaysSessions().reduce((sum, s) => sum + s.creditsUsed, 0)}</div>
          <div className="text-blue-700">Today</div>
        </div>
        <div className="bg-purple-50 p-2 rounded-lg text-center">
          <div className="font-bold text-purple-600">{getCumulativeTotal()}</div>
          <div className="text-purple-700">Total</div>
        </div>
        <div className="bg-green-50 p-2 rounded-lg text-center">
          <div className="font-bold text-green-600">{sessions.length}</div>
          <div className="text-green-700">Sessions</div>
        </div>
      </div>

      {/* Active Session */}
      {activeSession && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Active Session</span>
            </div>
            <span className="text-xs text-green-600">
              Started: {new Date(activeSession.startTime).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="text-sm text-green-800 mb-3">
            <strong>{activeSession.projectName}</strong> ({activeSession.platform})
            <br />
            Started with: {activeSession.creditsAtStart} credits
          </div>

          <EndSessionForm 
            onEndSession={endSession}
            initialCredits={activeSession.creditsAtStart}
          />
        </div>
      )}

      {/* Recent Sessions */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="text-sm font-semibold text-gray-700">Recent Sessions</h4>
        {sessions.slice(0, 5).map((session) => (
          <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900">{session.projectName}</span>
              <span className="text-red-600 font-bold">-{session.creditsUsed}</span>
            </div>
            
            <div className="text-gray-600">
              {session.platform} • {session.date}
              {session.endTime && (
                <span className="ml-2">
                  {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {session.sessionNotes && (
              <div className="text-gray-500 mt-1 italic">"{session.sessionNotes}"</div>
            )}
          </div>
        ))}
      </div>

      {/* Daily Totals */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Daily Summary</h4>
        {getDailyTotals().slice(0, 7).map((daily) => (
          <div key={daily.date} className="bg-gray-50 p-2 rounded-lg text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium">{daily.date}</span>
              <span className="font-bold text-red-600">{daily.totalCreditsUsed} credits</span>
            </div>
            <div className="text-gray-600">
              {daily.sessions.length} sessions • {daily.platforms.join(', ')}
            </div>
          </div>
        ))}
      </div>

      {/* Project Totals */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Project Totals</h4>
        {projects.map((project) => {
          const total = getProjectTotal(project.id);
          if (total === 0) return null;
          
          return (
            <div key={project.id} className="bg-blue-50 p-2 rounded-lg text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-900">{project.project_name}</span>
                <span className="font-bold text-blue-600">{total} credits</span>
              </div>
              <div className="text-blue-700">{project.ai_platform}</div>
            </div>
          );
        })}
      </div>

      {/* Start Session Modal */}
      {showStartSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Start Credit Tracking Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.project_name} ({project.ai_platform})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Credits in Platform</label>
                <input
                  type="number"
                  value={currentCredits}
                  onChange={(e) => setCurrentCredits(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="How many credits do you have right now?"
                  min="0"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={startSession}
                disabled={!selectedProject || currentCredits < 0}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Start Session
              </button>
              <button
                onClick={() => setShowStartSession(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// End Session Form Component
const EndSessionForm: React.FC<{
  onEndSession: (creditsAtEnd: number, notes: string) => void;
  initialCredits: number;
}> = ({ onEndSession, initialCredits }) => {
  const [creditsAtEnd, setCreditsAtEnd] = useState<number>(initialCredits);
  const [notes, setNotes] = useState('');

  const creditsUsed = Math.max(0, initialCredits - creditsAtEnd);

  const handleEndSession = () => {
    onEndSession(creditsAtEnd, notes);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-green-700 mb-1">Credits Now</label>
          <input
            type="number"
            value={creditsAtEnd}
            onChange={(e) => setCreditsAtEnd(parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
            min="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-green-700 mb-1">Credits Used</label>
          <input
            type="number"
            value={creditsUsed}
            readOnly
            className="w-full px-2 py-1 border border-green-300 bg-green-100 rounded text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-green-700 mb-1">Session Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
          rows={2}
          placeholder="What did you work on?"
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleEndSession}
          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors"
        >
          End Session
        </button>
      </div>
    </div>
  );
};

export default SmartCreditsTracker;
