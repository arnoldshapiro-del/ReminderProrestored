import { useState } from "react";
import { 
  Save, 
  Eye, 
  X, 
  Plus, 
  MessageSquare, 
  Mail, 
  Phone, 
  Smartphone, 
  Zap,
  Hash,
  Type
} from "lucide-react";
import type { ReminderTemplateType } from "@/shared/reminder-types";

interface ReminderTemplateEditorProps {
  template?: ReminderTemplateType;
  onSave: (template: Partial<ReminderTemplateType>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { name: '{patient_first_name}', description: 'Patient\'s first name', example: 'John' },
  { name: '{patient_last_name}', description: 'Patient\'s last name', example: 'Smith' },
  { name: '{appointment_date}', description: 'Appointment date', example: 'March 15, 2024' },
  { name: '{appointment_time}', description: 'Appointment time', example: '2:30 PM' },
  { name: '{appointment_type}', description: 'Type of appointment', example: 'Consultation' },
  { name: '{doctor_name}', description: 'Doctor\'s name', example: 'Dr. Johnson' },
  { name: '{practice_name}', description: 'Practice name', example: 'MindCare Clinic' },
  { name: '{practice_phone}', description: 'Practice phone number', example: '(555) 123-4567' },
  { name: '{practice_address}', description: 'Practice address', example: '123 Main St, City, ST' },
  { name: '{confirmation_link}', description: 'Link to confirm appointment', example: 'https://...' },
  { name: '{reschedule_link}', description: 'Link to reschedule', example: 'https://...' },
  { name: '{duration_minutes}', description: 'Appointment duration', example: '60' },
  { name: '{weather_forecast}', description: 'Weather forecast', example: 'Sunny, 72°F' },
  { name: '{travel_time}', description: 'Estimated travel time', example: '15 minutes' },
  { name: '{preparation_instructions}', description: 'Pre-appointment instructions', example: 'Please arrive 10 minutes early' }
];

const PREDEFINED_TEMPLATES = {
  sms: {
    appointment: [
      {
        name: "Standard Reminder",
        content: "Hi {patient_first_name}, reminder: {appointment_type} with {practice_name} on {appointment_date} at {appointment_time}. Reply YES to confirm or RESCHEDULE to change."
      },
      {
        name: "Friendly Reminder",
        content: "Hello {patient_first_name}! 👋 Just a friendly reminder about your {appointment_type} tomorrow at {appointment_time}. We're looking forward to seeing you! Reply CONFIRM if you'll be there."
      },
      {
        name: "Professional Reminder",
        content: "Dear {patient_first_name} {patient_last_name}, this is a reminder of your scheduled {appointment_type} appointment on {appointment_date} at {appointment_time} with {practice_name}. Please confirm your attendance."
      },
      {
        name: "Weather-Aware Reminder",
        content: "Hi {patient_first_name}! Reminder: {appointment_type} tomorrow at {appointment_time}. Weather forecast: {weather_forecast}. Please allow extra travel time if needed. Reply YES to confirm."
      }
    ],
    preparation: [
      {
        name: "Pre-Visit Instructions",
        content: "Hi {patient_first_name}, your {appointment_type} is tomorrow at {appointment_time}. {preparation_instructions} Please bring your insurance card and any medications you're currently taking."
      }
    ],
    followup: [
      {
        name: "Post-Visit Follow-up",
        content: "Hi {patient_first_name}, thank you for visiting {practice_name} today. If you have any questions about your visit or treatment plan, please don't hesitate to contact us at {practice_phone}."
      }
    ]
  },
  email: {
    appointment: [
      {
        name: "Detailed Reminder",
        subject: "Appointment Reminder - {appointment_date}",
        content: `Dear {patient_first_name} {patient_last_name},

This is a friendly reminder about your upcoming appointment:

📅 Date: {appointment_date}
🕒 Time: {appointment_time}
🏥 Type: {appointment_type}
📍 Location: {practice_address}

Please arrive 10 minutes early for check-in. If you need to reschedule, please contact us at {practice_phone} at least 24 hours in advance.

{preparation_instructions}

Best regards,
{practice_name} Team`
      }
    ]
  }
};

export default function ReminderTemplateEditor({ 
  template, 
  onSave, 
  onCancel, 
  isOpen 
}: ReminderTemplateEditorProps) {
  const [formData, setFormData] = useState<Partial<ReminderTemplateType>>(
    template || {
      template_name: '',
      template_type: 'appointment',
      channel_type: 'sms',
      language_code: 'en',
      subject: '',
      message_template: '',
      variables: JSON.stringify(TEMPLATE_VARIABLES.map(v => v.name)),
      is_active: true
    }
  );

  const [previewMode, setPreviewMode] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-template') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = formData.message_template || '';
    const newValue = currentValue.slice(0, start) + variable + currentValue.slice(end);
    
    setFormData({ ...formData, message_template: newValue });
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const loadPredefinedTemplate = (templateData: any) => {
    setFormData({
      ...formData,
      template_name: templateData.name,
      subject: templateData.subject || '',
      message_template: templateData.content
    });
  };

  const generatePreview = () => {
    let preview = formData.message_template || '';
    
    // Replace variables with sample data
    TEMPLATE_VARIABLES.forEach(variable => {
      preview = preview.replace(new RegExp(variable.name.replace(/[{}]/g, '\\$&'), 'g'), variable.example);
    });
    
    return preview;
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'sms': return <MessageSquare className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'voice': return <Phone className="w-5 h-5" />;
      case 'push': return <Smartphone className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const channelTemplates = formData.channel_type ? PREDEFINED_TEMPLATES[formData.channel_type as keyof typeof PREDEFINED_TEMPLATES] : null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Type className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {template ? 'Edit Reminder Template' : 'Create Reminder Template'}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  {getChannelIcon(formData.channel_type || 'sms')}
                  <span className="text-sm text-gray-500 capitalize">
                    {formData.channel_type} Template
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`btn-secondary flex items-center space-x-2 ${previewMode ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Left Column - Template Editor */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 24 Hour Reminder"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Type
                    </label>
                    <select
                      value={formData.template_type}
                      onChange={(e) => setFormData({ ...formData, template_type: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="appointment">Appointment Reminder</option>
                      <option value="preparation">Pre-Visit Preparation</option>
                      <option value="followup">Post-Visit Follow-up</option>
                      <option value="medication">Medication Reminder</option>
                      <option value="care_plan">Care Plan Check-in</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Channel Type
                    </label>
                    <select
                      value={formData.channel_type}
                      onChange={(e) => setFormData({ ...formData, channel_type: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="sms">SMS Text Message</option>
                      <option value="email">Email</option>
                      <option value="voice">Voice Call</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={formData.language_code}
                      onChange={(e) => setFormData({ ...formData, language_code: e.target.value })}
                      className="input-field"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>
                </div>

                {formData.channel_type === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject || ''}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Appointment Reminder - {appointment_date}"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Template *
                  </label>
                  {previewMode ? (
                    <div className="min-h-[300px] p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-3">Preview:</h4>
                      <div className="whitespace-pre-wrap text-gray-700 bg-white p-4 rounded border">
                        {generatePreview()}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      id="message-template"
                      value={formData.message_template}
                      onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                      rows={formData.channel_type === 'email' ? 15 : 8}
                      className="input-field resize-none font-mono text-sm"
                      placeholder={
                        formData.channel_type === 'sms' 
                          ? "Hi {patient_first_name}, reminder: {appointment_type} on {appointment_date} at {appointment_time}. Reply YES to confirm."
                          : "Dear {patient_first_name}, this is a reminder about your upcoming appointment..."
                      }
                    />
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Character count: {(formData.message_template || '').length}
                      {formData.channel_type === 'sms' && (formData.message_template || '').length > 160 && (
                        <span className="text-amber-600 ml-2">
                          (Will be sent as {Math.ceil((formData.message_template || '').length / 160)} messages)
                        </span>
                      )}
                    </p>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Variables & Templates */}
              <div className="space-y-6">
                {/* Predefined Templates */}
                {channelTemplates && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>Quick Start Templates</span>
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(channelTemplates).map(([category, templates]) => (
                        <div key={category}>
                          <h5 className="text-sm font-medium text-gray-700 capitalize mb-2">{category}</h5>
                          <div className="space-y-2">
                            {templates.map((tmpl: any, index: number) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={() => loadPredefinedTemplate(tmpl)}>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-900">{tmpl.name}</span>
                                  <Plus className="w-4 h-4 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {tmpl.content.substring(0, 80)}...
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Template Variables */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-blue-500" />
                    <span>Available Variables</span>
                  </h4>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {TEMPLATE_VARIABLES.map((variable, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => insertVariable(variable.name)}
                      >
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {variable.name}
                          </code>
                          <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Example: <span className="font-medium">{variable.example}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Features */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span>Smart Features</span>
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5"></div>
                      <span className="text-gray-700">Automatic language detection based on patient preferences</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5"></div>
                      <span className="text-gray-700">Weather-aware messaging with traffic updates</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5"></div>
                      <span className="text-gray-700">Sentiment analysis for personalized follow-up</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5"></div>
                      <span className="text-gray-700">AI-powered timing optimization</span>
                    </div>
                  </div>
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
              <span>{template ? 'Update' : 'Create'} Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
