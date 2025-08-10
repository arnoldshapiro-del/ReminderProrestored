import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import DataStorageInfo from "@/react-app/components/DataStorageInfo";
import ExpertWorkflow from "@/react-app/components/ExpertWorkflow";
import { 
  Settings, 
  Phone, 
  Key, 
  Save, 
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface TwilioSettings {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export default function SettingsPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [twilioSettings, setTwilioSettings] = useState<TwilioSettings>({
    accountSid: '',
    authToken: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchTwilioSettings();
    }
  }, [user]);

  const fetchTwilioSettings = async () => {
    try {
      const response = await fetch('/api/settings/twilio');
      if (response.ok) {
        const data = await response.json();
        setTwilioSettings({
          accountSid: data.accountSid || '',
          authToken: data.authToken || '',
          phoneNumber: data.phoneNumber || ''
        });
      }
    } catch (error) {
      console.error('Error fetching Twilio settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/settings/twilio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(twilioSettings),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving Twilio settings:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings/twilio/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(twilioSettings),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing Twilio connection:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your MindCare system settings</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Settings saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Twilio Configuration */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Twilio SMS Configuration</h2>
              <p className="text-gray-600 text-sm">Configure Twilio settings for appointment reminders</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account SID *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={twilioSettings.accountSid}
                  onChange={(e) => setTwilioSettings({...twilioSettings, accountSid: e.target.value})}
                  placeholder="Enter your Twilio Account SID"
                  className="input-field pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Found in your Twilio Console dashboard
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auth Token *
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showAuthToken ? "text" : "password"}
                  value={twilioSettings.authToken}
                  onChange={(e) => setTwilioSettings({...twilioSettings, authToken: e.target.value})}
                  placeholder="Enter your Twilio Auth Token"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthToken(!showAuthToken)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showAuthToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Found in your Twilio Console dashboard (keep this secure)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={twilioSettings.phoneNumber}
                  onChange={(e) => setTwilioSettings({...twilioSettings, phoneNumber: e.target.value})}
                  placeholder="e.g., +1234567890"
                  className="input-field pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your Twilio phone number in E.164 format (with country code)
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-600">
              Need help? Visit the{' '}
              <a 
                href="https://console.twilio.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Twilio Console
              </a>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleTestConnection}
                disabled={loading || !twilioSettings.accountSid || !twilioSettings.authToken}
                className="btn-secondary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                ) : (
                  <Settings className="w-4 h-4" />
                )}
                <span>Test Connection</span>
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={loading || !twilioSettings.accountSid || !twilioSettings.authToken || !twilioSettings.phoneNumber}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Settings Sections */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
              <p className="text-gray-600 text-sm">Configure general application preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Default Appointment Duration</h3>
                <p className="text-sm text-gray-600">Set the default duration for new appointments</p>
              </div>
              <select className="input-field w-auto">
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Reminder Schedule</h3>
                <p className="text-sm text-gray-600">Automatically send reminders before appointments</p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                  <span className="text-sm">2 days before</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                  <span className="text-sm">1 day before</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Data Storage Information */}
        <DataStorageInfo />

        {/* Expert Workflow Guide */}
        <ExpertWorkflow />
      </div>
    </Layout>
  );
}
