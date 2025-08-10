import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { 
  Calendar, 
  Clock, 
  CheckCircle,
  X,
  ArrowLeft,
  Heart,
  MessageSquare
} from "lucide-react";


interface PortalSettings {
  id: number;
  user_id: string;
  portal_enabled: boolean;
  portal_slug: string;
  welcome_message: string;
  booking_instructions: string;
  require_patient_info: boolean;
  allow_cancellations: boolean;
  cancellation_hours_limit: number;
}

interface AvailableSlot {
  date: string;
  time: string;
  duration: number;
}

interface BookingForm {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  date_of_birth: string;
  appointment_type: string;
  appointment_date: string;
  duration_minutes: number;
  notes: string;
}

export default function PatientPortal() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [portalSettings, setPortalSettings] = useState<PortalSettings | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [step, setStep] = useState<'welcome' | 'slots' | 'form' | 'confirmation'>('welcome');
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    date_of_birth: '',
    appointment_type: 'Consultation',
    appointment_date: '',
    duration_minutes: 60,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string>('');

  useEffect(() => {
    if (slug) {
      fetchPortalSettings();
    }
  }, [slug]);

  const fetchPortalSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/portal/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setPortalSettings(data);
        if (data.portal_enabled) {
          await fetchAvailableSlots();
        }
      } else {
        // Portal not found or disabled
        setPortalSettings(null);
      }
    } catch (error) {
      console.error('Error fetching portal settings:', error);
      setPortalSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`/api/portal/${slug}/availability`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !portalSettings) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/portal/${slug}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingForm,
          appointment_date: `${selectedSlot.date}T${selectedSlot.time}:00`,
          duration_minutes: selectedSlot.duration
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setConfirmationId(result.confirmationId);
        setStep('confirmation');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!portalSettings || !portalSettings.portal_enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portal Not Available</h1>
          <p className="text-gray-600">This booking portal is currently disabled or doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Group available slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, AvailableSlot[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile-First Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {step !== 'welcome' && (
              <button
                onClick={() => {
                  if (step === 'slots') setStep('welcome');
                  else if (step === 'form') setStep('slots');
                  else if (step === 'confirmation') setStep('form');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MindCare
              </span>
            </div>
            <div className="w-8"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {step === 'welcome' && (
          <div className="text-center mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Our Practice
              </h1>
              <div className="prose max-w-none text-gray-600 mb-6">
                <p>{portalSettings.welcome_message || 'Schedule your appointment online for convenient and flexible booking.'}</p>
              </div>
              
              {portalSettings.booking_instructions && (
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">Booking Instructions</h3>
                  <p className="text-blue-800 text-sm">{portalSettings.booking_instructions}</p>
                </div>
              )}

              <button
                onClick={() => setStep('slots')}
                className="w-full sm:w-auto btn-primary text-lg px-8 py-4"
              >
                Book Appointment
              </button>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Flexible Scheduling</h3>
                <p className="text-sm text-gray-600">Choose from available time slots</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">SMS Reminders</h3>
                <p className="text-sm text-gray-600">Automatic appointment reminders</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Easy Booking</h3>
                <p className="text-sm text-gray-600">Simple 3-step process</p>
              </div>
            </div>
          </div>
        )}

        {step === 'slots' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date & Time</h2>
            
            {Object.keys(slotsByDate).length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No available slots at this time. Please check back later.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(slotsByDate).map(([date, slots]) => (
                  <div key={date}>
                    <h3 className="font-medium text-gray-900 mb-3">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {slots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setBookingForm({...bookingForm, appointment_date: `${slot.date}T${slot.time}:00`});
                            setStep('form');
                          }}
                          className="p-3 text-center border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{slot.time}</div>
                          <div className="text-xs text-gray-500">{slot.duration} min</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'form' && selectedSlot && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
            
            {/* Selected Appointment Summary */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Selected Appointment</h3>
              <div className="text-blue-800 text-sm">
                <div>{new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
                <div>{selectedSlot.time} ({selectedSlot.duration} minutes)</div>
              </div>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.first_name}
                    onChange={(e) => setBookingForm({...bookingForm, first_name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.last_name}
                    onChange={(e) => setBookingForm({...bookingForm, last_name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.phone_number}
                    onChange={(e) => setBookingForm({...bookingForm, phone_number: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              {portalSettings.require_patient_info && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={bookingForm.date_of_birth}
                    onChange={(e) => setBookingForm({...bookingForm, date_of_birth: e.target.value})}
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <select
                  value={bookingForm.appointment_type}
                  onChange={(e) => setBookingForm({...bookingForm, appointment_type: e.target.value})}
                  className="input-field"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Initial Assessment">Initial Assessment</option>
                  <option value="Therapy Session">Therapy Session</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Any additional information or special requests..."
                />
              </div>

              <button
                type="button"
                onClick={handleBookAppointment}
                disabled={submitting || !bookingForm.first_name || !bookingForm.last_name || !bookingForm.phone_number}
                className="w-full btn-primary py-4 text-lg"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Booking Appointment...</span>
                  </div>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your appointment has been successfully booked. You'll receive an SMS reminder before your appointment.
            </p>
            
            {selectedSlot && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Appointment Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                  <div>{selectedSlot.time}</div>
                  <div>{bookingForm.appointment_type} ({selectedSlot.duration} minutes)</div>
                  <div>Confirmation ID: {confirmationId}</div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>Please save this confirmation for your records.</p>
              {portalSettings.allow_cancellations && (
                <p className="mt-2">
                  To cancel or reschedule, please call us at least {portalSettings.cancellation_hours_limit} hours before your appointment.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
