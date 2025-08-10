import { useState } from "react";
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Mail, 
  Phone, 
  Smartphone,
  Brain,
  Zap,
  ChevronDown,
  ChevronUp,
  Activity
} from "lucide-react";
import type { ReminderScheduleType } from "@/shared/reminder-types";

interface SmartScheduleEditorProps {
  schedule?: ReminderScheduleType;
  onSave: (schedule: Partial<ReminderScheduleType>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface ReminderStep {
  timing: number; // minutes before appointment
  channels: string[];
  template_id?: number;
  conditions?: {
    weather_dependent?: boolean;
    time_sensitive?: boolean;
    high_priority?: boolean;
  };
}

interface EscalationRule {
  trigger: 'no_response' | 'delivery_failed' | 'high_risk_patient';
  delay_minutes: number;
  next_channel: string;
  escalate_to_emergency?: boolean;
  custom_message?: string;
}

const PRESET_SCHEDULES = {
  standard: {
    name: "Standard 5-Step Reminder (4,3,2,1 Days + Day Of)",
    steps: [
      { timing: 5760, channels: ['sms'], conditions: {} }, // 4 days
      { timing: 4320, channels: ['sms'], conditions: {} }, // 3 days
      { timing: 2880, channels: ['sms'], conditions: {} }, // 2 days
      { timing: 1440, channels: ['sms'], conditions: {} }, // 1 day
      { timing: 0, channels: ['sms'], conditions: { time_sensitive: true } } // day of appointment
    ],
    escalation: []
  },
  comprehensive: {
    name: "Comprehensive 5-Step Schedule",
    steps: [
      { timing: 5760, channels: ['email'], conditions: {} }, // 4 days
      { timing: 4320, channels: ['sms'], conditions: {} },   // 3 days
      { timing: 2880, channels: ['sms'], conditions: {} },   // 2 days
      { timing: 1440, channels: ['sms'], conditions: {} },   // 1 day
      { timing: 0, channels: ['sms'], conditions: { time_sensitive: true } } // day of appointment
    ],
    escalation: [
      { trigger: 'no_response', delay_minutes: 60, next_channel: 'voice' }
    ]
  },
  gentle: {
    name: "Gentle 3-Step Reminder",
    steps: [
      { timing: 2880, channels: ['email'], conditions: {} }, // 2 days
      { timing: 1440, channels: ['sms'], conditions: {} },   // 1 day
      { timing: 480, channels: ['sms'], conditions: {} }     // 8 hours
    ],
    escalation: []
  },
  same_day_focus: {
    name: "Same Day Focus",
    steps: [
      { timing: 1440, channels: ['sms'], conditions: {} }, // 1 day
      { timing: 480, channels: ['sms'], conditions: {} }, // 8 hours
      { timing: 240, channels: ['sms'], conditions: {} }, // 4 hours
      { timing: 120, channels: ['sms'], conditions: { time_sensitive: true } }, // 2 hours
      { timing: 60, channels: ['sms'], conditions: { time_sensitive: true } }, // 1 hour
      { timing: 30, channels: ['sms'], conditions: { time_sensitive: true } }, // 30 minutes
      { timing: 0, channels: ['sms'], conditions: { time_sensitive: true } } // day of appointment
    ],
    escalation: []
  },
  extended: {
    name: "Extended 4-Day Schedule",
    steps: [
      { timing: 5760, channels: ['email'], conditions: {} }, // 4 days
      { timing: 4320, channels: ['sms'], conditions: {} },   // 3 days
      { timing: 2880, channels: ['sms'], conditions: {} },   // 2 days
      { timing: 1440, channels: ['sms'], conditions: {} },   // 1 day
      { timing: 240, channels: ['sms'], conditions: { time_sensitive: true } }, // 4 hours
      { timing: 0, channels: ['sms'], conditions: { time_sensitive: true } } // day of appointment
    ],
    escalation: [
      { trigger: 'no_response', delay_minutes: 120, next_channel: 'voice' }
    ]
  }
};

export default function SmartScheduleEditor({ 
  schedule, 
  onSave, 
  onCancel, 
  isOpen 
}: SmartScheduleEditorProps) {
  const [formData, setFormData] = useState<Partial<ReminderScheduleType>>(
    schedule || {
      schedule_name: '',
      appointment_type: '',
      reminders_config: JSON.stringify([]),
      escalation_rules: JSON.stringify([]),
      is_active: true
    }
  );

  const [reminderSteps, setReminderSteps] = useState<ReminderStep[]>(() => {
    try {
      return schedule ? JSON.parse(schedule.reminders_config) : [
        { timing: 5760, channels: ['sms'], conditions: {} }, // 4 days before
        { timing: 4320, channels: ['sms'], conditions: {} }, // 3 days before
        { timing: 2880, channels: ['sms'], conditions: {} }, // 2 days before
        { timing: 1440, channels: ['sms'], conditions: {} }, // 1 day before
        { timing: 0, channels: ['sms'], conditions: { time_sensitive: true } } // day of appointment
      ];
    } catch {
      return [
        { timing: 5760, channels: ['sms'], conditions: {} }, // 4 days before
        { timing: 4320, channels: ['sms'], conditions: {} }, // 3 days before
        { timing: 2880, channels: ['sms'], conditions: {} }, // 2 days before
        { timing: 1440, channels: ['sms'], conditions: {} }, // 1 day before
        { timing: 0, channels: ['sms'], conditions: { time_sensitive: true } } // day of appointment
      ];
    }
  });

  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>(() => {
    try {
      return schedule ? JSON.parse(schedule.escalation_rules || '[]') : [];
    } catch {
      return [];
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedFormData = {
      ...formData,
      reminders_config: JSON.stringify(reminderSteps),
      escalation_rules: JSON.stringify(escalationRules)
    };
    onSave(updatedFormData);
  };

  const addReminderStep = () => {
    setReminderSteps([...reminderSteps, { timing: 1440, channels: ['sms'], conditions: {} }]);
  };

  const updateReminderStep = (index: number, step: ReminderStep) => {
    const newSteps = [...reminderSteps];
    newSteps[index] = step;
    setReminderSteps(newSteps);
  };

  const removeReminderStep = (index: number) => {
    setReminderSteps(reminderSteps.filter((_, i) => i !== index));
  };

  const addEscalationRule = () => {
    setEscalationRules([...escalationRules, {
      trigger: 'no_response',
      delay_minutes: 60,
      next_channel: 'voice',
      escalate_to_emergency: false
    }]);
  };

  const updateEscalationRule = (index: number, rule: EscalationRule) => {
    const newRules = [...escalationRules];
    newRules[index] = rule;
    setEscalationRules(newRules);
  };

  const removeEscalationRule = (index: number) => {
    setEscalationRules(escalationRules.filter((_, i) => i !== index));
  };

  const loadPreset = (presetKey: string) => {
    const preset = PRESET_SCHEDULES[presetKey as keyof typeof PRESET_SCHEDULES];
    if (preset) {
      setFormData({ ...formData, schedule_name: preset.name });
      setReminderSteps(preset.steps);
      setEscalationRules(preset.escalation as EscalationRule[]);
      setSelectedPreset(presetKey);
    }
  };

  const getTimingLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
    return `${Math.round(minutes / 1440)} days`;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'voice': return <Phone className="w-4 h-4" />;
      case 'push': return <Smartphone className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {schedule ? 'Edit Smart Schedule' : 'Create Smart Schedule'}
              </h2>
              <p className="text-sm text-gray-600">AI-powered reminder scheduling with escalation rules</p>
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Name *
                  </label>
                  <input
                    type="text"
                    value={formData.schedule_name}
                    onChange={(e) => setFormData({ ...formData, schedule_name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., High-Priority Patient Schedule"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type (Optional)
                  </label>
                  <select
                    value={formData.appointment_type || ''}
                    onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All appointment types</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Initial Assessment">Initial Assessment</option>
                    <option value="Therapy Session">Therapy Session</option>
                    <option value="Medication Review">Medication Review</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active Schedule
                  </label>
                </div>
              </div>

              {/* Quick Start Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Start Templates
                </label>
                <div className="space-y-2">
                  {Object.entries(PRESET_SCHEDULES).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => loadPreset(key)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPreset === key 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{preset.name}</div>
                      <div className="text-sm text-gray-600">
                        {preset.steps.length} reminders, {preset.escalation.length} escalation rules
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reminder Timeline */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Reminder Timeline</span>
                </h3>
                <button
                  onClick={addReminderStep}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="space-y-4">
                {reminderSteps.map((step, index) => (
                  <div key={index} className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Reminder Step {index + 1}</h4>
                          <p className="text-sm text-gray-600">
                            {getTimingLabel(step.timing)} before appointment
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeReminderStep(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timing
                        </label>
                        <select
                          value={step.timing}
                          onChange={(e) => updateReminderStep(index, { ...step, timing: Number(e.target.value) })}
                          className="input-field"
                        >
                          <option value={0}>Day of appointment</option>
                          <option value={15}>15 minutes before</option>
                          <option value={30}>30 minutes before</option>
                          <option value={60}>1 hour before</option>
                          <option value={120}>2 hours before</option>
                          <option value={240}>4 hours before</option>
                          <option value={360}>6 hours before</option>
                          <option value={480}>8 hours before</option>
                          <option value={600}>10 hours before</option>
                          <option value={720}>12 hours before</option>
                          <option value={1440}>1 day before</option>
                          <option value={2880}>2 days before</option>
                          <option value={4320}>3 days before</option>
                          <option value={5760}>4 days before</option>
                          <option value={7200}>5 days before</option>
                          <option value={8640}>6 days before</option>
                          <option value={10080}>1 week before</option>
                          <option value={20160}>2 weeks before</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Channels
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['sms', 'email', 'voice', 'push'].map((channel) => (
                            <label key={channel} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={step.channels.includes(channel)}
                                onChange={(e) => {
                                  const newChannels = e.target.checked 
                                    ? [...step.channels, channel]
                                    : step.channels.filter(c => c !== channel);
                                  updateReminderStep(index, { ...step, channels: newChannels });
                                }}
                                className="rounded border-gray-300"
                              />
                              <div className="flex items-center space-x-1">
                                {getChannelIcon(channel)}
                                <span className="text-sm capitalize">{channel}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Smart Conditions
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={step.conditions?.weather_dependent || false}
                              onChange={(e) => updateReminderStep(index, {
                                ...step,
                                conditions: { ...step.conditions, weather_dependent: e.target.checked }
                              })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">Weather-aware</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={step.conditions?.time_sensitive || false}
                              onChange={(e) => updateReminderStep(index, {
                                ...step,
                                conditions: { ...step.conditions, time_sensitive: e.target.checked }
                              })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">Time-sensitive</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={step.conditions?.high_priority || false}
                              onChange={(e) => updateReminderStep(index, {
                                ...step,
                                conditions: { ...step.conditions, high_priority: e.target.checked }
                              })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">High priority</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escalation Rules */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span>Escalation Rules</span>
                </h3>
                <button
                  onClick={addEscalationRule}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Rule</span>
                </button>
              </div>

              {escalationRules.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No escalation rules configured</p>
                  <p className="text-sm text-gray-500">Add rules to automatically escalate when patients don't respond</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {escalationRules.map((rule, index) => (
                    <div key={index} className="card bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Escalation Rule {index + 1}</h4>
                            <p className="text-sm text-gray-600">
                              Trigger: {rule.trigger.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeEscalationRule(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trigger Condition
                          </label>
                          <select
                            value={rule.trigger}
                            onChange={(e) => updateEscalationRule(index, { ...rule, trigger: e.target.value as any })}
                            className="input-field"
                          >
                            <option value="no_response">No response received</option>
                            <option value="delivery_failed">Delivery failed</option>
                            <option value="high_risk_patient">High-risk patient</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delay (minutes)
                          </label>
                          <select
                            value={rule.delay_minutes}
                            onChange={(e) => updateEscalationRule(index, { ...rule, delay_minutes: Number(e.target.value) })}
                            className="input-field"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                            <option value={240}>4 hours</option>
                            <option value={480}>8 hours</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Escalate To
                          </label>
                          <select
                            value={rule.next_channel}
                            onChange={(e) => updateEscalationRule(index, { ...rule, next_channel: e.target.value })}
                            className="input-field"
                          >
                            <option value="sms">SMS</option>
                            <option value="email">Email</option>
                            <option value="voice">Voice Call</option>
                            <option value="emergency">Emergency Contact</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rule.escalate_to_emergency || false}
                            onChange={(e) => updateEscalationRule(index, { ...rule, escalate_to_emergency: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Contact emergency contact if patient still doesn't respond</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span className="font-medium">Advanced Settings</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">AI Optimization</h4>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                          <span className="text-sm">Optimize send times based on patient response patterns</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                          <span className="text-sm">Adjust frequency for high-risk patients</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm">Learn from patient feedback to improve messaging</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">External Integrations</h4>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm">Weather-based timing adjustments</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm">Traffic-aware timing recommendations</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm">Holiday and event awareness</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Preview */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span>Schedule Preview</span>
              </h4>
              <div className="space-y-3">
                {reminderSteps
                  .sort((a, b) => b.timing - a.timing)
                  .map((step, index) => (
                    <div key={index} className="flex items-center space-x-4 bg-white rounded-lg p-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {getTimingLabel(step.timing)} before
                        </span>
                        <span className="text-gray-600 ml-2">
                          via {step.channels.join(', ')}
                        </span>
                      </div>
                      {Object.values(step.conditions || {}).some(Boolean) && (
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-500">Smart conditions</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>{schedule ? 'Update' : 'Create'} Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}
