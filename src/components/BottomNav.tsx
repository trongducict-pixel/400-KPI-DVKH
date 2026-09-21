import React from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Home,
  LayoutDashboard,
  PlusCircle,
  Settings,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BottomNavProps {
  onOpenDailyEntry?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenDailyEntry }) => {
  const { currentUser, activeTab, setActiveTab } = useApp();

  const isStaff = currentUser.role === 'NHAN_VIEN';

  interface NavTabItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isHighlight?: boolean;
  }

  // Navigation tabs for Staff: Nhập số liệu nhanh -> hoàn tất -> khi cần mới tra cứu KPI
  const staffTabs: NavTabItem[] = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'entry', label: 'Nhập số liệu', icon: PlusCircle, isHighlight: true },
    { id: 'lookup', label: 'Tra cứu KPI', icon: BarChart3 },
    { id: 'profile', label: 'Cá nhân', icon: UserIcon },
  ];

  // Navigation tabs for Manager: Nhập số liệu cá nhân -> tra cứu toàn phòng -> phân tích -> lập báo cáo Giám đốc
  const managerTabs: NavTabItem[] = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'entry', label: 'Nhập cá nhân', icon: PlusCircle, isHighlight: true },
    { id: 'lookup', label: 'Tra cứu phòng', icon: BarChart3 },
    { id: 'reports', label: 'Báo cáo GĐ', icon: FileText },
    { id: 'settings', label: 'Quản trị', icon: Settings },
  ];

  const currentTabs = isStaff ? staffTabs : managerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 md:py-2">
      <div className="max-w-md md:max-w-4xl mx-auto flex items-center justify-around">
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'home' && (activeTab === 'home' || activeTab === 'overview')) ||
            (tab.id === 'lookup' && (activeTab === 'lookup' || activeTab === 'summary'));

          if (tab.isHighlight) {
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => {
                  if (onOpenDailyEntry) {
                    onOpenDailyEntry();
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#003B70] to-[#0072CE] text-white flex items-center justify-center shadow-lg shadow-blue-900/30 ring-4 ring-white active:scale-95 transition-transform">
                  <PlusCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-extrabold text-[#003B70] mt-1 whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors min-w-[56px] cursor-pointer ${
                isActive ? 'text-[#003B70] font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#003B70] stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0072CE] rounded-full"></span>
                )}
              </div>
              <span className={`text-[11px] mt-1 whitespace-nowrap ${isActive ? 'font-bold text-[#003B70]' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
