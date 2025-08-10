// Reminder System Types

export interface ReminderChannelType {
  id?: number;
  user_id: string;
  channel_name: string;
  channel_type: 'sms' | 'email' | 'voice' | 'push' | 'whatsapp' | 'webhook';
  is_enabled: boolean;
  priority_order: number;
  configuration: string; // JSON config for each channel
  success_rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface PatientPreferencesType {
  id?: number;
  patient_id: number;
  preferred_channel: string;
  preferred_time_start: string;
  preferred_time_end: string;
  timezone: string;
  language_code: string;
  do_not_disturb_start?: string;
  do_not_disturb_end?: string;
  max_reminders_per_day: number;
  emergency_contact_allowed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReminderTemplateType {
  id?: number;
  user_id: string;
  template_name: string;
  template_type: 'appointment' | 'medication' | 'followup' | 'preparation' | 'care_plan';
  channel_type: 'sms' | 'email' | 'voice';
  language_code: string;
  subject?: string;
  message_template: string;
  variables?: string; // JSON array of available variables
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReminderScheduleType {
  id?: number;
  user_id: string;
  schedule_name: string;
  appointment_type?: string;
  reminders_config: string; // JSON config for multiple reminders
  escalation_rules?: string; // JSON config for escalation
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CommunicationLogType {
  id?: number;
  appointment_id?: number;
  patient_id: number;
  channel_type: string;
  channel_id?: number;
  message_type: string;
  message_content: string;
  recipient_info: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  response_received?: string;
  response_sentiment?: 'positive' | 'negative' | 'neutral' | 'unknown';
  delivery_attempts: number;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  response_received_at?: string;
  cost_cents: number;
  external_id?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientEngagementType {
  id?: number;
  patient_id: number;
  engagement_score: number; // 0-100 score
  response_rate: number;
  preferred_response_time?: number; // minutes
  no_show_risk_score: number;
  last_interaction_at?: string;
  total_reminders_sent: number;
  total_responses: number;
  total_appointments: number;
  total_no_shows: number;
  total_cancellations: number;
  created_at?: string;
  updated_at?: string;
}

export interface BulkReminderOperation {
  operation_type: 'send' | 'schedule' | 'cancel';
  target_criteria: Record<string, any>;
  estimated_count: number;
  estimated_cost: number;
  created_at?: string;
}

export interface CarePlanType {
  id?: number;
  patient_id: number;
  care_plan_name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  frequency_days: number;
  reminder_message?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReminderQueueType {
  id?: number;
  appointment_id?: number;
  patient_id: number;
  reminder_type: string;
  channel_type: string;
  scheduled_at: string;
  priority: number; // 1-10, higher is more urgent
  retry_count: number;
  max_retries: number;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  message_content?: string;
  recipient_info?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExternalFactorsType {
  id?: number;
  factor_date: string;
  weather_condition?: string;
  temperature?: number;
  traffic_impact?: 'none' | 'light' | 'moderate' | 'heavy';
  local_events?: string; // JSON array of events
  adjustment_recommendations?: string; // JSON recommendations
  created_at?: string;
}
