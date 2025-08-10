import React, { useState } from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, GitBranch, Code, Globe, Smartphone } from 'lucide-react';

const ExpertWorkflow: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<'beginner' | 'expert'>('expert');

  const beginnerSteps = [
    { icon: Code, title: "Work in Mocha", desc: "Make changes here", status: "current" },
    { icon: GitBranch, title: "Save to GitHub", desc: "Upload files", status: "pending" },
    { icon: Code, title: "Back to Mocha", desc: "Make more changes", status: "pending" },
    { icon: Globe, title: "Deploy to Netlify", desc: "Go live", status: "pending" },
    { icon: Code, title: "More Mocha changes", desc: "Keep editing", status: "pending" },
  ];

  const expertSteps = [
    { icon: Code, title: "Perfect in Mocha", desc: "Build & test everything", status: "current" },
    { icon: GitBranch, title: "Deploy Once", desc: "GitHub → Netlify when ready", status: "pending" },
    { icon: Globe, title: "Use Live Version", desc: "Work from deployed app", status: "pending" },
  ];

  return (
    <div className="card space-y-6">
      <div className="flex items-center space-x-3">
        <GitBranch className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-900">Avoid "Multiple Versions" Nightmare</h3>
      </div>

      {/* Problem Statement */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 mb-1">The Problem You're Worried About</h4>
            <p className="text-sm text-red-700">
              "I could have version 1.0 in Mocha, version 0.9 in GitHub, version 0.8 on Netlify, 
              and different data everywhere. Which one is the real version?"
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Selector */}
      <div className="flex space-x-4">
        <button
          onClick={() => setSelectedWorkflow('beginner')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedWorkflow === 'beginner'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ❌ Beginner Way (Confusing)
        </button>
        <button
          onClick={() => setSelectedWorkflow('expert')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedWorkflow === 'expert'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ✅ Expert Way (Simple)
        </button>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {(selectedWorkflow === 'expert' ? expertSteps : beginnerSteps).map((step, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step.status === 'current' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </div>
            {index < (selectedWorkflow === 'expert' ? expertSteps : beginnerSteps).length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        ))}
      </div>

      {/* Expert Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-3">Expert Rules to Never Get Confused:</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span><strong>Rule 1:</strong> Perfect everything in Mocha FIRST</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span><strong>Rule 2:</strong> Deploy to GitHub + Netlify only when 100% ready</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span><strong>Rule 3:</strong> Use the LIVE version for daily work</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span><strong>Rule 4:</strong> For updates: Mocha → Test → Deploy (repeat)</span>
          </div>
        </div>
      </div>

      {/* Current Recommendation */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h4 className="font-medium text-green-800 mb-2">Your Next Steps (Keep It Simple):</h4>
        <div className="space-y-1 text-sm text-green-700">
          <p>1. <strong>Today:</strong> Use your current Mocha app, add some test projects</p>
          <p>2. <strong>This weekend:</strong> When happy, deploy to GitHub + Netlify</p>
          <p>3. <strong>Going forward:</strong> Use the live version for real work</p>
          <p>4. <strong>For new features:</strong> Build in Mocha → Deploy when perfect</p>
        </div>
      </div>

      {/* Data Sync Assurance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <Code className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Mocha</p>
          <p className="text-xs text-gray-600">Development</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <Globe className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Netlify</p>
          <p className="text-xs text-gray-600">Production</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <Smartphone className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Mobile</p>
          <p className="text-xs text-gray-600">Anywhere</p>
        </div>
        <div className="md:col-span-3 text-center">
          <p className="text-sm text-gray-600 mt-2">
            <strong>Same Data Everywhere:</strong> Cloudflare D1 keeps everything in sync
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpertWorkflow;
