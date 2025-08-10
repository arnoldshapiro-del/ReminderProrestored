import { useState, useEffect } from "react";
import { 
  Save, 
  X, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Settings
} from "lucide-react";

interface ReminderTimingSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

interface ReminderSettings {
  reminder_4_days_enabled: boolean;
  reminder_3_days_enabled: boolean;
  reminder_2_days_enabled: boolean;
  reminder_1_day_enabled: boolean;
  reminder_day_of_enabled: boolean;
  reminder_4_days_time: string;
  reminder_3_days_time: string;
  reminder_2_days_time: string;
  reminder_1_day_time: string;
  reminder_day_of_time: string;
  default_send_time: string;
}

interface PatientType {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export default function ReminderTimingSettings({ isOpen, onClose, onSave }: ReminderTimingSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'global' | 'bulk' | 'individual'>('global');
  
  const [settings, setSettings] = useState<ReminderSettings>({
    reminder_4_days_enabled: true,
    reminder_3_days_enabled: true,
    reminder_2_days_enabled: true,
    reminder_1_day_enabled: true,
    reminder_day_of_enabled: true,
    reminder_4_days_time: '10:00',
    reminder_3_days_time: '10:00',
    reminder_2_days_time: '10:00',
    reminder_1_day_time: '10:00',
    reminder_day_of_time: '09:00',
    default_send_time: '10:00'
  });

  const [bulkSettings, setBulkSettings] = useState({
    reminder_4_days_time: '10:00',
    reminder_3_days_time: '10:00',
    reminder_2_days_time: '10:00',
    reminder_1_day_time: '10:00',
    reminder_day_of_time: '09:00'
  });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      fetchPatients();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/reminder-timing');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setBulkSettings({
          reminder_4_days_time: data.reminder_4_days_time,
          reminder_3_days_time: data.reminder_3_days_time,
          reminder_2_days_time: data.reminder_2_days_time,
          reminder_1_day_time: data.reminder_1_day_time,
          reminder_day_of_time: data.reminder_day_of_time
        });
      }
    } catch (error) {
      console.error('Error fetching reminder settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        // Try anonymous patients as fallback
        const fallbackResponse = await fetch('/api/patients/list-anonymous');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setPatients(fallbackData);
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/settings/reminder-timing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onSave?.();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/patients/bulk-reminder-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bulkSettings,
          patient_ids: selectedPatients.length > 0 ? selectedPatients : null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setSelectedPatients([]);
        alert(`Successfully updated reminder times for ${result.updated_count || 0} patients`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update patient reminder times');
      }
    } catch (error) {
      console.error('Error updating patient reminder times:', error);
      setError('Failed to update patient reminder times');
    } finally {
      setSaving(false);
    }
  };

  const togglePatientSelection = (patientId: number) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const selectAllPatients = () => {
    setSelectedPatients(patients.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedPatients([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Appointment Reminder Schedule</h2>
              <p className="text-sm text-gray-600">Configure when reminders are sent: 4, 3, 2, 1 day before + day of appointment</p>
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
              <span className="text-green-700">Settings saved successfully!</span>
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

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'global', label: 'Global Settings', icon: Settings },
              { key: 'bulk', label: 'Bulk Patient Update', icon: Users },
              { key: 'individual', label: 'Individual Patients', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {activeTab === 'global' && (
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-medium text-purple-900 mb-2">Global Reminder Schedule</h3>
                    <p className="text-sm text-purple-700">
                      Set the default reminder schedule that applies to all new appointments. You can customize individual patient settings later.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-medium text-gray-900 mb-4">Reminder Days & Times</h4>
                      
                      {[
                        { key: 'reminder_4_days', label: '4 Days Before Appointment', timeKey: 'reminder_4_days_time' },
                        { key: 'reminder_3_days', label: '3 Days Before Appointment', timeKey: 'reminder_3_days_time' },
                        { key: 'reminder_2_days', label: '2 Days Before Appointment', timeKey: 'reminder_2_days_time' },
                        { key: 'reminder_1_day', label: '1 Day Before Appointment', timeKey: 'reminder_1_day_time' },
                        { key: 'reminder_day_of', label: 'Day of Appointment', timeKey: 'reminder_day_of_time' }
                      ].map((reminder) => (
                        <div key={reminder.key} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={settings[`${reminder.key}_enabled` as keyof ReminderSettings] as boolean}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  [`${reminder.key}_enabled`]: e.target.checked
                                })}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="font-medium text-gray-900">{reminder.label}</span>
                            </label>
                            
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <input
                                type="time"
                                value={settings[reminder.timeKey as keyof ReminderSettings] as string}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  [reminder.timeKey]: e.target.value
                                })}
                                className="input-field w-28 text-sm"
                                disabled={!(settings[`${reminder.key}_enabled` as keyof ReminderSettings] as boolean)}
                              />
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            {reminder.key.includes('day_of') ? 
                              'Send reminder on the day of the appointment' :
                              `Send reminder ${reminder.label.toLowerCase()}`
                            }
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      <h4 className="font-medium text-gray-900 mb-4">Schedule Preview</h4>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-medium text-green-900 mb-3">Active Reminders</h5>
                        <div className="space-y-2">
                          {[
                            { enabled: settings.reminder_4_days_enabled, time: settings.reminder_4_days_time, label: '4 days before' },
                            { enabled: settings.reminder_3_days_enabled, time: settings.reminder_3_days_time, label: '3 days before' },
                            { enabled: settings.reminder_2_days_enabled, time: settings.reminder_2_days_time, label: '2 days before' },
                            { enabled: settings.reminder_1_day_enabled, time: settings.reminder_1_day_time, label: '1 day before' },
                            { enabled: settings.reminder_day_of_enabled, time: settings.reminder_day_of_time, label: 'day of appointment' }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              {item.enabled ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                              )}
                              <span className={item.enabled ? 'text-green-700 font-medium' : 'text-gray-500'}>
                                {item.enabled ? `SMS at ${item.time} on ${item.label}` : `Disabled - ${item.label}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-medium text-blue-900 mb-3">Quick Setup</h5>
                        <div className="space-y-2">
                          <button
                            onClick={() => setSettings({
                              ...settings,
                              reminder_4_days_enabled: true,
                              reminder_3_days_enabled: true,
                              reminder_2_days_enabled: true,
                              reminder_1_day_enabled: true,
                              reminder_day_of_enabled: true,
                              reminder_4_days_time: '10:00',
                              reminder_3_days_time: '10:00',
                              reminder_2_days_time: '10:00',
                              reminder_1_day_time: '10:00',
                              reminder_day_of_time: '09:00'
                            })}
                            className="w-full text-left text-sm text-blue-700 hover:text-blue-800 py-1"
                          >
                            ✓ Enable all reminders (10:00 AM, 9:00 AM day-of)
                          </button>
                          <button
                            onClick={() => setSettings({
                              ...settings,
                              reminder_4_days_enabled: false,
                              reminder_3_days_enabled: false,
                              reminder_2_days_enabled: true,
                              reminder_1_day_enabled: true,
                              reminder_day_of_enabled: true
                            })}
                            className="w-full text-left text-sm text-blue-700 hover:text-blue-800 py-1"
                          >
                            ✓ Basic setup (2 day, 1 day, day-of only)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bulk' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Bulk Patient Reminder Times</h3>
                    <p className="text-sm text-blue-700">
                      Update reminder send times for multiple patients at once. Select specific patients or leave none selected to update all patients.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Bulk Update Times</h4>
                          <button
                            onClick={() => setBulkSettings({
                              reminder_4_days_time: settings.reminder_4_days_time,
                              reminder_3_days_time: settings.reminder_3_days_time,
                              reminder_2_days_time: settings.reminder_2_days_time,
                              reminder_1_day_time: settings.reminder_1_day_time,
                              reminder_day_of_time: settings.reminder_day_of_time
                            })}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Copy from Global
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {[
                            { key: 'reminder_4_days_time', label: '4 Days Before' },
                            { key: 'reminder_3_days_time', label: '3 Days Before' },
                            { key: 'reminder_2_days_time', label: '2 Days Before' },
                            { key: 'reminder_1_day_time', label: '1 Day Before' },
                            { key: 'reminder_day_of_time', label: 'Day Of' }
                          ].map((time) => (
                            <div key={time.key} className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700">
                                {time.label}:
                              </label>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <input
                                  type="time"
                                  value={bulkSettings[time.key as keyof typeof bulkSettings]}
                                  onChange={(e) => setBulkSettings({
                                    ...bulkSettings,
                                    [time.key]: e.target.value
                                  })}
                                  className="input-field w-24 text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t mt-4">
                          <span className="text-sm text-gray-600">
                            {selectedPatients.length === 0 
                              ? `Will update all ${patients.length} patients`
                              : `Will update ${selectedPatients.length} selected patients`
                            }
                          </span>
                          <button
                            onClick={handleBulkUpdate}
                            disabled={saving}
                            className="btn-primary flex items-center space-x-2"
                          >
                            {saving ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>Update Times</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Select Patients</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={selectAllPatients}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Select All
                          </button>
                          <button
                            onClick={clearSelection}
                            className="text-sm text-gray-600 hover:text-gray-700"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                        {patients.map((patient) => (
                          <label
                            key={patient.id}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPatients.includes(patient.id)}
                              onChange={() => togglePatientSelection(patient.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {patient.first_name} {patient.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {patient.phone_number}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'individual' && (
                <div className="space-y-6">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h3 className="font-medium text-indigo-900 mb-2">Individual Patient Settings</h3>
                    <p className="text-sm text-indigo-700">
                      Click on any patient to customize their specific reminder schedule and timing preferences.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.map((patient) => (
                      <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {patient.first_name[0]}{patient.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                              {patient.first_name} {patient.last_name}
                            </h4>
                            <p className="text-xs text-gray-500">{patient.phone_number}</p>
                          </div>
                        </div>
                        <button 
                          className="w-full btn-secondary text-sm"
                          onClick={() => {
                            alert(`Individual settings for ${patient.first_name} ${patient.last_name} will open the patient preferences editor. For now, use the bulk update feature or edit from the patient management page.`);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Customize Schedule
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'global' && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Global Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
