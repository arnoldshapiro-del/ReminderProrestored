
-- Update projects table with new credit tracking fields
ALTER TABLE projects ADD COLUMN initial_budget_credits INTEGER DEFAULT 100;
ALTER TABLE projects ADD COLUMN credits_remaining INTEGER DEFAULT 100;
ALTER TABLE projects ADD COLUMN estimated_completion_credits INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN cost_per_feature REAL DEFAULT 0;
ALTER TABLE projects ADD COLUMN budget_efficiency_score REAL DEFAULT 0;
ALTER TABLE projects ADD COLUMN time_to_deploy_hours REAL DEFAULT 0;

-- Update existing projects to have reasonable defaults using SQLite-compatible syntax
UPDATE projects SET 
  initial_budget_credits = CASE 
    WHEN credits_used > 0 THEN credits_used + 50 
    ELSE 100 
  END,
  credits_remaining = CASE 
    WHEN credits_used > 0 THEN 
      CASE WHEN (credits_used + 50) - credits_used < 0 THEN 0 ELSE (credits_used + 50) - credits_used END
    ELSE 100 - credits_used
  END,
  estimated_completion_credits = CASE
    WHEN completion_percentage > 0 THEN ROUND((credits_used * 100.0 / completion_percentage) - credits_used)
    ELSE credits_used + 20
  END,
  cost_per_feature = CASE
    WHEN completion_percentage > 0 THEN ROUND(credits_used * 1.0 / CASE WHEN completion_percentage / 10 < 1 THEN 1 ELSE completion_percentage / 10 END, 2)
    ELSE 5.0
  END,
  budget_efficiency_score = CASE
    WHEN credits_used > 0 AND completion_percentage > 0 THEN 
      ROUND(completion_percentage * 1.0 / credits_used * 10, 1)
    ELSE 8.5
  END;
