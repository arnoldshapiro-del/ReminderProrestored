import { useState } from 'react';
import { 
  ExternalLink,
  ChevronDown,
  Brain,
  GitBranch,
  Globe,
  Zap,
  AlertTriangle,
  Plus
} from 'lucide-react';
import type { ProjectType } from "@/shared/types";

interface QuickLinkDropdownProps {
  project: ProjectType;
}

export default function QuickLinkDropdown({ project }: QuickLinkDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const developmentLinks = [
    {
      platform: 'Mocha',
      icon: Brain,
      url: (project as any).mocha_development_url,
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50'
    },
    {
      platform: 'GitHub',
      icon: GitBranch,
      url: (project as any).github_development_url || project.github_repo_url,
      color: 'text-gray-600',
      bgColor: 'hover:bg-gray-50'
    },
    {
      platform: 'Netlify',
      icon: Globe,
      url: (project as any).netlify_development_url,
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50'
    },
    {
      platform: 'Vercel',
      icon: Zap,
      url: (project as any).vercel_development_url,
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50'
    },
    {
      platform: 'Twilio',
      icon: AlertTriangle,
      url: (project as any).twilio_development_url,
      color: 'text-red-600',
      bgColor: 'hover:bg-red-50'
    }
  ];

  const deployedLinks = [
    {
      platform: 'Mocha Published',
      icon: Brain,
      url: (project as any).mocha_published_url,
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50'
    },
    {
      platform: 'Netlify Live',
      icon: Globe,
      url: project.netlify_url,
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50'
    },
    {
      platform: 'Vercel Live',
      icon: Zap,
      url: project.vercel_url,
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50'
    }
  ];

  // Add custom platforms
  const customPlatforms = [
    {
      name: (project as any).custom_platform_1_name,
      devUrl: (project as any).custom_platform_1_development_url,
      liveUrl: (project as any).custom_platform_1_url
    },
    {
      name: (project as any).custom_platform_2_name,
      devUrl: (project as any).custom_platform_2_development_url,
      liveUrl: (project as any).custom_platform_2_url
    },
    {
      name: (project as any).custom_platform_3_name,
      devUrl: (project as any).custom_platform_3_development_url,
      liveUrl: (project as any).custom_platform_3_url
    }
  ];

  customPlatforms.forEach(platform => {
    if (platform.name) {
      if (platform.devUrl) {
        developmentLinks.push({
          platform: `${platform.name} Dev`,
          icon: Plus,
          url: platform.devUrl,
          color: 'text-yellow-600',
          bgColor: 'hover:bg-yellow-50'
        });
      }
      if (platform.liveUrl) {
        deployedLinks.push({
          platform: `${platform.name} Live`,
          icon: Plus,
          url: platform.liveUrl,
          color: 'text-yellow-600',
          bgColor: 'hover:bg-yellow-50'
        });
      }
    }
  });

  const activeDevelopmentLinks = developmentLinks.filter(link => link.url);
  const activeDeployedLinks = deployedLinks.filter(link => link.url);

  // Always show the dropdown button, even if no links are available yet
  const hasAnyLinks = activeDevelopmentLinks.length > 0 || activeDeployedLinks.length > 0;

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
          hasAnyLinks 
            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' 
            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
        }`}
        title={hasAnyLinks ? "Quick access to development and deployed links" : "No links configured yet - click to see options"}
      >
        <ExternalLink className="w-3 h-3" />
        <span>Links</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Quick Access Links
            </h3>

            {/* Development Links */}
            {activeDevelopmentLinks.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Development
                </h4>
                <div className="space-y-1">
                  {activeDevelopmentLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={`dev-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg ${link.bgColor} transition-colors text-sm hover:shadow-sm`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Close dropdown immediately to prevent flash
                          setShowDropdown(false);
                          // Open URL with slight delay to ensure UI has updated
                          setTimeout(() => {
                            window.open(link.url, '_blank', 'noopener,noreferrer');
                          }, 10);
                        }}
                      >
                        <Icon className={`w-4 h-4 ${link.color}`} />
                        <span className="text-gray-700 truncate">{link.platform}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Deployed Links */}
            {activeDeployedLinks.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Deployed
                </h4>
                <div className="space-y-1">
                  {activeDeployedLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={`deployed-${index}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg ${link.bgColor} transition-colors text-sm hover:shadow-sm`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Close dropdown immediately to prevent flash
                          setShowDropdown(false);
                          // Open URL with slight delay to ensure UI has updated
                          setTimeout(() => {
                            window.open(link.url, '_blank', 'noopener,noreferrer');
                          }, 10);
                        }}
                      >
                        <Icon className={`w-4 h-4 ${link.color}`} />
                        <span className="text-gray-700 truncate">{link.platform}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 text-center">
              💡 Never lose track of where you left off
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
