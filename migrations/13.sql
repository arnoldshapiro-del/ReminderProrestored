
INSERT INTO projects (
  user_id, project_name, project_description, ai_platform, project_type, 
  status, completion_percentage, credits_used, initial_budget_credits, 
  credits_remaining, created_at, updated_at
) VALUES 
(
  'demo-user', 'AI Chat Assistant', 'A smart chat assistant built with React and AI APIs', 
  'Mocha', 'Web App', 'development', 75, 25, 100, 75, 
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'demo-user', 'Task Manager Pro', 'Advanced task management system with AI insights', 
  'ChatGPT', 'SaaS App', 'testing', 90, 45, 100, 55, 
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'demo-user', 'Real Estate Bot', 'Automated property search and recommendation bot', 
  'Claude', 'Bot', 'deployed', 100, 80, 100, 20, 
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
