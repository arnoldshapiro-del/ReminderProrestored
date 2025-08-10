
-- Remove the additional timestamp columns
ALTER TABLE projects DROP COLUMN mocha_development_updated_at;
ALTER TABLE projects DROP COLUMN github_development_updated_at;
ALTER TABLE projects DROP COLUMN netlify_development_updated_at;
ALTER TABLE projects DROP COLUMN vercel_development_updated_at;
ALTER TABLE projects DROP COLUMN twilio_development_updated_at;
ALTER TABLE projects DROP COLUMN custom_platform_1_development_updated_at;
ALTER TABLE projects DROP COLUMN custom_platform_2_development_updated_at;
ALTER TABLE projects DROP COLUMN custom_platform_3_development_updated_at;
