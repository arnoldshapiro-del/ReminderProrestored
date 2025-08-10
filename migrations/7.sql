
-- Add advanced features tables
CREATE TABLE ai_prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  prompt_title TEXT NOT NULL,
  prompt_content TEXT NOT NULL,
  prompt_version TEXT DEFAULT 'v1.0',
  ai_platform TEXT NOT NULL,
  success_rating INTEGER DEFAULT 5,
  output_quality INTEGER DEFAULT 5,
  time_to_result_minutes INTEGER,
  credits_consumed INTEGER DEFAULT 0,
  tags TEXT, -- JSON array
  is_favorite BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  initial_budget_credits INTEGER NOT NULL,
  current_credits_remaining INTEGER NOT NULL,
  credits_consumed INTEGER DEFAULT 0,
  estimated_completion_credits INTEGER,
  budget_alerts_enabled BOOLEAN DEFAULT 1,
  alert_threshold_percentage INTEGER DEFAULT 80,
  cost_per_feature REAL DEFAULT 0,
  efficiency_score REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deployment_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  deployment_url TEXT,
  deployment_platform TEXT NOT NULL,
  status TEXT DEFAULT 'unknown',
  last_checked_at TIMESTAMP,
  uptime_percentage REAL DEFAULT 100.0,
  response_time_ms INTEGER,
  ssl_status TEXT DEFAULT 'unknown',
  auto_detected BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_description TEXT,
  project_type TEXT NOT NULL,
  ai_platform TEXT NOT NULL,
  estimated_credits INTEGER DEFAULT 0,
  estimated_hours INTEGER DEFAULT 0,
  difficulty_level TEXT DEFAULT 'medium',
  template_data TEXT NOT NULL, -- JSON with project structure
  success_rate REAL DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT 0,
  tags TEXT, -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT 1,
  last_sync_at TIMESTAMP,
  sync_frequency_minutes INTEGER DEFAULT 60,
  configuration TEXT, -- JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  metric_date DATE NOT NULL,
  time_to_deploy_hours REAL,
  features_completed INTEGER DEFAULT 0,
  bugs_fixed INTEGER DEFAULT 0,
  code_quality_score REAL DEFAULT 0,
  user_satisfaction_score REAL DEFAULT 0,
  performance_score REAL DEFAULT 0,
  credits_efficiency REAL DEFAULT 0,
  platform_rating INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cross_platform_comparisons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  project_concept TEXT NOT NULL,
  platform_results TEXT NOT NULL, -- JSON with platform comparison data
  winner_platform TEXT,
  cost_analysis TEXT, -- JSON
  time_analysis TEXT, -- JSON
  quality_analysis TEXT, -- JSON
  recommendation_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
