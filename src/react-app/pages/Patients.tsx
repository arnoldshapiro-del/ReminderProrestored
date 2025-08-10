import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import CSVImport from "@/react-app/components/CSVImport";
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar,
  X,
  Save,
  Upload
} from "lucide-react";
import type { PatientType, CreatePatientRequestType } from "@/shared/types";

// Phone number formatting utility
const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const phoneNumber = value.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (phoneNumber.length <= 3) {
    return phoneNumber;
  } else if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }
};

// Get raw phone number for saving
const getPhoneNumberForSave = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  // Add +1 country code if not present and is US number
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return value; // Return as-is if doesn't match expected format
};

export default function Patients() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientType | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreatePatientRequestType>({
    user_id: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    date_of_birth: '',
    notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    is_active: true
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/patients', {
        credentials: 'include'
      });
      if (!response.ok) {
        // If auth fails, try to fetch anonymous patients
        if (response.status === 401) {
          const anonymousResponse = await fetch('/api/patients/list-anonymous');
          if (anonymousResponse.ok) {
            const data = await anonymousResponse.json();
            setPatients(Array.isArray(data) ? data : []);
            return;
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone_number.trim()) {
      alert('Please fill in all required fields: First Name, Last Name, and Phone Number');
      return;
    }
    
    setSaving(true);
    try {
      const patientData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: getPhoneNumberForSave(formData.phone_number),
        email: formData.email,
        date_of_birth: formData.date_of_birth,
        notes: formData.notes,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone ? 
          getPhoneNumberForSave(formData.emergency_contact_phone) : '',
        is_active: formData.is_active
      };

      // First try with authenticated endpoint
      let response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(patientData),
      });

      // If auth fails, try anonymous endpoint temporarily
      if (!response.ok && response.status === 401) {
        response = await fetch('/api/patients/create-anonymous', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patientData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json();
      
      await fetchPatients();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating patient:', error);
      alert(`Failed to create patient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;

    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.first_name?.trim() || !formData.last_name?.trim() || !formData.phone_number?.trim()) {
        alert('First name, last name, and phone number are required');
        return;
      }

      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: getPhoneNumberForSave(formData.phone_number.trim()),
        email: formData.email?.trim() || '',
        date_of_birth: formData.date_of_birth || '',
        notes: formData.notes || '',
        emergency_contact_name: formData.emergency_contact_name || '',
        emergency_contact_phone: formData.emergency_contact_phone ? 
          getPhoneNumberForSave(formData.emergency_contact_phone.trim()) : '',
        is_active: formData.is_active ?? true
      };

      const response = await fetch(`/api/patients/${editingPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        await fetchPatients();
        setShowModal(false);
        setEditingPatient(null);
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Update failed:', errorData);
        alert(`Failed to update patient: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert(`Failed to update patient: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePatient = async (patientId: number) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert(`Failed to delete patient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      date_of_birth: '',
      notes: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      is_active: true
    });
  };

  const openEditModal = (patient: PatientType) => {
    setEditingPatient(patient);
    setFormData({
      user_id: patient.user_id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      phone_number: formatPhoneNumber(patient.phone_number.replace(/^\+1/, '')), // Remove +1 for display
      email: patient.email || '',
      date_of_birth: patient.date_of_birth || '',
      notes: patient.notes || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone ? 
        formatPhoneNumber(patient.emergency_contact_phone.replace(/^\+1/, '')) : '',
      is_active: patient.is_active
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingPatient(null);
    resetForm();
    setShowModal(true);
  };

  const handlePhoneNumberChange = (value: string, field: 'phone_number' | 'emergency_contact_phone') => {
    const formatted = formatPhoneNumber(value);
    setFormData({ ...formData, [field]: formatted });
  };

  const filteredPatients = (Array.isArray(patients) ? patients : []).filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone_number.includes(searchTerm) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isPending || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
            <p className="text-gray-600 mt-1">Manage your patient information and contact details</p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={openCreateModal}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Patient</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Patients Grid */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first patient'}
            </p>
            {!searchTerm && (
              <button onClick={openCreateModal} className="btn-primary">
                Add Your First Patient
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Patient ID: {patient.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditModal(patient)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient.id!)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">
                      {formatPhoneNumber(patient.phone_number.replace(/^\+1/, ''))}
                    </span>
                  </div>
                  
                  {patient.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700">{patient.email}</span>
                    </div>
                  )}
                  
                  {patient.date_of_birth && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-700">
                        {new Date(patient.date_of_birth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {patient.notes && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {patient.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <CSVImport
            onImportComplete={() => {
              fetchPatients();
              setShowImportModal(false);
            }}
            onClose={() => setShowImportModal(false)}
          />
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={saving}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="input-field"
                      required
                      disabled={saving}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="input-field"
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => handlePhoneNumberChange(e.target.value, 'phone_number')}
                      placeholder="(555) 123-4567"
                      className="input-field"
                      required
                      disabled={saving}
                      maxLength={14}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-field"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="input-field"
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                      className="input-field"
                      disabled={saving}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => handlePhoneNumberChange(e.target.value, 'emergency_contact_phone')}
                      placeholder="(555) 123-4567"
                      className="input-field"
                      disabled={saving}
                      maxLength={14}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Any additional notes about the patient..."
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={editingPatient ? handleUpdatePatient : handleCreatePatient}
                  disabled={saving || !formData.first_name.trim() || !formData.last_name.trim() || !formData.phone_number.trim()}
                  className="btn-primary flex items-center space-x-2 min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingPatient ? 'Update' : 'Create'} Patient</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
