
-- Add reminder timing preferences to patient_preferences table
ALTER TABLE patient_preferences ADD COLUMN reminder_send_time TEXT DEFAULT '10:00';
ALTER TABLE patient_preferences ADD COLUMN reminder_4_days BOOLEAN DEFAULT 1;
ALTER TABLE patient_preferences ADD COLUMN reminder_3_days BOOLEAN DEFAULT 1;
ALTER TABLE patient_preferences ADD COLUMN reminder_2_days BOOLEAN DEFAULT 1;
ALTER TABLE patient_preferences ADD COLUMN reminder_1_day BOOLEAN DEFAULT 1;
ALTER TABLE patient_preferences ADD COLUMN reminder_day_of BOOLEAN DEFAULT 1;

-- Add global reminder settings table
CREATE TABLE reminder_timing_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  default_send_time TEXT DEFAULT '10:00',
  reminder_4_days_enabled BOOLEAN DEFAULT 1,
  reminder_3_days_enabled BOOLEAN DEFAULT 1,
  reminder_2_days_enabled BOOLEAN DEFAULT 1,
  reminder_1_day_enabled BOOLEAN DEFAULT 1,
  reminder_day_of_enabled BOOLEAN DEFAULT 1,
  reminder_4_days_time TEXT DEFAULT '10:00',
  reminder_3_days_time TEXT DEFAULT '10:00',
  reminder_2_days_time TEXT DEFAULT '10:00',
  reminder_1_day_time TEXT DEFAULT '10:00',
  reminder_day_of_time TEXT DEFAULT '09:00',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
