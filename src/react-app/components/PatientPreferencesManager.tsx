import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Edit, 
  MessageSquare, 
  Mail, 
  Phone, 
  Smartphone,
  Clock,
  Settings,
  X
} from "lucide-react";
import type { PatientType } from "@/shared/types";
import type { PatientPreferencesType } from "@/shared/reminder-types";
import PatientPreferencesEditor from "./PatientPreferencesEditor";

interface PatientPreferencesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientPreferencesManager({ isOpen, onClose }: PatientPreferencesManagerProps) {
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [preferences, setPreferences] = useState<Record<number, PatientPreferencesType>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState<PatientType | null>(null);
  const [showPreferencesEditor, setShowPreferencesEditor] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPatientsAndPreferences();
    }
  }, [isOpen]);

  const fetchPatientsAndPreferences = async () => {
    try {
      setLoading(true);
      
      // Fetch patients
      const patientsResponse = await fetch('/api/patients');
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);
        
        // Fetch preferences for each patient
        const preferencesMap: Record<number, PatientPreferencesType> = {};
        
        for (const patient of patientsData) {
          try {
            const prefResponse = await fetch(`/api/patients/${patient.id}/preferences`);
            if (prefResponse.ok) {
              const prefData = await prefResponse.json();
              if (patient.id) {
                preferencesMap[patient.id] = prefData;
              }
            }
          } catch (error) {
            console.error(`Error fetching preferences for patient ${patient.id}:`, error);
          }
        }
        
        setPreferences(preferencesMap);
      }
    } catch (error) {
      console.error('Error fetching patients and preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async (patientId: number, newPreferences: Partial<PatientPreferencesType>) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPreferences, patient_id: patientId }),
      });

      if (response.ok) {
        const savedPreferences = await response.json();
        setPreferences(prev => ({
          ...prev,
          [patientId]: savedPreferences
        }));
        setShowPreferencesEditor(false);
        setEditingPatient(null);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone_number.includes(searchTerm) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'voice': return <Phone className="w-4 h-4" />;
      case 'push': return <Smartphone className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPreferenceStatus = (patientId: number) => {
    const pref = preferences[patientId];
    if (!pref) return { status: 'none', color: 'text-gray-400', text: 'Not set' };
    
    const hasPreferences = pref.preferred_channel || pref.preferred_time_start || pref.language_code !== 'en';
    return hasPreferences 
      ? { status: 'configured', color: 'text-green-600', text: 'Configured' }
      : { status: 'default', color: 'text-yellow-600', text: 'Default' };
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Patient Communication Preferences</h2>
                <p className="text-sm text-gray-600">Manage how and when patients receive reminders</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search and Actions */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredPatients.length} of {patients.length} patients
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => {
                  if (!patient.id) return null;
                  
                  const pref = preferences[patient.id];
                  const status = getPreferenceStatus(patient.id);
                  
                  return (
                    <div key={patient.id} className="card hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {patient.first_name?.[0] || ''}{patient.last_name?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {patient.first_name} {patient.last_name}
                            </h4>
                            <p className="text-sm text-gray-500">{patient.phone_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 ${status.color}`}>
                            {status.text}
                          </div>
                        </div>
                      </div>

                      {pref ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Preferred Channel</span>
                            <div className="flex items-center space-x-1">
                              {getChannelIcon(pref.preferred_channel)}
                              <span className="text-sm font-medium capitalize">{pref.preferred_channel}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Contact Hours</span>
                            <span className="text-sm font-medium">
                              {pref.preferred_time_start} - {pref.preferred_time_end}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Language</span>
                            <span className="text-sm font-medium uppercase">{pref.language_code}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Max per Day</span>
                            <span className="text-sm font-medium">{pref.max_reminders_per_day}</span>
                          </div>
                          {pref.do_not_disturb_start && pref.do_not_disturb_end && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Do Not Disturb</span>
                              <span className="text-sm font-medium text-red-600">
                                {pref.do_not_disturb_start} - {pref.do_not_disturb_end}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No preferences set</p>
                          <p className="text-xs">Using system defaults</p>
                        </div>
                      )}

                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setEditingPatient(patient);
                            setShowPreferencesEditor(true);
                          }}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>{pref ? 'Edit' : 'Set'} Preferences</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add patients to manage their preferences'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Preferences Editor */}
      {showPreferencesEditor && editingPatient && editingPatient.id && (
        <PatientPreferencesEditor
          patientId={editingPatient.id}
          patientName={`${editingPatient.first_name} ${editingPatient.last_name}`}
          preferences={preferences[editingPatient.id]}
          onSave={(prefs) => editingPatient.id && handleSavePreferences(editingPatient.id, prefs)}
          onCancel={() => {
            setShowPreferencesEditor(false);
            setEditingPatient(null);
          }}
          isOpen={true}
        />
      )}
    </>
  );
}
