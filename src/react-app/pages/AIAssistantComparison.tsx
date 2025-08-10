import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  Brain,
  Star,
  TrendingUp,
  CheckCircle,
  Plus,
  ExternalLink,
  Heart,
  Database,
  Edit,
  Zap
} from "lucide-react";

const AI_PLATFORMS = [
  {
    id: 'mocha',
    name: 'Mocha',
    url: 'https://getmocha.com',
    icon: Brain,
    color: 'blue',
    pricing: 'Credits ($0.01/msg)',
    strengths: ['Medical apps', 'Full-stack', 'Deployment ready', 'Professional UI'],
    weaknesses: ['Learning curve', 'Credit usage can add up'],
    bestFor: ['Production apps', 'Healthcare', 'Business apps'],
    rating: 9.2,
    speed: 8.5,
    quality: 9.5,
    ease: 7.5,
    credits: 4.2
  },
  {
    id: 'lovable',
    name: 'Lovable',
    url: 'https://lovable.dev',
    icon: Heart,
    color: 'pink',
    pricing: 'Credits',
    strengths: ['Visual design', 'Modern UI', 'Component library', 'Fast iteration'],
    weaknesses: ['Limited backend', 'Newer platform'],
    bestFor: ['UI/UX focused apps', 'Landing pages', 'Design systems'],
    rating: 8.3,
    speed: 8.5,
    quality: 8.5,
    ease: 8.0,
    credits: 7.0
  },
  {
    id: 'bolt',
    name: 'Bolt (StackBlitz)',
    url: 'https://bolt.new',
    icon: Zap,
    color: 'yellow',
    pricing: 'Subscription ($20/mo)',
    strengths: ['Very fast', 'Great for prototypes', 'Instant preview', 'React focus'],
    weaknesses: ['Limited backend', 'Deployment challenges'],
    bestFor: ['Frontend prototypes', 'React apps', 'Quick MVPs'],
    rating: 8.7,
    speed: 9.5,
    quality: 8.0,
    ease: 9.0,
    credits: 7.8
  },
  {
    id: 'emergent',
    name: 'Emergent',
    url: 'https://emergent.ai',
    icon: Zap,
    color: 'indigo',
    pricing: 'Subscription',
    strengths: ['AI-first approach', 'Automation focus', 'Smart workflows'],
    weaknesses: ['Limited documentation', 'Niche platform'],
    bestFor: ['AI workflows', 'Automation', 'Experiments'],
    rating: 7.8,
    speed: 8.0,
    quality: 8.0,
    ease: 7.0,
    credits: 7.5
  },
  {
    id: 'genspark',
    name: 'GenSpark',
    url: 'https://genspark.ai',
    icon: Zap,
    color: 'red',
    pricing: 'Credits',
    strengths: ['Fast generation', 'Good for MVPs', 'Multi-language support'],
    weaknesses: ['Limited customization', 'Quality varies'],
    bestFor: ['Quick prototypes', 'Multi-language apps', 'MVPs'],
    rating: 7.6,
    speed: 9.0,
    quality: 7.5,
    ease: 8.5,
    credits: 7.2
  },
  {
    id: 'google-opal',
    name: 'Google Opal',
    url: 'https://opal.google.com',
    icon: Brain,
    color: 'teal',
    pricing: 'Free + Pro',
    strengths: ['Google integration', 'Enterprise features', 'Security focus'],
    weaknesses: ['Early beta', 'Limited availability'],
    bestFor: ['Enterprise apps', 'Google workspace integration', 'Security-critical apps'],
    rating: 8.1,
    speed: 7.8,
    quality: 8.5,
    ease: 7.2,
    credits: 8.2
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini',
    url: 'https://gemini.google.com',
    icon: Brain,
    color: 'purple',
    pricing: 'Free + Pro ($20/mo)',
    strengths: ['Multimodal capabilities', 'Google services integration', 'Large context'],
    weaknesses: ['No built-in deployment', 'Requires setup'],
    bestFor: ['Complex analysis', 'Multimodal apps', 'Google ecosystem'],
    rating: 8.4,
    speed: 8.2,
    quality: 8.8,
    ease: 7.8,
    credits: 7.9
  },
  {
    id: 'chatgpt-5',
    name: 'ChatGPT 5',
    url: 'https://chat.openai.com',
    icon: Brain,
    color: 'green',
    pricing: 'Pro ($30/mo)',
    strengths: ['Advanced reasoning', 'Excellent code generation', 'Wide knowledge'],
    weaknesses: ['No built-in deployment', 'Requires manual setup'],
    bestFor: ['Complex logic', 'Code optimization', 'Problem solving'],
    rating: 8.9,
    speed: 8.5,
    quality: 9.1,
    ease: 8.8,
    credits: 7.1
  },
  {
    id: 'cursor',
    name: 'Cursor',
    url: 'https://cursor.sh',
    icon: Edit,
    color: 'slate',
    pricing: 'Subscription ($20/mo)',
    strengths: ['Local development', 'VS Code integration', 'Code completion'],
    weaknesses: ['Setup required', 'Technical expertise needed'],
    bestFor: ['Developers', 'Complex apps', 'Code editing'],
    rating: 8.9,
    speed: 8.0,
    quality: 9.0,
    ease: 6.5,
    credits: 8.5
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    url: 'https://claude.ai',
    icon: Brain,
    color: 'orange',
    pricing: 'Subscription ($20/mo)',
    strengths: ['Excellent reasoning', 'Long context', 'Safe outputs'],
    weaknesses: ['No built-in deployment', 'Requires manual setup'],
    bestFor: ['Planning', 'Complex logic', 'Documentation'],
    rating: 8.8,
    speed: 7.5,
    quality: 9.2,
    ease: 8.0,
    credits: 8.0
  },
  {
    id: 'replit',
    name: 'Replit',
    url: 'https://replit.com',
    icon: Database,
    color: 'cyan',
    pricing: 'Free + Pro ($7/mo)',
    strengths: ['Cloud IDE', 'Collaboration', 'Hosting included'],
    weaknesses: ['Performance limits', 'Limited AI features'],
    bestFor: ['Learning', 'Collaboration', 'Simple apps'],
    rating: 7.5,
    speed: 7.0,
    quality: 7.5,
    ease: 8.5,
    credits: 8.0
  },
  {
    id: 'abacus-ai',
    name: 'Abacus AI',
    url: 'https://abacus.ai',
    icon: Brain,
    color: 'violet',
    pricing: 'Enterprise',
    strengths: ['Enterprise ML', 'Data analysis', 'Custom models'],
    weaknesses: ['Complex setup', 'Enterprise focused'],
    bestFor: ['Data science', 'ML pipelines', 'Enterprise'],
    rating: 8.0,
    speed: 7.2,
    quality: 8.5,
    ease: 6.8,
    credits: 7.5
  },
  {
    id: 'manus',
    name: 'Manus',
    url: 'https://manus.ai',
    icon: Brain,
    color: 'emerald',
    pricing: 'Credits',
    strengths: ['Document processing', 'AI automation', 'Workflow integration'],
    weaknesses: ['Specialized use cases', 'Learning curve'],
    bestFor: ['Document workflows', 'Automation', 'Data processing'],
    rating: 7.7,
    speed: 7.8,
    quality: 8.0,
    ease: 7.3,
    credits: 7.8
  },
  {
    id: 'minimax',
    name: 'Minimax',
    url: 'https://minimax.chat',
    icon: Brain,
    color: 'rose',
    pricing: 'Free + Pro',
    strengths: ['Creative content', 'Storytelling', 'Character generation'],
    weaknesses: ['Limited to creative tasks', 'Not for complex apps'],
    bestFor: ['Creative projects', 'Content generation', 'Storytelling'],
    rating: 7.4,
    speed: 8.3,
    quality: 7.8,
    ease: 8.7,
    credits: 8.1
  }
];

export default function AIAssistantComparison() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  const categories = [
    { id: 'all', name: 'All Platforms' },
    { id: 'beginner', name: 'Beginner Friendly' },
    { id: 'professional', name: 'Professional Use' },
    { id: 'prototype', name: 'Rapid Prototyping' },
    { id: 'deployment', name: 'Full Deployment' }
  ];

  const getFilteredPlatforms = () => {
    let filtered = [...AI_PLATFORMS];

    if (selectedCategory === 'beginner') {
      filtered = filtered.filter(p => p.ease >= 8.0);
    } else if (selectedCategory === 'professional') {
      filtered = filtered.filter(p => p.quality >= 8.5);
    } else if (selectedCategory === 'prototype') {
      filtered = filtered.filter(p => p.speed >= 8.5);
    } else if (selectedCategory === 'deployment') {
      filtered = filtered.filter(p => ['mocha', 'bolt', 'cursor'].includes(p.id));
    }

    // Sort platforms
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'speed') return b.speed - a.speed;
      if (sortBy === 'quality') return b.quality - a.quality;
      if (sortBy === 'ease') return b.ease - a.ease;
      if (sortBy === 'credits') return b.credits - a.credits;
      return 0;
    });

    return filtered;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return 'text-green-600';
    if (rating >= 8) return 'text-blue-600';
    if (rating >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBar = (score: number, color: string) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
        style={{ width: `${(score / 10) * 100}%` }}
      ></div>
    </div>
  );

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
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">AI Platform Comparison</h1>
              <p className="text-purple-100">
                Find the perfect AI assistant for your specific project needs
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Brain className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-900">For Beginners</h3>
            </div>
            <p className="text-green-700 text-sm mb-3">Easy to use, great for learning</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Bolt</span>
                <span className="text-xs text-green-600">(Easiest)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">ChatGPT</span>
                <span className="text-xs text-green-600">(Most familiar)</span>
              </div>
            </div>
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900">For Speed</h3>
            </div>
            <p className="text-blue-700 text-sm mb-3">Fast prototyping and iteration</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Bolt</span>
                <span className="text-xs text-blue-600">(Instant preview)</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Lovable</span>
                <span className="text-xs text-blue-600">(Visual design)</span>
              </div>
            </div>
          </div>

          <div className="card bg-purple-50 border-purple-200">
            <div className="flex items-center space-x-3 mb-3">
              <Star className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-purple-900">For Production</h3>
            </div>
            <p className="text-purple-700 text-sm mb-3">Professional, deployable apps</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Mocha</span>
                <span className="text-xs text-purple-600">(Full-stack)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Cursor</span>
                <span className="text-xs text-purple-600">(Developer-first)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="rating">Overall Rating</option>
                <option value="speed">Speed</option>
                <option value="quality">Quality</option>
                <option value="ease">Ease of Use</option>
                <option value="credits">Credit Efficiency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {getFilteredPlatforms().map((platform) => {
            const PlatformIcon = platform.icon;
            
            return (
              <div key={platform.id} className="card hover:shadow-lg transition-shadow">
                {/* Platform Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-${platform.color}-500 rounded-xl flex items-center justify-center`}>
                      <PlatformIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{platform.name}</h3>
                      <p className="text-sm text-gray-600">{platform.pricing}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${getRatingColor(platform.rating)}`}>
                      {platform.rating}
                    </span>
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Speed</span>
                      <span className="text-sm font-medium">{platform.speed}/10</span>
                    </div>
                    {getScoreBar(platform.speed, platform.color)}
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Quality</span>
                      <span className="text-sm font-medium">{platform.quality}/10</span>
                    </div>
                    {getScoreBar(platform.quality, platform.color)}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Ease of Use</span>
                      <span className="text-sm font-medium">{platform.ease}/10</span>
                    </div>
                    {getScoreBar(platform.ease, platform.color)}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Credit Value</span>
                      <span className="text-sm font-medium">{platform.credits}/10</span>
                    </div>
                    {getScoreBar(platform.credits, platform.color)}
                  </div>
                </div>

                {/* Strengths */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
                  <div className="flex flex-wrap gap-1">
                    {platform.strengths.map((strength, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Best For */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Best For</h4>
                  <div className="flex flex-wrap gap-1">
                    {platform.bestFor.map((use, index) => (
                      <span key={index} className={`px-2 py-1 bg-${platform.color}-100 text-${platform.color}-800 text-xs rounded-full`}>
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Weaknesses */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Considerations</h4>
                  <div className="flex flex-wrap gap-1">
                    {platform.weaknesses.map((weakness, index) => (
                      <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        {weakness}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm"
                  >
                    Try {platform.name}
                  </a>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    Add to Comparison
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Comparison Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Comparison</h2>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="btn-secondary"
            >
              {showComparison ? 'Hide' : 'Show'} Table
            </button>
          </div>

          {showComparison && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Platform</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Rating</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Speed</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Quality</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Ease</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Value</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Pricing</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredPlatforms().map((platform) => (
                    <tr key={platform.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 bg-${platform.color}-500 rounded flex items-center justify-center`}>
                            <platform.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{platform.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`font-bold ${getRatingColor(platform.rating)}`}>
                          {platform.rating}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">{platform.speed}</td>
                      <td className="text-center py-3 px-4">{platform.quality}</td>
                      <td className="text-center py-3 px-4">{platform.ease}</td>
                      <td className="text-center py-3 px-4">{platform.credits}</td>
                      <td className="text-center py-3 px-4 text-xs">{platform.pricing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Your Platform Usage */}
        <div className="card bg-gradient-to-r from-gray-50 to-purple-50 border-dashed border-2 border-purple-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Track Your Platform Usage</h3>
                <p className="text-gray-600">Add your actual experience with these platforms to get personalized recommendations</p>
              </div>
            </div>
            <div className="hidden md:block">
              <button
                onClick={() => navigate('/projects')}
                className="btn-primary"
              >
                Add Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
