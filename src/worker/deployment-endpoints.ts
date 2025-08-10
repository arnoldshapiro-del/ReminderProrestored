import "./types";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "@getmocha/users-service/backend";

type Variables = {
  user: any;
};

const deploymentEndpoints = new Hono<{ Bindings: Env; Variables: Variables }>();

// Helper function to get user tokens - prefer environment variables first
async function getUserTokens(userId: string, db: D1Database, env: Env) {
  // First check environment variables (set by admin)
  const envGithubToken = env.GITHUB_PERSONAL_ACCESS_TOKEN;
  const envNetlifyToken = env.NETLIFY_PERSONAL_ACCESS_TOKEN;
  
  if (envGithubToken && envNetlifyToken) {
    return {
      githubToken: envGithubToken,
      netlifyToken: envNetlifyToken
    };
  }
  
  // Fall back to user preferences
  const result = await db.prepare(`
    SELECT github_token, netlify_token FROM user_preferences 
    WHERE user_id = ?
  `).bind(userId).first();
  
  return {
    githubToken: envGithubToken || result?.github_token,
    netlifyToken: envNetlifyToken || result?.netlify_token
  };
}

// ChatGPT 5 Solution: Exact GitHub PAT authentication with required User-Agent
const GITHUB_API = "https://api.github.com";
const GITHUB_HEADERS = (token: string) => ({
  "Authorization": `token ${token}`,                      // PATs use 'token', not 'Bearer' (ChatGPT 5 spec)
  "Accept": "application/vnd.github+json",                // Exact header from ChatGPT 5
  "X-GitHub-Api-Version": "2022-11-28",                 // Exact API version from ChatGPT 5
  "User-Agent": "getmocha-deployer (+https://getmocha.com)", // REQUIRED by GitHub REST API
  "Content-Type": "application/json"                     // Required for POST requests
});

type CreateRepoParams = {
  token: string;
  repoName: string;
  description?: string;
  makePrivate?: boolean;
};

async function createGitHubRepoCorrect(params: CreateRepoParams) {
  console.log(`🚀 Creating GitHub repository: ${params.repoName} using ChatGPT 5 exact solution`);
  
  // Step 1: Validate token with GET /user (ChatGPT 5 mandatory validation)
  console.log(`🔐 Step 1: Validating GitHub token with GET /user...`);
  const validateResponse = await fetch(`${GITHUB_API}/user`, { 
    headers: GITHUB_HEADERS(params.token) 
  });
  
  if (validateResponse.status === 401) {
    const text = await validateResponse.text();
    throw new Error(
      `GitHub 401 Bad credentials - Token validation failed.
       ChatGPT 5 Instructions:
       1. Use Personal Access Token (classic) with scopes: repo, workflow, write:packages, user:email
       2. Go to Developer settings → Personal access tokens (classic) → your token → Configure SSO
       3. MANDATORY: Authorize it for your GitHub org (without this GitHub returns 401)
       4. Token must be 'classic' type, not fine-grained
       Raw error: ${text}`
    );
  }
  
  if (!validateResponse.ok) {
    const text = await validateResponse.text();
    throw new Error(`GitHub validation failed: ${validateResponse.status} - ${text}`);
  }
  
  const userData = await validateResponse.json();
  console.log(`✅ Token validated successfully for user: ${userData.login}`);

  // Step 2: Determine if creating under personal account or organization
  console.log(`📁 Step 2: Creating repository under personal account...`);
  
  // ChatGPT 5 spec: POST /user/repos for personal account, POST /orgs/<org>/repos for org
  // For now, defaulting to personal account - in future could detect org from user data
  const createUrl = `${GITHUB_API}/user/repos`;  // Personal account (as per ChatGPT 5)
  
  // ChatGPT 5 spec: exact body format
  const requestBody = {
    name: params.repoName,
    description: params.description || `${params.repoName} - AI-powered application`,
    private: true,          // ChatGPT 5 spec: default private (avoids org visibility policy issues)
    auto_init: true         // ChatGPT 5 spec: auto-initialize with README
  };

  const createResponse = await fetch(createUrl, {
    method: "POST",
    headers: GITHUB_HEADERS(params.token),  // Already includes Content-Type
    body: JSON.stringify(requestBody),
  });

  if (createResponse.status === 401) {
    const text = await createResponse.text();
    throw new Error(
      `GitHub 401 during repo creation - Invalid/Unauthorized SSO.
       Solution: Go to GitHub → Settings → Developer settings → Personal access tokens (classic) 
       → Find your token → Click 'Configure SSO' → Authorize for your organization.
       This is mandatory for org-connected accounts.
       Raw: ${text}`
    );
  }

  if (createResponse.status === 403) {
    const text = await createResponse.text();
    throw new Error(
      `GitHub 403 Request forbidden by administrative rules. Specific causes and solutions:
       
       🔒 (1) Member repo-creation may be disabled—only owners can create repos:
           • Go to Org Settings → Member privileges → Repository creation
           • Enable "Members can create private repositories"
           • Or use an owner's PAT instead
       
       👁️ (2) Visibility policy may block public repos—create private instead:
           • Some orgs only allow private/internal repos
           • Our code creates private repos by default (recommended)
       
       🌐 (3) Enterprise IP allow list may be blocking Mocha's IPs:
           • Ask enterprise admin to allowlist Mocha's outbound IP addresses
           • Or run deployment from an allowed network
       
       🔐 (4) Re-check SAML SSO authorization:
           • Go to GitHub → Settings → Developer settings → Personal access tokens (classic)
           • Find your token → Configure SSO → Authorize for your organization
           • This must be done after any token regeneration or scope changes
       
       Raw GitHub response: ${text}`
    );
  }

  if (!createResponse.ok) {
    const text = await createResponse.text();
    throw new Error(`GitHub API error ${createResponse.status} during repo creation. Raw: ${text}`);
  }

  const repoData = await createResponse.json();
  console.log(`✅ Repository created successfully: ${repoData.full_name}`);
  
  return repoData;
}

// Create GitHub repository with multi-method authentication
deploymentEndpoints.post("/api/deployment/github/create-repo", authMiddleware, zValidator("json", z.object({
  name: z.string(),
  description: z.string().optional(),
  private: z.boolean().optional(),
  files: z.any()
})), async (c) => {
  const user: any = c.get("user");
  const { name, description, private: isPrivate, files } = c.req.valid("json");
  
  try {
    // Get user's GitHub token
    const { githubToken } = await getUserTokens(user.id, c.env.DB, c.env);
    
    if (!githubToken) {
      return c.json({ 
        error: "GitHub token not configured. Please add your token in API Tokens settings." 
      }, 400);
    }

    // Use ChatGPT 5 solution for proper GitHub authentication
    const repoData = await createGitHubRepoCorrect({
      token: githubToken,
      repoName: name,
      description: description,
      makePrivate: isPrivate || false
    });

    // Upload files to repository using ChatGPT 5 specifications
    console.log(`📁 Uploading ${Object.keys(files).length} files to repository: ${repoData.full_name}`);
    const uploadResults = [];
    
    // Upload files sequentially to avoid rate limiting (ChatGPT 5 best practice)
    for (const [filePath, content] of Object.entries(files)) {
      try {
        const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        const encodedContent = btoa(fileContent);
        
        console.log(`📤 Uploading file: ${filePath}`);
        const fileResponse = await fetch(`${GITHUB_API}/repos/${repoData.full_name}/contents/${filePath}`, {
          method: 'PUT',
          headers: GITHUB_HEADERS(githubToken),  // Use exact ChatGPT 5 headers
          body: JSON.stringify({
            message: `Add ${filePath}`,
            content: encodedContent,
            branch: "main"  // Explicit branch specification
          })
        });

        if (fileResponse.status === 401) {
          console.error(`❌ 401 Unauthorized for file: ${filePath} - SSO authorization required`);
          uploadResults.push({ 
            file: filePath, 
            success: false, 
            error: "401 Unauthorized - Configure SSO authorization for your GitHub org" 
          });
        } else if (fileResponse.status === 403) {
          console.error(`❌ 403 Forbidden for file: ${filePath} - Permission/policy issue`);
          uploadResults.push({ 
            file: filePath, 
            success: false, 
            error: "403 Forbidden - Organization policy or permission issue" 
          });
        } else if (fileResponse.ok) {
          console.log(`✅ Successfully uploaded: ${filePath}`);
          uploadResults.push({ file: filePath, success: true });
        } else {
          const errorText = await fileResponse.text();
          console.error(`❌ Failed to upload: ${filePath} - ${fileResponse.status} - ${errorText}`);
          uploadResults.push({ 
            file: filePath, 
            success: false, 
            status: fileResponse.status, 
            error: errorText 
          });
        }
        
      } catch (error) {
        console.error(`💥 Error uploading ${filePath}:`, error);
        uploadResults.push({ 
          file: filePath, 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    const successfulUploads = uploadResults.filter(r => r.success).length;
    console.log(`Upload complete: ${successfulUploads}/${uploadResults.length} files uploaded successfully`);

    return c.json({
      id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      html_url: repoData.html_url,
      clone_url: repoData.clone_url,
      private: repoData.private
    });
  } catch (error) {
    console.error('GitHub deployment error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ 
      error: "GitHub deployment failed: " + errorMessage,
      details: "Check console for full error details. Verify your GitHub token has 'repo' permissions."
    }, 500);
  }
});

// Create Netlify site with real API
deploymentEndpoints.post("/api/deployment/netlify/create-site", authMiddleware, zValidator("json", z.object({
  name: z.string(),
  githubUrl: z.string(),
  buildCommand: z.string().optional(),
  publishDir: z.string().optional(),
  customDomain: z.string().optional()
})), async (c) => {
  const user: any = c.get("user");
  const { name, githubUrl, buildCommand, publishDir, customDomain } = c.req.valid("json");
  
  try {
    // Get user's Netlify token
    const { netlifyToken } = await getUserTokens(user.id, c.env.DB, c.env);
    
    if (!netlifyToken) {
      return c.json({ 
        error: "Netlify token not configured. Please add your token in API Tokens settings." 
      }, 400);
    }

    // Extract GitHub repo info from URL
    const githubMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!githubMatch) {
      return c.json({ error: "Invalid GitHub URL format" }, 400);
    }
    
    const [, owner, repo] = githubMatch;

    // Create Netlify site
    const siteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        repo: {
          provider: 'github',
          repo: `${owner}/${repo}`,
          branch: 'main',
          cmd: buildCommand || 'npm run build',
          dir: publishDir || 'dist'
        },
        build_settings: {
          cmd: buildCommand || 'npm run build',
          publish_dir: publishDir || 'dist'
        }
      })
    });

    if (!siteResponse.ok) {
      const error = await siteResponse.text();
      return c.json({ 
        error: `Failed to create Netlify site: ${siteResponse.status} - ${error}` 
      }, 400);
    }

    const siteData = await siteResponse.json();

    // Configure custom domain if provided
    if (customDomain) {
      try {
        await fetch(`https://api.netlify.com/api/v1/sites/${siteData.id}/domains`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${netlifyToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ domain: customDomain })
        });
      } catch (error) {
        // Custom domain setup failed
      }
    }

    return c.json({
      id: siteData.id,
      name: siteData.name,
      url: siteData.url,
      ssl_url: siteData.ssl_url,
      admin_url: siteData.admin_url,
      custom_domain: customDomain
    });
  } catch (error) {
    // Netlify site creation error
    return c.json({ 
      error: "Failed to create Netlify site. Check your internet connection and token permissions." 
    }, 500);
  }
});

// Get deployment status
deploymentEndpoints.get("/api/deployment/status/:provider/:id", authMiddleware, async (c) => {
  const user: any = c.get("user");
  const provider = c.req.param("provider");
  const id = c.req.param("id");
  
  try {
    const { githubToken, netlifyToken } = await getUserTokens(user.id, c.env.DB, c.env);
    
    if (provider === 'github' && githubToken) {
      const response = await fetch(`${GITHUB_API}/repositories/${id}`, {
        headers: GITHUB_HEADERS(githubToken)
      });
      
      if (response.ok) {
        const data = await response.json();
        return c.json({ status: 'active', data });
      }
    } else if (provider === 'netlify' && netlifyToken) {
      const response = await fetch(`https://api.netlify.com/api/v1/sites/${id}`, {
        headers: {
          'Authorization': `Bearer ${netlifyToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return c.json({ status: 'active', data });
      }
    }
    
    return c.json({ status: 'unknown' });
  } catch (error) {
    return c.json({ status: 'error', error: error instanceof Error ? error.message : String(error) });
  }
});

// Get user's GitHub repositories (ChatGPT 5 compliant)
deploymentEndpoints.get("/api/deployment/github/repos", authMiddleware, async (c) => {
  const user: any = c.get("user");
  
  try {
    const { githubToken } = await getUserTokens(user.id, c.env.DB, c.env);
    
    if (!githubToken) {
      return c.json({ 
        error: "GitHub token not configured. Please add your token in API Tokens settings." 
      }, 400);
    }

    // ChatGPT 5 spec: First validate token with GET /user
    const validateResponse = await fetch(`${GITHUB_API}/user`, {
      headers: GITHUB_HEADERS(githubToken)
    });

    if (validateResponse.status === 401) {
      return c.json({ 
        error: "GitHub token invalid or SSO not authorized. Configure SSO for your GitHub organization." 
      }, 401);
    }

    if (!validateResponse.ok) {
      return c.json({ 
        error: `GitHub validation failed: ${validateResponse.status}` 
      }, 400);
    }

    // ChatGPT 5 spec: Use /user/repos for personal repositories (not /orgs/<org>/repos)
    const reposResponse = await fetch(`${GITHUB_API}/user/repos?sort=updated&per_page=50`, {
      headers: GITHUB_HEADERS(githubToken)
    });

    if (reposResponse.status === 403) {
      return c.json({ 
        error: "GitHub 403 Forbidden - Organization policy or permission issue" 
      }, 403);
    }

    if (reposResponse.ok) {
      const repos = await reposResponse.json();
      return c.json(repos);
    } else {
      const errorText = await reposResponse.text();
      return c.json({ 
        error: `Failed to fetch repositories: ${reposResponse.status} - ${errorText}` 
      }, 400);
    }
  } catch (error) {
    return c.json({ 
      error: "Failed to connect to GitHub", 
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Get user's Netlify sites
deploymentEndpoints.get("/api/deployment/netlify/sites", authMiddleware, async (c) => {
  const user: any = c.get("user");
  
  try {
    const { netlifyToken } = await getUserTokens(user.id, c.env.DB, c.env);
    
    if (!netlifyToken) {
      return c.json({ 
        error: "Netlify token not configured. Please add your token in API Tokens settings." 
      }, 400);
    }

    const response = await fetch('https://api.netlify.com/api/v1/sites', {
      headers: {
        'Authorization': `Bearer ${netlifyToken}`
      }
    });

    if (response.ok) {
      const sites = await response.json();
      return c.json(sites);
    } else {
      return c.json({ error: "Failed to fetch sites" }, 400);
    }
  } catch (error) {
    return c.json({ error: "Failed to connect to Netlify" }, 500);
  }
});

// ChatGPT 5 Token Sanitization Function
function sanitizeGitHubToken(token: string): string {
  return token.trim().replace(/^['"]|['"]$/g, '');
}

// ChatGPT 5 Token Validation Function
async function validateGitHubToken(token: string): Promise<{ valid: boolean; username?: string; error?: string; rawResponse?: string }> {
  try {
    const sanitizedToken = sanitizeGitHubToken(token);
    
    const response = await fetch(`${GITHUB_API}/user`, {
      headers: GITHUB_HEADERS(sanitizedToken)
    });

    if (response.status === 401) {
      const text = await response.text();
      return {
        valid: false,
        error: "401 Unauthorized - Token validation failed",
        rawResponse: text
      };
    }

    if (!response.ok) {
      const text = await response.text();
      return {
        valid: false,
        error: `HTTP ${response.status} - ${response.statusText}`,
        rawResponse: text
      };
    }

    const userData = await response.json();
    return {
      valid: true,
      username: userData.login
    };
  } catch (error) {
    return {
      valid: false,
      error: `Network error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Clear cached GitHub token and set new one
deploymentEndpoints.post("/api/deployment/github/set-token", authMiddleware, zValidator("json", z.object({
  token: z.string().min(1)
})), async (c) => {
  const user: any = c.get("user");
  const { token } = c.req.valid("json");
  
  try {
    console.log("🧹 Step 1: Clearing any cached/stored GitHub token...");
    
    // Clear cached token by deleting existing user preferences
    await c.env.DB.prepare(`
      DELETE FROM user_preferences WHERE user_id = ?
    `).bind(user.id).run();
    
    console.log("🔧 Step 2: Sanitizing token...");
    const sanitizedToken = sanitizeGitHubToken(token);
    
    console.log("🔐 Step 3: Validating token with ChatGPT 5 method...");
    const validation = await validateGitHubToken(sanitizedToken);
    
    if (!validation.valid) {
      console.log("❌ Token validation failed:", validation.error);
      return c.json({
        error: validation.error,
        rawResponse: validation.rawResponse,
        message: "STOP - Token validation failed. Do not continue with repository creation."
      }, 401);
    }
    
    console.log(`✅ Token validated successfully for user: ${validation.username}`);
    
    // Store the sanitized, validated token
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO user_preferences (
        user_id, github_token, updated_at
      ) VALUES (?, ?, CURRENT_TIMESTAMP)
    `).bind(user.id, sanitizedToken).run();
    
    return c.json({
      success: true,
      username: validation.username,
      message: `Token validated and stored for GitHub user: ${validation.username}`
    });
  } catch (error) {
    console.error("💥 Error setting GitHub token:", error);
    return c.json({
      error: `Failed to set GitHub token: ${error instanceof Error ? error.message : String(error)}`
    }, 500);
  }
});

// Create specific devtracker-pro repository using ChatGPT 5 specs
deploymentEndpoints.post("/api/deployment/github/create-devtracker-pro", authMiddleware, async (c) => {
  const user: any = c.get("user");
  
  try {
    // Get user's GitHub token
    const { githubToken } = await getUserTokens(user.id, c.env.DB, c.env);
    
    if (!githubToken) {
      return c.json({ 
        error: "GitHub token not configured. Please set your token first using /set-token endpoint." 
      }, 400);
    }

    console.log("🚀 Creating devtracker-pro repository using ChatGPT 5 exact specifications...");
    
    // Step 1: Validate token with GET /user (ChatGPT 5 mandatory validation)
    console.log("🔐 Step 1: Validating GitHub token with GET /user...");
    const validateResponse = await fetch(`${GITHUB_API}/user`, { 
      headers: GITHUB_HEADERS(githubToken) 
    });
    
    if (validateResponse.status === 401) {
      const text = await validateResponse.text();
      return c.json({
        error: "GitHub 401 Bad credentials - Token validation failed",
        rawResponse: text,
        instructions: [
          "Use Personal Access Token (classic) with scopes: repo, workflow, write:packages, user:email",
          "Go to Developer settings → Personal access tokens (classic) → your token → Configure SSO",
          "MANDATORY: Authorize it for your GitHub org (without this GitHub returns 401)",
          "Token must be 'classic' type, not fine-grained"
        ]
      }, 401);
    }
    
    if (!validateResponse.ok) {
      const text = await validateResponse.text();
      return c.json({
        error: `GitHub validation failed: ${validateResponse.status} - ${validateResponse.statusText}`,
        rawResponse: text
      }, 400);
    }
    
    const userData = await validateResponse.json();
    console.log(`✅ Token validated successfully for user: ${userData.login}`);

    // Step 2: Create repository under PERSONAL account
    console.log("📁 Step 2: Creating devtracker-pro repository under PERSONAL account...");
    
    // ChatGPT 5 spec: POST /user/repos for personal account (NOT organization)
    const createUrl = `${GITHUB_API}/user/repos`;
    
    // ChatGPT 5 spec: exact body format
    const requestBody = {
      name: "devtracker-pro",
      private: true,
      auto_init: true
    };

    const createResponse = await fetch(createUrl, {
      method: "POST",
      headers: GITHUB_HEADERS(githubToken),
      body: JSON.stringify(requestBody),
    });

    if (createResponse.status === 401) {
      const text = await createResponse.text();
      return c.json({
        error: "GitHub 401 during repo creation - Invalid/Unauthorized SSO",
        rawResponse: text,
        solution: "Go to GitHub → Settings → Developer settings → Personal access tokens (classic) → Find your token → Click 'Configure SSO' → Authorize for your organization. This is mandatory for org-connected accounts."
      }, 401);
    }

    if (createResponse.status === 403) {
      const text = await createResponse.text();
      return c.json({
        error: "GitHub 403 Request forbidden by administrative rules",
        rawResponse: text,
        causes: [
          "Member repo-creation may be disabled—only owners can create repos",
          "Visibility policy may block public repos—create private instead", 
          "Enterprise IP allow list may be blocking Mocha's IPs",
          "Re-check SAML SSO authorization"
        ]
      }, 403);
    }

    if (!createResponse.ok) {
      const text = await createResponse.text();
      return c.json({
        error: `GitHub API error ${createResponse.status} during repo creation`,
        rawResponse: text
      }, createResponse.status);
    }

    const repoData = await createResponse.json();
    console.log(`✅ Repository created successfully: ${repoData.full_name}`);
    
    return c.json({
      success: true,
      repository: {
        id: repoData.id,
        name: repoData.name,
        full_name: repoData.full_name,
        html_url: repoData.html_url,
        clone_url: repoData.clone_url,
        private: repoData.private
      },
      message: `devtracker-pro repository created successfully under your personal account: ${repoData.html_url}`
    });
  } catch (error) {
    console.error("💥 GitHub deployment error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ 
      error: "GitHub deployment failed: " + errorMessage,
      details: "Check console for full error details."
    }, 500);
  }
});

// Test connections with user's tokens
deploymentEndpoints.get("/api/deployment/test-connections", authMiddleware, async (c) => {
  const user: any = c.get("user");
  
  try {
    const { githubToken, netlifyToken } = await getUserTokens(user.id, c.env.DB, c.env);

    const results = {
      github: { 
        configured: !!githubToken, 
        connected: false, 
        error: null as string | null,
        username: null as string | null
      },
      netlify: { 
        configured: !!netlifyToken, 
        connected: false, 
        error: null as string | null,
        email: null as string | null
      }
    };

    // Test GitHub connection (ChatGPT 5 validation method)
    if (githubToken) {
      try {
        const githubResponse = await fetch(`${GITHUB_API}/user`, {
          headers: GITHUB_HEADERS(githubToken)
        });

        if (githubResponse.status === 401) {
          results.github.error = "401 Unauthorized - SSO not configured. Go to GitHub → Settings → Developer settings → Personal access tokens (classic) → Configure SSO → Authorize for your org";
        } else if (githubResponse.status === 403) {
          results.github.error = "403 Forbidden - Organization policy or permission issue (not credentials)";
        } else if (githubResponse.ok) {
          const userData = await githubResponse.json();
          results.github.connected = true;
          results.github.username = userData.login;
        } else {
          const errorText = await githubResponse.text();
          results.github.error = `HTTP ${githubResponse.status}: ${errorText}`;
        }
      } catch (error) {
        results.github.error = "Network connection failed";
      }
    }

    // Test Netlify connection
    if (netlifyToken) {
      try {
        const netlifyResponse = await fetch('https://api.netlify.com/api/v1/user', {
          headers: {
            'Authorization': `Bearer ${netlifyToken}`
          }
        });

        if (netlifyResponse.ok) {
          const userData = await netlifyResponse.json();
          results.netlify.connected = true;
          results.netlify.email = userData.email;
        } else {
          results.netlify.error = `HTTP ${netlifyResponse.status}`;
        }
      } catch (error) {
        results.netlify.error = "Connection failed";
      }
    }

    return c.json(results);
  } catch (error) {
    return c.json({ 
      error: "Failed to test connections", 
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

export default deploymentEndpoints;
