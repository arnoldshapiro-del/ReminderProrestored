import { useState } from "react";
import Layout from "@/react-app/components/Layout";
import { 
  Key,
  Github,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";

export default function GitHubTokenTest() {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [repoResult, setRepoResult] = useState<any>(null);

  const handleSetToken = async () => {
    if (!token.trim()) {
      alert('Please enter your GitHub token');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setRepoResult(null);

    try {
      const response = await fetch('/api/deployment/github/set-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ token })
      });

      const result = await response.json();
      setValidationResult(result);

      if (response.ok) {
        console.log('✅ Token validated successfully:', result);
      } else {
        console.error('❌ Token validation failed:', result);
      }
    } catch (error) {
      console.error('💥 Error setting token:', error);
      setValidationResult({
        error: 'Network error occurred',
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCreateRepo = async () => {
    setIsCreatingRepo(true);
    setRepoResult(null);

    try {
      const response = await fetch('/api/deployment/github/create-devtracker-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();
      setRepoResult(result);

      if (response.ok) {
        console.log('✅ Repository created successfully:', result);
      } else {
        console.error('❌ Repository creation failed:', result);
      }
    } catch (error) {
      console.error('💥 Error creating repository:', error);
      setRepoResult({
        error: 'Network error occurred',
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsCreatingRepo(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-800 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Github className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-3">
            GitHub Token Test (ChatGPT 5)
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Following ChatGPT 5's exact specifications for Personal Access Token handling
          </p>
        </div>

        {/* ChatGPT 5 Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">📋 ChatGPT 5 Implementation Steps:</h3>
          <ol className="space-y-2 text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span>Clear any cached/stored GitHub token for this project ✓</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span>Sanitize token: token.trim().replace(/^['"]|['"]$/g, '') ✓</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span>Validate with GET https://api.github.com/user using exact headers ✓</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              <span>Create repository under PERSONAL account using POST /user/repos ✓</span>
            </li>
          </ol>
        </div>

        {/* Token Input */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Step 1: Enter Your GitHub Personal Access Token (Classic)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Token (ghp_...):
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="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"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={3}
              />
            </div>
            
            <button
              onClick={handleSetToken}
              disabled={!token.trim() || isValidating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
            >
              {isValidating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Key className="w-5 h-5" />
              )}
              <span>{isValidating ? 'Validating Token...' : 'Set & Validate Token'}</span>
            </button>
          </div>
        </div>

        {/* Validation Result */}
        {validationResult && (
          <div className={`border rounded-2xl p-6 ${
            validationResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3 mb-4">
              {validationResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`font-semibold text-lg ${
                  validationResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {validationResult.success ? '✅ Token Validation Successful' : '❌ Token Validation Failed'}
                </h3>
                <p className={`${
                  validationResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {validationResult.message || validationResult.error}
                </p>
                {validationResult.username && (
                  <p className="text-green-700 mt-1">
                    <strong>GitHub Username:</strong> {validationResult.username}
                  </p>
                )}
              </div>
            </div>

            {validationResult.rawResponse && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Raw GitHub API Response:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {validationResult.rawResponse}
                </pre>
              </div>
            )}

            {validationResult.instructions && (
              <div className="mt-4">
                <h4 className="font-semibold text-red-900 mb-2">Instructions to Fix:</h4>
                <ul className="space-y-1 text-red-700">
                  {validationResult.instructions.map((instruction: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-600">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Repository Creation */}
        {validationResult?.success && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Github className="w-5 h-5 mr-2" />
              Step 2: Create devtracker-pro Repository
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Repository Details:</strong><br />
                  • Name: devtracker-pro<br />
                  • Private: true<br />
                  • Auto-init: true<br />
                  • Account: Your personal GitHub account
                </p>
              </div>
              
              <button
                onClick={handleCreateRepo}
                disabled={isCreatingRepo}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
              >
                {isCreatingRepo ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Github className="w-5 h-5" />
                )}
                <span>{isCreatingRepo ? 'Creating Repository...' : 'Create devtracker-pro Repository'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Repository Result */}
        {repoResult && (
          <div className={`border rounded-2xl p-6 ${
            repoResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3 mb-4">
              {repoResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`font-semibold text-lg ${
                  repoResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {repoResult.success ? '🎉 Repository Created Successfully' : '❌ Repository Creation Failed'}
                </h3>
                <p className={`${
                  repoResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {repoResult.message || repoResult.error}
                </p>
              </div>
            </div>

            {repoResult.repository && (
              <div className="bg-white border border-green-300 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-green-900 mb-2">Repository Details:</h4>
                <div className="space-y-1 text-green-700 text-sm">
                  <p><strong>Name:</strong> {repoResult.repository.name}</p>
                  <p><strong>Full Name:</strong> {repoResult.repository.full_name}</p>
                  <p><strong>Private:</strong> {repoResult.repository.private ? 'Yes' : 'No'}</p>
                  <p><strong>URL:</strong> <a href={repoResult.repository.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{repoResult.repository.html_url}</a></p>
                  <p><strong>Clone URL:</strong> {repoResult.repository.clone_url}</p>
                </div>
              </div>
            )}

            {repoResult.rawResponse && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Raw GitHub API Response:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {JSON.stringify(repoResult.rawResponse, null, 2)}
                </pre>
              </div>
            )}

            {repoResult.causes && (
              <div className="mt-4">
                <h4 className="font-semibold text-red-900 mb-2">Possible Causes:</h4>
                <ul className="space-y-1 text-red-700">
                  {repoResult.causes.map((cause: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-2">🐛 Debug Information:</h4>
          <div className="text-sm text-gray-600 space-y-1 font-mono">
            <div>Token Length: {token.length} characters</div>
            <div>Token Starts With: {token.substring(0, 10)}...</div>
            <div>Is Validating: {isValidating ? 'Yes' : 'No'}</div>
            <div>Is Creating Repo: {isCreatingRepo ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
