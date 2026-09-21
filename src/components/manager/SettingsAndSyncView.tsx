import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  HardDrive,
  Layers,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Table,
  Target,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportAllSheetsToExcel } from '../../utils/exportUtils';
import { formatDateTimeVN } from '../../utils/formatters';
import { UserManagement } from './UserManagement';
import { KpiManagement } from './KpiManagement';

export type SettingsSubTab = 'OFFICERS' | 'KPIS' | 'SHEETS' | 'AUDIT';

interface SettingsAndSyncViewProps {
  defaultSubTab?: SettingsSubTab;
}

export const SettingsAndSyncView: React.FC<SettingsAndSyncViewProps> = ({ defaultSubTab = 'OFFICERS' }) => {
  const {
    currentUser,
    switchUser,
    users,
    kpis,
    targets,
    dailyEntries,
    kpiHistory,
    auditLogs,
    reportConfig,
    reportHistory,
    googleSheetsStatus,
    triggerGoogleSheetsSync,
    resetToDemoData,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>(defaultSubTab);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (defaultSubTab) {
      setActiveSubTab(defaultSubTab);
    }
  }, [defaultSubTab]);

  // Find manager account for quick switch if needed
  const managerUser = users.find((u) => u.role === 'TRUONG_PHONG') || users[0];

  // 8 Sheets summary
  const sheets = [
    { name: 'USERS', label: 'Cán bộ phòng DVKH', count: users.length, desc: 'Danh sách tài khoản, chức danh, email, phân quyền' },
    { name: 'KPI_MASTER', label: 'Danh mục chỉ tiêu KPI', count: kpis.length, desc: 'Mã, tên, đơn vị, loại dữ liệu, trạng thái' },
    { name: 'KPI_TARGET', label: 'Mức KPI giao', count: targets.length, desc: 'Chỉ tiêu từng cán bộ theo năm' },
    { name: 'DAILY_DATA', label: 'Số liệu thực hiện hàng ngày', count: dailyEntries.length, desc: 'Lưu chính xác từng đồng số thực hiện hàng ngày' },
    { name: 'KPI_HISTORY', label: 'Lịch sử điều chỉnh KPI', count: kpiHistory.length, desc: 'Lưu dấu mức cũ, mức mới, người sửa, lý do' },
    { name: 'AUDIT_LOG', label: 'Nhật ký hệ thống', count: auditLogs.length, desc: 'Toàn bộ thao tác: đăng nhập, nhập số, sửa, chốt ngày' },
    { name: 'REPORT_CONFIG', label: 'Cấu hình Báo cáo Giám đốc', count: reportConfig.selectedKpiIds.length, desc: 'Chỉ tiêu chọn lọc xuất hiện trên báo cáo lãnh đạo' },
    { name: 'REPORT_HISTORY', label: 'Lịch sử chốt & gửi Báo cáo', count: reportHistory.length, desc: 'Phiên bản chốt, người duyệt, email đã gửi' },
  ];

  const handleExportAll = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportAllSheetsToExcel(
        users,
        kpis,
        targets,
        dailyEntries,
        kpiHistory,
        auditLogs,
        reportConfig,
        reportHistory
      );
      setIsExporting(false);
    }, 400);
  };

  return (
    <div className="pb-28 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Header Bar: Trung tâm Quản trị hệ thống */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#003B70] text-white uppercase tracking-wider">
              QUẢN TRỊ HỆ THỐNG
            </span>
            <span className="text-xs text-slate-500 font-semibold">VietinBank Chi nhánh Ninh Bình</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            TRUNG TÂM QUẢN TRỊ & DỮ LIỆU DVKH
          </h1>
          <p className="text-xs text-slate-500">
            Quản trị nhân sự, chỉ tiêu KPI, đồng bộ Google Sheets và nhật ký hệ thống
          </p>
        </div>

        {/* Quick action buttons on top right */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => triggerGoogleSheetsSync(false)}
            disabled={googleSheetsStatus.isSyncing}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003B70] border border-blue-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
            title="Đồng bộ lại dữ liệu với Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${googleSheetsStatus.isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Đồng bộ Sheets</span>
          </button>

          <button
            onClick={handleExportAll}
            disabled={isExporting}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            title="Xuất trọn gói 8 Sheets ra Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Đang xuất...' : 'Xuất 8 Sheets'}</span>
          </button>
        </div>
      </div>

      {/* Role Notice & Fast-Switch Bar for testing / permissions */}
      {currentUser.role === 'NHAN_VIEN' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-start sm:items-center space-x-2 text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold">Chế độ xem Quản trị:</span> Đang đăng nhập tài khoản Cán bộ{' '}
              <strong className="text-slate-900">{currentUser.fullName}</strong>. Bạn có thể tra cứu toàn bộ danh mục, cấu trúc dữ liệu và nhân sự.
            </div>
          </div>
          <button
            onClick={() => switchUser(managerUser.id)}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center justify-center space-x-1 transition-colors shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Chuyển quyền Trưởng phòng ({managerUser.fullName})</span>
          </button>
        </div>
      )}

      {/* 4 Main Admin Tabs Navigation */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center overflow-x-auto gap-1">
        <button
          onClick={() => setActiveSubTab('OFFICERS')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeSubTab === 'OFFICERS'
              ? 'bg-[#003B70] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản lý Cán bộ ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('KPIS')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeSubTab === 'KPIS'
              ? 'bg-[#003B70] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Chỉ tiêu & Giao KPI ({kpis.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SHEETS')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeSubTab === 'SHEETS'
              ? 'bg-[#003B70] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>8 Bảng Sheets</span>
        </button>

        <button
          onClick={() => setActiveSubTab('AUDIT')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeSubTab === 'AUDIT'
              ? 'bg-[#003B70] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* ================= SUB-TAB CONTENT ================= */}

      {/* 1. OFFICERS MANAGEMENT */}
      {activeSubTab === 'OFFICERS' && (
        <div className="space-y-4">
          <UserManagement />
        </div>
      )}

      {/* 2. KPI MASTER & TARGET ALLOCATION */}
      {activeSubTab === 'KPIS' && (
        <div className="space-y-4">
          <KpiManagement />
        </div>
      )}

      {/* 3. 8 GOOGLE SHEETS & DATABASE SYNC */}
      {activeSubTab === 'SHEETS' && (
        <div className="space-y-4">
          {/* Sync Status Banner */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>TRẠNG THÁI ĐỒNG BỘ GOOGLE SHEETS:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    googleSheetsStatus.status === 'SYNCED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {googleSheetsStatus.status === 'SYNCED' ? '🟢 ĐÃ ĐỒNG BỘ' : '⚠️ CẦN ĐỒNG BỘ LẠI'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thời gian đồng bộ tự động gần nhất: <strong className="font-mono text-slate-700">{googleSheetsStatus.lastSynced}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => triggerGoogleSheetsSync(false)}
                disabled={googleSheetsStatus.isSyncing}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003B70] border border-blue-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${googleSheetsStatus.isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                <span>{googleSheetsStatus.isSyncing ? 'Đang đồng bộ...' : 'ĐỒNG BỘ LẠI'}</span>
              </button>

              <button
                onClick={handleExportAll}
                disabled={isExporting}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Đang xuất...' : 'XUẤT TOÀN BỘ 8 SHEETS (XLSX)'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider px-1">
              CẤU TRÚC 8 BẢNG DỮ LIỆU TỰ ĐỘNG LƯU TRỮ TRÊN GOOGLE SHEETS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sheets.map((s, idx) => (
                <div
                  key={s.name}
                  className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2 hover:border-[#0072CE] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold font-mono text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-mono font-bold text-[#003B70] text-xs sm:text-sm">
                          {s.name}
                        </div>
                        <div className="text-[11px] font-medium text-slate-700">{s.label}</div>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {s.count} dòng
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div>
                <strong className="text-slate-800">Khôi phục trạng thái ban đầu:</strong> Bạn có thể đưa toàn bộ dữ liệu trở về bộ số liệu mẫu ngày 21/09/2026.
              </div>
              <button
                onClick={resetToDemoData}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center space-x-1 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. AUDIT LOG */}
      {activeSubTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold uppercase text-[#003B70] flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG (AUDIT LOG)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ghi lại chi tiết mọi hành vi nhập số liệu, sửa đổi, khóa chốt và gửi báo cáo
            </p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {log.action}
                    </span>
                  </div>
                  <div className="text-slate-600">{log.details}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-[11px] text-slate-400">
                    {formatDateTimeVN(log.timestamp)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{log.ipAddress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
