import { useState } from 'react';
import { 
  Brain, 
  Star,
  Search,
  Plus,
  Copy,
  TrendingUp,
  Target
} from 'lucide-react';

interface AIPrompt {
  id: number;
  title: string;
  content: string;
  platform: string;
  rating: number;
  credits: number;
  tags: string[];
  isFavorite: boolean;
}

export default function AIPromptLibrary() {
  const [prompts] = useState<AIPrompt[]>([
    {
      id: 1,
      title: 'Medical App Feature Request',
      content: 'Create a patient reminder system with SMS notifications, appointment scheduling, and HIPAA compliance. Include a dashboard for healthcare providers.',
      platform: 'Mocha',
      rating: 9,
      credits: 45,
      tags: ['medical', 'sms', 'dashboard'],
      isFavorite: true
    },
    {
      id: 2,
      title: 'E-commerce Landing Page',
      content: 'Build a modern e-commerce landing page with product showcase, shopping cart functionality, payment integration, and responsive design.',
      platform: 'Lovable',
      rating: 8,
      credits: 32,
      tags: ['ecommerce', 'payment', 'responsive'],
      isFavorite: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Prompt Library</h2>
          <p className="text-gray-600">Save and reuse successful AI prompts</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Prompt</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Prompts</p>
              <p className="text-2xl font-bold">{prompts.length}</p>
            </div>
            <Brain className="w-6 h-6 text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Favorites</p>
              <p className="text-2xl font-bold">{prompts.filter(p => p.isFavorite).length}</p>
            </div>
            <Star className="w-6 h-6 text-yellow-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Avg Rating</p>
              <p className="text-2xl font-bold">{(prompts.reduce((acc, p) => acc + p.rating, 0) / prompts.length).toFixed(1)}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Credits Saved</p>
              <p className="text-2xl font-bold">{prompts.reduce((acc, p) => acc + p.credits, 0)}</p>
            </div>
            <Target className="w-6 h-6 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prompts
          .filter(prompt => 
            prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((prompt) => (
            <div key={prompt.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">{prompt.title}</h3>
                  {prompt.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                </div>
                <span className="text-sm text-gray-500">{prompt.platform}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{prompt.content}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{prompt.rating}/10</span>
                  </span>
                  <span className="text-gray-500">{prompt.credits} credits</span>
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {prompt.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Prompt</h3>
            <p className="text-gray-600 mb-4">Feature coming soon! For now, prompts are pre-loaded.</p>
            <button 
              onClick={() => {
                // Close immediately to prevent flash
                setShowAddModal(false);
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
