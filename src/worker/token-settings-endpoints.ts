import "./types";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "@getmocha/users-service/backend";

type Variables = {
  user: any;
};

const tokenSettingsEndpoints = new Hono<{ Bindings: Env; Variables: Variables }>();

// Get current token settings (masked for security)
tokenSettingsEndpoints.get("/api/settings/tokens", authMiddleware, async (c) => {
  try {
    // Check if tokens are configured in environment variables
    const githubToken = c.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const netlifyToken = c.env.NETLIFY_PERSONAL_ACCESS_TOKEN;
    
    return c.json({
      githubToken: githubToken ? `${githubToken.substring(0, 8)}...` : '',
      netlifyToken: netlifyToken ? `${netlifyToken.substring(0, 8)}...` : '',
      githubConfigured: !!githubToken,
      netlifyConfigured: !!netlifyToken
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch token settings" }, 500);
  }
});

// Save token settings
tokenSettingsEndpoints.post("/api/settings/tokens", authMiddleware, zValidator("json", z.object({
  githubToken: z.string().min(1, "GitHub token is required"),
  netlifyToken: z.string().min(1, "Netlify token is required")
})), async (c) => {
  const user: any = c.get("user");
  const { githubToken, netlifyToken } = c.req.valid("json");
  
  try {
    // In a real application, you would store these securely in a database
    // For now, we'll validate they're properly formatted and return success
    
    // Basic validation for GitHub tokens (should start with ghp_ or github_pat_)
    if (!githubToken.startsWith('ghp_') && !githubToken.startsWith('github_pat_')) {
      return c.json({ error: "Invalid GitHub token format. Should start with 'ghp_' or 'github_pat_'" }, 400);
    }
    
    // Basic validation for Netlify tokens (should be a long hex string)
    if (netlifyToken.length < 20) {
      return c.json({ error: "Invalid Netlify token format. Should be a long access token" }, 400);
    }
    
    // Store tokens in user preferences table
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO user_preferences (
        user_id, github_token, netlify_token, updated_at
      ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(user.id, githubToken, netlifyToken).run();
    
    return c.json({ 
      message: "Tokens saved successfully",
      githubConfigured: true,
      netlifyConfigured: true
    });
  } catch (error) {
    return c.json({ error: "Failed to save tokens" }, 500);
  }
});

// Test GitHub connection
tokenSettingsEndpoints.post("/api/settings/tokens/test/github", authMiddleware, zValidator("json", z.object({
  token: z.string().min(1)
})), async (c) => {
  const { token } = c.req.valid("json");
  
  try {
    // Test GitHub API connection
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DevTracker-Pro'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      return c.json({ 
        success: true, 
        username: userData.login,
        message: `Connected successfully as ${userData.login}` 
      });
    } else {
      return c.json({ 
        error: `GitHub API error: ${response.status} - Invalid token or insufficient permissions` 
      }, 400);
    }
  } catch (error) {
    return c.json({ 
      error: "Failed to connect to GitHub API. Check your internet connection." 
    }, 500);
  }
});

// Test Netlify connection
tokenSettingsEndpoints.post("/api/settings/tokens/test/netlify", authMiddleware, zValidator("json", z.object({
  token: z.string().min(1)
})), async (c) => {
  const { token } = c.req.valid("json");
  
  try {
    // Test Netlify API connection
    const response = await fetch('https://api.netlify.com/api/v1/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      return c.json({ 
        success: true, 
        email: userData.email,
        message: `Connected successfully as ${userData.email}` 
      });
    } else {
      return c.json({ 
        error: `Netlify API error: ${response.status} - Invalid token or insufficient permissions` 
      }, 400);
    }
  } catch (error) {
    return c.json({ 
      error: "Failed to connect to Netlify API. Check your internet connection." 
    }, 500);
  }
});

// Get stored tokens for deployment (internal use only)
tokenSettingsEndpoints.get("/api/internal/tokens/:userId", async (c) => {
  const userId = c.req.param("userId");
  
  try {
    const result = await c.env.DB.prepare(`
      SELECT github_token, netlify_token FROM user_preferences 
      WHERE user_id = ?
    `).bind(userId).first();
    
    if (result) {
      return c.json({
        githubToken: result.github_token,
        netlifyToken: result.netlify_token
      });
    } else {
      return c.json({ error: "No tokens found for user" }, 404);
    }
  } catch (error) {
    return c.json({ error: "Failed to fetch user tokens" }, 500);
  }
});

export default tokenSettingsEndpoints;
