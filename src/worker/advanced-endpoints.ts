import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type Variables = {
  user: any;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// AI Prompts endpoints
app.get("/api/ai-prompts", async (c) => {
  const user: any = c.get("user");
  const projectId = c.req.query("project_id");
  
  let query = "SELECT * FROM ai_prompts WHERE user_id = ?";
  const params = [user.id];
  
  if (projectId) {
    query += " AND project_id = ?";
    params.push(projectId);
  }
  
  query += " ORDER BY created_at DESC";
  
  try {
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(result.results || []);
  } catch (error) {
    return c.json({ error: "Failed to fetch AI prompts" }, 500);
  }
});

app.post("/api/ai-prompts", zValidator("json", z.object({
  project_id: z.number(),
  prompt_title: z.string(),
  prompt_content: z.string(),
  ai_platform: z.string(),
  success_rating: z.number().min(1).max(10),
  output_quality: z.number().min(1).max(10),
  credits_consumed: z.number().min(0),
  tags: z.array(z.string()).optional(),
  time_to_result_minutes: z.number().optional()
})), async (c) => {
  const user: any = c.get("user");
  const data = c.req.valid("json");
  
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO ai_prompts (
        user_id, project_id, prompt_title, prompt_content, ai_platform,
        success_rating, output_quality, credits_consumed, tags, time_to_result_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      data.project_id,
      data.prompt_title,
      data.prompt_content,
      data.ai_platform,
      data.success_rating,
      data.output_quality,
      data.credits_consumed,
      JSON.stringify(data.tags || []),
      data.time_to_result_minutes || null
    ).run();
    
    if (result.success) {
      return c.json({ id: result.meta.last_row_id, ...data });
    } else {
      return c.json({ error: "Failed to create AI prompt" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to create AI prompt" }, 500);
  }
});

// Project Budget endpoints
app.get("/api/project-budgets/:projectId", async (c) => {
  const user: any = c.get("user");
  const projectId = c.req.param("projectId");
  
  try {
    const result = await c.env.DB.prepare(`
      SELECT pb.* FROM project_budgets pb
      JOIN projects p ON pb.project_id = p.id
      WHERE p.user_id = ? AND pb.project_id = ?
    `).bind(user.id, projectId).first();
    
    return c.json(result || {});
  } catch (error) {
    return c.json({ error: "Failed to fetch project budget" }, 500);
  }
});

app.post("/api/project-budgets", zValidator("json", z.object({
  project_id: z.number(),
  initial_budget_credits: z.number(),
  current_credits_remaining: z.number(),
  credits_consumed: z.number(),
  estimated_completion_credits: z.number().optional(),
  budget_alerts_enabled: z.boolean().optional(),
  alert_threshold_percentage: z.number().optional()
})), async (c) => {
  const user: any = c.get("user");
  const data = c.req.valid("json");
  
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO project_budgets (
        user_id, project_id, initial_budget_credits, current_credits_remaining,
        credits_consumed, estimated_completion_credits, budget_alerts_enabled,
        alert_threshold_percentage, efficiency_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      data.project_id,
      data.initial_budget_credits,
      data.current_credits_remaining,
      data.credits_consumed,
      data.estimated_completion_credits || 0,
      data.budget_alerts_enabled || true,
      data.alert_threshold_percentage || 80,
      data.credits_consumed > 0 ? (data.current_credits_remaining / data.credits_consumed) * 10 : 10
    ).run();
    
    if (result.success) {
      return c.json({ id: result.meta.last_row_id, ...data });
    } else {
      return c.json({ error: "Failed to create project budget" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to create project budget" }, 500);
  }
});

// Deployment Tracking endpoints
app.get("/api/deployment-tracking", async (c) => {
  const user: any = c.get("user");
  
  try {
    const result = await c.env.DB.prepare(`
      SELECT dt.*, p.project_name 
      FROM deployment_tracking dt
      JOIN projects p ON dt.project_id = p.id
      WHERE p.user_id = ?
      ORDER BY dt.last_checked_at DESC
    `).bind(user.id).all();
    
    return c.json(result.results || []);
  } catch (error) {
    return c.json({ error: "Failed to fetch deployment tracking" }, 500);
  }
});

app.post("/api/check-deployment", zValidator("json", z.object({
  url: z.string().url()
})), async (c) => {
  const { url } = c.req.valid("json");
  
  try {
    // Simulate deployment check for Cloudflare Workers
    // In production, you'd actually check the URL
    const isOnline = url.includes('netlify.app') ? Math.random() > 0.05 : Math.random() > 0.1;
    
    return c.json({
      status: isOnline ? 'online' : 'offline',
      statusCode: isOnline ? 200 : 503,
      responseTime: 150 + Math.floor(Math.random() * 500)
    });
  } catch (error) {
    return c.json({
      status: 'error',
      statusCode: 0,
      responseTime: 0
    });
  }
});

// Project Templates endpoints
app.get("/api/project-templates", async (c) => {
  const user: any = c.get("user");
  const isPublic = c.req.query("public");
  
  let query = "SELECT * FROM project_templates WHERE ";
  const params = [];
  
  if (isPublic === 'true') {
    query += "is_public = 1";
  } else {
    query += "user_id = ?";
    params.push(user.id);
  }
  
  query += " ORDER BY downloads_count DESC, created_at DESC";
  
  try {
    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(result.results || []);
  } catch (error) {
    return c.json({ error: "Failed to fetch project templates" }, 500);
  }
});

app.post("/api/project-templates", zValidator("json", z.object({
  template_name: z.string(),
  template_description: z.string().optional(),
  project_type: z.string(),
  ai_platform: z.string(),
  estimated_credits: z.number(),
  estimated_hours: z.number(),
  difficulty_level: z.enum(['easy', 'medium', 'hard']),
  template_data: z.any(),
  tags: z.array(z.string()),
  is_public: z.boolean().optional()
})), async (c) => {
  const user: any = c.get("user");
  const data = c.req.valid("json");
  
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO project_templates (
        user_id, template_name, template_description, project_type, ai_platform,
        estimated_credits, estimated_hours, difficulty_level, template_data,
        tags, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      data.template_name,
      data.template_description || '',
      data.project_type,
      data.ai_platform,
      data.estimated_credits,
      data.estimated_hours,
      data.difficulty_level,
      JSON.stringify(data.template_data),
      JSON.stringify(data.tags),
      data.is_public || false
    ).run();
    
    if (result.success) {
      return c.json({ id: result.meta.last_row_id, ...data });
    } else {
      return c.json({ error: "Failed to create project template" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to create project template" }, 500);
  }
});

// Cross-platform Comparisons endpoints
app.get("/api/cross-platform-comparisons", async (c) => {
  const user: any = c.get("user");
  
  try {
    const result = await c.env.DB.prepare(
      "SELECT * FROM cross_platform_comparisons WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(user.id).all();
    
    return c.json(result.results || []);
  } catch (error) {
    return c.json({ error: "Failed to fetch cross-platform comparisons" }, 500);
  }
});

app.post("/api/cross-platform-comparisons", zValidator("json", z.object({
  project_concept: z.string(),
  platform_results: z.any(),
  winner_platform: z.string().optional(),
  recommendation_notes: z.string().optional()
})), async (c) => {
  const user: any = c.get("user");
  const data = c.req.valid("json");
  
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO cross_platform_comparisons (
        user_id, project_concept, platform_results, winner_platform,
        recommendation_notes
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      user.id,
      data.project_concept,
      JSON.stringify(data.platform_results),
      data.winner_platform || null,
      data.recommendation_notes || null
    ).run();
    
    if (result.success) {
      return c.json({ id: result.meta.last_row_id, ...data });
    } else {
      return c.json({ error: "Failed to create cross-platform comparison" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to create cross-platform comparison" }, 500);
  }
});

// Performance Metrics endpoints
app.get("/api/performance-metrics/:projectId", async (c) => {
  const user: any = c.get("user");
  const projectId = c.req.param("projectId");
  
  try {
    const result = await c.env.DB.prepare(`
      SELECT pm.* FROM performance_metrics pm
      JOIN projects p ON pm.project_id = p.id
      WHERE p.user_id = ? AND pm.project_id = ?
      ORDER BY pm.metric_date DESC
    `).bind(user.id, projectId).all();
    
    return c.json(result.results || []);
  } catch (error) {
    return c.json({ error: "Failed to fetch performance metrics" }, 500);
  }
});

app.post("/api/performance-metrics", zValidator("json", z.object({
  project_id: z.number(),
  time_to_deploy_hours: z.number().optional(),
  features_completed: z.number(),
  bugs_fixed: z.number(),
  code_quality_score: z.number(),
  user_satisfaction_score: z.number(),
  performance_score: z.number(),
  credits_efficiency: z.number(),
  platform_rating: z.number()
})), async (c) => {
  const data = c.req.valid("json");
  
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO performance_metrics (
        project_id, metric_date, time_to_deploy_hours, features_completed,
        bugs_fixed, code_quality_score, user_satisfaction_score,
        performance_score, credits_efficiency, platform_rating
      ) VALUES (?, DATE('now'), ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.project_id,
      data.time_to_deploy_hours || 0,
      data.features_completed,
      data.bugs_fixed,
      data.code_quality_score,
      data.user_satisfaction_score,
      data.performance_score,
      data.credits_efficiency,
      data.platform_rating
    ).run();
    
    if (result.success) {
      return c.json({ id: result.meta.last_row_id, ...data });
    } else {
      return c.json({ error: "Failed to create performance metrics" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to create performance metrics" }, 500);
  }
});

export default app;
