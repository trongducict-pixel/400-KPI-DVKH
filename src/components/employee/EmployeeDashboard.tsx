import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Lock,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateVN } from '../../utils/formatters';
import { DailyEntryModal } from './DailyEntryModal';

export const EmployeeDashboard: React.FC = () => {
  const { currentUser, selectedDate, kpis, targets, dailyEntries, isDateLocked, setActiveTab } = useApp();
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const isLocked = isDateLocked(selectedDate);
  const activeKpis = kpis.filter((k) => k.status === 'ACTIVE').sort((a, b) => a.order - b.order);

  // Today's entry status count
  const todayUpdatedCount = activeKpis.filter((kpi) =>
    dailyEntries.some((e) => e.userId === currentUser.id && e.kpiId === kpi.id && e.date === selectedDate)
  ).length;

  const isAllUpdatedToday = activeKpis.length > 0 && todayUpdatedCount === activeKpis.length;

  return (
    <div className="pb-28 pt-4 px-3 sm:px-6 max-w-lg mx-auto space-y-5 animate-in fade-in duration-150">
      {/* 1. Header Card VietinBank Ninh Bình */}
      <div className="bg-gradient-to-br from-[#002B54] via-[#003B70] to-[#005FA8] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        {/* Decorative backdrop */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          {/* Bank branding */}
          <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-100">
                VIETINBANK CHI NHÁNH NINH BÌNH
              </span>
            </div>
            <span className="text-[10px] font-semibold bg-white/15 text-white px-2 py-0.5 rounded-full">
              DVKH
            </span>
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-blue-100 uppercase tracking-tight">
              BÁO CÁO SỐ LIỆU PHÒNG DVKH
            </h1>
            <div className="mt-1.5 flex items-baseline space-x-2">
              <span className="text-xs text-blue-200">Xin chào:</span>
              <span className="text-lg sm:text-xl font-black text-white truncate">
                {currentUser.fullName}
              </span>
            </div>
            <p className="text-xs text-blue-200/90 mt-0.5">
              {currentUser.title} • Mã CB: {currentUser.staffCode}
            </p>
          </div>

          {/* Date & today progress status */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-blue-200">
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              <span>Ngày: <strong className="text-white font-medium">{formatDateVN(selectedDate)}</strong></span>
            </div>

            <div>
              {isAllUpdatedToday ? (
                <span className="text-emerald-300 font-bold flex items-center space-x-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã cập nhật {todayUpdatedCount}/{activeKpis.length} chỉ tiêu</span>
                </span>
              ) : (
                <span className="text-amber-300 font-bold flex items-center space-x-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Đã nhập {todayUpdatedCount}/{activeKpis.length} chỉ tiêu</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHỈ HIỂN THỊ 2 NÚT LỚN (Section VI) */}
      <div className="space-y-4 pt-1">
        {/* NÚT 1: 📊 CẬP NHẬT SỐ LIỆU HÀNG NGÀY */}
        <button
          id="btn-emp-daily-entry"
          onClick={() => setIsEntryModalOpen(true)}
          disabled={isLocked}
          className={`w-full min-h-[110px] sm:min-h-[120px] p-5 rounded-2xl flex items-center justify-between shadow-md transition-all active:scale-98 text-left cursor-pointer border ${
            isLocked
              ? 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#003B70] via-[#005191] to-[#0072CE] text-white border-blue-400/30 hover:brightness-105'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <FileSpreadsheet className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black uppercase tracking-tight text-white flex items-center space-x-2">
                <span>📊 CẬP NHẬT SỐ LIỆU HÀNG NGÀY</span>
              </div>
              <p className="text-xs text-blue-100 font-medium mt-1 leading-relaxed">
                Nhập số thực hiện các chỉ tiêu KPI trong ngày
              </p>
              <div className="mt-2 inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white">
                <span>{isAllUpdatedToday ? '✓ Đã hoàn tất hôm nay (Bấm để sửa)' : '● Nhập từng chỉ tiêu một (1-2 phút)'}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 pl-2">
            <div className="w-10 h-10 rounded-full bg-white text-[#003B70] flex items-center justify-center shadow-md">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </button>

        {/* NÚT 2: 📈 TRA CỨU KẾT QUẢ KPI */}
        <button
          id="btn-emp-kpi-lookup"
          onClick={() => setActiveTab('lookup')}
          className="w-full min-h-[110px] sm:min-h-[120px] p-5 rounded-2xl flex items-center justify-between shadow-md bg-white border-2 border-[#003B70] hover:bg-blue-50/60 transition-all active:scale-98 text-left cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
              <BarChart3 className="w-8 h-8 text-[#003B70]" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#003B70] flex items-center space-x-2">
                <span>📈 TRA CỨU KẾT QUẢ KPI</span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                Xem lũy kế, tiến độ và kết quả theo từng chỉ tiêu
              </p>
              <div className="mt-2 inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#003B70] border border-blue-200">
                <span>● Chọn chỉ tiêu để xem chi tiết</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 pl-2">
            <div className="w-10 h-10 rounded-full bg-[#003B70] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </button>
      </div>

      {/* Lock Notification if locked */}
      {isLocked && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2 font-medium">
          <Lock className="w-4 h-4 shrink-0" />
          <span>Số liệu ngày {formatDateVN(selectedDate)} đã được khóa bởi Trưởng phòng. Chỉ có thể xem dữ liệu.</span>
        </div>
      )}

      {/* Modal Daily Entry Wizard */}
      <DailyEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
      />
    </div>
  );
};
