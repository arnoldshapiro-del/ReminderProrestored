import { useState } from 'react';
import {
  Upload,
  FileText,
  Target,
  CheckCircle,
  Database
} from 'lucide-react';

interface ProjectMigrationWizardProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function ProjectMigrationWizard({ onComplete, onClose }: ProjectMigrationWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState('');

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setStep(2);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Import Your Existing Projects</h2>
        
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-gray-600">Choose how you'd like to add your existing AI development projects:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleMethodSelect('templates')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
              >
                <Target className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Quick Templates</h3>
                <p className="text-sm text-gray-600">Pre-built templates for common project types</p>
                <p className="text-xs text-purple-600 mt-2">⚡ 2 minutes</p>
              </button>

              <button
                onClick={() => handleMethodSelect('csv')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
              >
                <Upload className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">CSV Import</h3>
                <p className="text-sm text-gray-600">Bulk import from Excel or Google Sheets</p>
                <p className="text-xs text-purple-600 mt-2">📊 5 minutes</p>
              </button>

              <button
                onClick={() => handleMethodSelect('manual')}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
              >
                <Database className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Manual Entry</h3>
                <p className="text-sm text-gray-600">Add projects one by one with full control</p>
                <p className="text-xs text-purple-600 mt-2">✍️ 10 minutes</p>
              </button>
            </div>
          </div>
        )}

        {step === 2 && selectedMethod === 'templates' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Project Templates</h3>
            <div className="space-y-3">
              {[
                'Medical Reminder App (Mocha)',
                'E-commerce Landing Page (Lovable)',
                'AI Dashboard (Bolt)',
                'Mobile App MVP (Cursor)'
              ].map((template, index) => (
                <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-900">{template}</span>
                </label>
              ))}
            </div>
            <div className="flex space-x-3 pt-4">
              <button onClick={handleComplete} className="flex-1 btn-primary">
                Import Selected Templates
              </button>
              <button onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
            </div>
          </div>
        )}

        {step === 2 && selectedMethod === 'csv' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">CSV Import</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drop your CSV file here or click to browse</p>
              <input type="file" accept=".csv" className="hidden" />
              <button className="btn-secondary">Choose File</button>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleComplete} className="flex-1 btn-primary">
                Import Projects
              </button>
              <button onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
            </div>
          </div>
        )}

        {step === 2 && selectedMethod === 'manual' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Manual Project Entry</h3>
            <p className="text-gray-600">Close this wizard to use the "Add Project" button and enter your projects manually.</p>
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 text-sm">This gives you the most control over your project data</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={onClose} className="flex-1 btn-primary">
                Start Adding Projects
              </button>
              <button onClick={() => setStep(1)} className="btn-secondary">
                Back
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
