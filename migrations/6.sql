
-- AI Development Project Management System Database

-- Core projects table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_description TEXT,
  ai_platform TEXT NOT NULL,
  project_type TEXT NOT NULL,
  status TEXT DEFAULT 'planning',
  completion_percentage INTEGER DEFAULT 0,
  current_version TEXT DEFAULT '1.0.0',
  last_working_version TEXT,
  
  -- Deployment tracking
  github_repo_url TEXT,
  github_status TEXT DEFAULT 'none',
  netlify_url TEXT,
  netlify_status TEXT DEFAULT 'none',
  vercel_url TEXT,
  vercel_status TEXT DEFAULT 'none',
  
  -- API configurations
  twilio_configured BOOLEAN DEFAULT 0,
  openai_configured BOOLEAN DEFAULT 0,
  other_apis TEXT, -- JSON
  
  -- Feature and bug tracking
  features_completed TEXT, -- JSON array
  features_pending TEXT, -- JSON array
  known_bugs TEXT, -- JSON array
  
  -- Credit and cost tracking
  credits_used INTEGER DEFAULT 0,
  estimated_credits_remaining INTEGER DEFAULT 0,
  
  -- Platform specific
  platform_project_id TEXT,
  platform_url TEXT,
  platform_last_active DATETIME,
  
  -- Privacy and security
  is_published BOOLEAN DEFAULT 0,
  contains_sensitive_data BOOLEAN DEFAULT 0,
  privacy_notes TEXT,
  
  -- Performance metrics
  build_success_rate REAL DEFAULT 100.0,
  deployment_success_rate REAL DEFAULT 100.0,
  last_successful_build DATETIME,
  last_successful_deployment DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Assistant platforms tracking
CREATE TABLE ai_assistants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  platform_url TEXT NOT NULL,
  pricing_model TEXT NOT NULL,
  credits_remaining INTEGER,
  subscription_status TEXT,
  
  -- Performance tracking
  projects_completed INTEGER DEFAULT 0,
  average_completion_time_hours REAL DEFAULT 0,
  success_rate_percentage REAL DEFAULT 100.0,
  credit_efficiency_score REAL DEFAULT 0,
  
  -- Platform analysis
  best_for TEXT, -- JSON array
  worst_for TEXT, -- JSON array
  notes TEXT,
  
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Deployment events and history
CREATE TABLE deployment_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress',
  platform_involved TEXT NOT NULL,
  credits_used INTEGER DEFAULT 0,
  error_details TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project comparisons across platforms
CREATE TABLE project_comparisons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  platforms_tested TEXT NOT NULL, -- JSON array
  feature_comparison TEXT, -- JSON object
  performance_comparison TEXT, -- JSON object
  final_recommendation TEXT,
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bug reports and issue tracking
CREATE TABLE bug_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  bug_title TEXT NOT NULL,
  bug_description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  screenshot_url TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  platform_affected TEXT NOT NULL,
  ai_fix_suggestion TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Feature requests and roadmap
CREATE TABLE feature_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  feature_title TEXT NOT NULL,
  feature_description TEXT NOT NULL,
  priority TEXT DEFAULT 'nice_to_have',
  estimated_credits INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planned',
  platform_to_implement TEXT,
  ai_implementation_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Credit usage analytics
CREATE TABLE credit_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  platform_name TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  task_description TEXT NOT NULL,
  efficiency_rating INTEGER DEFAULT 5,
  was_successful BOOLEAN DEFAULT 1,
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User preferences and settings
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  default_ai_platform TEXT DEFAULT 'mocha',
  preferred_deployment TEXT DEFAULT 'netlify',
  credit_budget_monthly INTEGER DEFAULT 100,
  notification_preferences TEXT, -- JSON
  dashboard_layout TEXT, -- JSON
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
