import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Save,
  CalendarOff
} from "lucide-react";
import { convertTo12Hour, generateTimeOptions } from "@/react-app/utils/timeUtils";

interface AvailabilitySchedule {
  id?: number;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  is_active: boolean;
}

interface TimeOffRequest {
  id?: number;
  user_id: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
  is_full_day: boolean;
  is_approved: boolean;
}

export default function Availability() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<AvailabilitySchedule[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AvailabilitySchedule | null>(null);
  

  const [scheduleForm, setScheduleForm] = useState<AvailabilitySchedule>({
    user_id: '',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:45',
    buffer_before_minutes: 15,
    buffer_after_minutes: 15,
    is_active: true
  });

  const timeOptions = generateTimeOptions();

  const [timeOffForm, setTimeOffForm] = useState<TimeOffRequest>({
    user_id: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    reason: '',
    is_full_day: true,
    is_approved: true
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [schedulesResponse, timeOffResponse] = await Promise.all([
        fetch('/api/availability/schedules'),
        fetch('/api/availability/time-off')
      ]);

      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json();
        setSchedules(schedulesData);
      }

      if (timeOffResponse.ok) {
        const timeOffData = await timeOffResponse.json();
        setTimeOffRequests(timeOffData);
      }

    } catch (error) {
      console.error('Error fetching availability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/availability/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...scheduleForm,
          user_id: user.id
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowScheduleModal(false);
        resetScheduleForm();
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule || !user) return;
    
    try {
      const response = await fetch(`/api/availability/schedules/${editingSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...scheduleForm,
          id: editingSchedule.id,
          user_id: user.id
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowScheduleModal(false);
        setEditingSchedule(null);
        resetScheduleForm();
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      const response = await fetch(`/api/availability/schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleCreateTimeOff = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/availability/time-off', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...timeOffForm,
          user_id: user.id
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowTimeOffModal(false);
        resetTimeOffForm();
      }
    } catch (error) {
      console.error('Error creating time off:', error);
    }
  };

  const handleDeleteTimeOff = async (timeOffId: number) => {
    if (!confirm('Are you sure you want to delete this time off?')) return;
    
    try {
      const response = await fetch(`/api/availability/time-off/${timeOffId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting time off:', error);
    }
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      user_id: '',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00',
      buffer_before_minutes: 15,
      buffer_after_minutes: 15,
      is_active: true
    });
  };

  const resetTimeOffForm = () => {
    setTimeOffForm({
      user_id: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      reason: '',
      is_full_day: true,
      is_approved: true
    });
  };

  const openEditScheduleModal = (schedule: AvailabilitySchedule) => {
    setEditingSchedule(schedule);
    setScheduleForm(schedule);
    setShowScheduleModal(true);
  };

  const openCreateScheduleModal = () => {
    setEditingSchedule(null);
    resetScheduleForm();
    setShowScheduleModal(true);
  };

  const openCreateTimeOffModal = () => {
    resetTimeOffForm();
    setShowTimeOffModal(true);
  };

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

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.day_of_week]) {
      acc[schedule.day_of_week] = [];
    }
    acc[schedule.day_of_week].push(schedule);
    return acc;
  }, {} as Record<number, AvailabilitySchedule[]>);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
            <p className="text-gray-600 mt-1">Configure your working hours, buffer times, and time off</p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0">
            <button
              onClick={openCreateTimeOffModal}
              className="btn-secondary flex items-center space-x-2"
            >
              <CalendarOff className="w-4 h-4" />
              <span>Add Time Off</span>
            </button>
            <button
              onClick={openCreateScheduleModal}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Schedule</span>
            </button>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
              <p className="text-gray-600 text-sm">Configure your working hours for each day of the week</p>
            </div>
          </div>

          <div className="space-y-4">
            {dayNames.map((dayName, dayIndex) => (
              <div key={dayIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-24 font-medium text-gray-900">{dayName}</div>
                  <div className="flex flex-wrap gap-2">
                    {schedulesByDay[dayIndex]?.length > 0 ? (
                      schedulesByDay[dayIndex].map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border"
                        >
                          <span className="text-sm">
                            {convertTo12Hour(schedule.start_time)} - {convertTo12Hour(schedule.end_time)}
                          </span>
                          {(schedule.buffer_before_minutes > 0 || schedule.buffer_after_minutes > 0) && (
                            <span className="text-xs text-gray-500">
                              (±{Math.max(schedule.buffer_before_minutes, schedule.buffer_after_minutes)}min)
                            </span>
                          )}
                          <button
                            onClick={() => openEditScheduleModal(schedule)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id!)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Not available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Off Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <CalendarOff className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Time Off</h2>
                <p className="text-gray-600 text-sm">Block out dates when you're unavailable (vacation, sick days, conferences, etc.)</p>
              </div>
            </div>
          </div>

          {timeOffRequests.length === 0 ? (
            <div className="text-center py-8">
              <CalendarOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No time off scheduled</p>
              <p className="text-sm text-gray-500 mt-2">Time off blocks prevent patients from booking appointments during those periods</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeOffRequests.map((timeOff) => (
                <div key={timeOff.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="font-medium text-gray-900">
                        {new Date(timeOff.start_date).toLocaleDateString()} - {new Date(timeOff.end_date).toLocaleDateString()}
                      </div>
                      {!timeOff.is_full_day && (
                        <div className="text-sm text-gray-600">
                          {timeOff.start_time ? convertTo12Hour(timeOff.start_time) : ''} - {timeOff.end_time ? convertTo12Hour(timeOff.end_time) : ''}
                        </div>
                      )}
                      {timeOff.reason && (
                        <div className="text-sm text-gray-600">
                          {timeOff.reason}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTimeOff(timeOff.id!)}
                    className="text-gray-400 hover:text-red-600 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
                </h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={scheduleForm.day_of_week}
                    onChange={(e) => setScheduleForm({...scheduleForm, day_of_week: Number(e.target.value)})}
                    className="input-field"
                  >
                    {dayNames.map((day, index) => (
                      <option key={index} value={index}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <select
                      value={scheduleForm.start_time}
                      onChange={(e) => setScheduleForm({...scheduleForm, start_time: e.target.value})}
                      className="input-field"
                    >
                      {timeOptions.map((time) => (
                        <option key={time.value} value={time.value}>{time.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <select
                      value={scheduleForm.end_time}
                      onChange={(e) => setScheduleForm({...scheduleForm, end_time: e.target.value})}
                      className="input-field"
                    >
                      {timeOptions.map((time) => (
                        <option key={time.value} value={time.value}>{time.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buffer Before (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={scheduleForm.buffer_before_minutes}
                      onChange={(e) => setScheduleForm({...scheduleForm, buffer_before_minutes: Number(e.target.value)})}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buffer After (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={scheduleForm.buffer_after_minutes}
                      onChange={(e) => setScheduleForm({...scheduleForm, buffer_after_minutes: Number(e.target.value)})}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingSchedule ? 'Update' : 'Create'} Schedule</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Off Modal */}
        {showTimeOffModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Add Time Off</h2>
                <button
                  onClick={() => setShowTimeOffModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={timeOffForm.start_date}
                      onChange={(e) => setTimeOffForm({...timeOffForm, start_date: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={timeOffForm.end_date}
                      onChange={(e) => setTimeOffForm({...timeOffForm, end_date: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fullDay"
                    checked={timeOffForm.is_full_day}
                    onChange={(e) => setTimeOffForm({...timeOffForm, is_full_day: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="fullDay" className="text-sm font-medium text-gray-700">
                    Full day(s)
                  </label>
                </div>

                {!timeOffForm.is_full_day && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <select
                        value={timeOffForm.start_time}
                        onChange={(e) => setTimeOffForm({...timeOffForm, start_time: e.target.value})}
                        className="input-field"
                      >
                        <option value="">Select time</option>
                        {timeOptions.map((time) => (
                          <option key={time.value} value={time.value}>{time.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <select
                        value={timeOffForm.end_time}
                        onChange={(e) => setTimeOffForm({...timeOffForm, end_time: e.target.value})}
                        className="input-field"
                      >
                        <option value="">Select time</option>
                        {timeOptions.map((time) => (
                          <option key={time.value} value={time.value}>{time.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (optional)
                  </label>
                  <input
                    type="text"
                    value={timeOffForm.reason}
                    onChange={(e) => setTimeOffForm({...timeOffForm, reason: e.target.value})}
                    placeholder="e.g., Vacation, Conference, Personal"
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowTimeOffModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTimeOff}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Add Time Off</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
