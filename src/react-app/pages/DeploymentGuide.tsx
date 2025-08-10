import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  Rocket,
  Globe,
  GitBranch,
  Cloud,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Code,
  Zap,
  FileText,
  Lightbulb,
  AlertCircle,
  Clock
} from "lucide-react";

const DEPLOYMENT_PLATFORMS = [
  {
    id: 'netlify',
    name: 'Netlify',
    icon: Globe,
    color: 'teal',
    difficulty: 'Beginner',
    timeEstimate: '5-10 minutes',
    description: 'Perfect for static sites and React apps with automatic CI/CD',
    pros: ['Free tier available', 'Automatic deploys from GitHub', 'Custom domains', 'Built-in forms'],
    cons: ['Limited server-side functionality', 'Function execution limits'],
    bestFor: ['Frontend apps', 'Static sites', 'Jamstack projects']
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: Zap,
    color: 'black',
    difficulty: 'Beginner',
    timeEstimate: '5-10 minutes',
    description: 'Optimized for Next.js and modern web frameworks',
    pros: ['Excellent performance', 'Edge functions', 'Preview deployments', 'Built-in analytics'],
    cons: ['Can be expensive at scale', 'Primarily Next.js focused'],
    bestFor: ['Next.js apps', 'Performance-critical sites', 'Edge computing']
  },
  {
    id: 'github-pages',
    name: 'GitHub Pages',
    icon: GitBranch,
    color: 'gray',
    difficulty: 'Beginner',
    timeEstimate: '10-15 minutes',
    description: 'Free hosting directly from your GitHub repository',
    pros: ['Completely free', 'Integrated with GitHub', 'Custom domains', 'HTTPS included'],
    cons: ['Static sites only', 'Limited bandwidth', 'Public repos only (free tier)'],
    bestFor: ['Documentation sites', 'Portfolio sites', 'Open source projects']
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Pages',
    icon: Cloud,
    color: 'orange',
    difficulty: 'Intermediate',
    timeEstimate: '15-20 minutes',
    description: 'Global edge deployment with Cloudflare Workers integration',
    pros: ['Global CDN', 'Unlimited bandwidth', 'Workers integration', 'Great performance'],
    cons: ['Learning curve for Workers', 'Complex configuration options'],
    bestFor: ['Global applications', 'Edge computing', 'High-traffic sites']
  }
];

const DEPLOYMENT_STEPS = {
  netlify: [
    {
      title: 'Build Your Project',
      description: 'Ensure your project builds successfully locally',
      code: 'npm run build',
      explanation: 'This creates a production-ready build in the dist/ folder'
    },
    {
      title: 'Push to GitHub',
      description: 'Make sure your code is pushed to a GitHub repository',
      code: 'git add .\ngit commit -m "Ready for deployment"\ngit push origin main',
      explanation: 'Netlify will pull from this repository for automatic deployments'
    },
    {
      title: 'Connect to Netlify',
      description: 'Link your GitHub repository to Netlify',
      explanation: '1. Go to netlify.com and sign up\n2. Click "Add new site" → "Import existing project"\n3. Choose GitHub and authorize\n4. Select your repository'
    },
    {
      title: 'Configure Build Settings',
      description: 'Set up your build configuration',
      explanation: 'Build command: npm run build\nPublish directory: dist\nNode version: 18'
    },
    {
      title: 'Deploy',
      description: 'Netlify will automatically build and deploy your site',
      explanation: 'Your site will be available at a netlify.app subdomain within minutes'
    }
  ],
  vercel: [
    {
      title: 'Install Vercel CLI',
      description: 'Install the Vercel command line interface',
      code: 'npm install -g vercel',
      explanation: 'This allows you to deploy directly from your terminal'
    },
    {
      title: 'Build and Test',
      description: 'Ensure your project builds successfully',
      code: 'npm run build',
      explanation: 'Fix any build errors before deploying'
    },
    {
      title: 'Deploy with CLI',
      description: 'Deploy your project using Vercel CLI',
      code: 'vercel',
      explanation: 'Follow the prompts to configure your deployment'
    },
    {
      title: 'Set Up Git Integration',
      description: 'Connect your GitHub repository for automatic deployments',
      explanation: 'Go to vercel.com dashboard and import your GitHub project for automatic deployments'
    }
  ]
};

export default function DeploymentGuide() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState('netlify');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCode, setShowCode] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  const toggleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepIndex) 
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const toggleShowCode = (stepIndex: number) => {
    setShowCode(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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

  const selectedPlatformData = DEPLOYMENT_PLATFORMS.find(p => p.id === selectedPlatform);
  const steps = DEPLOYMENT_STEPS[selectedPlatform as keyof typeof DEPLOYMENT_STEPS] || [];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Deployment Guide</h1>
              <p className="text-blue-100">
                Step-by-step instructions to deploy your AI projects to production
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Rocket className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Start Tips</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Always test your build locally first with <code className="bg-gray-100 px-1 rounded">npm run build</code></li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Keep sensitive data in environment variables, not in your code</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Use a custom domain for professional projects</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Set up automatic deployments from your main branch</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Deployment Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEPLOYMENT_PLATFORMS.map((platform) => {
              const PlatformIcon = platform.icon;
              const isSelected = selectedPlatform === platform.id;
              
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 bg-${platform.color}-500 rounded-xl flex items-center justify-center`}>
                      <PlatformIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(platform.difficulty)}`}>
                        {platform.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{platform.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {platform.timeEstimate}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Platform Details */}
        {selectedPlatformData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Step-by-Step Instructions */}
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <selectedPlatformData.icon className="w-8 h-8 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Deploy to {selectedPlatformData.name}
                  </h2>
                </div>

                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div 
                      key={index}
                      className={`p-4 border rounded-xl transition-all ${
                        completedSteps.includes(index) 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <button
                            onClick={() => toggleStepComplete(index)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                              completedSteps.includes(index)
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300 hover:border-purple-500'
                            }`}
                          >
                            {completedSteps.includes(index) && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Step {index + 1}: {step.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                            <div className="text-sm text-gray-700 whitespace-pre-line">
                              {step.explanation}
                            </div>
                          </div>
                        </div>
                        {step.code && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => toggleShowCode(index)}
                              className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                              title="Show code"
                            >
                              <Code className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {step.code && showCode[index] && (
                        <div className="mt-4 p-3 bg-gray-900 rounded-lg relative">
                          <button
                            onClick={() => copyToClipboard(step.code)}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <pre className="text-green-400 text-sm overflow-x-auto">
                            <code>{step.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Next Steps</h4>
                      <p className="text-blue-700 text-sm">
                        Once deployed, test your app thoroughly and set up monitoring. 
                        Consider setting up a custom domain and SSL certificate for production use.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Platform Info */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Platform Overview</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Pros</h4>
                    <ul className="space-y-1">
                      {selectedPlatformData.pros.map((pro, index) => (
                        <li key={index} className="flex items-center text-sm text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Considerations</h4>
                    <ul className="space-y-1">
                      {selectedPlatformData.cons.map((con, index) => (
                        <li key={index} className="flex items-center text-sm text-yellow-700">
                          <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Best For</h4>
                    <ul className="space-y-1">
                      {selectedPlatformData.bestFor.map((use, index) => (
                        <li key={index} className="flex items-center text-sm text-blue-700">
                          <Zap className="w-4 h-4 mr-2 text-blue-500" />
                          {use}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Common Issues</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 text-sm mb-1">Build Fails</h4>
                    <p className="text-red-700 text-xs">
                      Check your build command and ensure all dependencies are listed in package.json
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 text-sm mb-1">404 Errors</h4>
                    <p className="text-yellow-700 text-xs">
                      Add a _redirects file for client-side routing: /* /index.html 200
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 text-sm mb-1">Environment Variables</h4>
                    <p className="text-blue-700 text-xs">
                      Set up environment variables in your platform's dashboard, not in your code
                    </p>
                  </div>
                </div>
              </div>

              {/* External Resources */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Helpful Resources</h3>
                <div className="space-y-2">
                  <a
                    href={`https://${selectedPlatform === 'github-pages' ? 'pages.github.com' : selectedPlatform + '.com'}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Official Documentation</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://web.dev/deployment/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Web.dev Deployment Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Summary */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Deployment Progress</h3>
              <p className="text-gray-600 text-sm">
                {completedSteps.length} of {steps.length} steps completed
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {Math.round((completedSteps.length / steps.length) * 100)}%
              </span>
              {completedSteps.length === steps.length && (
                <button
                  onClick={() => navigate('/projects')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Add to Projects</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
