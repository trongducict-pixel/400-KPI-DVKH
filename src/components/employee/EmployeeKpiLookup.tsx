import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  Globe,
  HelpCircle,
  PiggyBank,
  Shield,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KpiMaster } from '../../types';
import { computeKpiProgress, getTimeProgressRate } from '../../utils/calculations';
import {
  formatDateVN,
  formatKpiValue,
  formatNumberWithDots,
  formatPercentage,
} from '../../utils/formatters';

interface EmployeeKpiLookupProps {
  onBackToHome: () => void;
}

// Icon mapper for KPIs
const getKpiIcon = (code: string) => {
  switch (code) {
    case 'NV':
      return PiggyBank;
    case 'TP':
      return Coins;
    case 'KDNT':
      return Globe;
    case 'MNL':
      return Shield;
    case 'VBI':
      return FileCheck;
    case 'IPAY':
      return Smartphone;
    case 'EFAST':
      return CreditCard;
    default:
      return Wallet;
  }
};

export const EmployeeKpiLookup: React.FC<EmployeeKpiLookupProps> = ({ onBackToHome }) => {
  const { currentUser, selectedDate, kpis, targets, dailyEntries } = useApp();
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);

  const activeKpis = kpis.filter((k) => k.status === 'ACTIVE').sort((a, b) => a.order - b.order);
  const selectedYear = new Date(selectedDate).getFullYear();
  const { rate: timeProgressRate } = getTimeProgressRate(selectedDate);

  // If a KPI is selected, find its object & compute data
  const selectedKpi = activeKpis.find((k) => k.id === selectedKpiId);

  // Calculate progress for the selected KPI
  const selectedKpiCalculation = selectedKpi
    ? computeKpiProgress(
        selectedKpi,
        targets.find(
          (t) =>
            t.userId === currentUser.id &&
            t.kpiId === selectedKpi.id &&
            t.year === selectedYear
        )?.targetValue || 0,
        dailyEntries,
        currentUser.id,
        selectedDate
      )
    : null;

  // Recent 7 days entries for this KPI
  const recentEntries = selectedKpi
    ? dailyEntries
        .filter((e) => e.userId === currentUser.id && e.kpiId === selectedKpi.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)
    : [];

  return (
    <div className="pb-28 pt-2 px-3 sm:px-6 max-w-lg mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={selectedKpiId ? () => setSelectedKpiId(null) : onBackToHome}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#003B70] bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{selectedKpiId ? 'Chọn chỉ tiêu khác' : 'Trang chủ'}</span>
        </button>

        <span className="text-xs font-medium text-slate-500">
          Ngày: <strong className="text-slate-800">{formatDateVN(selectedDate)}</strong>
        </span>
      </div>

      {/* VIEW 1: CHỌN CHỈ TIÊU CẦN TRA CỨU (Section XIII) */}
      {!selectedKpi && (
        <div className="space-y-3">
          <div className="text-center py-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#003B70] tracking-tight">
              CHỌN CHỈ TIÊU CẦN TRA CỨU
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chạm vào chỉ tiêu để xem chi tiết lũy kế và tiến độ
            </p>
          </div>

          {/* List of large cards */}
          <div className="space-y-2.5">
            {activeKpis.map((kpi) => {
              const Icon = getKpiIcon(kpi.code);
              return (
                <button
                  key={kpi.id}
                  onClick={() => setSelectedKpiId(kpi.id)}
                  className="w-full bg-white border border-slate-200 hover:border-[#0072CE] hover:shadow-md active:scale-98 transition-all rounded-2xl p-4 flex items-center justify-between text-left group shadow-xs cursor-pointer min-h-[80px]"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003B70] group-hover:bg-[#003B70] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-bold text-slate-900 group-hover:text-[#003B70] transition-colors truncate">
                        {kpi.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Mã: <span className="font-mono font-medium">{kpi.code}</span> • Đơn vị: {kpi.unit}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-[#003B70] transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: CHI TIẾT MỘT KPI – NHÂN VIÊN (Section XIV) */}
      {selectedKpi && selectedKpiCalculation && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Main KPI Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#003B70] font-mono">
                  {selectedKpi.code} • ĐƠN VỊ: {selectedKpi.unit}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#003B70] mt-1.5">
                  {selectedKpi.name}
                </h2>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedKpiCalculation.status === 'ACHIEVED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : selectedKpiCalculation.status === 'WARNING'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {selectedKpiCalculation.status === 'ACHIEVED'
                  ? '🟢 Đạt tiến độ'
                  : selectedKpiCalculation.status === 'WARNING'
                  ? '🟡 Cần theo dõi'
                  : '🔴 Chậm tiến độ'}
              </span>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* KPI được giao */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                <div className="text-[11px] text-slate-500 font-medium">KPI được giao:</div>
                <div className="text-sm sm:text-base font-bold text-slate-800 font-mono-num">
                  {formatNumberWithDots(selectedKpiCalculation.target)} {selectedKpi.unit}
                </div>
              </div>

              {/* Lũy kế thực hiện */}
              <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 space-y-1">
                <div className="text-[11px] text-[#003B70] font-medium">Lũy kế thực hiện:</div>
                <div className="text-sm sm:text-base font-extrabold text-[#003B70] font-mono-num">
                  {formatNumberWithDots(selectedKpiCalculation.cumulativeValue)} {selectedKpi.unit}
                </div>
              </div>

              {/* Hoàn thành */}
              <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 space-y-1">
                <div className="text-[11px] text-emerald-800 font-medium">Hoàn thành:</div>
                <div className="text-base sm:text-lg font-black text-emerald-700 font-mono-num">
                  {formatPercentage(selectedKpiCalculation.percentage)}
                </div>
                <div className="text-[10px] text-slate-400">
                  (Tiến độ kỳ: {timeProgressRate}%)
                </div>
              </div>

              {/* Còn thiếu */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                <div className="text-[11px] text-slate-500 font-medium">Còn thiếu:</div>
                <div className="text-sm sm:text-base font-bold text-rose-600 font-mono-num">
                  {formatNumberWithDots(selectedKpiCalculation.remaining)} {selectedKpi.unit}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Tiến độ thực hiện:</span>
                <span className="font-mono-num font-bold text-slate-800">
                  {formatPercentage(selectedKpiCalculation.percentage)}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all ${
                    selectedKpiCalculation.percentage >= 100
                      ? 'bg-emerald-500'
                      : selectedKpiCalculation.status === 'ACHIEVED'
                      ? 'bg-[#0072CE]'
                      : selectedKpiCalculation.status === 'WARNING'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, selectedKpiCalculation.percentage))}%` }}
                />
              </div>
            </div>

            {/* Dự báo cuối kỳ */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <div className="text-slate-500 text-[11px]">Dự báo kết quả cuối kỳ:</div>
                <div className="font-bold text-slate-800 font-mono-num text-sm">
                  {formatNumberWithDots(selectedKpiCalculation.forecastEndPeriod)} {selectedKpi.unit}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500">Tỷ lệ dự kiến:</div>
                <div
                  className={`font-extrabold font-mono-num ${
                    selectedKpiCalculation.forecastPercentage >= 100
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {formatPercentage(selectedKpiCalculation.forecastPercentage)}
                </div>
              </div>
            </div>
          </div>

          {/* THỰC HIỆN GẦN NHẤT (Section XIV) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-[#0072CE]" />
                <span>THỰC HIỆN GẦN NHẤT</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {recentEntries.length} ngày gần nhất
              </span>
            </div>

            {recentEntries.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có phát sinh số liệu trong những ngày gần đây
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#0072CE]" />
                      <span className="font-semibold text-slate-700">
                        {formatDateVN(entry.date)}:
                      </span>
                    </div>
                    <div className="font-mono-num font-extrabold text-sm text-slate-900">
                      {entry.value === 0 ? (
                        <span className="text-slate-400 font-normal italic">0 (Không phát sinh)</span>
                      ) : (
                        `${formatNumberWithDots(entry.value)} ${selectedKpi.unit}`
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Button: CHỌN CHỈ TIÊU KHÁC */}
          <div className="pt-2">
            <button
              onClick={() => setSelectedKpiId(null)}
              className="w-full py-3.5 px-4 rounded-xl bg-[#003B70] text-white font-bold text-sm shadow-md hover:bg-[#002B52] active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← CHỌN CHỈ TIÊU KHÁC</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
