import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import Layout from "@/react-app/components/Layout";
import { 
  Plus,
  Search,
  GitBranch,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Database,
  Brain,
  Heart,
  Upload,
  Rocket,
  DollarSign,
  Timer,
  Star,
  BarChart3,
  ExternalLink,
  Move,
  TrendingUp
} from "lucide-react";
import type { ProjectType } from "@/shared/types";
import ProjectMigrationWizard from "@/react-app/components/ProjectMigrationWizard";
import SmartBudgetTracker from "@/react-app/components/SmartBudgetTracker";
import AIPromptLibrary from "@/react-app/components/AIPromptLibrary";
import AutoDeploymentDetector from "@/react-app/components/AutoDeploymentDetector";
import CrossPlatformBenchmark from "@/react-app/components/CrossPlatformBenchmark";
import TemplateMarketplace from "@/react-app/components/TemplateMarketplace";
import TimeToDeployTracker from "@/react-app/components/TimeToDeployTracker";
import ProjectVersionHistory from "@/react-app/components/ProjectVersionHistory";
import DeploymentTimeline from "@/react-app/components/DeploymentTimeline";

import VersionStatusBadge from "@/react-app/components/VersionStatusBadge";
import QuickLinkDropdown from "@/react-app/components/QuickLinkDropdown";
import DeploymentInsights from "@/react-app/components/DeploymentInsights";
import ProjectExportImport from "@/react-app/components/ProjectExportImport";
import SmartUrlInput from "@/react-app/components/SmartUrlInput";
import SmartCreditsTracker from "@/react-app/components/SmartCreditsTracker";
import AutoDeploymentSystem from "@/react-app/components/AutoDeploymentSystem";
import RealAutoDeployment from "@/react-app/components/RealAutoDeployment";
import UrlHealthChecker from "@/react-app/components/UrlHealthChecker";

const AI_PLATFORMS = [
  { id: 'mocha', name: 'Mocha', color: 'blue', icon: Brain, rating: 0 },
  { id: 'lovable', name: 'Lovable', color: 'pink', icon: Heart, rating: 0 },
  { id: 'bolt', name: 'Bolt', color: 'yellow', icon: Zap, rating: 0 },
  { id: 'emergent', name: 'Emergent', color: 'indigo', icon: Zap, rating: 0 },
  { id: 'genspark', name: 'GenSpark', color: 'red', icon: Zap, rating: 0 },
  { id: 'google-opal', name: 'Google Opal', color: 'teal', icon: Brain, rating: 0 },
  { id: 'google-gemini', name: 'Google Gemini', color: 'purple', icon: Brain, rating: 0 },
  { id: 'chatgpt-5', name: 'ChatGPT 5', color: 'green', icon: Brain, rating: 0 },
  { id: 'cursor', name: 'Cursor', color: 'slate', icon: Edit, rating: 0 },
  { id: 'claude', name: 'Claude', color: 'orange', icon: Brain, rating: 0 },
  { id: 'replit', name: 'Replit', color: 'cyan', icon: Database, rating: 0 },
  { id: 'abacus-ai', name: 'Abacus AI', color: 'violet', icon: Brain, rating: 0 },
  { id: 'manus', name: 'Manus', color: 'emerald', icon: Brain, rating: 0 },
  { id: 'minimax', name: 'Minimax', color: 'rose', icon: Brain, rating: 0 },
  { id: 'custom', name: 'Add Custom Platform', color: 'gray', icon: Plus, rating: 0 }
];

const STATUS_COLORS = {
  planning: 'bg-gray-100 text-gray-800',
  development: 'bg-blue-100 text-blue-800',
  testing: 'bg-yellow-100 text-yellow-800',
  deployed: 'bg-green-100 text-green-800',
  maintenance: 'bg-purple-100 text-purple-800',
  abandoned: 'bg-red-100 text-red-800'
};

// Helper function to get professional icon color based on platform
const getPlatformIconColor = (platformColor: string) => {
  switch (platformColor) {
    case 'blue': return 'bg-blue-600 text-white hover:bg-blue-700';
    case 'pink': return 'bg-pink-600 text-white hover:bg-pink-700';
    case 'yellow': return 'bg-amber-500 text-white hover:bg-amber-600';
    case 'indigo': return 'bg-indigo-600 text-white hover:bg-indigo-700';
    case 'red': return 'bg-red-600 text-white hover:bg-red-700';
    case 'teal': return 'bg-teal-600 text-white hover:bg-teal-700';
    case 'purple': return 'bg-purple-600 text-white hover:bg-purple-700';
    case 'green': return 'bg-green-600 text-white hover:bg-green-700';
    case 'slate': return 'bg-slate-600 text-white hover:bg-slate-700';
    case 'orange': return 'bg-orange-600 text-white hover:bg-orange-700';
    case 'cyan': return 'bg-cyan-600 text-white hover:bg-cyan-700';
    case 'violet': return 'bg-violet-600 text-white hover:bg-violet-700';
    case 'emerald': return 'bg-emerald-600 text-white hover:bg-emerald-700';
    case 'rose': return 'bg-rose-600 text-white hover:bg-rose-700';
    default: return 'bg-gray-600 text-white hover:bg-gray-700';
  }
};

// Helper function to open URL with anti-flash delay
const openUrl = (url: string) => {
  if (url && url.trim() !== '') {
    setTimeout(() => {
      window.open(url.trim(), '_blank', 'noopener,noreferrer');
    }, 10);
  }
};

// URL Input Component with external link button
const UrlInput = ({ value, onChange, placeholder, label, colorName }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  colorName: string;
}) => {
  const hasUrl = value && value.trim() !== '';
  const inputBgColor = hasUrl ? `bg-${colorName}-50` : 'bg-white';
  const inputBorderColor = hasUrl ? `border-${colorName}-300` : 'border-gray-300';
  
  const handleOpenUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUrl) {
      window.open(value.trim(), '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <div>
      <label className={`block text-sm font-medium text-${colorName}-700 mb-1`}>{label}</label>
      <div className="flex items-center space-x-1">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 px-2 py-1 border ${inputBorderColor} ${inputBgColor} rounded text-sm focus:ring-1 focus:ring-${colorName}-500`}
          placeholder={placeholder}
        />
        {hasUrl && (
          <button
            type="button"
            onClick={handleOpenUrl}
            className={`p-1.5 text-${colorName}-600 hover:text-${colorName}-800 hover:bg-${colorName}-100 rounded-lg transition-colors border border-${colorName}-300 flex-shrink-0`}
            title="🔗 Click to open URL"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Sortable project card component for drag & drop
interface SortableProjectCardProps {
  project: ProjectType;
  onEditProject: (project: ProjectType) => void;
  onDeleteProject: (projectId: number, projectName: string) => void;
}

function SortableProjectCard({ project, onEditProject, onDeleteProject }: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const platform = AI_PLATFORMS.find(p => p.id === project.ai_platform) || AI_PLATFORMS[AI_PLATFORMS.length - 1];
  const PlatformIcon = platform.icon;
  const platformIconColor = getPlatformIconColor(platform.color);

  // Parse features and bugs
  const featuresCompleted = project.features_completed ? JSON.parse(project.features_completed) : [];
  const featuresPending = project.features_pending ? JSON.parse(project.features_pending) : [];
  const knownBugs = project.known_bugs ? JSON.parse(project.known_bugs) : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="w-4 h-4" />;
      case 'development': return <Clock className="w-4 h-4" />;
      case 'testing': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 group ${
        isDragging
          ? 'shadow-2xl rotate-2 scale-105 border-purple-300 bg-purple-50 z-50'
          : 'hover:shadow-xl hover:border-purple-200'
      }`}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-between mb-3">
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-purple-100 rounded-lg transition-colors flex items-center space-x-2 text-purple-600"
          title="🖱️ Click and drag to reorder projects"
        >
          <Move className="w-4 h-4" />
          <span className="text-xs font-medium">Drag to reorder</span>
        </div>
        <div className="flex items-center space-x-2">
          <QuickLinkDropdown project={project} />
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}`}>
            {getStatusIcon(project.status)}
            <span className="ml-1">{project.status}</span>
          </span>
        </div>
      </div>

      {/* Project Header with Enhanced Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEditProject(project);
            }}
            className={`w-12 h-12 ${platformIconColor} rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl`}
            title="Click to edit project"
          >
            <PlatformIcon className="w-7 h-7" />
          </button>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors mb-1">
              {project.project_name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{platform.name}</span>
              <span>•</span>
              <span>{project.project_type}</span>
              {project.time_to_deploy_hours && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">{project.time_to_deploy_hours.toFixed(1)}h deploy time</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Description */}
      {project.project_description && (
        <p className="text-gray-700 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
          {project.project_description}
        </p>
      )}

      {/* Enhanced Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700 font-medium">Progress & Features</span>
          <span className="font-bold text-purple-600">{project.completion_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${project.completion_percentage}%` }}
          ></div>
        </div>

        {/* Features Summary */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="font-bold text-green-600">{featuresCompleted.length}</div>
            <div className="text-green-700">Completed</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="font-bold text-blue-600">{featuresPending.length}</div>
            <div className="text-blue-700">Pending</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <div className="font-bold text-red-600">{knownBugs.length}</div>
            <div className="text-red-700">Issues</div>
          </div>
        </div>
      </div>

      {/* Enhanced Platform Status with Clickable Links */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Platform Status</h4>
        <div className="space-y-2">
          {/* Mocha Status */}
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Mocha</span>
            </div>
            <div className="flex items-center space-x-2">
              {(project as any).mocha_development_url && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if ((project as any).mocha_development_url) {
                      openUrl((project as any).mocha_development_url);
                    }
                  }}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors cursor-pointer hover:shadow-sm"
                >
                  Dev
                </button>
              )}
              {(project as any).mocha_published_url && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if ((project as any).mocha_published_url) {
                      openUrl((project as any).mocha_published_url);
                    }
                  }}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer hover:shadow-sm"
                >
                  Live
                </button>
              )}
            </div>
          </div>

          {/* GitHub Status */}
          {project.github_repo_url && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">GitHub</span>
                {(project as any).github_branch && (
                  <span className="text-xs text-gray-500">({(project as any).github_branch})</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {(project as any).github_development_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openUrl((project as any).github_development_url);
                    }}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 transition-colors cursor-pointer hover:shadow-sm"
                  >
                    Dev
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (project.github_repo_url) {
                      openUrl(project.github_repo_url);
                    }
                  }}
                  className="px-2 py-1 bg-gray-700 text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer hover:shadow-sm"
                >
                  Repo
                </button>
              </div>
            </div>
          )}

          {/* Netlify Status */}
          {project.netlify_url && (
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Netlify</span>
              </div>
              <div className="flex items-center space-x-2">
                {(project as any).netlify_development_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if ((project as any).netlify_development_url) {
                        openUrl((project as any).netlify_development_url);
                      }
                    }}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors cursor-pointer hover:shadow-sm"
                  >
                    Console
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (project.netlify_url) {
                      openUrl(project.netlify_url);
                    }
                  }}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer hover:shadow-sm"
                >
                  Live
                </button>
              </div>
            </div>
          )}

          {/* Vercel Status */}
          {project.vercel_url && (
            <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Vercel</span>
              </div>
              <div className="flex items-center space-x-2">
                {(project as any).vercel_development_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if ((project as any).vercel_development_url) {
                        openUrl((project as any).vercel_development_url);
                      }
                    }}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors cursor-pointer hover:shadow-sm"
                  >
                    Console
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (project.vercel_url) {
                      openUrl(project.vercel_url);
                    }
                  }}
                  className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors cursor-pointer hover:shadow-sm"
                >
                  Live
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Budget & Metrics */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Budget & Performance</h4>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <div className="font-bold text-red-600">{project.credits_used || 0}</div>
            <div className="text-red-700">Used</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="font-bold text-blue-600">{project.initial_budget_credits || 0}</div>
            <div className="text-blue-700">Budget</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="font-bold text-green-600">{project.credits_remaining || 0}</div>
            <div className="text-green-700">Left</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg">
            <div className="font-bold text-yellow-600">
              {project.initial_budget_credits ? Math.round(((project.credits_used || 0) / project.initial_budget_credits) * 100) : 0}%
            </div>
            <div className="text-yellow-700">Usage</div>
          </div>
        </div>
      </div>

      {/* Version Status */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h4>
        <div className="flex flex-wrap gap-1">
          <VersionStatusBadge project={project} platform="mocha" />
          <VersionStatusBadge project={project} platform="github" />
          <VersionStatusBadge project={project} platform="netlify" />
          <VersionStatusBadge project={project} platform="vercel" />
          <VersionStatusBadge project={project} platform="twilio" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Updated: {new Date(project.updated_at).toLocaleDateString()}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onDeleteProject(project.id, project.project_name)}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
            title="Delete Project"
          >
            Delete
          </button>
          <div className="text-xs text-purple-600 font-medium">
            Click icon to edit
          </div>
        </div>
      </div>
    </div>
  );
}

// Comprehensive Rating System Component
function ComprehensiveRatingSystem() {
  const [ratings, setRatings] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'platforms' | 'projects'>('platforms');
  const [showAddRating, setShowAddRating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  
  // Top 10 Platform Rating Criteria (researched from industry standards)
  const platformCriteria = [
    { id: 'ease_of_use', label: 'Ease of Use', weight: 4.5 },
    { id: 'code_quality', label: 'Code Quality Output', weight: 4.8 },
    { id: 'speed_efficiency', label: 'Speed & Efficiency', weight: 4.3 },
    { id: 'feature_completeness', label: 'Feature Completeness', weight: 4.6 },
    { id: 'documentation', label: 'Documentation Quality', weight: 4.0 },
    { id: 'community_support', label: 'Community & Support', weight: 3.8 },
    { id: 'pricing_value', label: 'Pricing & Value', weight: 4.4 },
    { id: 'reliability_uptime', label: 'Reliability & Uptime', weight: 4.7 },
    { id: 'learning_curve', label: 'Learning Curve', weight: 3.9 },
    { id: 'integration_capabilities', label: 'Integration Capabilities', weight: 4.2 }
  ];

  // Top 10 Project Rating Criteria (researched from software development standards)
  const projectCriteria = [
    { id: 'functionality', label: 'Functionality & Features', weight: 4.8 },
    { id: 'user_experience', label: 'User Experience Design', weight: 4.6 },
    { id: 'performance', label: 'Performance & Speed', weight: 4.5 },
    { id: 'code_maintainability', label: 'Code Maintainability', weight: 4.3 },
    { id: 'deployment_ease', label: 'Deployment & DevOps', weight: 4.2 },
    { id: 'scalability', label: 'Scalability Potential', weight: 4.4 },
    { id: 'security', label: 'Security Implementation', weight: 4.7 },
    { id: 'testing_coverage', label: 'Testing & Quality Assurance', weight: 4.1 },
    { id: 'documentation_project', label: 'Project Documentation', weight: 3.9 },
    { id: 'business_value', label: 'Business Value & ROI', weight: 4.0 }
  ];

  useEffect(() => {
    // Load comprehensive ratings from localStorage
    const savedRatings = localStorage.getItem('comprehensive-ratings');
    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    }

    // Fetch projects for project ratings
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const saveRatings = (newRatings: any) => {
    setRatings(newRatings);
    localStorage.setItem('comprehensive-ratings', JSON.stringify(newRatings));
  };

  const addRating = (item: any, type: 'platform' | 'project', criteriaScores: any, notes: string) => {
    const timestamp = Date.now();
    const ratingKey = type === 'platform' ? `platform_${item.id}` : `project_${item.id}`;
    
    const newRating = {
      id: timestamp,
      itemId: item.id,
      itemName: type === 'platform' ? item.name : item.project_name,
      type,
      timestamp,
      date: new Date().toLocaleDateString(),
      criteriaScores,
      notes,
      overallScore: Object.values(criteriaScores).reduce((sum: number, score: any) => sum + score, 0) / Object.keys(criteriaScores).length
    };

    const newRatings = { ...ratings };
    if (!newRatings[ratingKey]) {
      newRatings[ratingKey] = [];
    }
    newRatings[ratingKey].unshift(newRating);

    saveRatings(newRatings);
    setShowAddRating(false);
    setSelectedItem(null);
  };

  const deleteRating = (itemKey: string, ratingId: number) => {
    const newRatings = { ...ratings };
    newRatings[itemKey] = newRatings[itemKey].filter((r: any) => r.id !== ratingId);
    saveRatings(newRatings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Star className="w-6 h-6 mr-3 text-yellow-500" />
              Comprehensive Rating System
            </h3>
            <p className="text-gray-600 mt-1">Professional rating system with timestamped reviews and detailed criteria</p>
          </div>
          <button
            onClick={() => setShowAddRating(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rating</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('platforms')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'platforms'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            AI Platforms ({Object.keys(ratings).filter(k => k.startsWith('platform_')).length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'projects'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Projects ({Object.keys(ratings).filter(k => k.startsWith('project_')).length})
          </button>
        </div>
      </div>

      {/* Platform Ratings */}
      {activeTab === 'platforms' && (
        <div className="space-y-4">
          {AI_PLATFORMS.slice(0, -1).map((platform) => {
            const Icon = platform.icon;
            const platformRatings = ratings[`platform_${platform.id}`] || [];
            const avgScore = platformRatings.length > 0 
              ? platformRatings.reduce((sum: number, r: any) => sum + r.overallScore, 0) / platformRatings.length
              : 0;

            return (
              <div key={platform.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${getPlatformIconColor(platform.color)} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{platform.name}</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= avgScore ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {avgScore > 0 ? `${avgScore.toFixed(1)}/5` : 'Not rated'} ({platformRatings.length} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedItem(platform);
                      setShowAddRating(true);
                    }}
                    className="btn-secondary text-sm"
                  >
                    Add Review
                  </button>
                </div>

                {/* Recent Ratings */}
                {platformRatings.length > 0 && (
                  <div className="space-y-3">
                    {platformRatings.slice(0, 3).map((rating: any) => (
                      <div key={rating.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= rating.overallScore ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{rating.overallScore.toFixed(1)}/5</span>
                            <span className="text-xs text-gray-500">{rating.date}</span>
                          </div>
                          <button
                            onClick={() => deleteRating(`platform_${platform.id}`, rating.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                        {rating.notes && (
                          <p className="text-sm text-gray-700">{rating.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Project Ratings */}
      

        {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.map((project) => {
            const platform = AI_PLATFORMS.find(p => p.id === project.ai_platform) || AI_PLATFORMS[AI_PLATFORMS.length - 1];
            const Icon = platform.icon;
            const projectRatings = ratings[`project_${project.id}`] || [];
            const avgScore = projectRatings.length > 0 
              ? projectRatings.reduce((sum: number, r: any) => sum + r.overallScore, 0) / projectRatings.length
              : 0;

            return (
              <div key={project.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${getPlatformIconColor(platform.color)} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{project.project_name}</h4>
                      <p className="text-sm text-gray-600">{platform.name} • {project.project_type}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= avgScore ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {avgScore > 0 ? `${avgScore.toFixed(1)}/5` : 'Not rated'} ({projectRatings.length} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedItem(project);
                      setShowAddRating(true);
                    }}
                    className="btn-secondary text-sm"
                  >
                    Add Review
                  </button>
                </div>

                {/* Recent Ratings */}
                {projectRatings.length > 0 && (
                  <div className="space-y-3">
                    {projectRatings.slice(0, 3).map((rating: any) => (
                      <div key={rating.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= rating.overallScore ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{rating.overallScore.toFixed(1)}/5</span>
                            <span className="text-xs text-gray-500">{rating.date}</span>
                          </div>
                          <button
                            onClick={() => deleteRating(`project_${project.id}`, rating.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                        {rating.notes && (
                          <p className="text-sm text-gray-700">{rating.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Rating Modal */}
      {showAddRating && selectedItem && (
        <AddRatingModal
          item={selectedItem}
          type={activeTab === 'platforms' ? 'platform' : 'project'}
          criteria={activeTab === 'platforms' ? platformCriteria : projectCriteria}
          onSave={addRating}
          onClose={() => {
            setShowAddRating(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}

// Add Rating Modal Component
function AddRatingModal({ item, type, criteria, onSave, onClose }: {
  item: any;
  type: 'platform' | 'project';
  criteria: any[];
  onSave: (item: any, type: 'platform' | 'project', scores: any, notes: string) => void;
  onClose: () => void;
}) {
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState('');

  const updateScore = (criteriaId: string, score: number) => {
    setScores(prev => ({ ...prev, [criteriaId]: score }));
  };

  const handleSave = () => {
    if (Object.keys(scores).length === 0) {
      alert('Please rate at least one criteria');
      return;
    }
    onSave(item, type, scores, notes);
  };

  const platform = type === 'platform' ? item : AI_PLATFORMS.find(p => p.id === item.ai_platform);
  const Icon = platform?.icon || Star;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${getPlatformIconColor(platform?.color || 'gray')} rounded-lg flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Rate {type === 'platform' ? item.name : item.project_name}
              </h2>
              <p className="text-sm text-gray-600">
                {type === 'platform' ? 'AI Development Platform' : `${platform?.name} Project`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Rating Criteria ({type === 'platform' ? 'Industry Standard' : 'Software Quality'} Metrics)
          </h3>
          
          {criteria.map((criterion) => (
            <div key={criterion.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-900">{criterion.label}</span>
                  <span className="text-xs text-gray-500 ml-2">(Weight: {criterion.weight}/5.0)</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateScore(criterion.id, star)}
                      className={`w-6 h-6 ${
                        star <= (scores[criterion.id] || 0)
                          ? 'text-yellow-400 hover:text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-400'
                      } transition-colors`}
                    >
                      <Star className={`w-6 h-6 ${star <= (scores[criterion.id] || 0) ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {scores[criterion.id] || 0}/5
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes & Thoughts
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            rows={4}
            placeholder={`Share your detailed thoughts about ${type === 'platform' ? item.name : item.project_name}...`}
          />
        </div>

        <div className="flex space-x-3">
          <button onClick={handleSave} className="flex-1 btn-primary">
            Save Rating
          </button>
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalHandled, setEditModalHandled] = useState(false);
  const [showMigrationWizard, setShowMigrationWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [newProject, setNewProject] = useState({
    project_name: '',
    project_description: '',
    ai_platform: '',
    custom_platform_name: '',
    project_type: 'web',
    platform_url: '',
    github_repo_url: '',
    netlify_url: '',
    credits_used: 0,
    credits_remaining: 0,
    initial_budget_credits: 100
  });
  const [editProject, setEditProject] = useState({
    id: 0,
    project_name: '',
    project_description: '',
    ai_platform: '',
    project_type: 'web',
    platform_url: '',
    github_repo_url: '',
    netlify_url: '',
    vercel_url: '',
    status: 'planning',
    completion_percentage: 0,
    credits_used: 0,
    features_completed: '',
    features_pending: '',
    known_bugs: '',
    // Version Tracking Fields
    mocha_published_url: '',
    mocha_published_at: '',
    mocha_published_version: '',
    mocha_development_url: '',
    mocha_development_updated_at: '',
    github_pushed_at: '',
    github_commit_hash: '',
    github_branch: '',
    github_development_url: '',
    github_development_updated_at: '',
    netlify_deployed_at: '',
    netlify_deploy_id: '',
    netlify_domain: '',
    netlify_development_url: '',
    netlify_development_updated_at: '',
    vercel_deployed_at: '',
    vercel_deployment_id: '',
    vercel_development_url: '',
    vercel_development_updated_at: '',
    twilio_configured_at: '',
    twilio_phone_number: '',
    twilio_status: '',
    twilio_development_url: '',
    twilio_development_updated_at: '',
    custom_platform_1_name: '',
    custom_platform_1_url: '',
    custom_platform_1_deployed_at: '',
    custom_platform_1_version: '',
    custom_platform_1_development_url: '',
    custom_platform_1_development_updated_at: '',
    custom_platform_2_name: '',
    custom_platform_2_url: '',
    custom_platform_2_deployed_at: '',
    custom_platform_2_version: '',
    custom_platform_2_development_url: '',
    custom_platform_2_development_updated_at: '',
    custom_platform_3_name: '',
    custom_platform_3_url: '',
    custom_platform_3_deployed_at: '',
    custom_platform_3_version: '',
    custom_platform_3_development_url: '',
    custom_platform_3_development_updated_at: ''
  });

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Handle direct edit from dashboard or add action
  useEffect(() => {
    const editId = searchParams.get('edit');
    const action = searchParams.get('action');
    
    if (editId && projects.length > 0 && !editModalHandled) {
      // Clear URL parameter FIRST to prevent flash
      const url = new URL(window.location.href);
      url.searchParams.delete('edit');
      window.history.replaceState({}, '', url.toString());
      
      const projectToEdit = projects.find(p => p.id.toString() === editId);
      if (projectToEdit) {
        handleEditProject(projectToEdit);
        setEditModalHandled(true);
      }
    }
    
    if (action === 'add' && !showAddModal) {
      // Clear URL parameter and show add modal immediately
      const url = new URL(window.location.href);
      url.searchParams.delete('action');
      window.history.replaceState({}, '', url.toString());
      
      setShowAddModal(true);
    }
  }, [searchParams, projects, editModalHandled, showAddModal]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, filterPlatform, filterStatus]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects:', response.status);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPlatform !== 'all') {
      filtered = filtered.filter(project => project.ai_platform === filterPlatform);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    // Apply custom order from dashboard if available
    const savedOrder = localStorage.getItem(`dashboard-order-${user?.id}`);
    if (savedOrder) {
      const orderIds = JSON.parse(savedOrder);
      filtered.sort((a, b) => {
        const aIndex = orderIds.indexOf(a.id.toString());
        const bIndex = orderIds.indexOf(b.id.toString());
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    setFilteredProjects(filtered);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredProjects.findIndex(project => project.id.toString() === active.id);
      const newIndex = filteredProjects.findIndex(project => project.id.toString() === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedProjects = arrayMove(filteredProjects, oldIndex, newIndex);
        setFilteredProjects(reorderedProjects);
        
        // Save order to sync with dashboard
        const newOrder = reorderedProjects.map(p => p.id.toString());
        localStorage.setItem(`dashboard-order-${user?.id}`, JSON.stringify(newOrder));
      }
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.project_name || !newProject.ai_platform) {
      alert('Please fill in project name and AI platform');
      return;
    }

    const platformName = newProject.ai_platform === 'custom' 
      ? newProject.custom_platform_name 
      : newProject.ai_platform;

    if (!platformName) {
      alert('Please provide a platform name');
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newProject,
          ai_platform: platformName
        })
      });

      if (response.ok) {
        await fetchProjects();
        // FORCE CLOSE: Multiple methods to ensure modal closes
        forceCloseModal();
        // Success feedback
        setTimeout(() => {
          alert('Project created successfully!');
        }, 200);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to create project: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again.');
    }
  };

  const handleEditProject = (project: ProjectType) => {
    setEditProject({
      id: project.id,
      project_name: project.project_name,
      project_description: project.project_description || '',
      ai_platform: project.ai_platform,
      project_type: project.project_type,
      platform_url: project.platform_url || '',
      github_repo_url: project.github_repo_url || '',
      netlify_url: project.netlify_url || '',
      vercel_url: project.vercel_url || '',
      status: project.status,
      completion_percentage: project.completion_percentage,
      credits_used: project.credits_used,
      features_completed: project.features_completed || '',
      features_pending: project.features_pending || '',
      known_bugs: project.known_bugs || '',
      // Version Tracking Fields
      mocha_published_url: (project as any).mocha_published_url || '',
      mocha_published_at: (project as any).mocha_published_at || '',
      mocha_published_version: (project as any).mocha_published_version || '',
      mocha_development_url: (project as any).mocha_development_url || '',
      github_pushed_at: (project as any).github_pushed_at || '',
      github_commit_hash: (project as any).github_commit_hash || '',
      github_branch: (project as any).github_branch || '',
      netlify_deployed_at: (project as any).netlify_deployed_at || '',
      netlify_deploy_id: (project as any).netlify_deploy_id || '',
      netlify_domain: (project as any).netlify_domain || '',
      vercel_deployed_at: (project as any).vercel_deployed_at || '',
      vercel_deployment_id: (project as any).vercel_deployment_id || '',
      twilio_configured_at: (project as any).twilio_configured_at || '',
      twilio_phone_number: (project as any).twilio_phone_number || '',
      twilio_status: (project as any).twilio_status || '',
      custom_platform_1_name: (project as any).custom_platform_1_name || '',
      custom_platform_1_url: (project as any).custom_platform_1_url || '',
      custom_platform_1_deployed_at: (project as any).custom_platform_1_deployed_at || '',
      custom_platform_1_version: (project as any).custom_platform_1_version || '',
      custom_platform_2_name: (project as any).custom_platform_2_name || '',
      custom_platform_2_url: (project as any).custom_platform_2_url || '',
      custom_platform_2_deployed_at: (project as any).custom_platform_2_deployed_at || '',
      custom_platform_2_version: (project as any).custom_platform_2_version || '',
      custom_platform_3_name: (project as any).custom_platform_3_name || '',
      custom_platform_3_url: (project as any).custom_platform_3_url || '',
      custom_platform_3_deployed_at: (project as any).custom_platform_3_deployed_at || '',
      custom_platform_3_version: (project as any).custom_platform_3_version || '',
      // Development URLs with timestamps
      github_development_url: (project as any).github_development_url || '',
      github_development_updated_at: (project as any).github_development_updated_at || '',
      netlify_development_url: (project as any).netlify_development_url || '',
      netlify_development_updated_at: (project as any).netlify_development_updated_at || '',
      vercel_development_url: (project as any).vercel_development_url || '',
      vercel_development_updated_at: (project as any).vercel_development_updated_at || '',
      twilio_development_url: (project as any).twilio_development_url || '',
      twilio_development_updated_at: (project as any).twilio_development_updated_at || '',
      custom_platform_1_development_url: (project as any).custom_platform_1_development_url || '',
      custom_platform_1_development_updated_at: (project as any).custom_platform_1_development_updated_at || '',
      custom_platform_2_development_url: (project as any).custom_platform_2_development_url || '',
      custom_platform_2_development_updated_at: (project as any).custom_platform_2_development_updated_at || '',
      custom_platform_3_development_url: (project as any).custom_platform_3_development_url || '',
      custom_platform_3_development_updated_at: (project as any).custom_platform_3_development_updated_at || '',
      mocha_development_updated_at: (project as any).mocha_development_updated_at || ''
    });
    setEditModalHandled(false); // Reset this to ensure modal can show
    setShowEditModal(true);
  };

  const handleUpdateProject = async () => {
    try {
      const response = await fetch(`/api/projects/${editProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editProject)
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditModalHandled(false);
        await fetchProjects(); // Refresh the projects list
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to update project: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId: number, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchProjects();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to delete project: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project. Please try again.');
    }
  };

  // Reset form helper function
  const resetNewProjectForm = () => {
    setNewProject({
      project_name: '',
      project_description: '',
      ai_platform: '',
      custom_platform_name: '',
      project_type: 'web',
      platform_url: '',
      github_repo_url: '',
      netlify_url: '',
      credits_used: 0,
      credits_remaining: 0,
      initial_budget_credits: 100
    });
  };

  // ENHANCED: Force close modal with multiple fallback methods
  const forceCloseModal = () => {
    // Method 1: Direct state manipulation
    setShowAddModal(false);
    setShowEditModal(false);
    
    // Method 2: Reset all form states
    resetNewProjectForm();
    setEditModalHandled(false);
    
    // Method 3: Clear URL parameters
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    url.searchParams.delete('action');
    url.searchParams.delete('edit');
    if (url.toString() !== currentUrl) {
      window.history.replaceState({}, '', url.toString());
    }
    
    // Method 4: Force navigation as backup
    setTimeout(() => {
      if (window.location.pathname !== '/dashboard') {
        navigate('/dashboard', { replace: true });
      }
    }, 100);
    
    // Method 5: Force focus away from modal
    document.body.focus();
  };

  // ENHANCED: Multiple ways to close modal + keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      // Escape key OR Ctrl+W OR Alt+F4 - any common close shortcuts
      if (event.key === 'Escape' || 
          (event.ctrlKey && event.key === 'w') || 
          (event.altKey && event.key === 'F4')) {
        
        if (showAddModal || showEditModal) {
          event.preventDefault();
          event.stopPropagation();
          forceCloseModal();
        }
      }
    };

    // Global event listener to catch all modal close attempts
    if (showAddModal || showEditModal) {
      document.addEventListener('keydown', handleKeyboardShortcuts, true);
      
      // Additional safety: close modal if user tries to navigate away
      const handleBeforeUnload = () => {
        forceCloseModal();
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        document.removeEventListener('keydown', handleKeyboardShortcuts, true);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [showAddModal, showEditModal]);

  if (isPending || loading) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DevTracker Pro</h1>
            <p className="text-gray-600">Complete AI development project management with drag & drop reordering</p>
          </div>
          <div className="flex items-center space-x-3">
            {projects.length === 0 && (
              <button
                onClick={() => setShowMigrationWizard(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Import Projects</span>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Project</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'projects', name: 'Projects', icon: Database },
              { id: 'export-import', name: 'Export & Import', icon: Upload },
              { id: 'ratings', name: 'Comprehensive Ratings', icon: Star },
              { id: 'versions', name: 'Version History', icon: Clock },
              { id: 'budget', name: 'Smart Budget', icon: DollarSign },
              { id: 'credits', name: 'Smart Credits', icon: TrendingUp },
              { id: 'auto-deploy-fake', name: 'Auto Deploy (Fake)', icon: Rocket },
              { id: 'auto-deploy', name: 'Real Auto Deploy', icon: Rocket },
              { id: 'prompts', name: 'AI Prompts', icon: Brain },
              { id: 'deployment', name: 'Deploy Status', icon: Globe },
              { id: 'benchmark', name: 'Platform Compare', icon: BarChart3 },
              { id: 'templates', name: 'Templates', icon: Star },
              { id: 'time', name: 'Time Tracker', icon: Timer },
              { id: 'timeline', name: 'Timeline', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'projects' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Projects</p>
                    <p className="text-3xl font-bold">{projects.length}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Deployed</p>
                    <p className="text-3xl font-bold">{projects.filter(p => p.status === 'deployed').length}</p>
                  </div>
                  <Globe className="w-8 h-8 text-green-200" />
                </div>
              </div>

              <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">In Development</p>
                    <p className="text-3xl font-bold">{projects.filter(p => p.status === 'development').length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-200" />
                </div>
              </div>

              <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Need Attention</p>
                    <p className="text-3xl font-bold">{projects.filter(p => p.known_bugs && JSON.parse(p.known_bugs || '[]').length > 0).length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="text-sm text-purple-600 font-medium bg-purple-50 px-3 py-2 rounded-lg">
                    🖱️ DRAG & DROP: Click the drag handle (⋮⋮) and drag to reorder projects
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <select
                    value={filterPlatform}
                    onChange={(e) => setFilterPlatform(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Platforms</option>
                    {AI_PLATFORMS.map(platform => (
                      <option key={platform.id} value={platform.id}>{platform.name}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="deployed">Deployed</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="abandoned">Abandoned</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Projects Grid with Drag & Drop */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first AI development project</p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setShowMigrationWizard(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Existing Projects</span>
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Project</span>
                  </button>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={filteredProjects.map(p => p.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <SortableProjectCard
                        key={project.id}
                        project={project}
                        onEditProject={handleEditProject}
                        onDeleteProject={handleDeleteProject}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </>
        )}

        {/* Comprehensive Ratings Tab */}
        {activeTab === 'ratings' && <ComprehensiveRatingSystem />}

        {/* Version History Tab */}
        {activeTab === 'versions' && (
          <div className="space-y-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects for version tracking</h3>
                <p className="text-gray-600 mb-6">Create a project first to start tracking versions across all your platforms</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Project</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overview Stats for Version Tracking */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Mocha Published</p>
                        <p className="text-3xl font-bold">
                          {projects.filter(p => (p as any).mocha_published_at).length}
                        </p>
                      </div>
                      <Brain className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>

                  <div className="card bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-100 text-sm font-medium">GitHub Pushed</p>
                        <p className="text-3xl font-bold">
                          {projects.filter(p => (p as any).github_pushed_at).length}
                        </p>
                      </div>
                      <GitBranch className="w-8 h-8 text-gray-200" />
                    </div>
                  </div>

                  <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Netlify Deployed</p>
                        <p className="text-3xl font-bold">
                          {projects.filter(p => (p as any).netlify_deployed_at).length}
                        </p>
                      </div>
                      <Globe className="w-8 h-8 text-green-200" />
                    </div>
                  </div>

                  <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">Twilio Configured</p>
                        <p className="text-3xl font-bold">
                          {projects.filter(p => (p as any).twilio_configured_at).length}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-200" />
                    </div>
                  </div>
                </div>

                {/* Deployment Insights */}
                <DeploymentInsights projects={projects} />

                {/* Quick Actions */}
                <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">Version Tracking Made Simple</h3>
                      <p className="text-purple-700">Automatically track when you publish to Mocha, push to GitHub, deploy to Netlify, and configure other platforms.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setActiveTab('projects')}
                        className="btn-secondary"
                      >
                        Edit Projects
                      </button>
                    </div>
                  </div>
                </div>

                {/* Individual Project Version History */}
                <div className="grid grid-cols-1 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="card">
                      <ProjectVersionHistory 
                        projectId={project.id} 
                        projectName={project.project_name}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Smart Budget Tab */}
        {activeTab === 'budget' && (
          <SmartBudgetTracker 
            projects={projects} 
          />
        )}

        {/* AI Prompts Tab */}
        {activeTab === 'prompts' && (
          <AIPromptLibrary />
        )}

        {/* Auto Deploy Tab */}
        {activeTab === 'deployment' && (
          <AutoDeploymentDetector 
            projects={projects}
            onProjectUpdate={handleUpdateProject}
          />
        )}

        {/* Platform Benchmark Tab */}
        {activeTab === 'benchmark' && (
          <CrossPlatformBenchmark projects={projects} />
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <TemplateMarketplace />
        )}

        {/* Time Tracker Tab */}
        {activeTab === 'time' && (
          <TimeToDeployTracker 
            projects={projects}
            onProjectUpdate={handleUpdateProject}
          />
        )}

        {/* Export & Import Tab */}
        {activeTab === 'export-import' && (
          <ProjectExportImport onImportComplete={fetchProjects} />
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <DeploymentTimeline projects={projects} />
        )}

        {/* Smart Credits Tracker Tab */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            <SmartCreditsTracker />
          </div>
        )}

        {/* Fake Auto-Deployment System Tab */}
        {activeTab === 'auto-deploy-fake' && (
          <AutoDeploymentSystem 
            projects={projects}
            onProjectUpdate={fetchProjects}
          />
        )}

        {/* Real Auto-Deployment System Tab */}
        {activeTab === 'auto-deploy' && (
          <RealAutoDeployment 
            projects={projects}
            onProjectUpdate={fetchProjects}
          />
        )}

        {/* Add Project Modal */}
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              // Backdrop click to close
              if (e.target === e.currentTarget) {
                e.preventDefault();
                e.stopPropagation();
                forceCloseModal();
              }
            }}
            onTouchStart={(e) => {
              // Touch support for mobile
              if (e.target === e.currentTarget) {
                forceCloseModal();
              }
            }}
          >
            <div 
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => {
                // Prevent modal from closing when clicking inside
                e.stopPropagation();
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New AI Project</h2>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    forceCloseModal();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    forceCloseModal();
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors text-2xl font-bold hover:bg-red-100 rounded-full w-10 h-10 flex items-center justify-center border-2 border-red-300 hover:border-red-500"
                  title="❌ CLOSE MODAL"
                >
                  ❌
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProject.project_name}
                    onChange={(e) => setNewProject(prev => ({...prev, project_name: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="My Amazing App"
                  />
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProject.project_description}
                    onChange={(e) => setNewProject(prev => ({...prev, project_description: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={3}
                    placeholder="What does this project do?"
                  />
                </div>

                {/* AI Platform */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Platform *
                  </label>
                  <select
                    value={newProject.ai_platform}
                    onChange={(e) => setNewProject(prev => ({...prev, ai_platform: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select AI Platform</option>
                    {AI_PLATFORMS.map(platform => (
                      <option key={platform.id} value={platform.id}>{platform.name}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Platform Name */}
                {newProject.ai_platform === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Platform Name *
                    </label>
                    <input
                      type="text"
                      value={newProject.custom_platform_name}
                      onChange={(e) => setNewProject(prev => ({...prev, custom_platform_name: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter platform name"
                    />
                  </div>
                )}

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <select
                    value={newProject.project_type}
                    onChange={(e) => setNewProject(prev => ({...prev, project_type: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="medical">Medical App</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS Tool</option>
                    <option value="web">Web App</option>
                    <option value="mobile">Mobile App</option>
                    <option value="ai">AI Tool</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Platform URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Platform Project URL
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="url"
                      value={newProject.platform_url}
                      onChange={(e) => setNewProject(prev => ({...prev, platform_url: e.target.value}))}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${newProject.platform_url ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-300'}`}
                      placeholder="https://mocha.app/projects/123"
                    />
                    {newProject.platform_url && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(newProject.platform_url.trim(), '_blank', 'noopener,noreferrer');
                        }}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors border border-purple-300 flex-shrink-0"
                        title="🔗 Click to open URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* GitHub URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Repository URL
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="url"
                      value={newProject.github_repo_url}
                      onChange={(e) => setNewProject(prev => ({...prev, github_repo_url: e.target.value}))}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${newProject.github_repo_url ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-300'}`}
                      placeholder="https://github.com/username/repo"
                    />
                    {newProject.github_repo_url && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(newProject.github_repo_url.trim(), '_blank', 'noopener,noreferrer');
                        }}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 flex-shrink-0"
                        title="🔗 Click to open URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Netlify URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Netlify Deployment URL
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="url"
                      value={newProject.netlify_url}
                      onChange={(e) => setNewProject(prev => ({...prev, netlify_url: e.target.value}))}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${newProject.netlify_url ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300'}`}
                      placeholder="https://your-app.netlify.app"
                    />
                    {newProject.netlify_url && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(newProject.netlify_url.trim(), '_blank', 'noopener,noreferrer');
                        }}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors border border-green-300 flex-shrink-0"
                        title="🔗 Click to open URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Smart Credits System */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credits Remaining
                    </label>
                    <input
                      type="number"
                      value={newProject.credits_remaining || ''}
                      onChange={(e) => {
                        const remaining = parseInt(e.target.value) || 0;
                        const total = newProject.initial_budget_credits || 0;
                        const used = Math.max(0, total - remaining);
                        setNewProject(prev => ({
                          ...prev, 
                          credits_remaining: remaining,
                          credits_used: used
                        }));
                      }}
                      className="w-full px-3 py-2 border border-green-300 bg-green-50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Credits left"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credits Used (Auto-Calculated)
                    </label>
                    <input
                      type="number"
                      value={newProject.credits_used}
                      onChange={(e) => {
                        const used = parseInt(e.target.value) || 0;
                        const total = newProject.initial_budget_credits || 0;
                        const remaining = Math.max(0, total - used);
                        setNewProject(prev => ({
                          ...prev, 
                          credits_used: used,
                          credits_remaining: remaining
                        }));
                      }}
                      className="w-full px-3 py-2 border border-red-300 bg-red-50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                
                {/* Initial Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Budget (Total Credits)
                  </label>
                  <input
                    type="number"
                    value={newProject.initial_budget_credits || ''}
                    onChange={(e) => {
                      const total = parseInt(e.target.value) || 0;
                      const used = newProject.credits_used || 0;
                      const remaining = Math.max(0, total - used);
                      setNewProject(prev => ({
                        ...prev, 
                        initial_budget_credits: total,
                        credits_remaining: remaining
                      }));
                    }}
                    className="w-full px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Total credits available"
                    min="0"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreateProject();
                    }}
                    className="flex-1 btn-primary"
                  >
                    Create Project
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      forceCloseModal();
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      forceCloseModal();
                    }}
                    className="flex-1 bg-red-100 text-red-800 border-2 border-red-400 rounded-lg px-4 py-3 hover:bg-red-200 focus:bg-red-200 transition-colors font-bold"
                  >
                    ❌ CANCEL & CLOSE MODAL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Project URL Health Check & Editor</h2>
              
              {/* URL Health Checker - Shows Best URL at Top */}
              <div className="mb-6">
                <UrlHealthChecker project={projects.find(p => p.id === editProject.id) || {} as ProjectType} />
              </div>
              
              <div className="space-y-6">
                {/* Basic Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                    <input
                      type="text"
                      value={editProject.project_name}
                      onChange={(e) => setEditProject(prev => ({...prev, project_name: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credits Used</label>
                    <input
                      type="number"
                      min="0"
                      value={editProject.credits_used}
                      onChange={(e) => setEditProject(prev => ({...prev, credits_used: parseInt(e.target.value) || 0}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editProject.project_description}
                    onChange={(e) => setEditProject(prev => ({...prev, project_description: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editProject.status}
                      onChange={(e) => setEditProject(prev => ({...prev, status: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="planning">Planning</option>
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                      <option value="deployed">Deployed</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="abandoned">Abandoned</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Completion (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editProject.completion_percentage}
                      onChange={(e) => setEditProject(prev => ({...prev, completion_percentage: parseInt(e.target.value) || 0}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Mocha Publishing Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-blue-900 mb-3 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-blue-600" />
                    Mocha Publishing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <SmartUrlInput
                      value={editProject.mocha_development_url}
                      onChange={(value) => setEditProject(prev => ({...prev, mocha_development_url: value}))}
                      placeholder="https://getmocha.com/apps/123?chat=open"
                      label="Development URL"
                      colorName="blue"
                      timestamp={editProject.mocha_development_updated_at}
                      platformName="Mocha"
                    />
                    <SmartUrlInput
                      value={editProject.mocha_published_url}
                      onChange={(value) => setEditProject(prev => ({...prev, mocha_published_url: value}))}
                      placeholder="https://abc123.mocha.app"
                      label="Published URL"
                      colorName="blue"
                      timestamp={editProject.mocha_published_at}
                      platformName="Mocha"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Development Updated</label>
                      <input
                        type="datetime-local"
                        value={editProject.mocha_development_updated_at}
                        onChange={(e) => setEditProject(prev => ({...prev, mocha_development_updated_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Published Date & Time</label>
                      <input
                        type="datetime-local"
                        value={editProject.mocha_published_at}
                        onChange={(e) => setEditProject(prev => ({...prev, mocha_published_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Version</label>
                      <input
                        type="text"
                        value={editProject.mocha_published_version}
                        onChange={(e) => setEditProject(prev => ({...prev, mocha_published_version: e.target.value}))}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                        placeholder="v1.0.0"
                      />
                    </div>
                  </div>
                </div>

                {/* GitHub Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <GitBranch className="w-5 h-5 mr-2 text-gray-600" />
                    GitHub Repository
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <SmartUrlInput
                      value={editProject.github_development_url}
                      onChange={(value) => setEditProject(prev => ({...prev, github_development_url: value}))}
                      placeholder="https://github.com/user/repo/tree/dev"
                      label="Development URL"
                      colorName="gray"
                      timestamp={editProject.github_development_updated_at}
                      platformName="GitHub"
                    />
                    <SmartUrlInput
                      value={editProject.github_repo_url}
                      onChange={(value) => setEditProject(prev => ({...prev, github_repo_url: value}))}
                      placeholder="https://github.com/user/repo"
                      label="Repository URL"
                      colorName="gray"
                      timestamp={editProject.github_pushed_at}
                      platformName="GitHub"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Development Updated</label>
                      <input
                        type="datetime-local"
                        value={editProject.github_development_updated_at}
                        onChange={(e) => setEditProject(prev => ({...prev, github_development_updated_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Pushed</label>
                      <input
                        type="datetime-local"
                        value={editProject.github_pushed_at}
                        onChange={(e) => setEditProject(prev => ({...prev, github_pushed_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                      <input
                        type="text"
                        value={editProject.github_branch}
                        onChange={(e) => setEditProject(prev => ({...prev, github_branch: e.target.value}))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-500"
                        placeholder="main"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commit Hash</label>
                    <input
                      type="text"
                      value={editProject.github_commit_hash}
                      onChange={(e) => setEditProject(prev => ({...prev, github_commit_hash: e.target.value}))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-500"
                      placeholder="a1b2c3d4e5f6..."
                    />
                  </div>
                </div>

                {/* Netlify Section */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-green-900 mb-3 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-green-600" />
                    Netlify Deployment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <SmartUrlInput
                      value={editProject.netlify_development_url}
                      onChange={(value) => setEditProject(prev => ({...prev, netlify_development_url: value}))}
                      placeholder="https://app.netlify.com/sites/myapp"
                      label="Development URL"
                      colorName="green"
                      timestamp={editProject.netlify_development_updated_at}
                      platformName="Netlify"
                    />
                    <SmartUrlInput
                      value={editProject.netlify_url}
                      onChange={(value) => setEditProject(prev => ({...prev, netlify_url: value}))}
                      placeholder="https://app.netlify.app"
                      label="Live URL"
                      colorName="green"
                      timestamp={editProject.netlify_deployed_at}
                      platformName="Netlify"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Development Updated</label>
                      <input
                        type="datetime-local"
                        value={editProject.netlify_development_updated_at}
                        onChange={(e) => setEditProject(prev => ({...prev, netlify_development_updated_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Deployed At</label>
                      <input
                        type="datetime-local"
                        value={editProject.netlify_deployed_at}
                        onChange={(e) => setEditProject(prev => ({...prev, netlify_deployed_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Domain Name</label>
                      <input
                        type="text"
                        value={editProject.netlify_domain}
                        onChange={(e) => setEditProject(prev => ({...prev, netlify_domain: e.target.value}))}
                        className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                        placeholder="myapp.netlify.app"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-green-700 mb-1">Deploy ID</label>
                    <input
                      type="text"
                      value={editProject.netlify_deploy_id}
                      onChange={(e) => setEditProject(prev => ({...prev, netlify_deploy_id: e.target.value}))}
                      className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                      placeholder="6123456789abcdef"
                    />
                  </div>
                </div>

                {/* Vercel Section */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-purple-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-600" />
                    Vercel Deployment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <SmartUrlInput
                      value={editProject.vercel_development_url}
                      onChange={(value) => setEditProject(prev => ({...prev, vercel_development_url: value}))}
                      placeholder="https://vercel.com/username/project"
                      label="Development URL"
                      colorName="purple"
                      timestamp={editProject.vercel_development_updated_at}
                      platformName="Vercel"
                    />
                    <SmartUrlInput
                      value={editProject.vercel_url}
                      onChange={(value) => setEditProject(prev => ({...prev, vercel_url: value}))}
                      placeholder="https://app.vercel.app"
                      label="Live URL"
                      colorName="purple"
                      timestamp={editProject.vercel_deployed_at}
                      platformName="Vercel"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Development Updated</label>
                      <input
                        type="datetime-local"
                        value={editProject.vercel_development_updated_at}
                        onChange={(e) => setEditProject(prev => ({...prev, vercel_development_updated_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-purple-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Deployed At</label>
                      <input
                        type="datetime-local"
                        value={editProject.vercel_deployed_at}
                        onChange={(e) => setEditProject(prev => ({...prev, vercel_deployed_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-purple-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-purple-700 mb-1">Deployment ID</label>
                    <input
                      type="text"
                      value={editProject.vercel_deployment_id}
                      onChange={(e) => setEditProject(prev => ({...prev, vercel_deployment_id: e.target.value}))}
                      className="w-full px-2 py-1 border border-purple-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                      placeholder="dpl_xyz123..."
                    />
                  </div>
                </div>

                {/* Twilio Section */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-red-900 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Twilio Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                    <UrlInput
                      value={editProject.twilio_development_url}
                      onChange={(value) => setEditProject(prev => ({...prev, twilio_development_url: value}))}
                      placeholder="https://console.twilio.com/project"
                      label="Development URL"
                      colorName="red"
                    />
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Development Updated</label>
                      <input
                        type="datetime-local"
                        value={editProject.twilio_development_updated_at}
                        onChange={(e) => setEditProject(prev => ({...prev, twilio_development_updated_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-red-300 rounded text-sm focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={editProject.twilio_phone_number}
                        onChange={(e) => setEditProject(prev => ({...prev, twilio_phone_number: e.target.value}))}
                        className="w-full px-2 py-1 border border-red-300 rounded text-sm focus:ring-1 focus:ring-red-500"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Configured At</label>
                      <input
                        type="datetime-local"
                        value={editProject.twilio_configured_at}
                        onChange={(e) => setEditProject(prev => ({...prev, twilio_configured_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-red-300 rounded text-sm focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Status</label>
                      <select
                        value={editProject.twilio_status}
                        onChange={(e) => setEditProject(prev => ({...prev, twilio_status: e.target.value}))}
                        className="w-full px-2 py-1 border border-red-300 rounded text-sm focus:ring-1 focus:ring-red-500"
                      >
                        <option value="">Select Status</option>
                        <option value="not_configured">Not Configured</option>
                        <option value="configured">Configured</option>
                        <option value="active">Active</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUpdateProject();
                    }}
                    className="flex-1 btn-primary"
                  >
                    Update Project
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Clear states immediately, no delays
                      setShowEditModal(false);
                      setEditModalHandled(false);
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel & Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Migration Wizard */}
        {showMigrationWizard && (
          <ProjectMigrationWizard
            onComplete={() => {
              setShowMigrationWizard(false);
              fetchProjects();
            }}
            onClose={() => setShowMigrationWizard(false)}
          />
        )}
      </div>
    </Layout>
  );
}
