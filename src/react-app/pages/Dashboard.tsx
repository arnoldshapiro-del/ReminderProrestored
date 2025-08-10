import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import Layout from "@/react-app/components/Layout";
import { 
  Brain,
  Database,
  Globe,
  Clock,
  Plus,
  Search,
  Edit,
  DollarSign,
  BarChart3,
  ChevronRight,
  Grid3X3,
  List,
  Zap,
  Heart,
  ExternalLink,
  GitBranch,
  AlertTriangle,
  Move
} from "lucide-react";
import type { DashboardStatsType, ProjectType } from "@/shared/types";
import VersionStatusBadge from "@/react-app/components/VersionStatusBadge";
import QuickLinkDropdown from "@/react-app/components/QuickLinkDropdown";
import SmartUrlInput from "@/react-app/components/SmartUrlInput";
import UrlHealthChecker from "@/react-app/components/UrlHealthChecker";

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
      setTimeout(() => {
        window.open(value.trim(), '_blank', 'noopener,noreferrer');
      }, 10);
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

// Import comprehensive edit modal from Projects page
// We'll reuse the same comprehensive modal interface

const AI_PLATFORMS = [
  { id: 'mocha', name: 'Mocha', color: 'blue', icon: Brain },
  { id: 'lovable', name: 'Lovable', color: 'pink', icon: Heart },
  { id: 'bolt', name: 'Bolt', color: 'yellow', icon: Zap },
  { id: 'cursor', name: 'Cursor', color: 'slate', icon: Edit },
  { id: 'claude', name: 'Claude', color: 'orange', icon: Brain },
];

const STATUS_COLORS = {
  planning: 'bg-gray-100 text-gray-800',
  development: 'bg-blue-100 text-blue-800',
  testing: 'bg-yellow-100 text-yellow-800',
  deployed: 'bg-green-100 text-green-800',
  maintenance: 'bg-purple-100 text-purple-800',
  abandoned: 'bg-red-100 text-red-800'
};

// Helper function to get muted icon colors (less intense, supporting role)
const getPlatformIconColor = (platformColor: string) => {
  switch (platformColor) {
    case 'blue': return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
    case 'pink': return 'bg-pink-100 text-pink-600 hover:bg-pink-200';
    case 'yellow': return 'bg-amber-100 text-amber-600 hover:bg-amber-200';
    case 'indigo': return 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200';
    case 'red': return 'bg-red-100 text-red-600 hover:bg-red-200';
    case 'teal': return 'bg-teal-100 text-teal-600 hover:bg-teal-200';
    case 'purple': return 'bg-purple-100 text-purple-600 hover:bg-purple-200';
    case 'green': return 'bg-green-100 text-green-600 hover:bg-green-200';
    case 'slate': return 'bg-slate-100 text-slate-600 hover:bg-slate-200';
    case 'orange': return 'bg-orange-100 text-orange-600 hover:bg-orange-200';
    case 'cyan': return 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200';
    case 'violet': return 'bg-violet-100 text-violet-600 hover:bg-violet-200';
    case 'emerald': return 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200';
    case 'rose': return 'bg-rose-100 text-rose-600 hover:bg-rose-200';
    default: return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  }
};

// Helper function for platform name styling (subtle, secondary)
const getPlatformNameStyle = () => {
  return 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded';
};

// Helper function to open URL with anti-flash delay
const openUrl = (url: string) => {
  if (url && url.trim() !== '') {
    setTimeout(() => {
      window.open(url.trim(), '_blank', 'noopener,noreferrer');
    }, 10);
  }
};

interface SortableProjectCardProps {
  project: ProjectType;
  onEditProject: (project: ProjectType) => void;
  viewMode: 'grid' | 'list';
}

function SortableProjectCard({ project, onEditProject, viewMode }: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: project.id.toString()});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const platform = AI_PLATFORMS.find(p => p.id === project.ai_platform) || { id: 'custom', name: project.ai_platform, color: 'gray', icon: Brain };
  const PlatformIcon = platform.icon;
  const platformIconColor = getPlatformIconColor(platform.color);

  if (viewMode === 'list') {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes}
        className={`flex items-center space-x-4 p-3 bg-white border border-gray-200 rounded-lg transition-all group ${
          isDragging 
            ? 'shadow-2xl scale-105 border-purple-400 bg-purple-50 rotate-2' 
            : 'hover:shadow-sm hover:border-purple-200'
        }`}
      >
        <div 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          title="Drag to reorder projects"
        >
          <Move className="w-5 h-5 text-gray-400" />
        </div>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEditProject(project);
          }}
          className={`w-10 h-10 ${platformIconColor} rounded-lg flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer hover:shadow-sm`}
          title="Click to edit project"
        >
          <PlatformIcon className="w-5 h-5" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors text-base">
              {project.project_name}
            </h3>
            <span className={`${getPlatformNameStyle()}`}>
              {platform.name}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}`}>
              {project.status}
            </span>
          </div>
          {project.project_description && (
            <p className="text-sm text-gray-600 truncate mt-1 leading-tight">
              {project.project_description}
            </p>
          )}
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full"
                  style={{ width: `${project.completion_percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{project.completion_percentage}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <VersionStatusBadge project={project} platform="mocha" />
          <VersionStatusBadge project={project} platform="github" />
          <VersionStatusBadge project={project} platform="netlify" />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEditProject(project);
            }}
            className="px-2 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium flex items-center space-x-1"
            title="Edit Project Details"
          >
            <Edit className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <QuickLinkDropdown project={project} />
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-sm font-medium text-gray-900">{project.credits_used || 0}</p>
          <p className="text-xs text-gray-500">credits</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes}
      className={`bg-white border border-gray-200 rounded-lg p-4 transition-all group ${
        isDragging 
          ? 'shadow-2xl rotate-2 scale-105 border-purple-300 bg-purple-50 z-50' 
          : 'hover:shadow-md hover:border-purple-200'
      }`}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-between mb-3">
        <div 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          title="🖱️ Click and drag to reorder projects"
        >
          <Move className="w-4 h-4 text-gray-400 hover:text-purple-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className={`${getPlatformNameStyle()}`}>
            {platform.name}
          </span>
          <QuickLinkDropdown project={project} />
          <span className={`px-2 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1 ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}`}>
            <span>{project.status}</span>
          </span>
        </div>
      </div>

      {/* Project Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEditProject(project);
            }}
            className={`w-10 h-10 ${platformIconColor} rounded-lg flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer shadow-sm hover:shadow-md`}
            title="Click to edit project"
          >
            <PlatformIcon className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-purple-600 transition-colors leading-tight">
              {project.project_name}
            </h3>
            {project.project_description && (
              <p className="text-sm text-gray-600 truncate mt-1 leading-relaxed">
                {project.project_description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{project.completion_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${project.completion_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Enhanced Platform Status with Clickable Links */}
      <div className="mb-3">
        <div className="space-y-1">
          {/* Mocha Status */}
          {((project as any).mocha_development_url || (project as any).mocha_published_url) && (
            <div className="flex items-center justify-between p-1.5 bg-blue-50 rounded">
              <div className="flex items-center space-x-1">
                <Brain className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-900">Mocha</span>
              </div>
              <div className="flex items-center space-x-1">
                {(project as any).mocha_development_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if ((project as any).mocha_development_url) {
                        openUrl((project as any).mocha_development_url);
                      }
                    }}
                    className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors cursor-pointer hover:shadow-sm flex items-center space-x-1"
                  >
                    <span>Dev</span>
                    <ExternalLink className="w-2 h-2" />
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
                    className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer hover:shadow-sm flex items-center space-x-1"
                  >
                    <span>Live</span>
                    <ExternalLink className="w-2 h-2" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* GitHub Status */}
          {(project.github_repo_url || (project as any).github_development_url) && (
            <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
              <div className="flex items-center space-x-1">
                <Brain className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-900">GitHub</span>
              </div>
              <div className="flex items-center space-x-1">
                {(project as any).github_development_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if ((project as any).github_development_url) {
                        openUrl((project as any).github_development_url);
                      }
                    }}
                    className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 transition-colors cursor-pointer hover:shadow-sm flex items-center space-x-1"
                  >
                    <span>Dev</span>
                    <ExternalLink className="w-2 h-2" />
                  </button>
                )}
                {project.github_repo_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (project.github_repo_url) {
                        openUrl(project.github_repo_url);
                      }
                    }}
                    className="px-1.5 py-0.5 bg-gray-700 text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer hover:shadow-sm flex items-center space-x-1"
                  >
                    <span>Repo</span>
                    <ExternalLink className="w-2 h-2" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Netlify Status */}
          {(project.netlify_url || (project as any).netlify_development_url) && (
            <div className="flex items-center justify-between p-1.5 bg-green-50 rounded">
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-900">Netlify</span>
              </div>
              <div className="flex items-center space-x-1">
                {(project as any).netlify_development_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if ((project as any).netlify_development_url) {
                        openUrl((project as any).netlify_development_url);
                      }
                    }}
                    className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors cursor-pointer hover:shadow-sm flex items-center space-x-1"
                  >
                    <span>Console</span>
                    <ExternalLink className="w-2 h-2" />
                  </button>
                )}
                {project.netlify_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (project.netlify_url) {
                        openUrl(project.netlify_url);
                      }
                    }}
                    className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer hover:shadow-sm flex items-center space-x-1"
                  >
                    <span>Live</span>
                    <ExternalLink className="w-2 h-2" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Vercel Status */}
          {(project.vercel_url || (project as any).vercel_development_url) && (
            <div className="flex items-center justify-between p-1.5 bg-purple-50 rounded">
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-medium text-purple-900">Vercel</span>
              </div>
              <div className="flex items-center space-x-1">
                {(project as any).vercel_development_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if ((project as any).vercel_development_url) {
                        openUrl((project as any).vercel_development_url);
                      }
                    }}
                    className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors cursor-pointer hover:shadow-sm flex items-center space-x-1"
                  >
                    <span>Console</span>
                    <ExternalLink className="w-2 h-2" />
                  </button>
                )}
                {project.vercel_url && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (project.vercel_url) {
                        openUrl(project.vercel_url);
                      }
                    }}
                    className="px-1.5 py-0.5 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors cursor-pointer hover:shadow-sm flex items-center space-x-1"
                  >
                    <span>Live</span>
                    <ExternalLink className="w-2 h-2" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version Status */}
      <div className="flex flex-wrap gap-1 mb-3">
        <VersionStatusBadge project={project} platform="mocha" />
        <VersionStatusBadge project={project} platform="github" />
        <VersionStatusBadge project={project} platform="netlify" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="text-left">
          <p className="text-xs text-gray-500">
            {project.credits_used || 0} credits used
          </p>
          <p className="text-xs text-gray-400">
            {new Date(project.updated_at).toLocaleDateString()}
          </p>
        </div>
        
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const [stats, setStats] = useState<DashboardStatsType>({
    totalProjects: 0,
    activeProjects: 0,
    deployedProjects: 0,
    totalCreditsUsed: 0,
    averageProjectCompletion: 0,
    mostUsedPlatform: '',
    projectsNeedingAttention: 0,
    recentActivity: []
  });
  
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectType[]>([]);
  const [projectOrder, setProjectOrder] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
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
      fetchDashboardData();
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, filterStatus, sortBy]);

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        
        // Load saved order or initialize with current order
        const savedOrder = localStorage.getItem(`dashboard-order-${user?.id}`);
        if (savedOrder) {
          const orderIds = JSON.parse(savedOrder);
          setProjectOrder(orderIds);
        } else {
          setProjectOrder(data.map((p: ProjectType) => p.id.toString()));
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.ai_platform.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.project_name.localeCompare(b.project_name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'completion':
          return b.completion_percentage - a.completion_percentage;
        case 'credits':
          return b.credits_used - a.credits_used;
        case 'platform':
          return a.ai_platform.localeCompare(b.ai_platform);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: // updated_at
          // Apply custom order if no other sorting is applied
          if (projectOrder.length > 0) {
            filtered.sort((a, b) => {
              const aIndex = projectOrder.indexOf(a.id.toString());
              const bIndex = projectOrder.indexOf(b.id.toString());
              if (aIndex === -1) return 1;
              if (bIndex === -1) return -1;
              return aIndex - bIndex;
            });
            return 0; // Don't sort again
          }
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    setFilteredProjects(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getPaginatedProjects = () => {
    let orderedProjects = [...filteredProjects];
    
    // Apply custom order if we have one and no other sorting
    if (projectOrder.length > 0 && sortBy === 'updated_at') {
      orderedProjects.sort((a, b) => {
        const aIndex = projectOrder.indexOf(a.id.toString());
        const bIndex = projectOrder.indexOf(b.id.toString());
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return orderedProjects.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const paginatedProjects = getPaginatedProjects();
      const oldIndex = paginatedProjects.findIndex(project => project.id.toString() === active.id);
      const newIndex = paginatedProjects.findIndex(project => project.id.toString() === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update the order for the paginated projects
        arrayMove(paginatedProjects, oldIndex, newIndex);
        
        // Update the global project order
        const newProjectOrder = [...projectOrder];
        
        // Remove the moved project from its current position
        const movedProjectIndex = newProjectOrder.findIndex(id => id === active.id);
        if (movedProjectIndex !== -1) {
          newProjectOrder.splice(movedProjectIndex, 1);
        }
        
        // Insert it at the new position
        const targetIndex = newProjectOrder.findIndex(id => id === over.id);
        if (targetIndex !== -1) {
          newProjectOrder.splice(targetIndex, 0, active.id.toString());
        } else {
          newProjectOrder.push(active.id.toString());
        }
        
        setProjectOrder(newProjectOrder);
        localStorage.setItem(`dashboard-order-${user?.id}`, JSON.stringify(newProjectOrder));
        
        // Update filtered projects to reflect new order immediately
        filterAndSortProjects();
      }
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

  

  if (isPending || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.google_user_data?.name?.split(' ')[0] || 'Developer'}
            </h1>
            <p className="text-gray-600">
              {stats.totalProjects} projects • {stats.activeProjects} active • {stats.deployedProjects} deployed
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/projects?action=add')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Projects</p>
                <p className="text-xl font-bold">{stats.totalProjects}</p>
              </div>
              <Database className="w-6 h-6 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Deployed</p>
                <p className="text-xl font-bold">{stats.deployedProjects}</p>
              </div>
              <Globe className="w-6 h-6 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Active</p>
                <p className="text-xl font-bold">{stats.activeProjects}</p>
              </div>
              <Clock className="w-6 h-6 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium">Credits Used</p>
                <p className="text-xl font-bold">{stats.totalCreditsUsed}</p>
              </div>
              <DollarSign className="w-6 h-6 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
              {filteredProjects.length !== projects.length && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {filteredProjects.length} of {projects.length}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => navigate('/projects')}
                className="btn-secondary text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm w-64"
                />
              </div>
              
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="development">Development</option>
                <option value="testing">Testing</option>
                <option value="deployed">Deployed</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="updated_at">Recently Updated</option>
                <option value="created_at">Recently Created</option>
                <option value="name">Name A-Z</option>
                <option value="completion">Completion %</option>
                <option value="status">Status</option>
                <option value="platform">Platform</option>
                <option value="credits">Credits Used</option>
              </select>
            </div>
          </div>

          {/* Projects Grid/List */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No projects match your filters' : 'No projects yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first AI development project'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => navigate('/projects?action=add')}
                  className="btn-primary"
                >
                  Create First Project
                </button>
              )}
            </div>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={getPaginatedProjects().map(p => p.id.toString())}
                  strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
                >
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {getPaginatedProjects().map((project) => (
                        <SortableProjectCard
                          key={project.id}
                          project={project}
                          onEditProject={handleEditProject}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getPaginatedProjects().map((project) => (
                        <SortableProjectCard
                          key={project.id}
                          project={project}
                          onEditProject={handleEditProject}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  )}
                </SortableContext>
              </DndContext>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="flex items-center justify-center space-x-4 pt-4">
          <button
            onClick={() => navigate('/projects')}
            className="btn-secondary flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>Manage All Projects</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="btn-secondary flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Analytics</span>
          </button>
        </div>

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">AI Platform</label>
                    <select
                      value={editProject.ai_platform}
                      onChange={(e) => setEditProject(prev => ({...prev, ai_platform: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select AI Platform</option>
                      <option value="mocha">Mocha</option>
                      <option value="lovable">Lovable</option>
                      <option value="bolt">Bolt</option>
                      <option value="emergent">Emergent</option>
                      <option value="genspark">GenSpark</option>
                      <option value="google-opal">Google Opal</option>
                      <option value="google-gemini">Google Gemini</option>
                      <option value="chatgpt-5">ChatGPT 5</option>
                      <option value="cursor">Cursor</option>
                      <option value="claude">Claude</option>
                      <option value="replit">Replit</option>
                      <option value="abacus-ai">Abacus AI</option>
                      <option value="manus">Manus</option>
                      <option value="minimax">Minimax</option>
                      <option value="custom">Custom Platform</option>
                    </select>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                    <select
                      value={editProject.project_type}
                      onChange={(e) => setEditProject(prev => ({...prev, project_type: e.target.value}))}
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

                {/* Features & Tracking */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features Completed (JSON)</label>
                    <textarea
                      value={editProject.features_completed}
                      onChange={(e) => setEditProject(prev => ({...prev, features_completed: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                      placeholder='["Login", "Dashboard", "Settings"]'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features Pending (JSON)</label>
                    <textarea
                      value={editProject.features_pending}
                      onChange={(e) => setEditProject(prev => ({...prev, features_pending: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                      placeholder='["Analytics", "Reports", "Export"]'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Known Bugs (JSON)</label>
                    <textarea
                      value={editProject.known_bugs}
                      onChange={(e) => setEditProject(prev => ({...prev, known_bugs: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                      placeholder='["Mobile layout issue", "API timeout"]'
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

                {/* Custom Platform 1 Section */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-indigo-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                    Custom Platform 1
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <SmartUrlInput
                      value={editProject.custom_platform_1_development_url}
                      onChange={(value) => setEditProject(prev => ({...prev, custom_platform_1_development_url: value}))}
                      placeholder="https://platform1.com/console"
                      label="Development URL"
                      colorName="indigo"
                      timestamp={editProject.custom_platform_1_development_updated_at}
                      platformName="Custom Platform 1"
                    />
                    <SmartUrlInput
                      value={editProject.custom_platform_1_url}
                      onChange={(value) => setEditProject(prev => ({...prev, custom_platform_1_url: value}))}
                      placeholder="https://app.platform1.com"
                      label="Live URL"
                      colorName="indigo"
                      timestamp={editProject.custom_platform_1_deployed_at}
                      platformName="Custom Platform 1"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-indigo-700 mb-1">Platform Name</label>
                      <input
                        type="text"
                        value={editProject.custom_platform_1_name}
                        onChange={(e) => setEditProject(prev => ({...prev, custom_platform_1_name: e.target.value}))}
                        className="w-full px-2 py-1 border border-indigo-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                        placeholder="Platform Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-700 mb-1">Deployed At</label>
                      <input
                        type="datetime-local"
                        value={editProject.custom_platform_1_deployed_at}
                        onChange={(e) => setEditProject(prev => ({...prev, custom_platform_1_deployed_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-indigo-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-700 mb-1">Version</label>
                      <input
                        type="text"
                        value={editProject.custom_platform_1_version}
                        onChange={(e) => setEditProject(prev => ({...prev, custom_platform_1_version: e.target.value}))}
                        className="w-full px-2 py-1 border border-indigo-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                        placeholder="v1.0.0"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-indigo-700 mb-1">Development Updated</label>
                    <input
                      type="datetime-local"
                      value={editProject.custom_platform_1_development_updated_at}
                      onChange={(e) => setEditProject(prev => ({...prev, custom_platform_1_development_updated_at: e.target.value}))}
                      className="w-full px-2 py-1 border border-indigo-300 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Custom Platform 2 Section */}
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-teal-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-teal-600" />
                    Custom Platform 2
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <SmartUrlInput
                      value={editProject.custom_platform_2_development_url}
                      onChange={(value) => setEditProject(prev => ({...prev, custom_platform_2_development_url: value}))}
                      placeholder="https://platform2.com/console"
                      label="Development URL"
                      colorName="teal"
                      timestamp={editProject.custom_platform_2_development_updated_at}
                      platformName="Custom Platform 2"
                    />
                    <SmartUrlInput
                      value={editProject.custom_platform_2_url}
                      onChange={(value) => setEditProject(prev => ({...prev, custom_platform_2_url: value}))}
                      placeholder="https://app.platform2.com"
                      label="Live URL"
                      colorName="teal"
                      timestamp={editProject.custom_platform_2_deployed_at}
                      platformName="Custom Platform 2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-teal-700 mb-1">Platform Name</label>
                      <input
                        type="text"
                        value={editProject.custom_platform_2_name}
                        onChange={(e) => setEditProject(prev => ({...prev, custom_platform_2_name: e.target.value}))}
                        className="w-full px-2 py-1 border border-teal-300 rounded text-sm focus:ring-1 focus:ring-teal-500"
                        placeholder="Platform Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teal-700 mb-1">Deployed At</label>
                      <input
                        type="datetime-local"
                        value={editProject.custom_platform_2_deployed_at}
                        onChange={(e) => setEditProject(prev => ({...prev, custom_platform_2_deployed_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-teal-300 rounded text-sm focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teal-700 mb-1">Version</label>
                      <input
                        type="text"
                        value={editProject.custom_platform_2_version}
                        onChange={(e) => setEditProject(prev => ({...prev, custom_platform_2_version: e.target.value}))}
                        className="w-full px-2 py-1 border border-teal-300 rounded text-sm focus:ring-1 focus:ring-teal-500"
                        placeholder="v1.0.0"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-teal-700 mb-1">Development Updated</label>
                    <input
                      type="datetime-local"
                      value={editProject.custom_platform_2_development_updated_at}
                      onChange={(e) => setEditProject(prev => ({...prev, custom_platform_2_development_updated_at: e.target.value}))}
                      className="w-full px-2 py-1 border border-teal-300 rounded text-sm focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Custom Platform 3 Section */}
                <div className="bg-rose-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-rose-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-rose-600" />
                    Custom Platform 3
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <SmartUrlInput
                      value={editProject.custom_platform_3_development_url}
                      onChange={(value) => setEditProject(prev => ({...prev, custom_platform_3_development_url: value}))}
                      placeholder="https://platform3.com/console"
                      label="Development URL"
                      colorName="rose"
                      timestamp={editProject.custom_platform_3_development_updated_at}
                      platformName="Custom Platform 3"
                    />
                    <SmartUrlInput
                      value={editProject.custom_platform_3_url}
                      onChange={(value) => setEditProject(prev => ({...prev, custom_platform_3_url: value}))}
                      placeholder="https://app.platform3.com"
                      label="Live URL"
                      colorName="rose"
                      timestamp={editProject.custom_platform_3_deployed_at}
                      platformName="Custom Platform 3"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-rose-700 mb-1">Platform Name</label>
                      <input
                        type="text"
                        value={editProject.custom_platform_3_name}
                        onChange={(e) => setEditProject(prev => ({...prev, custom_platform_3_name: e.target.value}))}
                        className="w-full px-2 py-1 border border-rose-300 rounded text-sm focus:ring-1 focus:ring-rose-500"
                        placeholder="Platform Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-rose-700 mb-1">Deployed At</label>
                      <input
                        type="datetime-local"
                        value={editProject.custom_platform_3_deployed_at}
                        onChange={(e) => setEditProject(prev => ({...prev, custom_platform_3_deployed_at: e.target.value}))}
                        className="w-full px-2 py-1 border border-rose-300 rounded text-sm focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-rose-700 mb-1">Version</label>
                      <input
                        type="text"
                        value={editProject.custom_platform_3_version}
                        onChange={(e) => setEditProject(prev => ({...prev, custom_platform_3_version: e.target.value}))}
                        className="w-full px-2 py-1 border border-rose-300 rounded text-sm focus:ring-1 focus:ring-rose-500"
                        placeholder="v1.0.0"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-rose-700 mb-1">Development Updated</label>
                    <input
                      type="datetime-local"
                      value={editProject.custom_platform_3_development_updated_at}
                      onChange={(e) => setEditProject(prev => ({...prev, custom_platform_3_development_updated_at: e.target.value}))}
                      className="w-full px-2 py-1 border border-rose-300 rounded text-sm focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={handleUpdateProject}
                    className="flex-1 btn-primary"
                  >
                    Update Project
                  </button>
                  <button 
                    onClick={() => setShowEditModal(false)}
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
    </Layout>
  );
}
