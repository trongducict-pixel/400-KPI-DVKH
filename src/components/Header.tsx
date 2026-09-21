import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Lock,
  LogOut,
  RefreshCw,
  RotateCcw,
  Settings,
  ShieldCheck,
  Unlock,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateVN } from '../utils/formatters';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    selectedDate,
    setSelectedDate,
    dayLocks,
    toggleLockDay,
    googleSheetsStatus,
    triggerGoogleSheetsSync,
    resetToDemoData,
    logout,
    setActiveTab,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const isLocked = !!dayLocks[selectedDate]?.isLocked;

  return (
    <header className="sticky top-0 z-30 bg-[#003B70] text-white shadow-md border-b border-[#00284D]">
      {/* Top micro bar for Bank Brand */}
      <div className="bg-[#00274B] px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs text-blue-100">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="font-bold tracking-wider uppercase text-white">VIETINBANK</span>
          <span className="text-blue-300">|</span>
          <span className="text-blue-200 font-medium">CHI NHÁNH NINH BÌNH</span>
        </div>

        {/* Sync Indicator */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerGoogleSheetsSync(false)}
            disabled={googleSheetsStatus.isSyncing}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-[11px] transition-colors"
            title="Đồng bộ Google Sheets"
          >
            <RefreshCw className={`w-3 h-3 ${googleSheetsStatus.isSyncing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">Google Sheets:</span>
            {googleSheetsStatus.status === 'ERROR' ? (
              <span className="text-amber-300 font-medium">⚠️ Chưa đồng bộ</span>
            ) : (
              <span className="text-emerald-300 font-medium">{googleSheetsStatus.lastSynced}</span>
            )}
          </button>

          <button
            onClick={resetToDemoData}
            title="Khôi phục dữ liệu mẫu gốc"
            className="p-1 text-blue-300 hover:text-white hover:bg-blue-800/50 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Left: App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0072CE] to-[#004B91] flex items-center justify-center font-bold text-white shadow-inner border border-blue-400/30">
            KPI
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                DVKH DAILY KPI
              </h1>
              <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-[#0072CE] text-white rounded">
                PHÒNG DVKH
              </span>
            </div>
            <p className="text-[11px] text-blue-200 hidden sm:block">
              Báo cáo số liệu & quản trị chỉ tiêu hàng ngày
            </p>
          </div>
        </div>

        {/* Right: Date Picker & User Profile Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Date Selector */}
          <div className="relative flex items-center bg-[#002D56] rounded-lg px-2.5 py-1.5 border border-blue-400/30 text-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-300 mr-1.5 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
            />
            {/* Lock / Unlock Day status toggle (For Truong Phong/Admin) */}
            {currentUser.role !== 'NHAN_VIEN' ? (
              <button
                onClick={() => toggleLockDay(selectedDate)}
                title={isLocked ? 'Ngày đã khóa chốt - Bấm để mở' : 'Ngày đang mở - Bấm để chốt số liệu'}
                className={`ml-1.5 p-1 rounded transition-colors ${
                  isLocked ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            ) : (
              isLocked && (
                <span className="ml-1.5 text-red-400" title="Số liệu ngày này đã được Trưởng phòng khóa chốt">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              )
            )}
          </div>

          {/* Settings Quick Direct Button */}
          <button
            id="header-btn-settings"
            onClick={() => setActiveTab('settings')}
            className="flex items-center space-x-1 bg-[#002D56] hover:bg-[#002447] px-2.5 py-1.5 rounded-lg border border-blue-400/30 transition-all text-white text-xs font-semibold cursor-pointer"
            title="Trung tâm Quản trị DVKH & Dữ liệu"
          >
            <Settings className="w-3.5 h-3.5 text-blue-300" />
            <span className="hidden sm:inline">Quản trị</span>
          </button>

          {/* User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 bg-[#002D56] hover:bg-[#002447] px-2.5 py-1.5 rounded-lg border border-blue-400/30 transition-all text-left"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.fullName}
                className="w-6 h-6 rounded-full object-cover border border-blue-300/40 shrink-0"
              />
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white leading-none">{currentUser.fullName}</div>
                <div className="text-[10px] text-blue-300 leading-tight">
                  {currentUser.role === 'TRUONG_PHONG'
                    ? 'Trưởng phòng'
                    : currentUser.role === 'ADMIN'
                    ? 'Quản trị viên'
                    : 'Cán bộ'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 text-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3 bg-[#003B70] text-white">
                    <div className="text-xs text-blue-200 uppercase font-semibold">Tài khoản hiện tại</div>
                    <div className="font-bold text-sm">{currentUser.fullName}</div>
                    <div className="text-xs text-blue-100">{currentUser.title} - {currentUser.email}</div>
                  </div>

                  <div className="p-2 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Đổi tài khoản mô phỏng (Phân quyền)
                  </div>

                  <div className="max-h-72 overflow-y-auto p-1 divide-y divide-slate-100">
                    {users.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full px-2.5 py-2 flex items-center space-x-2.5 text-left rounded-lg text-xs transition-colors ${
                            isSelected ? 'bg-blue-50 text-[#003B70] font-semibold' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.fullName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium flex items-center justify-between">
                              <span>{u.fullName}</span>
                              {u.role === 'TRUONG_PHONG' && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                                  Lãnh đạo
                                </span>
                              )}
                              {u.role === 'ADMIN' && (
                                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-semibold">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{u.title} • {u.staffCode}</div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0072CE] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 bg-slate-50 border-t border-slate-200 space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowUserDropdown(false);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-[#003B70] bg-blue-50 hover:bg-blue-100 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Trung tâm Quản trị DVKH</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-red-700 hover:bg-red-50 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất hệ thống</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
