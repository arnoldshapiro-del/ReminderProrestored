import React, { useState, useEffect } from 'react';
import { useAuth } from "@getmocha/users-service/react";
import {
  Download,
  Upload,
  FileText,
  GitBranch,
  Globe,
  CheckCircle,
  AlertCircle,
  Database,
  ArrowRight
} from 'lucide-react';

interface ProjectExportImportProps {
  onImportComplete?: () => void;
}

const ProjectExportImport: React.FC<ProjectExportImportProps> = ({ onImportComplete }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'github' | 'netlify'>('json');
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        setSelectedProjects(data.map((p: any) => p.id));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(p => p.id));
    }
  };

  const handleProjectSelect = (projectId: number) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getSelectedProjectsData = () => {
    return projects.filter(p => selectedProjects.includes(p.id));
  };

  const exportToJSON = () => {
    const data = getSelectedProjectsData();
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: user?.google_user_data?.name || user?.email || 'Unknown',
      totalProjects: data.length,
      platform: 'DevTracker Pro',
      version: '1.0.0',
      projects: data
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtracker-projects-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const data = getSelectedProjectsData();
    const headers = [
      'Project Name',
      'Description', 
      'AI Platform',
      'Project Type',
      'Status',
      'Completion %',
      'Credits Used',
      'GitHub URL',
      'Netlify URL',
      'Vercel URL',
      'Created At',
      'Updated At'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(project => [
        `"${project.project_name}"`,
        `"${project.project_description || ''}"`,
        `"${project.ai_platform}"`,
        `"${project.project_type}"`,
        `"${project.status}"`,
        project.completion_percentage || 0,
        project.credits_used || 0,
        `"${project.github_repo_url || ''}"`,
        `"${project.netlify_url || ''}"`,
        `"${project.vercel_url || ''}"`,
        `"${project.created_at}"`,
        `"${project.updated_at}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtracker-projects-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateGitHubReadme = () => {
    const data = getSelectedProjectsData();
    const readme = `# My AI Development Projects

Exported from DevTracker Pro on ${new Date().toLocaleDateString()}

## 📊 Project Overview

- **Total Projects**: ${data.length}
- **Platforms Used**: ${Array.from(new Set(data.map(p => p.ai_platform))).join(', ')}
- **Completed Projects**: ${data.filter(p => p.status === 'deployed').length}
- **In Development**: ${data.filter(p => p.status === 'development').length}

## 🚀 Projects

${data.map(project => `
### ${project.project_name}

- **Platform**: ${project.ai_platform}
- **Type**: ${project.project_type}
- **Status**: ${project.status}
- **Progress**: ${project.completion_percentage}%
- **Credits Used**: ${project.credits_used || 0}

${project.project_description ? `**Description**: ${project.project_description}` : ''}

**Links**:
${project.github_repo_url ? `- [GitHub Repository](${project.github_repo_url})` : ''}
${project.netlify_url ? `- [Live Site (Netlify)](${project.netlify_url})` : ''}
${project.vercel_url ? `- [Live Site (Vercel)](${project.vercel_url})` : ''}

**Created**: ${new Date(project.created_at).toLocaleDateString()}
**Updated**: ${new Date(project.updated_at).toLocaleDateString()}

---
`).join('')}

## 📈 Statistics

- **Most Used Platform**: ${getMostUsedPlatform(data)}
- **Total Credits Used**: ${data.reduce((sum, p) => sum + (p.credits_used || 0), 0)}
- **Average Completion**: ${Math.round(data.reduce((sum, p) => sum + p.completion_percentage, 0) / data.length)}%

---
*Generated by DevTracker Pro - AI Development Project Management*
`;
    
    return readme;
  };

  const getMostUsedPlatform = (projectData: any[]) => {
    const platformCounts: { [key: string]: number } = {};
    projectData.forEach(p => {
      platformCounts[p.ai_platform] = (platformCounts[p.ai_platform] || 0) + 1;
    });
    return Object.keys(platformCounts).reduce((a, b) => 
      platformCounts[a] > platformCounts[b] ? a : b
    );
  };

  const exportForGitHub = () => {
    const readme = generateGitHubReadme();
    const jsonData = {
      exportedAt: new Date().toISOString(),
      exportedBy: user?.google_user_data?.name || user?.email || 'Unknown',
      totalProjects: getSelectedProjectsData().length,
      projects: getSelectedProjectsData()
    };
    
    // Create README.md
    const readmeBlob = new Blob([readme], { type: 'text/markdown' });
    const readmeUrl = URL.createObjectURL(readmeBlob);
    const readmeA = document.createElement('a');
    readmeA.href = readmeUrl;
    readmeA.download = 'README.md';
    document.body.appendChild(readmeA);
    readmeA.click();
    document.body.removeChild(readmeA);
    URL.revokeObjectURL(readmeUrl);
    
    // Create projects.json
    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonA = document.createElement('a');
    jsonA.href = jsonUrl;
    jsonA.download = 'projects.json';
    document.body.appendChild(jsonA);
    jsonA.click();
    document.body.removeChild(jsonA);
    URL.revokeObjectURL(jsonUrl);
  };

  const generateNetlifyConfig = () => {
    const data = getSelectedProjectsData();
    return `# Netlify Configuration for DevTracker Pro Projects
# Generated on ${new Date().toISOString()}

# Build settings
[build]
  publish = "dist"
  command = "npm run build"

# Environment variables (add your actual values)
[build.environment]
  NODE_VERSION = "18"
  
# Redirects for client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers for security
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

# Project Statistics
# Total Projects: ${data.length}
# Platforms: ${Array.from(new Set(data.map(p => p.ai_platform))).join(', ')}
# Deployed Projects: ${data.filter(p => p.status === 'deployed').length}
`;
  };

  const exportForNetlify = () => {
    const netlifyConfig = generateNetlifyConfig();
    const projectsData = {
      exportedAt: new Date().toISOString(),
      totalProjects: getSelectedProjectsData().length,
      projects: getSelectedProjectsData()
    };
    
    // Create netlify.toml
    const configBlob = new Blob([netlifyConfig], { type: 'text/plain' });
    const configUrl = URL.createObjectURL(configBlob);
    const configA = document.createElement('a');
    configA.href = configUrl;
    configA.download = 'netlify.toml';
    document.body.appendChild(configA);
    configA.click();
    document.body.removeChild(configA);
    URL.revokeObjectURL(configUrl);
    
    // Create projects.json
    const jsonBlob = new Blob([JSON.stringify(projectsData, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonA = document.createElement('a');
    jsonA.href = jsonUrl;
    jsonA.download = 'projects-data.json';
    document.body.appendChild(jsonA);
    jsonA.click();
    document.body.removeChild(jsonA);
    URL.revokeObjectURL(jsonUrl);
  };

  const handleExport = async () => {
    setLoading(true);
    setExportStatus('exporting');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
      
      switch (exportFormat) {
        case 'json':
          exportToJSON();
          break;
        case 'csv':
          exportToCSV();
          break;
        case 'github':
          exportForGitHub();
          break;
        case 'netlify':
          exportForNetlify();
          break;
      }
      
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          setImportPreview(data.projects || [data]);
        } else if (file.name.endsWith('.csv')) {
          // Basic CSV parsing
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          const projects = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',');
            const project: any = {};
            headers.forEach((header, index) => {
              project[header.replace(/"/g, '').toLowerCase().replace(/ /g, '_')] = values[index]?.replace(/"/g, '') || '';
            });
            return project;
          });
          setImportPreview(projects);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        setImportPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importPreview.length) return;
    
    setLoading(true);
    try {
      for (const project of importPreview) {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            project_name: project.project_name || project.name || 'Imported Project',
            project_description: project.project_description || project.description || '',
            ai_platform: project.ai_platform || project.platform || 'custom',
            project_type: project.project_type || project.type || 'web',
            github_repo_url: project.github_repo_url || project.github_url || '',
            netlify_url: project.netlify_url || '',
            credits_used: parseInt(project.credits_used || project.credits || '0') || 0
          })
        });
      }
      
      setImportFile(null);
      setImportPreview([]);
      if (onImportComplete) onImportComplete();
      alert(`Successfully imported ${importPreview.length} projects!`);
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please check your file format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
              <Database className="w-7 h-7 mr-3 text-blue-600" />
              Project Export & Import System
            </h2>
            <p className="text-gray-700">
              Export ALL your projects ({projects.length} total) for GitHub, Netlify deployment, or backup. 
              Import projects from other sources.
            </p>
          </div>
          <div className="text-right">
            <div className="bg-blue-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
              <div className="text-sm text-blue-700">Total Projects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'export'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Projects</span>
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
            activeTab === 'import'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Import Projects</span>
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {/* Project Selection */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Projects to Export</h3>
              <button
                onClick={handleSelectAll}
                className="btn-secondary text-sm"
              >
                {selectedProjects.length === projects.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {projects.map(project => (
                <label key={project.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleProjectSelect(project.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{project.project_name}</p>
                    <p className="text-sm text-gray-500">{project.ai_platform}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">
                <strong>{selectedProjects.length}</strong> of <strong>{projects.length}</strong> projects selected for export
              </p>
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Export Format</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setExportFormat('json')}
                className={`p-4 border-2 rounded-xl transition-all text-left ${
                  exportFormat === 'json'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <FileText className="w-8 h-8 text-blue-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">JSON Export</h4>
                <p className="text-sm text-gray-600">Complete data backup with all project details</p>
                <div className="text-xs text-blue-600 mt-2">• Full data • Re-importable • Backup</div>
              </button>

              <button
                onClick={() => setExportFormat('csv')}
                className={`p-4 border-2 rounded-xl transition-all text-left ${
                  exportFormat === 'csv'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <Database className="w-8 h-8 text-green-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">CSV Export</h4>
                <p className="text-sm text-gray-600">Spreadsheet format for Excel, Google Sheets</p>
                <div className="text-xs text-green-600 mt-2">• Excel compatible • Analysis • Reporting</div>
              </button>

              <button
                onClick={() => setExportFormat('github')}
                className={`p-4 border-2 rounded-xl transition-all text-left ${
                  exportFormat === 'github'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <GitBranch className="w-8 h-8 text-gray-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">GitHub Package</h4>
                <p className="text-sm text-gray-600">README.md + JSON for GitHub repository</p>
                <div className="text-xs text-gray-600 mt-2">• Professional README • Repository ready</div>
              </button>

              <button
                onClick={() => setExportFormat('netlify')}
                className={`p-4 border-2 rounded-xl transition-all text-left ${
                  exportFormat === 'netlify'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <Globe className="w-8 h-8 text-teal-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Netlify Package</h4>
                <p className="text-sm text-gray-600">Configuration files for Netlify deployment</p>
                <div className="text-xs text-teal-600 mt-2">• netlify.toml • Deploy ready • Config</div>
              </button>
            </div>
          </div>

          {/* Export Action */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to Export</h3>
                <p className="text-gray-600">
                  {selectedProjects.length} projects will be exported in {exportFormat.toUpperCase()} format
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {exportStatus === 'success' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Export completed!</span>
                  </div>
                )}
                {exportStatus === 'error' && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>Export failed</span>
                  </div>
                )}
                <button
                  onClick={handleExport}
                  disabled={selectedProjects.length === 0 || loading}
                  className="btn-primary flex items-center space-x-2 min-w-[140px] justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Export Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Professional Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-gradient-to-r from-blue-50 to-blue-100">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <GitBranch className="w-5 h-5 mr-2" />
                Perfect for GitHub
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Professional README generation</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Repository documentation</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Project portfolio showcase</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Backup and version control</li>
              </ul>
            </div>

            <div className="card bg-gradient-to-r from-teal-50 to-teal-100">
              <h4 className="font-semibold text-teal-900 mb-3 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Perfect for Netlify
              </h4>
              <ul className="space-y-2 text-sm text-teal-800">
                <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Automatic deployment config</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Environment setup</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Redirect rules included</li>
                <li className="flex items-center"><ArrowRight className="w-4 h-4 mr-2" />Production-ready settings</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Why Import? */}
          <div className="card bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3">Why Import Projects?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
              <div>
                <h4 className="font-medium mb-2">📱 Multi-Device Sync</h4>
                <p>Move projects between different devices or accounts seamlessly</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">👥 Team Collaboration</h4>
                <p>Share project templates and setups with team members</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔄 Platform Migration</h4>
                <p>Import from other project management tools or spreadsheets</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">💾 Backup Restoration</h4>
                <p>Restore from previous exports or recover lost data</p>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Project File</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Drop your project file here</p>
              <p className="text-gray-600 mb-4">Supports JSON, CSV files</p>
              
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="btn-primary inline-flex items-center space-x-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Choose File</span>
              </label>
            </div>

            {importFile && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">File loaded: {importFile.name}</span>
                  <span className="text-blue-700">({importPreview.length} projects found)</span>
                </div>
              </div>
            )}
          </div>

          {/* Import Preview */}
          {importPreview.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Preview Import ({importPreview.length} projects)</h3>
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Import {importPreview.length} Projects</span>
                    </>
                  )}
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {importPreview.slice(0, 10).map((project, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {project.project_name || project.name || `Project ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {project.ai_platform || project.platform || 'Unknown platform'} • 
                          {project.project_type || project.type || 'Unknown type'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.credits_used || project.credits || 0} credits
                      </div>
                    </div>
                  </div>
                ))}
                {importPreview.length > 10 && (
                  <div className="text-center text-gray-500 text-sm py-2">
                    ... and {importPreview.length - 10} more projects
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Tips */}
          <div className="card bg-gradient-to-r from-gray-50 to-gray-100">
            <h4 className="font-semibold text-gray-900 mb-3">💡 Import Tips</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>JSON Format:</strong> Use exports from DevTracker Pro or similar tools</p>
              <p><strong>CSV Format:</strong> Include columns: project_name, ai_platform, project_type, credits_used</p>
              <p><strong>Large Files:</strong> Import will process projects in batches for reliability</p>
              <p><strong>Duplicates:</strong> System will create new projects - duplicates won't be automatically merged</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectExportImport;
