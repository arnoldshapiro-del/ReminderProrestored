import { useState } from 'react';
import { 
  Search,
  Download,
  Star,
  Users,
  Tag
} from 'lucide-react';

interface Template {
  id: number;
  template_name: string;
  template_description?: string;
  project_type: string;
  ai_platform: string;
  estimated_credits: number;
  estimated_hours: number;
  difficulty_level: string;
  success_rate: number;
  downloads_count: number;
  tags: string[];
}

export default function TemplateMarketplace() {
  const [templates] = useState<Template[]>([
    {
      id: 1,
      template_name: 'Medical Reminder System',
      template_description: 'Complete patient reminder system with SMS, appointments, and analytics',
      project_type: 'medical',
      ai_platform: 'Mocha',
      estimated_credits: 65,
      estimated_hours: 3,
      difficulty_level: 'medium',
      success_rate: 92,
      downloads_count: 147,
      tags: ['medical', 'sms', 'appointments']
    },
    {
      id: 2,
      template_name: 'E-commerce Landing Page',
      template_description: 'Modern responsive landing page with product showcase and cart',
      project_type: 'ecommerce',
      ai_platform: 'Lovable',
      estimated_credits: 45,
      estimated_hours: 2,
      difficulty_level: 'easy',
      success_rate: 88,
      downloads_count: 203,
      tags: ['ecommerce', 'landing', 'responsive']
    },
    {
      id: 3,
      template_name: 'AI Dashboard',
      template_description: 'Analytics dashboard with charts, metrics, and data visualization',
      project_type: 'saas',
      ai_platform: 'Bolt',
      estimated_credits: 80,
      estimated_hours: 4,
      difficulty_level: 'hard',
      success_rate: 85,
      downloads_count: 98,
      tags: ['dashboard', 'analytics', 'charts']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(template =>
    template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.template_description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Template Marketplace</h2>
          <p className="text-gray-600">Download proven project templates to speed up development</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Available Templates</p>
              <p className="text-2xl font-bold">{templates.length}</p>
            </div>
            <Tag className="w-6 h-6 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Downloads</p>
              <p className="text-2xl font-bold">{templates.reduce((acc, t) => acc + t.downloads_count, 0)}</p>
            </div>
            <Download className="w-6 h-6 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Success Rate</p>
              <p className="text-2xl font-bold">{Math.round(templates.reduce((acc, t) => acc + t.success_rate, 0) / templates.length)}%</p>
            </div>
            <Star className="w-6 h-6 text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Community</p>
              <p className="text-2xl font-bold">1.2k</p>
              <p className="text-orange-200 text-xs">active users</p>
            </div>
            <Users className="w-6 h-6 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {template.template_name}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty_level)}`}>
                {template.difficulty_level}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">{template.template_description || 'No description available'}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium">{template.ai_platform}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Est. Credits:</span>
                <span className="font-medium">{template.estimated_credits}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Est. Time:</span>
                <span className="font-medium">{template.estimated_hours}h</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-gray-600">Success:</span>
                </span>
                <span className="font-medium">{template.success_rate}%</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Download Info */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Download className="w-3 h-3" />
                <span>{template.downloads_count} downloads</span>
              </div>
              
              <button className="btn-primary btn-sm">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}
