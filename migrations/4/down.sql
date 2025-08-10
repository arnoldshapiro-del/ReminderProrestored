
-- Remove reminder timing columns from patient_preferences
ALTER TABLE patient_preferences DROP COLUMN reminder_send_time;
ALTER TABLE patient_preferences DROP COLUMN reminder_4_days;
ALTER TABLE patient_preferences DROP COLUMN reminder_3_days;
ALTER TABLE patient_preferences DROP COLUMN reminder_2_days;
ALTER TABLE patient_preferences DROP COLUMN reminder_1_day;
ALTER TABLE patient_preferences DROP COLUMN reminder_day_of;

-- Drop the reminder timing settings table
DROP TABLE reminder_timing_settings;
