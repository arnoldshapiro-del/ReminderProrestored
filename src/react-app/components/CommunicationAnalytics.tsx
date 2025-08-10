import { useState, useEffect } from "react";
import { 
  BarChart3, 
  MessageSquare, 
  Target,
  ThumbsUp,
  CheckCircle,
  Download,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  channelPerformance: Array<{
    channel: string;
    sent: number;
    delivered: number;
    responded: number;
    cost: number;
  }>;
  responsePatterns: Array<{
    hour: number;
    responses: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  weeklyTrends: Array<{
    week: string;
    sent: number;
    delivered: number;
    responded: number;
  }>;
  sentimentBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  topPatients: Array<{
    id: number;
    name: string;
    totalReminders: number;
    responseRate: number;
    engagementScore: number;
  }>;
}

interface CommunicationAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommunicationAnalytics({ isOpen, onClose }: CommunicationAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    channelPerformance: [],
    responsePatterns: [],
    weeklyTrends: [],
    sentimentBreakdown: [],
    topPatients: []
  });
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState<'delivery' | 'response' | 'cost'>('delivery');

  useEffect(() => {
    if (isOpen) {
      fetchAnalyticsData();
    }
  }, [isOpen, dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data from multiple endpoints
      const [channelResponse, patternsResponse, trendsResponse, sentimentResponse, patientsResponse] = await Promise.all([
        fetch(`/api/reminders/analytics/channels?days=${dateRange}`),
        fetch(`/api/reminders/analytics/patterns?days=${dateRange}`),
        fetch(`/api/reminders/analytics/trends?days=${dateRange}`),
        fetch(`/api/reminders/analytics/sentiment?days=${dateRange}`),
        fetch(`/api/reminders/analytics/top-patients?days=${dateRange}`)
      ]);

      const [channelData, patternsData, trendsData, sentimentData, patientsData] = await Promise.all([
        channelResponse.ok ? channelResponse.json() : [],
        patternsResponse.ok ? patternsResponse.json() : [],
        trendsResponse.ok ? trendsResponse.json() : [],
        sentimentResponse.ok ? sentimentResponse.json() : [],
        patientsResponse.ok ? patientsResponse.json() : []
      ]);

      setData({
        channelPerformance: channelData,
        responsePatterns: patternsData,
        weeklyTrends: trendsData,
        sentimentBreakdown: sentimentData,
        topPatients: patientsData
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      // Mock data for demonstration
      setData({
        channelPerformance: [
          { channel: 'SMS', sent: 1234, delivered: 1198, responded: 856, cost: 925.50 },
          { channel: 'Email', sent: 567, delivered: 534, responded: 234, cost: 56.70 },
          { channel: 'Voice', sent: 89, delivered: 85, responded: 67, cost: 178.00 },
          { channel: 'Push', sent: 234, delivered: 198, responded: 89, cost: 23.40 }
        ],
        responsePatterns: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          responses: Math.floor(Math.random() * 50) + 10,
          sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any
        })),
        weeklyTrends: [
          { week: 'Week 1', sent: 456, delivered: 432, responded: 298 },
          { week: 'Week 2', sent: 523, delivered: 498, responded: 356 },
          { week: 'Week 3', sent: 612, delivered: 587, responded: 423 },
          { week: 'Week 4', sent: 734, delivered: 698, responded: 498 }
        ],
        sentimentBreakdown: [
          { name: 'Positive', value: 65, color: '#10B981' },
          { name: 'Neutral', value: 25, color: '#6B7280' },
          { name: 'Negative', value: 10, color: '#EF4444' }
        ],
        topPatients: [
          { id: 1, name: 'John Smith', totalReminders: 12, responseRate: 92, engagementScore: 95 },
          { id: 2, name: 'Sarah Johnson', totalReminders: 8, responseRate: 88, engagementScore: 87 },
          { id: 3, name: 'Mike Davis', totalReminders: 15, responseRate: 73, engagementScore: 82 },
          { id: 4, name: 'Lisa Brown', totalReminders: 10, responseRate: 90, engagementScore: 89 },
          { id: 5, name: 'David Wilson', totalReminders: 6, responseRate: 83, engagementScore: 85 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const exportData = {
      dateRange: `${dateRange} days`,
      generatedAt: new Date().toISOString(),
      data
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communication-analytics-${dateRange}days-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Communication Analytics</h2>
              <p className="text-sm text-gray-600">Deep insights into your reminder system performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={handleExportData}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={fetchAnalyticsData}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Sent</p>
                      <p className="text-2xl font-bold">
                        {data.channelPerformance.reduce((sum, channel) => sum + channel.sent, 0).toLocaleString()}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Delivery Rate</p>
                      <p className="text-2xl font-bold">
                        {Math.round(
                          (data.channelPerformance.reduce((sum, channel) => sum + channel.delivered, 0) /
                           data.channelPerformance.reduce((sum, channel) => sum + channel.sent, 0)) * 100
                        )}%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Response Rate</p>
                      <p className="text-2xl font-bold">
                        {Math.round(
                          (data.channelPerformance.reduce((sum, channel) => sum + channel.responded, 0) /
                           data.channelPerformance.reduce((sum, channel) => sum + channel.delivered, 0)) * 100
                        )}%
                      </p>
                    </div>
                    <ThumbsUp className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Total Cost</p>
                      <p className="text-2xl font-bold">
                        ${data.channelPerformance.reduce((sum, channel) => sum + channel.cost, 0).toFixed(0)}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Channel Performance */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Channel Performance</h3>
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                    >
                      <option value="delivery">Delivery Rate</option>
                      <option value="response">Response Rate</option>
                      <option value="cost">Cost Efficiency</option>
                    </select>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.channelPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey={selectedMetric === 'delivery' ? 'delivered' : selectedMetric === 'response' ? 'responded' : 'cost'} 
                        fill="#3B82F6" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Sentiment Analysis */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Response Sentiment</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.sentimentBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.sentimentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly Trends */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.weeklyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sent" stroke="#3B82F6" name="Sent" />
                      <Line type="monotone" dataKey="delivered" stroke="#10B981" name="Delivered" />
                      <Line type="monotone" dataKey="responded" stroke="#8B5CF6" name="Responded" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Response Patterns by Hour */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Response Patterns by Hour</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.responsePatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="responses" fill="#06B6D4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Performing Patients */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Most Engaged Patients</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Reminders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Response Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Engagement Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.topPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {patient.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.totalReminders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{patient.responseRate}%</div>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${patient.responseRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{patient.engagementScore}</div>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${patient.engagementScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              patient.engagementScore >= 80 ? 'bg-green-100 text-green-800' :
                              patient.engagementScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {patient.engagementScore >= 80 ? 'High' :
                               patient.engagementScore >= 60 ? 'Medium' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
