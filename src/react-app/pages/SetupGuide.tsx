import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import ProjectMigrationWizard from "@/react-app/components/ProjectMigrationWizard";
import { 
  Rocket,
  CheckCircle,
  ArrowRight,
  Database,
  Brain,
  Globe,
  BarChart3,
  Settings,
  Zap,
  Plus,
  FileText,
  Lightbulb,
  Target,
  TrendingUp,
  Timer,
  Star
} from "lucide-react";

const SETUP_STEPS = [
  {
    id: 'import',
    title: 'Import Your Projects',
    description: 'Get all your existing AI projects into DevTracker Pro',
    icon: Database,
    color: 'blue',
    estimatedTime: '5 min'
  },
  {
    id: 'platforms',
    title: 'Connect Platforms',
    description: 'Link your GitHub, Netlify, and AI platform accounts',
    icon: Globe,
    color: 'green',
    estimatedTime: '3 min'
  },
  {
    id: 'customize',
    title: 'Customize Dashboard',
    description: 'Set up your workspace and preferences',
    icon: Settings,
    color: 'purple',
    estimatedTime: '2 min'
  },
  {
    id: 'explore',
    title: 'Explore Features',
    description: 'Discover advanced tracking and analytics',
    icon: BarChart3,
    color: 'orange',
    estimatedTime: '5 min'
  }
];

const PRODUCTIVITY_FEATURES = [
  {
    title: 'Credit Usage Analytics',
    description: 'Track spending across all AI platforms and optimize your budget',
    icon: TrendingUp,
    benefit: 'Save 30-50% on AI costs'
  },
  {
    title: 'Deployment Pipeline Tracking',
    description: 'Monitor GitHub → Netlify → Production workflows automatically',
    icon: Rocket,
    benefit: 'Reduce deployment issues by 80%'
  },
  {
    title: 'Cross-Platform Project Comparison',
    description: 'Compare how the same project performs on different AI platforms',
    icon: Brain,
    benefit: 'Choose the best platform every time'
  },
  {
    title: 'Time-to-Deploy Optimization',
    description: 'Track development speed and identify bottlenecks',
    icon: Timer,
    benefit: 'Ship projects 2x faster'
  },
  {
    title: 'Bug & Feature Tracking',
    description: 'Manage issues across all projects in one centralized system',
    icon: Target,
    benefit: 'Never lose track of important tasks'
  },
  {
    title: 'Performance Benchmarking',
    description: 'Compare your projects against industry standards',
    icon: Star,
    benefit: 'Build better, faster projects'
  }
];

export default function SetupGuide() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [currentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showMigrationWizard, setShowMigrationWizard] = useState(false);
  const [projects, setProjects] = useState([]);

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

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        
        // Auto-complete import step if they have projects
        if (data.length > 0 && !completedSteps.includes('import')) {
          setCompletedSteps(prev => [...prev, 'import']);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const getProgressPercentage = () => {
    return Math.round((completedSteps.length / SETUP_STEPS.length) * 100);
  };

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
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome to DevTracker Pro! 🚀
              </h1>
              <p className="text-purple-100 text-lg mb-4">
                Let's get you set up in less than 15 minutes
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  <span className="font-semibold">{getProgressPercentage()}% Complete</span>
                </div>
                <div className="w-32 bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Rocket className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Projects Imported</p>
                  <p className="text-3xl font-bold">{projects.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Setup Progress</p>
                  <p className="text-3xl font-bold">{getProgressPercentage()}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Time Saved</p>
                  <p className="text-3xl font-bold">∞</p>
                </div>
                <Timer className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>
        )}

        {/* Setup Steps */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <Rocket className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Setup Checklist</h2>
          </div>

          <div className="space-y-4">
            {SETUP_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStep && !isCompleted;
              
              return (
                <div 
                  key={step.id}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    isCompleted 
                      ? 'border-green-300 bg-green-50' 
                      : isCurrent 
                        ? 'border-purple-300 bg-purple-50' 
                        : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCompleted ? 'bg-green-500' : `bg-${step.color}-500`
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <StepIcon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                        <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {step.id === 'import' && !isCompleted && (
                        <button
                          onClick={() => setShowMigrationWizard(true)}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Start Import</span>
                        </button>
                      )}
                      
                      {step.id === 'platforms' && !isCompleted && (
                        <button
                          onClick={() => navigate('/settings')}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Connect</span>
                        </button>
                      )}
                      
                      {step.id === 'customize' && !isCompleted && (
                        <button
                          onClick={() => {
                            navigate('/dashboard');
                            markStepComplete('customize');
                          }}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Customize</span>
                        </button>
                      )}
                      
                      {step.id === 'explore' && !isCompleted && (
                        <button
                          onClick={() => {
                            navigate('/analytics');
                            markStepComplete('explore');
                          }}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Explore</span>
                        </button>
                      )}

                      {isCompleted && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Productivity Features */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">What You'll Achieve</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTIVITY_FEATURES.map((feature, index) => {
              const FeatureIcon = feature.icon;
              
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <FeatureIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                  <div className="text-xs font-medium text-green-600">
                    💡 {feature.benefit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-gradient-to-r from-gray-50 to-purple-50 border-dashed border-2 border-purple-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ready to Track Everything?</h3>
                <p className="text-gray-600">
                  {completedSteps.length === SETUP_STEPS.length 
                    ? "You're all set up! Start managing your AI development projects."
                    : `Complete ${SETUP_STEPS.length - completedSteps.length} more steps to unlock full productivity.`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {completedSteps.length === SETUP_STEPS.length ? (
                <button
                  onClick={() => navigate('/projects')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Go to Projects</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowMigrationWizard(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Continue Setup</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* External Resources */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Helpful Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/deployment"
              className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Deployment Guide</h3>
                <p className="text-blue-700 text-sm">Step-by-step deployment to Netlify</p>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </a>

            <a
              href="/ai-comparison"
              className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
            >
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">AI Platform Comparison</h3>
                <p className="text-purple-700 text-sm">Find the best AI tool for your needs</p>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </a>
          </div>
        </div>

        {/* Migration Wizard */}
        {showMigrationWizard && (
          <ProjectMigrationWizard
            onComplete={() => {
              setShowMigrationWizard(false);
              markStepComplete('import');
              fetchProjects();
            }}
            onClose={() => setShowMigrationWizard(false)}
          />
        )}
      </div>
    </Layout>
  );
}
