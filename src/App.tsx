import React, { useState } from 'react';
import { AlertsView } from './components/common/AlertsView';
import { DailyEntryModal } from './components/employee/DailyEntryModal';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { EmployeeKpiLookup } from './components/employee/EmployeeKpiLookup';
import { EmployeeProfile } from './components/employee/EmployeeProfile';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { DirectorReportView } from './components/manager/DirectorReportView';
import { KpiManagement } from './components/manager/KpiManagement';
import { ManagerHome } from './components/manager/ManagerHome';
import { ManagerKpiLookup } from './components/manager/ManagerKpiLookup';
import { SettingsAndSyncView } from './components/manager/SettingsAndSyncView';
import { UserManagement } from './components/manager/UserManagement';
import { LoginScreen } from './components/auth/LoginScreen';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated, activeTab, setActiveTab } = useApp();
  const [isGlobalEntryModalOpen, setIsGlobalEntryModalOpen] = useState(false);

  // If not authenticated, enforce the VietinBank secure login screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const isStaff = currentUser.role === 'NHAN_VIEN';

  // Render role-specific view based on activeTab
  const renderView = () => {
    // Quản trị hệ thống (Administration) accessible across roles
    if (activeTab === 'settings' || activeTab === 'officers' || activeTab === 'kpis') {
      const subTab = activeTab === 'officers' ? 'OFFICERS' : activeTab === 'kpis' ? 'KPIS' : 'OFFICERS';
      return <SettingsAndSyncView defaultSubTab={subTab} />;
    }

    if (isStaff) {
      switch (activeTab) {
        case 'home':
        case 'entry':
          return <EmployeeDashboard />;
        case 'lookup':
        case 'summary':
        case 'kpi':
          return <EmployeeKpiLookup onBackToHome={() => setActiveTab('home')} />;
        case 'profile':
          return <EmployeeProfile />;
        case 'alerts':
          return <AlertsView />;
        default:
          return <EmployeeDashboard />;
      }
    } else {
      // Manager & Admin views
      switch (activeTab) {
        case 'home':
        case 'overview':
        case 'entry':
          return <ManagerHome />;
        case 'lookup':
        case 'summary':
          return <ManagerKpiLookup onBackToHome={() => setActiveTab('home')} />;
        case 'reports':
          return <DirectorReportView />;
        case 'profile':
          return <EmployeeProfile />;
        case 'alerts':
          return <AlertsView />;
        default:
          return <ManagerHome />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans selection:bg-[#0072CE] selection:text-white">
      {/* Top Fixed Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {renderView()}
      </main>

      {/* Bottom Sticky Navigation */}
      <BottomNav
        onOpenDailyEntry={() => {
          setIsGlobalEntryModalOpen(true);
        }}
      />

      {/* Global Quick Daily Entry Modal */}
      <DailyEntryModal
        isOpen={isGlobalEntryModalOpen}
        onClose={() => setIsGlobalEntryModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
