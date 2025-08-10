import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  MessageSquare, 
  Plus, 
  Brain,
  Target,
  Zap,
  Clock,
  Users,
  Send,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Download,
  PlayCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  Phone,
  Mail,
  Smartphone,
  Globe,
  Star,
  ThumbsUp,
  ThumbsDown,
  Activity
} from "lucide-react";
import type { PatientType, AppointmentWithPatientType } from "@/shared/types";
import type { 
  ReminderChannelType, 
  ReminderTemplateType,
  ReminderScheduleType,
  CommunicationLogType,
  PatientEngagementType,
  BulkReminderOperation
} from "@/shared/reminder-types";
import ReminderTemplateEditor from "@/react-app/components/ReminderTemplateEditor";
import SmartScheduleEditor from "@/react-app/components/SmartScheduleEditor";
import PatientPreferencesManagerNew from "@/react-app/components/PatientPreferencesManagerNew";
import CommunicationAnalytics from "@/react-app/components/CommunicationAnalytics";
import ReminderTimingSettings from "@/react-app/components/ReminderTimingSettings";

interface ReminderStats {
  totalSent: number;
  deliveryRate: number;
  responseRate: number;
  noShowReduction: number;
  avgCostPerReminder: number;
  totalCostSavings: number;
}

interface SmartRecommendation {
  type: 'timing' | 'channel' | 'template' | 'escalation';
  patient_id?: number;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  action: string;
}

export default function SmartReminders() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'templates' | 'schedules' | 'analytics' | 'patients'>('overview');
  
  // Data states
  const [reminderStats, setReminderStats] = useState<ReminderStats>({
    totalSent: 0,
    deliveryRate: 0,
    responseRate: 0,
    noShowReduction: 0,
    avgCostPerReminder: 0,
    totalCostSavings: 0
  });
  const [channels, setChannels] = useState<ReminderChannelType[]>([]);
  const [templates, setTemplates] = useState<ReminderTemplateType[]>([]);
  const [schedules, setSchedules] = useState<ReminderScheduleType[]>([]);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogType[]>([]);
  const [patientEngagement, setPatientEngagement] = useState<PatientEngagementType[]>([]);
  const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [, setUpcomingAppointments] = useState<AppointmentWithPatientType[]>([]);

  // Modal states
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPreferencesManager, setShowPreferencesManager] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSimpleTimingManager, setShowSimpleTimingManager] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [channelForm, setChannelForm] = useState<Partial<ReminderChannelType>>({
    channel_name: '',
    channel_type: 'sms',
    is_enabled: true,
    priority_order: 1,
    configuration: '{}'
  });

  const [templateForm, setTemplateForm] = useState<Partial<ReminderTemplateType>>({
    template_name: '',
    template_type: 'appointment',
    channel_type: 'sms',
    language_code: 'en',
    message_template: '',
    is_active: true
  });

  const [,] = useState<Partial<ReminderScheduleType>>({
    schedule_name: '',
    appointment_type: '',
    reminders_config: '[]',
    escalation_rules: '[]',
    is_active: true
  });

  const [bulkOperation, setBulkOperation] = useState<Partial<BulkReminderOperation>>({
    operation_type: 'send',
    target_criteria: {},
    estimated_count: 0,
    estimated_cost: 0
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchReminderStats(),
        fetchChannels(),
        fetchTemplates(),
        fetchSchedules(),
        fetchCommunicationLogs(),
        fetchPatientEngagement(),
        fetchSmartRecommendations(),
        fetchPatients(),
        fetchUpcomingAppointments()
      ]);
    } catch (error) {
      console.error('Error fetching reminder data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReminderStats = async () => {
    try {
      const response = await fetch('/api/reminders/stats');
      if (response.ok) {
        const data = await response.json();
        setReminderStats(data);
      }
    } catch (error) {
      console.error('Error fetching reminder stats:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/reminders/channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/reminders/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/reminders/schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchCommunicationLogs = async () => {
    try {
      const response = await fetch('/api/reminders/logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        setCommunicationLogs(data);
      }
    } catch (error) {
      console.error('Error fetching communication logs:', error);
    }
  };

  const fetchPatientEngagement = async () => {
    try {
      const response = await fetch('/api/reminders/engagement');
      if (response.ok) {
        const data = await response.json();
        setPatientEngagement(data);
      }
    } catch (error) {
      console.error('Error fetching patient engagement:', error);
    }
  };

  const fetchSmartRecommendations = async () => {
    try {
      const response = await fetch('/api/reminders/recommendations');
      if (response.ok) {
        const data = await response.json();
        setSmartRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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

  const fetchUpcomingAppointments = async () => {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const response = await fetch(`/api/appointments?start_date=${today.toISOString()}&end_date=${futureDate.toISOString()}`);
      if (response.ok) {
        const data = await response.json();
        setUpcomingAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    }
  };

  const handleCreateChannel = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/reminders/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...channelForm, user_id: user.id }),
      });

      if (response.ok) {
        await fetchChannels();
        setShowChannelModal(false);
        resetChannelForm();
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/reminders/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...templateForm, user_id: user.id }),
      });

      if (response.ok) {
        await fetchTemplates();
        setShowTemplateModal(false);
        resetTemplateForm();
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  

  const handleBulkOperation = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/reminders/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkOperation),
      });

      if (response.ok) {
        setShowBulkModal(false);
        // Refresh data after bulk operation
        fetchAllData();
      }
    } catch (error) {
      console.error('Error executing bulk operation:', error);
    }
  };

  const resetChannelForm = () => {
    setChannelForm({
      channel_name: '',
      channel_type: 'sms',
      is_enabled: true,
      priority_order: 1,
      configuration: '{}'
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      template_name: '',
      template_type: 'appointment',
      channel_type: 'sms',
      language_code: 'en',
      message_template: '',
      is_active: true
    });
  };

  

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'sms': return <MessageSquare className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'voice': return <Phone className="w-5 h-5" />;
      case 'push': return <Smartphone className="w-5 h-5" />;
      case 'webhook': return <Globe className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': case 'delivered': case 'read': return 'text-green-600 bg-green-100';
      case 'pending': case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'failed': case 'bounced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span>Smart Reminder System</span>
            </h1>
            <p className="text-gray-600 mt-1">AI-powered multi-channel appointment reminders with intelligent scheduling</p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowSimpleTimingManager(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Timing Settings</span>
            </button>
            <button
              onClick={() => setShowPreferencesManager(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Patient Preferences</span>
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Bulk Actions</span>
            </button>
            <button
              onClick={() => setShowChannelModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Channel</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Sent</p>
                <p className="text-2xl font-bold">{reminderStats.totalSent.toLocaleString()}</p>
              </div>
              <Send className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Delivery Rate</p>
                <p className="text-2xl font-bold">{reminderStats.deliveryRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Response Rate</p>
                <p className="text-2xl font-bold">{reminderStats.responseRate}%</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">No-Show Reduction</p>
                <p className="text-2xl font-bold">{reminderStats.noShowReduction}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Avg Cost</p>
                <p className="text-2xl font-bold">${reminderStats.avgCostPerReminder.toFixed(2)}</p>
              </div>
              <Activity className="w-8 h-8 text-indigo-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Cost Savings</p>
                <p className="text-2xl font-bold">${reminderStats.totalCostSavings.toLocaleString()}</p>
              </div>
              <Star className="w-8 h-8 text-pink-200" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'channels', label: 'Channels', icon: MessageSquare },
              { key: 'templates', label: 'Templates', icon: Edit },
              { key: 'schedules', label: 'Smart Schedules', icon: Brain },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp },
              { key: 'patients', label: 'Patient Insights', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Smart Recommendations */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                    <p className="text-sm text-gray-600">Smart suggestions to improve your reminder effectiveness</p>
                  </div>
                </div>
                <button className="btn-secondary flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="space-y-3">
                {smartRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.impact === 'high' ? 'border-red-500 bg-red-50' :
                      rec.impact === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-green-500 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.impact === 'high' ? 'bg-red-100 text-red-700' :
                            rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {rec.impact.toUpperCase()} IMPACT
                          </span>
                          <span className="text-xs text-gray-500">
                            {rec.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (rec.type === 'timing') {
                            setShowSimpleTimingManager(true);
                          } else if (rec.type === 'channel') {
                            setActiveTab('channels');
                          } else if (rec.type === 'template') {
                            setActiveTab('templates');
                          } else if (rec.type === 'escalation') {
                            setActiveTab('schedules');
                          }
                        }}
                        className="btn-primary text-sm"
                      >
                        {rec.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Communication Logs */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Communications</h3>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View All</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Channel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {communicationLogs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Patient #{log.patient_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.recipient_info}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getChannelIcon(log.channel_type)}
                            <span className="text-sm text-gray-900 capitalize">
                              {log.channel_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {log.message_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.response_received ? (
                            <div className="flex items-center space-x-2">
                              {log.response_sentiment === 'positive' ? (
                                <ThumbsUp className="w-4 h-4 text-green-500" />
                              ) : log.response_sentiment === 'negative' ? (
                                <ThumbsDown className="w-4 h-4 text-red-500" />
                              ) : (
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm text-gray-900 truncate max-w-32">
                                {log.response_received}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No response</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Communication Channels</h3>
              <button
                onClick={() => setShowChannelModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Channel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <div key={channel.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        {getChannelIcon(channel.channel_type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{channel.channel_name}</h4>
                        <p className="text-sm text-gray-500 capitalize">{channel.channel_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        channel.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {channel.is_enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priority Order</span>
                      <span className="text-sm font-medium">{channel.priority_order}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium">{channel.success_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        style={{ width: `${channel.success_rate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                    <button className="text-blue-600 hover:text-blue-700 p-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {showChannelModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? 'Edit Channel' : 'Add Communication Channel'}
                </h2>
                <button
                  onClick={() => setShowChannelModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={channelForm.channel_name}
                    onChange={(e) => setChannelForm({...channelForm, channel_name: e.target.value})}
                    className="input-field"
                    placeholder="e.g., Primary SMS, Backup Email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel Type *
                  </label>
                  <select
                    value={channelForm.channel_type}
                    onChange={(e) => setChannelForm({...channelForm, channel_type: e.target.value as any})}
                    className="input-field"
                  >
                    <option value="sms">SMS Text Message</option>
                    <option value="email">Email</option>
                    <option value="voice">Voice Call</option>
                    <option value="push">Push Notification</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={channelForm.priority_order}
                      onChange={(e) => setChannelForm({...channelForm, priority_order: Number(e.target.value)})}
                      className="input-field"
                    />
                  </div>
                  
                  <div className="flex items-center pt-8">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={channelForm.is_enabled}
                        onChange={(e) => setChannelForm({...channelForm, is_enabled: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Enable Channel
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Configuration (JSON)
                  </label>
                  <textarea
                    value={channelForm.configuration}
                    onChange={(e) => setChannelForm({...channelForm, configuration: e.target.value})}
                    rows={4}
                    className="input-field resize-none font-mono text-sm"
                    placeholder='{"api_key": "your_key", "sender_id": "your_sender"}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Channel-specific configuration in JSON format
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowChannelModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateChannel}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingItem ? 'Update' : 'Create'} Channel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Message Templates</h3>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                        {getChannelIcon(template.channel_type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{template.template_name}</h4>
                        <p className="text-sm text-gray-500 capitalize">
                          {template.template_type} • {template.channel_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {template.message_template}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {template.language_code?.toUpperCase() || 'EN'}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingItem(template);
                          setTemplateForm(template);
                          setShowTemplateModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Smart Reminder Schedules</h3>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Schedule</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{schedule.schedule_name}</h4>
                        <p className="text-sm text-gray-500">
                          {schedule.appointment_type || 'All appointment types'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        schedule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {schedule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Reminder Timeline</h5>
                      {(() => {
                        try {
                          const config = JSON.parse(schedule.reminders_config);
                          return (
                            <div className="space-y-1">
                              {config.map((reminder: any, index: number) => (
                                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  <span>{reminder.timing} minutes before via {reminder.channels?.join(', ') || 'SMS'}</span>
                                </div>
                              ))}
                            </div>
                          );
                        } catch {
                          return <span className="text-sm text-gray-500">Invalid configuration</span>;
                        }
                      })()}
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Escalation Rules</h5>
                      {(() => {
                        try {
                          const rules = JSON.parse(schedule.escalation_rules || '[]');
                          return rules.length > 0 ? (
                            <div className="space-y-1">
                              {rules.map((rule: any, index: number) => (
                                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>If {rule.trigger}, escalate to {rule.next_channel} after {rule.delay_minutes}min</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No escalation rules</span>
                          );
                        } catch {
                          return <span className="text-sm text-gray-500">Invalid rules</span>;
                        }
                      })()}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                    <button className="text-blue-600 hover:text-blue-700 p-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Communication Analytics</h3>
            
            {/* Analytics Charts would go here */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-4">Channel Performance</h4>
                <div className="space-y-3">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          {getChannelIcon(channel.channel_type)}
                        </div>
                        <span className="font-medium capitalize">{channel.channel_type}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{channel.success_rate}%</div>
                          <div className="text-xs text-gray-500">Success Rate</div>
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                            style={{ width: `${channel.success_rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4 className="font-medium text-gray-900 mb-4">Response Sentiment</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="w-4 h-4 text-green-500" />
                      <span>Positive</span>
                    </div>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span>Neutral</span>
                    </div>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                      <span>Negative</span>
                    </div>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Logs Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-medium text-gray-900">Recent Communications</h4>
                <div className="flex items-center space-x-2">
                  <button className="btn-secondary flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="btn-secondary flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Channel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {communicationLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Patient #{log.patient_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.recipient_info}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getChannelIcon(log.channel_type)}
                            <span className="text-sm text-gray-900 capitalize">
                              {log.channel_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {log.message_content}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.response_received ? (
                            <div className="flex items-center space-x-2">
                              {log.response_sentiment === 'positive' ? (
                                <ThumbsUp className="w-4 h-4 text-green-500" />
                              ) : log.response_sentiment === 'negative' ? (
                                <ThumbsDown className="w-4 h-4 text-red-500" />
                              ) : (
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm text-gray-900 truncate max-w-24">
                                {log.response_received}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No response</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${((log.cost_cents || 0) / 100).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Patient Engagement Insights</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {patientEngagement.map((engagement) => {
                const patient = patients.find(p => p.id === engagement.patient_id);
                return (
                  <div key={engagement.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {patient?.first_name?.[0] || 'P'}{patient?.last_name?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {patient?.first_name} {patient?.last_name}
                          </h4>
                          <p className="text-sm text-gray-500">Patient #{engagement.patient_id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Engagement Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                engagement.engagement_score >= 70 ? 'bg-green-500' :
                                engagement.engagement_score >= 40 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${engagement.engagement_score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{Math.round(engagement.engagement_score)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Response Rate</span>
                        <span className="text-sm font-medium">{Math.round(engagement.response_rate)}%</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">No-Show Risk</span>
                        <span className={`text-sm font-medium ${
                          engagement.no_show_risk_score >= 70 ? 'text-red-600' :
                          engagement.no_show_risk_score >= 40 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {engagement.no_show_risk_score >= 70 ? 'High' :
                           engagement.no_show_risk_score >= 40 ? 'Medium' : 'Low'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Reminders</span>
                        <span className="text-sm font-medium">{engagement.total_reminders_sent}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Appointments</span>
                        <span className="text-sm font-medium">{engagement.total_appointments}</span>
                      </div>

                      {engagement.last_interaction_at && (
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Last interaction: {new Date(engagement.last_interaction_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Template Editor Modal */}
        <ReminderTemplateEditor
          template={editingItem}
          onSave={handleCreateTemplate}
          onCancel={() => {
            setShowTemplateModal(false);
            setEditingItem(null);
            resetTemplateForm();
          }}
          isOpen={showTemplateModal}
        />

        {/* Smart Schedule Editor Modal */}
        <SmartScheduleEditor
          schedule={editingItem}
          onSave={(scheduleData) => {
            // Handle schedule save
            console.log('Saving schedule:', scheduleData);
            setShowScheduleModal(false);
            setEditingItem(null);
          }}
          onCancel={() => {
            setShowScheduleModal(false);
            setEditingItem(null);
          }}
          isOpen={showScheduleModal}
        />

        {/* Patient Preferences Manager */}
        <PatientPreferencesManagerNew
          isOpen={showPreferencesManager}
          onClose={() => setShowPreferencesManager(false)}
        />

        {/* Communication Analytics */}
        <CommunicationAnalytics
          isOpen={showAnalytics}
          onClose={() => setShowAnalytics(false)}
        />

        {/* Simple Timing Manager Modal */}
        {showSimpleTimingManager && (
          <ReminderTimingSettings
            isOpen={showSimpleTimingManager}
            onClose={() => setShowSimpleTimingManager(false)}
            onSave={() => {
              setShowSimpleTimingManager(false);
              // Refresh any necessary data
            }}
          />
        )}

        {/* Bulk Operations Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Bulk Reminder Operations</h2>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operation Type
                  </label>
                  <select
                    value={bulkOperation.operation_type}
                    onChange={(e) => setBulkOperation({...bulkOperation, operation_type: e.target.value as any})}
                    className="input-field"
                  >
                    <option value="send">Send Reminders Now</option>
                    <option value="schedule">Schedule Future Reminders</option>
                    <option value="cancel">Cancel Scheduled Reminders</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Target Criteria</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            className="input-field"
                            placeholder="Start date"
                          />
                          <input
                            type="date"
                            className="input-field"
                            placeholder="End date"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Appointment Types
                        </label>
                        <div className="space-y-2">
                          {['Consultation', 'Follow-up', 'Initial Assessment', 'Therapy Session'].map((type) => (
                            <label key={type} className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded border-gray-300" />
                              <span className="text-sm">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Estimated Impact</h3>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Affected Appointments:</span>
                        <span className="text-sm font-medium">{bulkOperation.estimated_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Estimated Cost:</span>
                        <span className="text-sm font-medium">${(bulkOperation.estimated_cost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Expected Responses:</span>
                        <span className="text-sm font-medium">~{Math.round((bulkOperation.estimated_count || 0) * 0.68)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkOperation}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Execute Operation</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
