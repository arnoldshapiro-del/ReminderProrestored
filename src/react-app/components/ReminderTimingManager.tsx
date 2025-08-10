import { useState, useEffect } from "react";
import { 
  Clock, 
  Save, 
  X, 
  Users, 
  Settings,
  CheckCircle,
  AlertCircle,
  Calendar,
  Bell,
  User
} from "lucide-react";

interface ReminderTimingManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

interface ReminderSettings {
  send_4_days_before: boolean;
  send_3_days_before: boolean;
  send_2_days_before: boolean;
  send_1_day_before: boolean;
  send_day_of: boolean;
  send_time_4_days: string;
  send_time_3_days: string;
  send_time_2_days: string;
  send_time_1_day: string;
  send_time_day_of: string;
  reminder_message?: string;
}

interface PatientType {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export default function ReminderTimingManager({ isOpen, onClose, onSave }: ReminderTimingManagerProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'bulk' | 'individual'>('global');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [bulkSettings, setBulkSettings] = useState({
    send_time_4_days: '10:00',
    send_time_3_days: '10:00',
    send_time_2_days: '10:00',
    send_time_1_day: '10:00',
    send_time_day_of: '09:00'
  });
  
  const [settings, setSettings] = useState<ReminderSettings>({
    send_4_days_before: true,
    send_3_days_before: true,
    send_2_days_before: true,
    send_1_day_before: true,
    send_day_of: true,
    send_time_4_days: '10:00',
    send_time_3_days: '10:00',
    send_time_2_days: '10:00',
    send_time_1_day: '10:00',
    send_time_day_of: '09:00'
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
      const response = await fetch('/api/reminder-settings/global');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching reminder settings:', error);
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
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/reminder-settings/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        onSave?.();
        onClose();
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/reminder-settings/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: bulkSettings,
          patient_ids: selectedPatients.length > 0 ? selectedPatients : null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully updated reminder times for ${result.updated_count} patients`);
        setSelectedPatients([]);
      } else {
        alert('Failed to update patient reminder times');
      }
    } catch (error) {
      console.error('Error updating patient reminder times:', error);
      alert('Failed to update patient reminder times');
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

  const copyGlobalTimes = () => {
    setBulkSettings({
      send_time_4_days: settings.send_time_4_days,
      send_time_3_days: settings.send_time_3_days,
      send_time_2_days: settings.send_time_2_days,
      send_time_1_day: settings.send_time_1_day,
      send_time_day_of: settings.send_time_day_of
    });
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
              <h2 className="text-xl font-semibold text-gray-900">Appointment Reminder Manager</h2>
              <p className="text-sm text-gray-600">Configure 4, 3, 2, 1 day + day-of reminders with custom timing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'global', label: 'Global Settings', icon: Settings },
              { key: 'bulk', label: 'Bulk Patient Update', icon: Users },
              { key: 'individual', label: 'Individual Patients', icon: User }
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
                  <div className="card bg-purple-50 border-purple-200">
                    <div className="flex items-start space-x-3">
                      <Bell className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-purple-900">Global Reminder Schedule</h3>
                        <p className="text-sm text-purple-700 mt-1">
                          Configure your 4, 3, 2, 1 day + day-of reminder schedule. This applies to all new appointments unless overridden by patient-specific settings.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Reminder Schedule (Your Requested Times)</h4>
                      
                      {[
                        { key: 'send_4_days_before', label: '4 Days Before Appointment', timeKey: 'send_time_4_days' },
                        { key: 'send_3_days_before', label: '3 Days Before Appointment', timeKey: 'send_time_3_days' },
                        { key: 'send_2_days_before', label: '2 Days Before Appointment', timeKey: 'send_time_2_days' },
                        { key: 'send_1_day_before', label: '1 Day Before Appointment', timeKey: 'send_time_1_day' },
                        { key: 'send_day_of', label: 'Day of Appointment', timeKey: 'send_time_day_of' }
                      ].map((reminder) => (
                        <div key={reminder.key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                          <label className="flex items-center space-x-3 flex-1">
                            <input
                              type="checkbox"
                              checked={settings[reminder.key as keyof ReminderSettings] as boolean}
                              onChange={(e) => setSettings({
                                ...settings,
                                [reminder.key]: e.target.checked
                              })}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="font-medium text-gray-700">{reminder.label}</span>
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
                              className="input-field w-24 text-sm"
                              disabled={!(settings[reminder.key as keyof ReminderSettings] as boolean)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Schedule Preview</h4>
                      
                      <div className="card bg-green-50 border-green-200">
                        <h5 className="font-medium text-green-900 mb-3">Active Reminders</h5>
                        <div className="space-y-2">
                          {[
                            { enabled: settings.send_4_days_before, time: settings.send_time_4_days, label: '4 days before' },
                            { enabled: settings.send_3_days_before, time: settings.send_time_3_days, label: '3 days before' },
                            { enabled: settings.send_2_days_before, time: settings.send_time_2_days, label: '2 days before' },
                            { enabled: settings.send_1_day_before, time: settings.send_time_1_day, label: '1 day before' },
                            { enabled: settings.send_day_of, time: settings.send_time_day_of, label: 'day of appointment' }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              {item.enabled ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={item.enabled ? 'text-green-700 font-medium' : 'text-gray-500'}>
                                {item.enabled ? `SMS at ${item.time} on ${item.label}` : `Disabled - ${item.label}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card">
                        <h5 className="font-medium text-gray-900 mb-3">Custom Message (Optional)</h5>
                        <textarea
                          value={settings.reminder_message || ''}
                          onChange={(e) => setSettings({...settings, reminder_message: e.target.value})}
                          rows={3}
                          className="input-field resize-none text-sm"
                          placeholder="Custom message template (leave blank for default)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          You can use variables like {'{'}{'{'} patient_name {'}'}{'}'}  {'{'}{'{'} appointment_time {'}'}{'}'}  {'{'}{'{'} appointment_type {'}'}{'}'} 
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bulk' && (
                <div className="space-y-6">
                  <div className="card bg-blue-50 border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900">Bulk Patient Reminder Times</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Update reminder send times for multiple patients at once. Select specific patients or leave none selected to update all patients.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="card">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Bulk Update Times</h4>
                          <button
                            onClick={copyGlobalTimes}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Copy from Global
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {[
                            { key: 'send_time_4_days', label: '4 Days Before' },
                            { key: 'send_time_3_days', label: '3 Days Before' },
                            { key: 'send_time_2_days', label: '2 Days Before' },
                            { key: 'send_time_1_day', label: '1 Day Before' },
                            { key: 'send_time_day_of', label: 'Day Of' }
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
                  <div className="card bg-indigo-50 border-indigo-200">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-indigo-900">Individual Patient Settings</h3>
                        <p className="text-sm text-indigo-700 mt-1">
                          Set custom reminder schedules for specific patients. These settings override the global defaults and bulk settings.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.map((patient) => (
                      <div key={patient.id} className="card hover:shadow-md transition-shadow">
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
                            // This would open an individual patient settings modal
                            alert(`Individual settings for ${patient.first_name} ${patient.last_name} will be available soon. For now, use the bulk update feature.`);
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
