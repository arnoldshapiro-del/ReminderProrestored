import { useState, useEffect } from "react";
import { 
  Clock, 
  Save, 
  X, 
  Users, 
  Settings,
  CheckCircle,
  AlertCircle,
  Bell
} from "lucide-react";

interface SimpleReminderTimingManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

interface PatientType {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
}

interface ReminderPreferences {
  reminder_send_time: string;
  reminder_4_days: boolean;
  reminder_3_days: boolean;
  reminder_2_days: boolean;
  reminder_1_day: boolean;
  reminder_day_of: boolean;
}

export default function SimpleReminderTimingManager({ isOpen, onClose, onSave }: SimpleReminderTimingManagerProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'bulk'>('global');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [bulkSendTime, setBulkSendTime] = useState('10:00');
  
  const [globalSettings, setGlobalSettings] = useState<ReminderPreferences>({
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
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/patients/bulk-reminder-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          send_time: bulkSendTime,
          patient_ids: selectedPatients.length > 0 ? selectedPatients : null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully updated reminder times for ${result.updated_count} patients`);
        setSelectedPatients([]);
        onSave?.();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to update patient reminder times: ${errorData.error}`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reminder Timing Settings</h2>
              <p className="text-sm text-gray-600">Set custom send times for appointment reminders</p>
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
              { key: 'global', label: 'Default Times', icon: Settings },
              { key: 'bulk', label: 'Bulk Patient Update', icon: Users }
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
                        <h3 className="font-medium text-purple-900">Default Reminder Schedule</h3>
                        <p className="text-sm text-purple-700 mt-1">
                          Configure your 4, 3, 2, 1 day + day-of reminder schedule with custom send times.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Reminder Schedule</h4>
                      
                      {[
                        { key: 'reminder_4_days', label: '4 Days Before Appointment', timeKey: 'reminder_4_days_time' },
                        { key: 'reminder_3_days', label: '3 Days Before Appointment', timeKey: 'reminder_3_days_time' },
                        { key: 'reminder_2_days', label: '2 Days Before Appointment', timeKey: 'reminder_2_days_time' },
                        { key: 'reminder_1_day', label: '1 Day Before Appointment', timeKey: 'reminder_1_day_time' },
                        { key: 'reminder_day_of', label: 'Day of Appointment', timeKey: 'reminder_day_of_time' }
                      ].map((reminder, index) => (
                        <div key={reminder.key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                          <label className="flex items-center space-x-3 flex-1">
                            <input
                              type="checkbox"
                              checked={globalSettings[reminder.key as keyof ReminderPreferences] as boolean}
                              onChange={(e) => setGlobalSettings({
                                ...globalSettings,
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
                              value={index === 4 ? '09:00' : globalSettings.reminder_send_time}
                              onChange={(e) => setGlobalSettings({
                                ...globalSettings,
                                reminder_send_time: e.target.value
                              })}
                              className="input-field w-24 text-sm"
                              disabled={!(globalSettings[reminder.key as keyof ReminderPreferences] as boolean)}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Note: Day-of reminders are sent 1 hour before the appointment time.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Schedule Preview</h4>
                      
                      <div className="card bg-green-50 border-green-200">
                        <h5 className="font-medium text-green-900 mb-3">Active Reminders</h5>
                        <div className="space-y-2">
                          {[
                            { enabled: globalSettings.reminder_4_days, time: globalSettings.reminder_send_time, label: '4 days before' },
                            { enabled: globalSettings.reminder_3_days, time: globalSettings.reminder_send_time, label: '3 days before' },
                            { enabled: globalSettings.reminder_2_days, time: globalSettings.reminder_send_time, label: '2 days before' },
                            { enabled: globalSettings.reminder_1_day, time: globalSettings.reminder_send_time, label: '1 day before' },
                            { enabled: globalSettings.reminder_day_of, time: '1 hour before', label: 'day of appointment' }
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
                        <h3 className="font-medium text-blue-900">Bulk Update Patient Reminder Times</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Update the reminder send time for multiple patients at once. Select specific patients or leave none selected to update all patients.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="card">
                        <h4 className="font-medium text-gray-900 mb-4">Update Settings</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Reminder Send Time
                            </label>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <input
                                type="time"
                                value={bulkSendTime}
                                onChange={(e) => setBulkSendTime(e.target.value)}
                                className="input-field"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              This will be the time when 4, 3, 2, and 1 day reminders are sent
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
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

                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
