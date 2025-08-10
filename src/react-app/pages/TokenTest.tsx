import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import { 
  CheckCircle, 
  AlertCircle, 
  Github, 
  Globe, 
  Rocket,
  RefreshCw
} from "lucide-react";

interface ConnectionStatus {
  github: {
    configured: boolean;
    connected: boolean;
    error: string | null;
    username: string | null;
  };
  netlify: {
    configured: boolean;
    connected: boolean;
    error: string | null;
    email: string | null;
  };
}

export default function TokenTest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      testConnections();
    }
  }, [user]);

  const testConnections = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/deployment/test-connections', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to test connections');
      }
    } catch (error) {
      console.error('Error testing connections:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deployTestProject = async () => {
    const timestamp = Date.now();
    console.log('🚀 DEPLOYMENT TEST STARTING!', { timestamp });
    
    // Show detailed progress
    const progressDiv = document.createElement('div');
    progressDiv.id = 'deployment-progress';
    progressDiv.style.cssText = 'position:fixed;top:20px;right:20px;background:#1f2937;color:white;padding:20px;border-radius:12px;z-index:9999;min-width:300px;font-family:monospace;font-size:12px;';
    progressDiv.innerHTML = '<h3>🚀 DEPLOYMENT TEST IN PROGRESS</h3><div id="progress-log"></div>';
    document.body.appendChild(progressDiv);
    
    const logProgress = (message: string, isError = false) => {
      console.log(message);
      const logDiv = document.getElementById('progress-log');
      if (logDiv) {
        logDiv.innerHTML += `<div style="color:${isError ? '#ef4444' : '#10b981'};margin:5px 0;">${message}</div>`;
        logDiv.scrollTop = logDiv.scrollHeight;
      }
    };
    
    try {
      logProgress('📋 STEP 1: Testing GitHub Repository Creation...');
      
      const repoName = `test-deployment-${timestamp}`;
      const requestBody = {
        name: repoName,
        description: 'Test deployment from DevTracker Pro Real Auto-Deploy System',
        private: false,
        files: {
          'README.md': '# Test Deployment\n\nThis is a test deployment from DevTracker Pro Real Auto-Deploy system!\n\nGenerated at: ' + new Date().toISOString(),
          'index.html': `<!DOCTYPE html><html><head><title>Test Deployment</title></head><body><h1>🎉 Success! Auto-deployment worked!</h1><p>Created: ${new Date().toISOString()}</p></body></html>`
        }
      };
      
      logProgress('📤 Sending GitHub API request...');
      console.log('GitHub request payload:', requestBody);
      
      const githubResponse = await fetch('/api/deployment/github/create-repo', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      logProgress(`📨 GitHub Response: ${githubResponse.status} ${githubResponse.statusText}`);
      console.log('GitHub response status:', githubResponse.status, githubResponse.statusText);

      if (!githubResponse.ok) {
        let errorText;
        let errorData;
        try {
          errorText = await githubResponse.text();
          console.log('GitHub error response text:', errorText);
          
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
        } catch (fetchError) {
          console.error('Error reading GitHub response:', fetchError);
          errorData = { error: 'Failed to read error response' };
        }
        
        const errorMessage = `GitHub API Failed (${githubResponse.status}): ${errorData.error || errorText || 'Unknown error'}`;
        logProgress(`❌ ${errorMessage}`, true);
        
        // Remove progress div after delay
        setTimeout(() => {
          document.body.removeChild(progressDiv);
        }, 10000);
        
        alert(`❌ GITHUB DEPLOYMENT FAILED!\n\nStatus: ${githubResponse.status}\nError: ${errorData.error || errorText}\n\nCheck console and progress panel for full details.`);
        return;
      }

      let githubResult;
      try {
        githubResult = await githubResponse.json();
        logProgress(`✅ GitHub Repository Created: ${githubResult.name}`);
        logProgress(`🔗 Repository URL: ${githubResult.html_url}`);
        console.log('GitHub success result:', githubResult);
      } catch (parseError) {
        console.error('Error parsing GitHub response JSON:', parseError);
        logProgress('❌ Failed to parse GitHub response JSON', true);
        
        setTimeout(() => {
          document.body.removeChild(progressDiv);
        }, 10000);
        
        alert('❌ GitHub response parsing failed! Check console for details.');
        return;
      }

      // Test Netlify
      logProgress('📋 STEP 2: Testing Netlify Site Creation...');
      
      const netlifyRequestBody = {
        name: `test-deployment-${timestamp}`,
        githubUrl: githubResult.html_url,
        buildCommand: 'echo "No build needed - static site"',
        publishDir: '.',
        customDomain: ''
      };
      
      logProgress('📤 Sending Netlify API request...');
      console.log('Netlify request payload:', netlifyRequestBody);
      
      const netlifyResponse = await fetch('/api/deployment/netlify/create-site', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(netlifyRequestBody)
      });

      logProgress(`📨 Netlify Response: ${netlifyResponse.status} ${netlifyResponse.statusText}`);
      console.log('Netlify response status:', netlifyResponse.status, netlifyResponse.statusText);

      if (!netlifyResponse.ok) {
        let errorText;
        let errorData;
        try {
          errorText = await netlifyResponse.text();
          console.log('Netlify error response text:', errorText);
          
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
        } catch (fetchError) {
          console.error('Error reading Netlify response:', fetchError);
          errorData = { error: 'Failed to read error response' };
        }
        
        const errorMessage = `Netlify API Failed (${netlifyResponse.status}): ${errorData.error || errorText || 'Unknown error'}`;
        logProgress(`❌ ${errorMessage}`, true);
        
        // Remove progress div after delay
        setTimeout(() => {
          document.body.removeChild(progressDiv);
        }, 10000);
        
        alert(`❌ NETLIFY DEPLOYMENT FAILED!\n\nStatus: ${netlifyResponse.status}\nError: ${errorData.error || errorText}\n\nGitHub repo was created successfully: ${githubResult.html_url}\n\nCheck console and progress panel for full details.`);
        return;
      }

      let netlifyResult;
      try {
        netlifyResult = await netlifyResponse.json();
        logProgress(`✅ Netlify Site Created: ${netlifyResult.name}`);
        logProgress(`🔗 Site URL: ${netlifyResult.ssl_url || netlifyResult.url}`);
        console.log('Netlify success result:', netlifyResult);
      } catch (parseError) {
        console.error('Error parsing Netlify response JSON:', parseError);
        logProgress('❌ Failed to parse Netlify response JSON', true);
        
        setTimeout(() => {
          document.body.removeChild(progressDiv);
        }, 10000);
        
        alert(`❌ Netlify response parsing failed!\n\nGitHub repo created: ${githubResult.html_url}\n\nCheck console for details.`);
        return;
      }

      logProgress('🎉 DEPLOYMENT TEST COMPLETED SUCCESSFULLY!');
      logProgress(`📊 Total time: ${Date.now() - timestamp}ms`);
      
      // Remove progress div after success
      setTimeout(() => {
        document.body.removeChild(progressDiv);
      }, 15000);
      
      alert(`🎉 COMPLETE SUCCESS!\n\n✅ GitHub Repository: ${githubResult.html_url}\n✅ Netlify Site: ${netlifyResult.ssl_url || netlifyResult.url}\n\n🚀 Real auto-deployment is fully operational!\n\nBoth resources are live and ready to use.`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ DEPLOYMENT TEST CRITICAL ERROR:', error);
      logProgress(`❌ CRITICAL ERROR: ${errorMessage}`, true);
      
      // Remove progress div after error
      setTimeout(() => {
        const progressElement = document.getElementById('deployment-progress');
        if (progressElement) {
          document.body.removeChild(progressElement);
        }
      }, 10000);
      
      alert(`❌ DEPLOYMENT TEST FAILED!\n\nCritical Error: ${errorMessage}\n\nThis could be a network issue, server error, or authentication problem.\n\nCheck console and progress panel for full error details.`);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">
            🧪 TOKEN CONNECTION TEST
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test your GitHub and Netlify tokens before running real deployments
          </p>
        </div>

        {/* Test Button */}
        <div className="text-center">
          <button
            onClick={testConnections}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center space-x-3 mx-auto"
          >
            {loading ? (
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <RefreshCw className="w-6 h-6" />
            )}
            <span>Test Connections Now</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Connection Test Failed</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {connectionStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GitHub Status */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">GitHub Connection</h2>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Token Configured:</span>
                  <div className="flex items-center space-x-2">
                    {connectionStatus.github.configured ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={connectionStatus.github.configured ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus.github.configured ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700">API Connection:</span>
                  <div className="flex items-center space-x-2">
                    {connectionStatus.github.connected ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={connectionStatus.github.connected ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus.github.connected ? 'WORKING' : 'FAILED'}
                    </span>
                  </div>
                </div>

                {connectionStatus.github.username && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-800">
                      <strong>✅ Connected as:</strong> {connectionStatus.github.username}
                    </div>
                  </div>
                )}

                {connectionStatus.github.error && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm text-red-800">
                      <strong>❌ Error:</strong> {connectionStatus.github.error}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Netlify Status */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Netlify Connection</h2>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Token Configured:</span>
                  <div className="flex items-center space-x-2">
                    {connectionStatus.netlify.configured ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={connectionStatus.netlify.configured ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus.netlify.configured ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700">API Connection:</span>
                  <div className="flex items-center space-x-2">
                    {connectionStatus.netlify.connected ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={connectionStatus.netlify.connected ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus.netlify.connected ? 'WORKING' : 'FAILED'}
                    </span>
                  </div>
                </div>

                {connectionStatus.netlify.email && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-800">
                      <strong>✅ Connected as:</strong> {connectionStatus.netlify.email}
                    </div>
                  </div>
                )}

                {connectionStatus.netlify.error && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm text-red-800">
                      <strong>❌ Error:</strong> {connectionStatus.netlify.error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Test Deployment Button */}
        {connectionStatus?.github.connected && connectionStatus?.netlify.connected && (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">🎉 Both Connections Working!</h3>
              <p className="text-green-700 mb-4">Ready to test real deployment. This will create actual GitHub repo and Netlify site.</p>
              <button
                onClick={deployTestProject}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                🚀 Run Test Deployment Now
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">🔧 Fix Connection Issues:</h3>
          <div className="space-y-2 text-blue-800">
            <p><strong>❌ GitHub not configured:</strong> Ask admin to set GITHUB_PERSONAL_ACCESS_TOKEN secret</p>
            <p><strong>❌ Netlify not configured:</strong> Ask admin to set NETLIFY_PERSONAL_ACCESS_TOKEN secret</p>
            <p><strong>❌ Connection failed:</strong> Check token permissions (GitHub needs 'repo', Netlify needs full access)</p>
            <p><strong>✅ Both working:</strong> Ready for real auto-deployment!</p>
          </div>
        </div>

        {/* Deployment Troubleshooting */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">⚠️ If Test Deployment Fails:</h3>
          <div className="space-y-2 text-yellow-800">
            <p><strong>🔑 Most Common Issue:</strong> GitHub token missing "repo" permission scope</p>
            <p><strong>📝 Repository name exists:</strong> Try with a different/unique repository name</p>
            <p><strong>⏱️ Rate limiting:</strong> Wait a few minutes between deployment attempts</p>
            <p><strong>🔧 Fix:</strong> Go to GitHub.com → Settings → Personal access tokens → Create new token with "repo" scope</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
