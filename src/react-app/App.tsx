import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";

import Home from "@/react-app/pages/Home";
import AuthCallback from "@/react-app/pages/AuthCallback";
import TokenSettings from "@/react-app/pages/TokenSettings";

// Import pages directly for immediate loading
import Dashboard from "@/react-app/pages/Dashboard";
import Projects from "@/react-app/pages/Projects";
import Analytics from "@/react-app/pages/Analytics";
import Settings from "@/react-app/pages/Settings";
import DeploymentGuide from "@/react-app/pages/DeploymentGuide";
import AIAssistantComparison from "@/react-app/pages/AIAssistantComparison";
import SetupGuide from "@/react-app/pages/SetupGuide";
import Help from "@/react-app/pages/Help";
import TestDeployment from "@/react-app/pages/TestDeployment";
import TokenTest from "@/react-app/pages/TokenTest";
import GitHubTokenTest from "@/react-app/pages/GitHubTokenTest";



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/tokens" element={<TokenSettings />} />
            <Route path="/deployment" element={<DeploymentGuide />} />
            <Route path="/ai-comparison" element={<AIAssistantComparison />} />
            <Route path="/setup" element={<SetupGuide />} />
            <Route path="/help" element={<Help />} />
            <Route path="/test-deployment" element={<TestDeployment />} />
          <Route path="/token-test" element={<TokenTest />} />
          <Route path="/github-token-test" element={<GitHubTokenTest />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
