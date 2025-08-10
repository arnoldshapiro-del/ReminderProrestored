
-- Add comprehensive version tracking fields to projects table
ALTER TABLE projects ADD COLUMN mocha_published_url TEXT;
ALTER TABLE projects ADD COLUMN mocha_published_at DATETIME;
ALTER TABLE projects ADD COLUMN mocha_published_version TEXT DEFAULT 'v1.0.0';

ALTER TABLE projects ADD COLUMN github_pushed_at DATETIME;
ALTER TABLE projects ADD COLUMN github_commit_hash TEXT;
ALTER TABLE projects ADD COLUMN github_branch TEXT DEFAULT 'main';

ALTER TABLE projects ADD COLUMN netlify_deployed_at DATETIME;
ALTER TABLE projects ADD COLUMN netlify_deploy_id TEXT;
ALTER TABLE projects ADD COLUMN netlify_domain TEXT;

ALTER TABLE projects ADD COLUMN vercel_deployed_at DATETIME;
ALTER TABLE projects ADD COLUMN vercel_deployment_id TEXT;

ALTER TABLE projects ADD COLUMN twilio_configured_at DATETIME;
ALTER TABLE projects ADD COLUMN twilio_phone_number TEXT;
ALTER TABLE projects ADD COLUMN twilio_status TEXT DEFAULT 'not_configured';

ALTER TABLE projects ADD COLUMN custom_platform_1_name TEXT;
ALTER TABLE projects ADD COLUMN custom_platform_1_url TEXT;
ALTER TABLE projects ADD COLUMN custom_platform_1_deployed_at DATETIME;
ALTER TABLE projects ADD COLUMN custom_platform_1_version TEXT;

ALTER TABLE projects ADD COLUMN custom_platform_2_name TEXT;
ALTER TABLE projects ADD COLUMN custom_platform_2_url TEXT;
ALTER TABLE projects ADD COLUMN custom_platform_2_deployed_at DATETIME;
ALTER TABLE projects ADD COLUMN custom_platform_2_version TEXT;

ALTER TABLE projects ADD COLUMN custom_platform_3_name TEXT;
ALTER TABLE projects ADD COLUMN custom_platform_3_url TEXT;
ALTER TABLE projects ADD COLUMN custom_platform_3_deployed_at DATETIME;
ALTER TABLE projects ADD COLUMN custom_platform_3_version TEXT;

-- Create version tracking log table for detailed history
CREATE TABLE project_version_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    platform_name TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'publish', 'deploy', 'push', 'configure'
    version_number TEXT,
    platform_url TEXT,
    commit_hash TEXT,
    deployment_id TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
