
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  patient_id INTEGER NOT NULL,
  appointment_date DATETIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  appointment_type TEXT DEFAULT 'Consultation',
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  reminder_sent_2_days BOOLEAN DEFAULT 0,
  reminder_sent_1_day BOOLEAN DEFAULT 0,
  patient_response TEXT,
  response_received_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sms_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER NOT NULL,
  phone_number TEXT NOT NULL,
  message_text TEXT NOT NULL,
  reminder_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at DATETIME,
  response_received TEXT,
  response_received_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
