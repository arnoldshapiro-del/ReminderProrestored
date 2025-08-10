import { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Download } from "lucide-react";
import Papa from "papaparse";

interface CSVImportProps {
  onImportComplete: () => void;
  onClose: () => void;
}

interface CSVRow {
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  date_of_birth?: string;
  notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export default function CSVImport({ onImportComplete, onClose }: CSVImportProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = [
      ['first_name', 'last_name', 'phone_number', 'email', 'date_of_birth', 'notes', 'emergency_contact_name', 'emergency_contact_phone'],
      ['John', 'Smith', '+1234567890', 'john@example.com', '1985-03-15', 'Regular patient', 'Jane Smith', '+1234567891'],
      ['Mary', 'Johnson', '+1987654321', 'mary@example.com', '1990-07-22', '', '', '']
    ];
    
    const csvContent = template.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patient_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const data = results.data as CSVRow[];
        const validationErrors: string[] = [];

        // Validate required fields
        data.forEach((row, index) => {
          if (!row.first_name) {
            validationErrors.push(`Row ${index + 1}: First name is required`);
          }
          if (!row.last_name) {
            validationErrors.push(`Row ${index + 1}: Last name is required`);
          }
          if (!row.phone_number) {
            validationErrors.push(`Row ${index + 1}: Phone number is required`);
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        } else {
          setCsvData(data);
          setStep('preview');
        }
      },
      error: (error: any) => {
        setErrors([`CSV parsing error: ${error.message}`]);
      }
    });
  };

  const handleImport = async () => {
    setStep('importing');
    let successCount = 0;
    let failedCount = 0;

    for (const row of csvData) {
      try {
        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: row.first_name,
            last_name: row.last_name,
            phone_number: row.phone_number,
            email: row.email || '',
            date_of_birth: row.date_of_birth || '',
            notes: row.notes || '',
            emergency_contact_name: row.emergency_contact_name || '',
            emergency_contact_phone: row.emergency_contact_phone || '',
            is_active: true
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
      }
    }

    setImportResults({ success: successCount, failed: failedCount });
    setStep('complete');
  };

  const handleComplete = () => {
    onImportComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Import Patients from CSV</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Step 1: Download Template</h3>
                <p className="text-gray-600 mb-4">
                  Download our CSV template to ensure your data is formatted correctly.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template</span>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Step 2: Upload Your CSV</h3>
                <p className="text-gray-600 mb-4">
                  Upload your CSV file with patient data. Required fields: first_name, last_name, phone_number.
                </p>
                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Click to upload your CSV file
                  </p>
                  <p className="text-gray-600">
                    Supported format: CSV files only
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium text-red-800">Validation Errors</h4>
                  </div>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Import Data</h3>
                <p className="text-gray-600 mb-4">
                  Review the data below before importing {csvData.length} patients.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          DOB
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Emergency Contact
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {csvData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {row.first_name} {row.last_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.phone_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.email || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.date_of_birth || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.emergency_contact_name ? (
                              <div>
                                <div>{row.emergency_contact_name}</div>
                                <div className="text-gray-500">{row.emergency_contact_phone}</div>
                              </div>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setStep('upload')}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  className="btn-primary"
                >
                  Import {csvData.length} Patients
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importing Patients...</h3>
              <p className="text-gray-600">Please wait while we process your data.</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Complete!</h3>
              <div className="space-y-2 mb-6">
                <p className="text-green-600">
                  ✓ {importResults.success} patients imported successfully
                </p>
                {importResults.failed > 0 && (
                  <p className="text-red-600">
                    ✗ {importResults.failed} patients failed to import
                  </p>
                )}
              </div>
              <button
                onClick={handleComplete}
                className="btn-primary"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
