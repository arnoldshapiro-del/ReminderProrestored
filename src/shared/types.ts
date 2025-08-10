export interface ProjectType {
  id: number;
  user_id: string;
  project_name: string;
  project_description?: string;
  ai_platform: string;
  project_type: string;
  status: string;
  completion_percentage: number;
  current_version?: string;
  last_working_version?: string;
  github_repo_url?: string;
  github_status: string;
  netlify_url?: string;
  netlify_status: string;
  vercel_url?: string;
  vercel_status: string;
  twilio_configured: boolean;
  openai_configured: boolean;
  other_apis?: string;
  features_completed?: string;
  features_pending?: string;
  known_bugs?: string;
  credits_used: number;
  estimated_credits_remaining?: number;
  platform_project_id?: string;
  platform_url?: string;
  platform_last_active?: string;
  is_published: boolean;
  contains_sensitive_data: boolean;
  privacy_notes?: string;
  build_success_rate: number;
  deployment_success_rate: number;
  last_successful_build?: string;
  last_successful_deployment?: string;
  created_at: string;
  updated_at: string;
  initial_budget_credits?: number;
  credits_remaining?: number;
  credits_consumed?: number;
  estimated_completion_credits?: number;
  cost_per_feature?: number;
  budget_efficiency_score?: number;
  time_to_deploy_hours?: number;
}

export interface AIAssistantType {
  id?: number;
  user_id: string;
  platform_name: string;
  platform_url: string;
  pricing_model: 'free' | 'credits' | 'subscription' | 'usage_based';
  credits_remaining?: number;
  subscription_status?: 'active' | 'expired' | 'trial';
  
  // Performance metrics
  projects_completed: number;
  average_completion_time_hours: number;
  success_rate_percentage: number;
  credit_efficiency_score: number; // credits per feature
  
  // Strengths and weaknesses
  best_for?: string; // JSON array of project types
  worst_for?: string; // JSON array of project types
  notes?: string;
  
  last_used_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeploymentEventType {
  id?: number;
  project_id: number;
  event_type: 'github_push' | 'netlify_deploy' | 'vercel_deploy' | 'api_config' | 'bug_fix' | 'feature_add';
  event_description: string;
  status: 'success' | 'failed' | 'in_progress';
  platform_involved: string;
  credits_used?: number;
  error_details?: string;
  
  created_at?: string;
}

export interface ProjectComparisonType {
  id?: number;
  user_id: string;
  project_name: string;
  platforms_tested: string; // JSON array of platforms
  feature_comparison: string; // JSON object comparing features across platforms
  performance_comparison: string; // JSON object comparing performance metrics
  final_recommendation: string;
  notes?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStatsType {
  totalProjects: number;
  activeProjects: number;
  deployedProjects: number;
  totalCreditsUsed: number;
  averageProjectCompletion: number;
  mostUsedPlatform: string;
  projectsNeedingAttention: number;
  recentActivity: Array<{
    id: string;
    type: 'deployment' | 'update' | 'bug' | 'feature';
    message: string;
    timestamp: string;
    project_name: string;
  }>;
}

export interface BugReportType {
  id?: number;
  project_id: number;
  bug_title: string;
  bug_description: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  screenshot_url?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'fixed' | 'wont_fix';
  platform_affected: string;
  ai_fix_suggestion?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface FeatureRequestType {
  id?: number;
  project_id: number;
  feature_title: string;
  feature_description: string;
  priority: 'nice_to_have' | 'important' | 'critical';
  estimated_credits: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  platform_to_implement: string;
  ai_implementation_notes?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface CreditUsageType {
  id?: number;
  project_id: number;
  platform_name: string;
  credits_used: number;
  task_description: string;
  efficiency_rating: number; // 1-10 scale
  was_successful: boolean;
  notes?: string;
  
  created_at?: string;
}

// New Advanced Feature Types
export interface AIPromptType {
  id?: number;
  project_id: number;
  prompt_title: string;
  prompt_content: string;
  prompt_version: string;
  ai_platform: string;
  success_rating: number; // 1-10
  output_quality: number; // 1-10
  time_to_result_minutes?: number;
  credits_consumed: number;
  tags: string[]; // JSON array
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectBudgetType {
  id?: number;
  project_id: number;
  initial_budget_credits: number;
  current_credits_remaining: number;
  credits_consumed: number;
  estimated_completion_credits?: number;
  budget_alerts_enabled: boolean;
  alert_threshold_percentage: number;
  cost_per_feature: number;
  efficiency_score: number;
  created_at?: string;
  updated_at?: string;
}

export interface DeploymentTrackingType {
  id?: number;
  project_id: number;
  deployment_url?: string;
  deployment_platform: string;
  status: 'online' | 'offline' | 'error' | 'unknown';
  last_checked_at?: string;
  uptime_percentage: number;
  response_time_ms?: number;
  ssl_status: 'valid' | 'invalid' | 'unknown';
  auto_detected: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectTemplateType {
  id?: number;
  user_id: string;
  template_name: string;
  template_description?: string;
  project_type: string;
  ai_platform: string;
  estimated_credits: number;
  estimated_hours: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  template_data: any; // JSON with project structure
  success_rate: number;
  downloads_count: number;
  is_public: boolean;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface IntegrationType {
  id?: number;
  user_id: string;
  integration_name: string;
  integration_type: 'github' | 'figma' | 'discord' | 'slack' | 'notion' | 'linear' | 'custom';
  api_endpoint?: string;
  api_key_encrypted?: string;
  webhook_url?: string;
  is_active: boolean;
  last_sync_at?: string;
  sync_frequency_minutes: number;
  configuration: any; // JSON
  created_at?: string;
  updated_at?: string;
}

export interface PerformanceMetricType {
  id?: number;
  project_id: number;
  metric_date: string;
  time_to_deploy_hours?: number;
  features_completed: number;
  bugs_fixed: number;
  code_quality_score: number;
  user_satisfaction_score: number;
  performance_score: number;
  credits_efficiency: number;
  platform_rating: number;
  created_at?: string;
}

export interface CrossPlatformComparisonType {
  id: number;
  user_id: string;
  project_concept: string;
  platform_results: string;
  winner_platform?: string;
  cost_analysis?: string;
  time_analysis?: string;
  quality_analysis?: string;
  recommendation_notes?: string;
  created_at: string;
  updated_at?: string;
}

// Additional types for existing components
export interface PatientType {
  id?: number;
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  date_of_birth?: string;
  notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePatientRequestType {
  user_id?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  date_of_birth?: string;
  notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_active?: boolean;
}

export interface AppointmentWithPatientType {
  id?: number;
  user_id: string;
  patient_id: number;
  appointment_date: string;
  duration_minutes: number;
  appointment_type: string;
  status: AppointmentStatus;
  notes?: string;
  reminder_sent_2_days?: boolean;
  reminder_sent_1_day?: boolean;
  patient_response?: string;
  response_received_at?: string;
  patient: PatientType;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAppointmentRequestType {
  user_id?: string;
  patient_id: number;
  appointment_date: string;
  duration_minutes?: number;
  appointment_type?: string;
  notes?: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface AnalyticsDataType {
  totalPatients: number;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  remindersSent: number;
  responseRate: number;
  appointmentsByType: Array<{ type: string; count: number }>;
  appointmentsByStatus: Array<{ status: string; count: number }>;
  remindersByType: Array<{ type: string; count: number }>;
  monthlyAppointments: Array<{ month: string; completed: number; cancelled: number; no_show: number }>;
  patientEngagement: Array<{ date: string; responses: number; reminders: number }>;
}
