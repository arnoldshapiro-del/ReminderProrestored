import { useState } from "react";
import Layout from "@/react-app/components/Layout";
import RealAutoDeployment from "@/react-app/components/RealAutoDeployment";
import { 
  Rocket, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Mock projects for testing deployment
const mockProjects = [
  {
    id: 1,
    project_name: "AI Chat Assistant",
    project_description: "A smart chat assistant built with React and AI APIs",
    ai_platform: "Mocha",
    project_type: "Web App",
    status: "development",
    completion_percentage: 75,
    credits_used: 25,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    project_name: "Task Manager Pro", 
    project_description: "Advanced task management system with AI insights",
    ai_platform: "ChatGPT",
    project_type: "SaaS App", 
    status: "testing",
    completion_percentage: 90,
    credits_used: 45,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    project_name: "Real Estate Bot",
    project_description: "Automated property search and recommendation bot",
    ai_platform: "Claude", 
    project_type: "Bot",
    status: "ready",
    completion_percentage: 100,
    credits_used: 80,
    created_at: new Date().toISOString()
  }
];

export default function TestDeployment() {
  const [projects] = useState(mockProjects);

  const handleProjectUpdate = () => {
    // Simulate project update
    console.log("Project updated!");
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
            🚀 DEPLOYMENT TEST CENTER
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real deployment testing environment - no fake progress bars!
          </p>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ Build System</h3>
            <p className="text-green-600 text-sm font-medium">
              WORKING - No build errors
            </p>
          </div>
          
          <div className="card text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ Token Settings</h3>
            <p className="text-green-600 text-sm font-medium">
              WORKING - Beautiful interface ready
            </p>
          </div>
          
          <div className="card text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚠️ Real Deployment</h3>
            <p className="text-yellow-600 text-sm font-medium">
              READY FOR TESTING - Add tokens below
            </p>
          </div>
        </div>

        {/* Real Auto-Deployment System */}
        <RealAutoDeployment 
          projects={projects}
          onProjectUpdate={handleProjectUpdate}
        />

        {/* Next Steps Guide */}
        <div className="mt-12 card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 TESTING CHECKLIST - Do This Now:</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <span className="font-medium">Go to API Tokens page (/tokens) and add your GitHub & Netlify tokens</span>
                <p className="text-sm text-gray-600">This enables real automation - no fake progress bars!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <span className="font-medium">Select a test project above and configure deployment settings</span>
                <p className="text-sm text-gray-600">Choose GitHub repo name and Netlify site name</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <span className="font-medium">Click "Deploy to GitHub & Netlify (REAL)" and watch it work</span>
                <p className="text-sm text-gray-600">Real API calls, real repositories, real live sites!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">4</span>
              </div>
              <div>
                <span className="font-medium">Verify your deployed site is live and working</span>
                <p className="text-sm text-gray-600">Click the live links to see your deployed application</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
