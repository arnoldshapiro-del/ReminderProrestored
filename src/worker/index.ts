import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { 
  authMiddleware,
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME
} from "@getmocha/users-service/backend";
import { setCookie, getCookie } from "hono/cookie";
import advancedEndpoints from "./advanced-endpoints";
import deploymentEndpoints from "./deployment-endpoints";
import tokenSettingsEndpoints from "./token-settings-endpoints";

type Variables = {
  user: any;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS middleware
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Mount advanced endpoints
app.route("/", advancedEndpoints);

// Mount deployment endpoints
app.route("/", deploymentEndpoints);

// Mount token settings endpoints
app.route("/", tokenSettingsEndpoints);

// Auth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  try {
    const redirectUrl = await getOAuthRedirectUrl('google', {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
    return c.json({ redirectUrl });
  } catch (error) {
    return c.json({ error: "Failed to get redirect URL" }, 500);
  }
});

app.post("/api/sessions", async (c) => {
  try {
    const body = await c.req.json();
    
    if (!body.code) {
      return c.json({ error: "No authorization code provided" }, 400);
    }

    const sessionToken = await exchangeCodeForSessionToken(body.code, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });

    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to exchange code for session" }, 500);
  }
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  try {
    const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

    if (typeof sessionToken === 'string') {
      await deleteSession(sessionToken, {
        apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
        apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
      });
    }

    setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: true,
      maxAge: 0,
    });

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to logout" }, 500);
  }
});

// Projects endpoints
app.get("/api/projects", authMiddleware, async (c) => {
  const user: any = c.get("user");
  const limit = c.req.query("limit");
  const sort = c.req.query("sort") || "updated_at";
  
  let query = "SELECT * FROM projects WHERE user_id = ? ORDER BY " + sort + " DESC";
  const params = [user.id];
  
  if (limit) {
    query += " LIMIT ?";
    params.push(limit);
  }
  
  try {
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(result.results || []);
  } catch (error) {
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

app.post("/api/projects", authMiddleware, zValidator("json", z.object({
  project_name: z.string().min(1),
  project_description: z.string().optional(),
  ai_platform: z.string(),
  project_type: z.string(),
  platform_url: z.string().optional(),
  github_repo_url: z.string().optional(),
  netlify_url: z.string().optional(),
  credits_used: z.number().optional(),
})), async (c) => {
  const user: any = c.get("user");
  const data = c.req.valid("json");
  
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO projects (
        user_id, project_name, project_description, ai_platform, 
        project_type, platform_url, github_repo_url, netlify_url,
        credits_used, initial_budget_credits, credits_remaining, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      user.id,
      data.project_name,
      data.project_description || null,
      data.ai_platform,
      data.project_type,
      data.platform_url || null,
      data.github_repo_url || null,
      data.netlify_url || null,
      data.credits_used || 0,
      100,
      100 - (data.credits_used || 0)
    ).run();
    
    if (result.success) {
      return c.json({ id: result.meta.last_row_id, ...data });
    } else {
      return c.json({ error: "Failed to create project" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to create project" }, 500);
  }
});

app.put("/api/projects/:id", authMiddleware, async (c) => {
  const user: any = c.get("user");
  const projectId = c.req.param("id");
  const data = await c.req.json();
  
  try {
    const result = await c.env.DB.prepare(`
      UPDATE projects SET 
        project_name = COALESCE(?, project_name),
        project_description = COALESCE(?, project_description),
        status = COALESCE(?, status),
        completion_percentage = COALESCE(?, completion_percentage),
        github_repo_url = COALESCE(?, github_repo_url),
        netlify_url = COALESCE(?, netlify_url),
        vercel_url = COALESCE(?, vercel_url),
        features_completed = COALESCE(?, features_completed),
        features_pending = COALESCE(?, features_pending),
        known_bugs = COALESCE(?, known_bugs),
        credits_used = COALESCE(?, credits_used),
        mocha_published_url = COALESCE(?, mocha_published_url),
        mocha_published_at = COALESCE(?, mocha_published_at),
        mocha_published_version = COALESCE(?, mocha_published_version),
        github_pushed_at = COALESCE(?, github_pushed_at),
        github_commit_hash = COALESCE(?, github_commit_hash),
        github_branch = COALESCE(?, github_branch),
        netlify_deployed_at = COALESCE(?, netlify_deployed_at),
        netlify_deploy_id = COALESCE(?, netlify_deploy_id),
        netlify_domain = COALESCE(?, netlify_domain),
        vercel_deployed_at = COALESCE(?, vercel_deployed_at),
        vercel_deployment_id = COALESCE(?, vercel_deployment_id),
        twilio_configured_at = COALESCE(?, twilio_configured_at),
        twilio_phone_number = COALESCE(?, twilio_phone_number),
        twilio_status = COALESCE(?, twilio_status),
        custom_platform_1_name = COALESCE(?, custom_platform_1_name),
        custom_platform_1_url = COALESCE(?, custom_platform_1_url),
        custom_platform_1_deployed_at = COALESCE(?, custom_platform_1_deployed_at),
        custom_platform_1_version = COALESCE(?, custom_platform_1_version),
        custom_platform_2_name = COALESCE(?, custom_platform_2_name),
        custom_platform_2_url = COALESCE(?, custom_platform_2_url),
        custom_platform_2_deployed_at = COALESCE(?, custom_platform_2_deployed_at),
        custom_platform_2_version = COALESCE(?, custom_platform_2_version),
        custom_platform_3_name = COALESCE(?, custom_platform_3_name),
        custom_platform_3_url = COALESCE(?, custom_platform_3_url),
        custom_platform_3_deployed_at = COALESCE(?, custom_platform_3_deployed_at),
        custom_platform_3_version = COALESCE(?, custom_platform_3_version),
        mocha_development_url = COALESCE(?, mocha_development_url),
        github_development_url = COALESCE(?, github_development_url),
        netlify_development_url = COALESCE(?, netlify_development_url),
        vercel_development_url = COALESCE(?, vercel_development_url),
        twilio_development_url = COALESCE(?, twilio_development_url),
        custom_platform_1_development_url = COALESCE(?, custom_platform_1_development_url),
        custom_platform_2_development_url = COALESCE(?, custom_platform_2_development_url),
        custom_platform_3_development_url = COALESCE(?, custom_platform_3_development_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      data.project_name || null,
      data.project_description || null,
      data.status || null,
      data.completion_percentage || null,
      data.github_repo_url || null,
      data.netlify_url || null,
      data.vercel_url || null,
      data.features_completed || null,
      data.features_pending || null,
      data.known_bugs || null,
      data.credits_used || null,
      data.mocha_published_url || null,
      data.mocha_published_at || null,
      data.mocha_published_version || null,
      data.github_pushed_at || null,
      data.github_commit_hash || null,
      data.github_branch || null,
      data.netlify_deployed_at || null,
      data.netlify_deploy_id || null,
      data.netlify_domain || null,
      data.vercel_deployed_at || null,
      data.vercel_deployment_id || null,
      data.twilio_configured_at || null,
      data.twilio_phone_number || null,
      data.twilio_status || null,
      data.custom_platform_1_name || null,
      data.custom_platform_1_url || null,
      data.custom_platform_1_deployed_at || null,
      data.custom_platform_1_version || null,
      data.custom_platform_2_name || null,
      data.custom_platform_2_url || null,
      data.custom_platform_2_deployed_at || null,
      data.custom_platform_2_version || null,
      data.custom_platform_3_name || null,
      data.custom_platform_3_url || null,
      data.custom_platform_3_deployed_at || null,
      data.custom_platform_3_version || null,
      data.mocha_development_url || null,
      data.github_development_url || null,
      data.netlify_development_url || null,
      data.vercel_development_url || null,
      data.twilio_development_url || null,
      data.custom_platform_1_development_url || null,
      data.custom_platform_2_development_url || null,
      data.custom_platform_3_development_url || null,
      projectId,
      user.id
    ).run();
    
    if (result.success) {
      // Log the version update to the version logs table
      if (data.mocha_published_url || data.github_pushed_at || data.netlify_deployed_at || data.vercel_deployed_at || data.twilio_configured_at) {
        const logEntries = [];
        
        if (data.mocha_published_url && data.mocha_published_at) {
          logEntries.push({
            platform: 'mocha',
            action: 'publish',
            version: data.mocha_published_version,
            url: data.mocha_published_url
          });
        }
        
        if (data.github_pushed_at) {
          logEntries.push({
            platform: 'github',
            action: 'push',
            version: data.github_commit_hash,
            url: data.github_repo_url
          });
        }
        
        if (data.netlify_deployed_at) {
          logEntries.push({
            platform: 'netlify',
            action: 'deploy',
            version: data.netlify_deploy_id,
            url: data.netlify_url
          });
        }
        
        if (data.vercel_deployed_at) {
          logEntries.push({
            platform: 'vercel',
            action: 'deploy',
            version: data.vercel_deployment_id,
            url: data.vercel_url
          });
        }
        
        if (data.twilio_configured_at) {
          logEntries.push({
            platform: 'twilio',
            action: 'configure',
            version: data.twilio_phone_number,
            url: 'https://console.twilio.com'
          });
        }
        
        // Insert version logs
        for (const entry of logEntries) {
          await c.env.DB.prepare(`
            INSERT INTO project_version_logs (
              project_id, platform_name, action_type, version_number, platform_url, notes
            ) VALUES (?, ?, ?, ?, ?, ?)
          `).bind(
            projectId,
            entry.platform,
            entry.action,
            entry.version || 'unknown',
            entry.url || null,
            `Updated via DevTracker Pro at ${new Date().toISOString()}`
          ).run();
        }
      }
      
      return c.json({ message: "Project updated successfully" });
    } else {
      return c.json({ error: "Failed to update project" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to update project" }, 500);
  }
});

app.delete("/api/projects/:id", authMiddleware, async (c) => {
  const user: any = c.get("user");
  const projectId = c.req.param("id");
  
  try {
    const result = await c.env.DB.prepare(
      "DELETE FROM projects WHERE id = ? AND user_id = ?"
    ).bind(projectId, user.id).run();
    
    if (result.success) {
      return c.json({ message: "Project deleted successfully" });
    } else {
      return c.json({ error: "Failed to delete project" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to delete project" }, 500);
  }
});

// Dashboard stats endpoint
app.get("/api/dashboard/stats", authMiddleware, async (c) => {
  const user: any = c.get("user");
  
  try {
    // Get project counts
    const projectsResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status IN ('development', 'testing') THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'deployed' THEN 1 END) as deployed_projects,
        SUM(credits_used) as total_credits_used,
        AVG(completion_percentage) as average_completion,
        COUNT(CASE WHEN known_bugs IS NOT NULL AND known_bugs != '[]' THEN 1 END) as projects_needing_attention
      FROM projects WHERE user_id = ?
    `).bind(user.id).first();

    // Get most used platform
    const platformResult = await c.env.DB.prepare(`
      SELECT ai_platform, COUNT(*) as count
      FROM projects WHERE user_id = ?
      GROUP BY ai_platform
      ORDER BY count DESC
      LIMIT 1
    `).bind(user.id).first();

    // Get recent activity
    const activityResult = await c.env.DB.prepare(`
      SELECT 
        id,
        'update' as type,
        'Updated ' || project_name as message,
        updated_at as timestamp,
        project_name
      FROM projects 
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 5
    `).bind(user.id).all();

    const stats = {
      totalProjects: projectsResult?.total_projects || 0,
      activeProjects: projectsResult?.active_projects || 0,
      deployedProjects: projectsResult?.deployed_projects || 0,
      totalCreditsUsed: projectsResult?.total_credits_used || 0,
      averageProjectCompletion: Math.round(projectsResult?.average_completion || 0),
      mostUsedPlatform: platformResult?.ai_platform || '',
      projectsNeedingAttention: projectsResult?.projects_needing_attention || 0,
      recentActivity: (activityResult?.results || []).map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp).toLocaleDateString()
      }))
    };

    return c.json(stats);
  } catch (error) {
    return c.json({ error: "Failed to fetch dashboard stats" }, 500);
  }
});

// AI Assistants endpoints
app.get("/api/ai-assistants", authMiddleware, async (c) => {
  const user: any = c.get("user");
  
  try {
    const result = await c.env.DB.prepare(
      "SELECT * FROM ai_assistants WHERE user_id = ? ORDER BY last_used_at DESC"
    ).bind(user.id).all();
    
    return c.json(result.results || []);
  } catch (error) {
    return c.json({ error: "Failed to fetch AI assistants" }, 500);
  }
});

// Bug reports endpoints
app.get("/api/bug-reports", authMiddleware, async (c) => {
  const user: any = c.get("user");
  const projectId = c.req.query("project_id");
  
  let query = `
    SELECT br.*, p.project_name 
    FROM bug_reports br 
    JOIN projects p ON br.project_id = p.id 
    WHERE p.user_id = ?
  `;
  const params = [user.id];
  
  if (projectId) {
    query += " AND br.project_id = ?";
    params.push(projectId);
  }
  
  query += " ORDER BY br.created_at DESC";
  
  try {
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(result.results || []);
  } catch (error) {
    return c.json({ error: "Failed to fetch bug reports" }, 500);
  }
});

// Credit usage analytics
app.get("/api/credit-usage", authMiddleware, async (c) => {
  const user: any = c.get("user");
  
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        cu.*,
        p.project_name
      FROM credit_usage cu
      JOIN projects p ON cu.project_id = p.id
      WHERE p.user_id = ?
      ORDER BY cu.created_at DESC
      LIMIT 50
    `).bind(user.id).all();
    
    return c.json(result.results || []);
  } catch (error) {
    return c.json({ error: "Failed to fetch credit usage" }, 500);
  }
});

// Analytics endpoint for existing functionality
app.get("/api/analytics", authMiddleware, async (c) => {
  try {
    // Return empty analytics data for now
    const emptyData = {
      totalPatients: 0,
      totalAppointments: 0,
      upcomingAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      remindersSent: 0,
      responseRate: 0,
      appointmentsByType: [],
      appointmentsByStatus: [],
      remindersByType: [],
      monthlyAppointments: [],
      patientEngagement: []
    };
    
    return c.json(emptyData);
  } catch (error) {
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

// Version logs endpoint
app.get("/api/projects/:id/version-logs", authMiddleware, async (c) => {
  const user: any = c.get("user");
  const projectId = c.req.param("id");
  
  try {
    // Verify project belongs to user
    const project = await c.env.DB.prepare(
      "SELECT id FROM projects WHERE id = ? AND user_id = ?"
    ).bind(projectId, user.id).first();
    
    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }
    
    const result = await c.env.DB.prepare(`
      SELECT * FROM project_version_logs 
      WHERE project_id = ? 
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(projectId).all();
    
    return c.json(result.results || []);
  } catch (error) {
    return c.json({ error: "Failed to fetch version logs" }, 500);
  }
});

// Quick version log endpoint - for adding manual entries
app.post("/api/projects/:id/version-logs", authMiddleware, async (c) => {
  const user: any = c.get("user");
  const projectId = c.req.param("id");
  const data = await c.req.json();
  
  try {
    // Verify project belongs to user
    const project = await c.env.DB.prepare(
      "SELECT id FROM projects WHERE id = ? AND user_id = ?"
    ).bind(projectId, user.id).first();
    
    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }
    
    const result = await c.env.DB.prepare(`
      INSERT INTO project_version_logs (
        project_id, platform_name, action_type, version_number, 
        platform_url, commit_hash, deployment_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      projectId,
      data.platform_name,
      data.action_type,
      data.version_number || null,
      data.platform_url || null,
      data.commit_hash || null,
      data.deployment_id || null,
      data.notes || null
    ).run();
    
    if (result.success) {
      return c.json({ id: result.meta.last_row_id, ...data });
    } else {
      return c.json({ error: "Failed to create version log" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to create version log" }, 500);
  }
});

// Delete version log entry
app.delete("/api/version-logs/:id", authMiddleware, async (c) => {
  const user: any = c.get("user");
  const logId = c.req.param("id");
  
  try {
    // Verify the version log belongs to a project owned by the user
    const log = await c.env.DB.prepare(`
      SELECT pvl.* FROM project_version_logs pvl
      JOIN projects p ON pvl.project_id = p.id
      WHERE pvl.id = ? AND p.user_id = ?
    `).bind(logId, user.id).first();
    
    if (!log) {
      return c.json({ error: "Version log not found" }, 404);
    }
    
    const result = await c.env.DB.prepare(
      "DELETE FROM project_version_logs WHERE id = ?"
    ).bind(logId).run();
    
    if (result.success) {
      return c.json({ message: "Version log deleted successfully" });
    } else {
      return c.json({ error: "Failed to delete version log" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to delete version log" }, 500);
  }
});

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch-all for API routes
app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "API endpoint not found" }, 404);
  }
  return c.text("Not Found", 404);
});

export default app;
