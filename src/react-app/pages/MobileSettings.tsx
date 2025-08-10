import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  Smartphone, 
  QrCode, 
  Link, 
  
  Copy,
  CheckCircle,
  Save,
  ExternalLink,
  Settings as SettingsIcon,
  Globe,
  Lock
} from "lucide-react";
import QRCode from 'react-qr-code';

interface PortalSettings {
  id?: number;
  user_id: string;
  portal_enabled: boolean;
  portal_slug: string;
  welcome_message: string;
  booking_instructions: string;
  require_patient_info: boolean;
  allow_cancellations: boolean;
  cancellation_hours_limit: number;
}

export default function MobileSettings() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [portalSettings, setPortalSettings] = useState<PortalSettings>({
    user_id: '',
    portal_enabled: false,
    portal_slug: '',
    welcome_message: 'Welcome to our practice! Schedule your appointment online for convenient and flexible booking.',
    booking_instructions: 'Please arrive 10 minutes before your scheduled appointment time. If you need to cancel or reschedule, please do so at least 24 hours in advance.',
    require_patient_info: true,
    allow_cancellations: true,
    cancellation_hours_limit: 24
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchPortalSettings();
    }
  }, [user]);

  const fetchPortalSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/portal/settings');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setPortalSettings(data);
        } else if (user) {
          // Initialize with default values if no settings exist
          setPortalSettings(prev => ({
            ...prev,
            user_id: user.id,
            portal_slug: generateSlug()
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching portal settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/portal/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...portalSettings,
          user_id: user.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPortalSettings(result);
      }
    } catch (error) {
      console.error('Error saving portal settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const regenerateSlug = () => {
    setPortalSettings({
      ...portalSettings,
      portal_slug: generateSlug()
    });
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

  const portalUrl = `${window.location.origin}/portal/${portalSettings.portal_slug}`;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Portal & Mobile</h1>
          <p className="text-gray-600 mt-1">Configure your online booking portal and mobile experience</p>
        </div>

        {/* Portal Enable/Disable */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Patient Booking Portal</h3>
                <p className="text-sm text-gray-600">Allow patients to book appointments online</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={portalSettings.portal_enabled}
                onChange={(e) => setPortalSettings({...portalSettings, portal_enabled: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {portalSettings.portal_enabled && (
          <>
            {/* Portal URL and QR Code */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Link className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Booking Portal URL</h3>
                  <p className="text-sm text-gray-600">Share this link with your patients</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portal URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={portalUrl}
                        readOnly
                        className="input-field flex-1 bg-gray-50"
                      />
                      <button
                        onClick={() => copyToClipboard(portalUrl)}
                        className="btn-secondary flex items-center space-x-1"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Slug
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={portalSettings.portal_slug}
                        onChange={(e) => setPortalSettings({...portalSettings, portal_slug: e.target.value})}
                        className="input-field flex-1"
                        placeholder="my-practice"
                      />
                      <button
                        onClick={regenerateSlug}
                        className="btn-secondary"
                      >
                        Regenerate
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Only letters, numbers, and hyphens allowed
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Preview Portal</span>
                    </a>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <QRCode
                      size={200}
                      value={portalUrl}
                      viewBox="0 0 256 256"
                    />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900">QR Code</h4>
                    <p className="text-sm text-gray-600">Print and display in your office</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Portal Configuration */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Portal Configuration</h3>
                  <p className="text-sm text-gray-600">Customize your booking portal experience</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Message
                  </label>
                  <textarea
                    value={portalSettings.welcome_message}
                    onChange={(e) => setPortalSettings({...portalSettings, welcome_message: e.target.value})}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Welcome message for patients..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Instructions
                  </label>
                  <textarea
                    value={portalSettings.booking_instructions}
                    onChange={(e) => setPortalSettings({...portalSettings, booking_instructions: e.target.value})}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Instructions for patients when booking..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Require Patient Information</h4>
                        <p className="text-sm text-gray-600">Collect date of birth and additional details</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={portalSettings.require_patient_info}
                          onChange={(e) => setPortalSettings({...portalSettings, require_patient_info: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Allow Cancellations</h4>
                        <p className="text-sm text-gray-600">Let patients know they can cancel</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={portalSettings.allow_cancellations}
                          onChange={(e) => setPortalSettings({...portalSettings, allow_cancellations: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {portalSettings.allow_cancellations && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cancellation Notice (hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={portalSettings.cancellation_hours_limit}
                        onChange={(e) => setPortalSettings({...portalSettings, cancellation_hours_limit: Number(e.target.value)})}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum hours notice required for cancellations
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Features */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile Experience</h3>
                  <p className="text-sm text-gray-600">Your portal is optimized for mobile devices</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                  <Smartphone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Mobile Responsive</h4>
                  <p className="text-sm text-gray-600">Works perfectly on phones and tablets</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                  <QrCode className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">QR Code Sharing</h4>
                  <p className="text-sm text-gray-600">Easy access via QR code scanning</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                  <Lock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Secure Booking</h4>
                  <p className="text-sm text-gray-600">HIPAA-compliant data handling</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                {saving ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
