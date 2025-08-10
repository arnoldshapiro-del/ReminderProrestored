import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Edit, 
  Trash2, 
  Clock, 
  User,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  ChevronDown
} from "lucide-react";
import type { AppointmentWithPatientType, CreateAppointmentRequestType, PatientType, AppointmentStatus } from "@/shared/types";

// Email Dropdown Component
interface EmailDropdownProps {
  email: string;
  patientName: string;
  appointmentDate: string;
  appointmentType: string;
}

function EmailDropdown({ email, patientName, appointmentDate, appointmentType }: EmailDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmailOption = (option: 'gmail' | 'outlook' | 'default') => {
    const subject = `Appointment Reminder - ${new Date(appointmentDate).toLocaleDateString()}`;
    const body = `Dear ${patientName},\n\nThis is a reminder about your upcoming appointment:\n\nDate: ${new Date(appointmentDate).toLocaleDateString()}\nTime: ${new Date(appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}\nType: ${appointmentType}\n\nPlease let us know if you need to reschedule.\n\nBest regards`;
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    
    switch (option) {
      case 'gmail':
        window.open(`https://mail.google.com/mail/?view=cm&to=${email}&su=${encodedSubject}&body=${encodedBody}`, '_blank');
        break;
      case 'outlook':
        window.open(`https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${encodedSubject}&body=${encodedBody}`, '_blank');
        break;
      case 'default':
        window.location.href = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
        break;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
        title="Email patient"
      >
        <Mail className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              <button
                onClick={() => handleEmailOption('default')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
              >
                📧 Default Email App
              </button>
              <button
                onClick={() => handleEmailOption('gmail')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
              >
                📧 Gmail
              </button>
              <button
                onClick={() => handleEmailOption('outlook')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
              >
                📧 Outlook
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Appointments() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentWithPatientType[]>([]);
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithPatientType | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentRequestType>({
    user_id: '',
    patient_id: 0,
    appointment_date: '',
    duration_minutes: 60,
    appointment_type: 'Consultation',
    notes: ''
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchPatients();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let response = await fetch('/api/appointments', {
        credentials: 'include'
      });
      
      // If auth fails, try anonymous appointments
      if (!response.ok && response.status === 401) {
        response = await fetch('/api/appointments/list-anonymous');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  const handleCreateAppointment = async () => {
    // Validate required fields
    if (!formData.patient_id || !formData.appointment_date) {
      alert('Please select a patient and appointment date');
      return;
    }
    
    setSaving(true);
    try {
      // First try with authenticated endpoint
      let response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          user_id: user?.id || ''
        }),
      });

      // If auth fails, try anonymous endpoint temporarily
      if (!response.ok && response.status === 401) {
        response = await fetch('/api/appointments/create-anonymous', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json();
      
      await fetchAppointments();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(`Failed to create appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;
    
    // Validate required fields
    if (!formData.patient_id || !formData.appointment_date) {
      alert('Please select a patient and appointment date');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`/api/appointments/${editingAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: editingAppointment.id,
          user_id: user?.id || editingAppointment.user_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json();
      
      await fetchAppointments();
      setShowModal(false);
      setEditingAppointment(null);
      resetForm();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(`Failed to update appointment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAppointments();
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      patient_id: 0,
      appointment_date: '',
      duration_minutes: 60,
      appointment_type: 'Consultation',
      notes: ''
    });
  };

  const openEditModal = (appointment: AppointmentWithPatientType) => {
    setEditingAppointment(appointment);
    setFormData({
      user_id: appointment.user_id,
      patient_id: appointment.patient_id,
      appointment_date: appointment.appointment_date.slice(0, 16), // Format for datetime-local input
      duration_minutes: appointment.duration_minutes,
      appointment_type: appointment.appointment_type,
      notes: appointment.notes || ''
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingAppointment(null);
    resetForm();
    setShowModal(true);
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'no_show': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAppointments = (Array.isArray(appointments) ? appointments : []).filter(appointment => {
    const patientName = appointment.patient ? 
      `${appointment.patient.first_name} ${appointment.patient.last_name}` : '';
    const patientPhone = appointment.patient?.phone_number || '';
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">Manage your appointment schedule and patient visits</p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center space-x-2 mt-4 lg:mt-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by scheduling your first appointment'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button onClick={openCreateModal} className="btn-primary">
                Schedule First Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {appointment.patient ? 
                          `${appointment.patient.first_name[0]}${appointment.patient.last_name[0]}` : 
                          'PA'}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.patient ? 
                          `${appointment.patient.first_name} ${appointment.patient.last_name}` : 
                          'Unknown Patient'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(appointment.appointment_date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{appointment.appointment_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {appointment.duration_minutes} minutes
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {appointment.patient?.phone_number && (
                        <a
                          href={`tel:${appointment.patient.phone_number}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Call patient"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      
                      {appointment.patient?.email && (
                        <EmailDropdown 
                          email={appointment.patient.email}
                          patientName={appointment.patient.first_name}
                          appointmentDate={appointment.appointment_date}
                          appointmentType={appointment.appointment_type}
                        />
                      )}
                      
                      <button
                        onClick={() => openEditModal(appointment)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  </div>
                )}

                {/* Reminder Status */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      {appointment.reminder_sent_2_days ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-gray-300" />
                      )}
                      <span className={appointment.reminder_sent_2_days ? 'text-green-600' : 'text-gray-500'}>
                        2-day reminder
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {appointment.reminder_sent_1_day ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-gray-300" />
                      )}
                      <span className={appointment.reminder_sent_1_day ? 'text-green-600' : 'text-gray-500'}>
                        1-day reminder
                      </span>
                    </div>
                    {appointment.patient_response && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span className="text-blue-600">Patient responded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient *
                  </label>
                  <select
                    value={formData.patient_id}
                    onChange={(e) => setFormData({...formData, patient_id: Number(e.target.value)})}
                    className="input-field"
                    required
                  >
                    <option value={0}>Select a patient</option>
                    {(Array.isArray(patients) ? patients : []).map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} - {patient.phone_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.appointment_date}
                      onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) *
                    </label>
                    <select
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                      className="input-field"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type *
                  </label>
                  <select
                    value={formData.appointment_type}
                    onChange={(e) => setFormData({...formData, appointment_type: e.target.value})}
                    className="input-field"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Initial Assessment">Initial Assessment</option>
                    <option value="Therapy Session">Therapy Session</option>
                    <option value="Check-up">Check-up</option>
                    <option value="Emergency">Emergency</option>
                  </select>
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
                    placeholder="Any additional notes for this appointment..."
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
                  onClick={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}
                  disabled={saving || !formData.patient_id || !formData.appointment_date}
                  className="btn-primary flex items-center space-x-2 min-w-[140px]"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingAppointment ? 'Update' : 'Schedule'} Appointment</span>
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
