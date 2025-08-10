import { useState } from "react";
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
  Settings
} from "lucide-react";
import type { PatientPreferencesType } from "@/shared/reminder-types";

interface PatientPreferencesEditorProps {
  patientId: number;
  patientName: string;
  preferences?: PatientPreferencesType;
  onSave: (preferences: Partial<PatientPreferencesType>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function PatientPreferencesEditor({ 
  patientId,
  patientName,
  preferences, 
  onSave, 
  onCancel, 
  isOpen 
}: PatientPreferencesEditorProps) {
  const [formData, setFormData] = useState<Partial<PatientPreferencesType>>(
    preferences || {
      patient_id: patientId,
      preferred_channel: 'sms',
      preferred_time_start: '09:00',
      preferred_time_end: '18:00',
      timezone: 'America/New_York',
      language_code: 'en',
      do_not_disturb_start: '',
      do_not_disturb_end: '',
      max_reminders_per_day: 3,
      emergency_contact_allowed: true
    }
  );

  if (!isOpen) return null;

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return; // Prevent double clicks
    
    try {
      setSaving(true);
      console.log('Saving preferences for patient:', patientId, formData);
      
      const response = await fetch(`/api/patients/${patientId}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          patient_id: patientId
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Successfully saved preferences:', result);
        alert('Preferences saved successfully!');
        onSave(result);
      } else {
        const errorText = await response.text();
        console.error('Failed to save preferences:', errorText);
        alert(`Failed to save preferences: ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert(`Failed to save preferences: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setSaving(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return <MessageSquare className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'voice': return <Phone className="w-5 h-5" />;
      case 'push': return <Smartphone className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Communication Preferences</h2>
              <p className="text-sm text-gray-600">Settings for {patientName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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
                  onClick={() => setFormData({ ...formData, preferred_channel: key })}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    formData.preferred_channel === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      formData.preferred_channel === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Preferred Contact Hours</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.preferred_time_start}
                  onChange={(e) => setFormData({ ...formData, preferred_time_start: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.preferred_time_end}
                  onChange={(e) => setFormData({ ...formData, preferred_time_end: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Timezone</span>
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
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
              <span>Preferred Language</span>
            </label>
            <select
              value={formData.language_code}
              onChange={(e) => setFormData({ ...formData, language_code: e.target.value })}
              className="input-field"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Do Not Disturb Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Do Not Disturb Hours (Optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.do_not_disturb_start || ''}
                  onChange={(e) => setFormData({ ...formData, do_not_disturb_start: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.do_not_disturb_end || ''}
                  onChange={(e) => setFormData({ ...formData, do_not_disturb_end: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              During these hours, only emergency messages will be sent
            </p>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Reminders Per Day
              </label>
              <select
                value={formData.max_reminders_per_day}
                onChange={(e) => setFormData({ ...formData, max_reminders_per_day: Number(e.target.value) })}
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emergency_contact"
                checked={formData.emergency_contact_allowed}
                onChange={(e) => setFormData({ ...formData, emergency_contact_allowed: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="emergency_contact" className="text-sm text-gray-700">
                Allow emergency contact to be notified if patient doesn't respond
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-3">Preference Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Preferred Channel:</span>
                <div className="flex items-center space-x-1">
                  {getChannelIcon(formData.preferred_channel || 'sms')}
                  <span className="font-medium capitalize">{formData.preferred_channel}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Contact Hours:</span>
                <span className="font-medium">
                  {formData.preferred_time_start} - {formData.preferred_time_end}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Language:</span>
                <span className="font-medium">
                  {languages.find(l => l.code === formData.language_code)?.name || 'English'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Max Reminders/Day:</span>
                <span className="font-medium">
                  {formData.max_reminders_per_day === 0 ? 'No limit' : formData.max_reminders_per_day}
                </span>
              </div>
              {formData.do_not_disturb_start && formData.do_not_disturb_end && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Do Not Disturb:</span>
                  <span className="font-medium text-red-600">
                    {formData.do_not_disturb_start} - {formData.do_not_disturb_end}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={onCancel} className="btn-secondary">
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
      </div>
    </div>
  );
}
