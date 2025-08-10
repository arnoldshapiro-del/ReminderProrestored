import { useState, useEffect } from "react";
import { 
  Save, 
  X, 
  MessageSquare, 
  Mail, 
  Phone, 
  Smartphone,
  Clock,
  Globe,
  Volume2,
  Settings,
  CheckCircle,
  AlertCircle,
  User,
  Users
} from "lucide-react";

interface PatientPreferencesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: number;
  patientName?: string;
}

interface PatientPreferences {
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
  reminder_send_time: string;
  reminder_4_days: boolean;
  reminder_3_days: boolean;
  reminder_2_days: boolean;
  reminder_1_day: boolean;
  reminder_day_of: boolean;
}

interface PatientType {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
}

export default function PatientPreferencesManagerNew({ 
  isOpen, 
  onClose, 
  patientId 
}: PatientPreferencesManagerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(patientId || null);
  const [preferences, setPreferences] = useState<PatientPreferences>({
    patient_id: patientId || 0,
    preferred_channel: 'sms',
    preferred_time_start: '09:00',
    preferred_time_end: '18:00',
    timezone: 'America/New_York',
    language_code: 'en',
    do_not_disturb_start: '',
    do_not_disturb_end: '',
    max_reminders_per_day: 3,
    emergency_contact_allowed: true,
    reminder_send_time: '10:00',
    reminder_4_days: true,
    reminder_3_days: true,
    reminder_2_days: true,
    reminder_1_day: true,
    reminder_day_of: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      if (selectedPatientId) {
        fetchPreferences(selectedPatientId);
      }
    }
  }, [isOpen, selectedPatientId]);

  const fetchPatients = async () => {
    try {
      let response = await fetch('/api/patients');
      if (!response.ok) {
        // Try anonymous patients as fallback
        response = await fetch('/api/patients/list-anonymous');
      }
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
        if (!selectedPatientId && data.length > 0) {
          setSelectedPatientId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPreferences = async (patientId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/patients/${patientId}/preferences`);
      if (response.ok) {
        const data = await response.json();
        setPreferences({
          ...data,
          emergency_contact_allowed: Boolean(data.emergency_contact_allowed),
          reminder_4_days: Boolean(data.reminder_4_days),
          reminder_3_days: Boolean(data.reminder_3_days),
          reminder_2_days: Boolean(data.reminder_2_days),
          reminder_1_day: Boolean(data.reminder_1_day),
          reminder_day_of: Boolean(data.reminder_day_of)
        });
      } else {
        // Set defaults for new patient
        setPreferences({
          patient_id: patientId,
          preferred_channel: 'sms',
          preferred_time_start: '09:00',
          preferred_time_end: '18:00',
          timezone: 'America/New_York',
          language_code: 'en',
          do_not_disturb_start: '',
          do_not_disturb_end: '',
          max_reminders_per_day: 3,
          emergency_contact_allowed: true,
          reminder_send_time: '10:00',
          reminder_4_days: true,
          reminder_3_days: true,
          reminder_2_days: true,
          reminder_1_day: true,
          reminder_day_of: true
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`/api/patients/${selectedPatientId}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...preferences,
          patient_id: selectedPatientId,
          emergency_contact_allowed: preferences.emergency_contact_allowed ? 1 : 0,
          reminder_4_days: preferences.reminder_4_days ? 1 : 0,
          reminder_3_days: preferences.reminder_3_days ? 1 : 0,
          reminder_2_days: preferences.reminder_2_days ? 1 : 0,
          reminder_1_day: preferences.reminder_1_day ? 1 : 0,
          reminder_day_of: preferences.reminder_day_of ? 1 : 0
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorText = await response.text();
        setError(`Failed to save preferences: ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError(`Failed to save preferences: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setSaving(false);
    }
  };

  

  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' }
  ];

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Patient Communication Preferences</h2>
              <p className="text-sm text-gray-600">Configure reminder schedule and communication settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-6 mt-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-700">Preferences saved successfully!</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Patient Selection */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Select Patient</span>
              </h3>
              
              <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`w-full text-left p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                      selectedPatientId === patient.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {patient.phone_number}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences Form */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                </div>
              ) : selectedPatient ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedPatient.phone_number}</p>
                    </div>
                  </div>

                  {/* Reminder Schedule */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Reminder Schedule</span>
                    </h4>
                    
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {[
                        { key: 'reminder_4_days', label: '4 Days Before Appointment' },
                        { key: 'reminder_3_days', label: '3 Days Before Appointment' },
                        { key: 'reminder_2_days', label: '2 Days Before Appointment' },
                        { key: 'reminder_1_day', label: '1 Day Before Appointment' },
                        { key: 'reminder_day_of', label: 'Day of Appointment' }
                      ].map((reminder) => (
                        <label key={reminder.key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={preferences[reminder.key as keyof PatientPreferences] as boolean}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              [reminder.key]: e.target.checked
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{reminder.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Send Time
                      </label>
                      <input
                        type="time"
                        value={preferences.reminder_send_time}
                        onChange={(e) => setPreferences({ ...preferences, reminder_send_time: e.target.value })}
                        className="input-field w-32"
                      />
                    </div>
                  </div>

                  {/* Preferred Communication Channel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Communication Channel
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { key: 'sms', label: 'SMS Text', icon: MessageSquare },
                        { key: 'email', label: 'Email', icon: Mail },
                        { key: 'voice', label: 'Voice Call', icon: Phone },
                        { key: 'push', label: 'Push Notification', icon: Smartphone }
                      ].map(({ key, label, icon: Icon }) => (
                        <div
                          key={key}
                          onClick={() => setPreferences({ ...preferences, preferred_channel: key })}
                          className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                            preferences.preferred_channel === key
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                              preferences.preferred_channel === key
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-medium text-gray-900">{label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Hours */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Contact Hours
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={preferences.preferred_time_start}
                          onChange={(e) => setPreferences({ ...preferences, preferred_time_start: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">End Time</label>
                        <input
                          type="time"
                          value={preferences.preferred_time_end}
                          onChange={(e) => setPreferences({ ...preferences, preferred_time_end: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>Timezone</span>
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                        className="input-field"
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz.replace('America/', '').replace('Pacific/', '').replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                        <Volume2 className="w-4 h-4" />
                        <span>Language</span>
                      </label>
                      <select
                        value={preferences.language_code}
                        onChange={(e) => setPreferences({ ...preferences, language_code: e.target.value })}
                        className="input-field"
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Max Reminders & Emergency Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Reminders Per Day
                      </label>
                      <select
                        value={preferences.max_reminders_per_day}
                        onChange={(e) => setPreferences({ ...preferences, max_reminders_per_day: Number(e.target.value) })}
                        className="input-field"
                      >
                        <option value={1}>1 reminder</option>
                        <option value={2}>2 reminders</option>
                        <option value={3}>3 reminders</option>
                        <option value={4}>4 reminders</option>
                        <option value={5}>5 reminders</option>
                        <option value={0}>No limit</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.emergency_contact_allowed}
                          onChange={(e) => setPreferences({ ...preferences, emergency_contact_allowed: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">
                          Allow emergency contact notifications
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a patient to configure their preferences</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {selectedPatient && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
