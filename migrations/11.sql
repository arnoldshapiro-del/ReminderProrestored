
-- Add separate development and published timestamps for better tracking
ALTER TABLE projects ADD COLUMN mocha_development_updated_at DATETIME;
ALTER TABLE projects ADD COLUMN github_development_updated_at DATETIME;
ALTER TABLE projects ADD COLUMN netlify_development_updated_at DATETIME;
ALTER TABLE projects ADD COLUMN vercel_development_updated_at DATETIME;
ALTER TABLE projects ADD COLUMN twilio_development_updated_at DATETIME;
ALTER TABLE projects ADD COLUMN custom_platform_1_development_updated_at DATETIME;
ALTER TABLE projects ADD COLUMN custom_platform_2_development_updated_at DATETIME;
ALTER TABLE projects ADD COLUMN custom_platform_3_development_updated_at DATETIME;
