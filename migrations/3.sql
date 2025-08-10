
-- Enhanced reminder channels table
CREATE TABLE reminder_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_type TEXT NOT NULL, -- sms, email, voice, push, webhook
  is_enabled BOOLEAN DEFAULT 1,
  priority_order INTEGER DEFAULT 1,
  configuration TEXT, -- JSON config for each channel
  success_rate REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patient communication preferences
CREATE TABLE patient_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  preferred_channel TEXT DEFAULT 'sms', -- sms, email, voice, push
  preferred_time_start TEXT DEFAULT '09:00',
  preferred_time_end TEXT DEFAULT '18:00',
  timezone TEXT DEFAULT 'America/New_York',
  language_code TEXT DEFAULT 'en',
  do_not_disturb_start TEXT,
  do_not_disturb_end TEXT,
  max_reminders_per_day INTEGER DEFAULT 3,
  emergency_contact_allowed BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced reminder templates
CREATE TABLE reminder_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- appointment, medication, followup, preparation, care_plan
  channel_type TEXT NOT NULL, -- sms, email, voice
  language_code TEXT DEFAULT 'en',
  subject TEXT,
  message_template TEXT NOT NULL,
  variables TEXT, -- JSON array of available variables
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Smart reminder scheduling
CREATE TABLE reminder_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  schedule_name TEXT NOT NULL,
  appointment_type TEXT,
  reminders_config TEXT NOT NULL, -- JSON config for multiple reminders
  escalation_rules TEXT, -- JSON config for escalation
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced SMS logs with multi-channel support
CREATE TABLE communication_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER,
  patient_id INTEGER NOT NULL,
  channel_type TEXT NOT NULL, -- sms, email, voice, push
  channel_id INTEGER, -- reference to specific channel config
  message_type TEXT NOT NULL, -- reminder, followup, preparation, emergency
  message_content TEXT NOT NULL,
  recipient_info TEXT, -- phone, email, etc
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, read, failed, bounced
  response_received TEXT,
  response_sentiment TEXT, -- positive, negative, neutral, unknown
  delivery_attempts INTEGER DEFAULT 0,
  sent_at DATETIME,
  delivered_at DATETIME,
  read_at DATETIME,
  response_received_at DATETIME,
  cost_cents INTEGER DEFAULT 0,
  external_id TEXT, -- provider-specific ID
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Patient engagement analytics
CREATE TABLE patient_engagement (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  engagement_score REAL DEFAULT 0.0, -- 0-100 score
  response_rate REAL DEFAULT 0.0,
  preferred_response_time INTEGER, -- minutes
  no_show_risk_score REAL DEFAULT 0.0,
  last_interaction_at DATETIME,
  total_reminders_sent INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  total_no_shows INTEGER DEFAULT 0,
  total_cancellations INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Care plan reminders
CREATE TABLE care_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  care_plan_name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  frequency_days INTEGER DEFAULT 7, -- how often to send reminders
  reminder_message TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Advanced reminder queue
CREATE TABLE reminder_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER,
  patient_id INTEGER NOT NULL,
  reminder_type TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  priority INTEGER DEFAULT 5, -- 1-10, higher is more urgent
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending', -- pending, processing, sent, failed, cancelled
  message_content TEXT,
  recipient_info TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Weather and external factors
CREATE TABLE external_factors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  factor_date DATE NOT NULL,
  weather_condition TEXT,
  temperature INTEGER,
  traffic_impact TEXT, -- none, light, moderate, heavy
  local_events TEXT, -- JSON array of events that might impact appointments
  adjustment_recommendations TEXT, -- JSON recommendations for reminder timing
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
