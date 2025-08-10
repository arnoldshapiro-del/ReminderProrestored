
-- Remove version tracking fields
ALTER TABLE projects DROP COLUMN mocha_published_url;
ALTER TABLE projects DROP COLUMN mocha_published_at;
ALTER TABLE projects DROP COLUMN mocha_published_version;

ALTER TABLE projects DROP COLUMN github_pushed_at;
ALTER TABLE projects DROP COLUMN github_commit_hash;
ALTER TABLE projects DROP COLUMN github_branch;

ALTER TABLE projects DROP COLUMN netlify_deployed_at;
ALTER TABLE projects DROP COLUMN netlify_deploy_id;
ALTER TABLE projects DROP COLUMN netlify_domain;

ALTER TABLE projects DROP COLUMN vercel_deployed_at;
ALTER TABLE projects DROP COLUMN vercel_deployment_id;

ALTER TABLE projects DROP COLUMN twilio_configured_at;
ALTER TABLE projects DROP COLUMN twilio_phone_number;
ALTER TABLE projects DROP COLUMN twilio_status;

ALTER TABLE projects DROP COLUMN custom_platform_1_name;
ALTER TABLE projects DROP COLUMN custom_platform_1_url;
ALTER TABLE projects DROP COLUMN custom_platform_1_deployed_at;
ALTER TABLE projects DROP COLUMN custom_platform_1_version;

ALTER TABLE projects DROP COLUMN custom_platform_2_name;
ALTER TABLE projects DROP COLUMN custom_platform_2_url;
ALTER TABLE projects DROP COLUMN custom_platform_2_deployed_at;
ALTER TABLE projects DROP COLUMN custom_platform_2_version;

ALTER TABLE projects DROP COLUMN custom_platform_3_name;
ALTER TABLE projects DROP COLUMN custom_platform_3_url;
ALTER TABLE projects DROP COLUMN custom_platform_3_deployed_at;
ALTER TABLE projects DROP COLUMN custom_platform_3_version;

DROP TABLE project_version_logs;
