
-- Create a new comprehensive reminder settings table
CREATE TABLE appointment_reminder_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  appointment_id INTEGER,
  patient_id INTEGER,
  send_4_days_before BOOLEAN DEFAULT 1,
  send_3_days_before BOOLEAN DEFAULT 1,
  send_2_days_before BOOLEAN DEFAULT 1,
  send_1_day_before BOOLEAN DEFAULT 1,
  send_day_of BOOLEAN DEFAULT 1,
  send_time_4_days TEXT DEFAULT '10:00',
  send_time_3_days TEXT DEFAULT '10:00',
  send_time_2_days TEXT DEFAULT '10:00',
  send_time_1_day TEXT DEFAULT '10:00',
  send_time_day_of TEXT DEFAULT '09:00',
  reminder_message TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default global settings for existing users
INSERT INTO appointment_reminder_settings (
  user_id, send_4_days_before, send_3_days_before, send_2_days_before, 
  send_1_day_before, send_day_of, send_time_4_days, send_time_3_days,
  send_time_2_days, send_time_1_day, send_time_day_of
)
SELECT DISTINCT user_id, 1, 1, 1, 1, 1, '10:00', '10:00', '10:00', '10:00', '09:00'
FROM patients
WHERE NOT EXISTS (
  SELECT 1 FROM appointment_reminder_settings 
  WHERE appointment_reminder_settings.user_id = patients.user_id 
  AND appointment_reminder_settings.appointment_id IS NULL
  AND appointment_reminder_settings.patient_id IS NULL
);
