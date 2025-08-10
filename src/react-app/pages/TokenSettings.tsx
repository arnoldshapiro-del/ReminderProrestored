import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";

import Layout from "@/react-app/components/Layout";
import { 
  Key, 
  Save, 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Github,
  Globe,
  TestTube
} from "lucide-react";

interface TokenSettings {
  githubToken: string;
  netlifyToken: string;
}

export default function TokenSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showNetlifyToken, setShowNetlifyToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [tokenSettings, setTokenSettings] = useState<TokenSettings>({
    githubToken: '',
    netlifyToken: ''
  });

  useEffect(() => {
    if (user) {
      fetchTokenSettings();
    }
  }, [user]);

  const fetchTokenSettings = async () => {
    try {
      const response = await fetch('/api/settings/tokens', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTokenSettings({
          githubToken: data.githubToken || '',
          netlifyToken: data.netlifyToken || ''
        });
      }
    } catch (error) {
      console.error('Error fetching token settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/settings/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(tokenSettings),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save tokens');
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (provider: 'github' | 'netlify') => {
    setTestingConnection(provider);
    setError(null);

    try {
      const token = provider === 'github' ? tokenSettings.githubToken : tokenSettings.netlifyToken;
      
      if (!token) {
        setError(`Please enter your ${provider} token first`);
        return;
      }

      const response = await fetch(`/api/settings/tokens/test/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `${provider} connection test failed`);
      }
    } catch (error) {
      console.error(`Error testing ${provider} connection:`, error);
      setError('Network error occurred');
    } finally {
      setTestingConnection(null);
    }
  };

  const renderTokenInterface = () => (
    <>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Token Settings</h1>
        <p className="text-gray-600 mt-1">Configure your GitHub and Netlify tokens for real auto-deployment</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700">Settings saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🔑 One-Time Setup for Real Automation</h3>
            <p className="text-gray-700 mb-3">
              Add your GitHub and Netlify personal access tokens to enable real auto-deployment. 
              This is a one-time setup that will save you 43 minutes per deployment!
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>✅ GitHub Token:</strong> Allows creating repositories and uploading files automatically</p>
              <p><strong>✅ Netlify Token:</strong> Allows creating sites and configuring deployments automatically</p>
              <p><strong>🔒 Security:</strong> Tokens are securely encrypted and only used for deployment automation</p>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Token Configuration */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">GitHub Personal Access Token</h2>
            <p className="text-gray-600 text-sm">Required for creating repositories and uploading files</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Token *
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showGithubToken ? "text" : "password"}
                value={tokenSettings.githubToken}
                onChange={(e) => setTokenSettings({...tokenSettings, githubToken: e.target.value})}
                placeholder="Enter your GitHub personal access token"
                className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowGithubToken(!showGithubToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showGithubToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get yours at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">github.com/settings/tokens</a> (needs "repo" permission)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleTestConnection('github')}
              disabled={!tokenSettings.githubToken || testingConnection === 'github'}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {testingConnection === 'github' ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              <span>Test GitHub Connection</span>
            </button>
            
            {tokenSettings.githubToken && (
              <span className="text-sm text-green-600 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Token Added</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Netlify Token Configuration */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Netlify Personal Access Token</h2>
            <p className="text-gray-600 text-sm">Required for creating sites and configuring deployments</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Netlify Token *
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showNetlifyToken ? "text" : "password"}
                value={tokenSettings.netlifyToken}
                onChange={(e) => setTokenSettings({...tokenSettings, netlifyToken: e.target.value})}
                placeholder="Enter your Netlify personal access token"
                className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="button"
                onClick={() => setShowNetlifyToken(!showNetlifyToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNetlifyToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get yours at: <a href="https://app.netlify.com/user/applications#personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">app.netlify.com/user/applications</a>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleTestConnection('netlify')}
              disabled={!tokenSettings.netlifyToken || testingConnection === 'netlify'}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {testingConnection === 'netlify' ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              <span>Test Netlify Connection</span>
            </button>
            
            {tokenSettings.netlifyToken && (
              <span className="text-sm text-green-600 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Token Added</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button
          onClick={handleSaveSettings}
          disabled={loading || !tokenSettings.githubToken || !tokenSettings.netlifyToken}
          className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center space-x-3 mx-auto ${
            !loading && tokenSettings.githubToken && tokenSettings.netlifyToken
              ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <Save className="w-6 h-6" />
          )}
          <span>Save Tokens & Enable Real Auto-Deployment</span>
        </button>
        
        {(!tokenSettings.githubToken || !tokenSettings.netlifyToken) && (
          <p className="text-sm text-gray-500 mt-2">
            Please add both GitHub and Netlify tokens to enable automation
          </p>
        )}
      </div>

      {/* What Happens Next */}
      {tokenSettings.githubToken && tokenSettings.netlifyToken && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-900 mb-3">🎉 Ready for Real Auto-Deployment!</h3>
          <p className="text-green-700 mb-3">
            Once you save these tokens, the Real Auto-Deploy system will:
          </p>
          <ul className="space-y-1 text-sm text-green-700">
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Actually create GitHub repositories for your projects</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Actually upload all your project files to GitHub</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Actually create and deploy Netlify sites</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Actually configure auto-sync between GitHub and Netlify</li>
            <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Save you 43 minutes per deployment by automating 8 out of 10 steps</li>
          </ul>
        </div>
      )}
    </>
  );

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <span className="text-yellow-800 font-semibold">Demo Mode</span>
              <p className="text-yellow-700 text-sm">Sign in to save your actual tokens. For now, you can test the interface.</p>
            </div>
          </div>
        )}
        {renderTokenInterface()}
      </div>
    </Layout>
  );
}
