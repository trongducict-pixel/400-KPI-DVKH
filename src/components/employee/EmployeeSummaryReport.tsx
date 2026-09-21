import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileSpreadsheet,
  HelpCircle,
  Info,
  Layers,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { computeKpiProgress, getDailyValue, getTimeProgressRate } from '../../utils/calculations';
import {
  formatDateVN,
  formatKpiValue,
  formatNumberWithDots,
  formatPercentage,
} from '../../utils/formatters';

export const EmployeeSummaryReport: React.FC<{ onBackToEntry?: () => void }> = ({
  onBackToEntry,
}) => {
  const { currentUser, selectedDate, kpis, targets, dailyEntries } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'ACHIEVED' | 'WARNING' | 'SLOW'>('ALL');

  const activeKpis = kpis.filter((k) => k.status === 'ACTIVE').sort((a, b) => a.order - b.order);
  const selectedYear = new Date(selectedDate).getFullYear();
  const { rate: timeProgressRate } = getTimeProgressRate(selectedDate);

  // Progress computations for each KPI
  const progressList = activeKpis.map((kpi) => {
    const tgt = targets.find((t) => t.userId === currentUser.id && t.kpiId === kpi.id && t.year === selectedYear)?.targetValue || 0;
    const progress = computeKpiProgress(
      kpi,
      tgt,
      dailyEntries,
      currentUser.id,
      selectedDate
    );
    const todayActual = getDailyValue(dailyEntries, currentUser.id, kpi.id, selectedDate);
    return {
      kpi,
      progress,
      todayActual,
    };
  });

  const totalTargetCount = progressList.filter((p) => p.progress.target > 0).length;
  const averagePercentage =
    totalTargetCount > 0
      ? progressList.reduce((acc, curr) => acc + (curr.progress.target > 0 ? curr.progress.percentage : 0), 0) / totalTargetCount
      : 0;

  const achievedCount = progressList.filter((p) => p.progress.status === 'ACHIEVED').length;
  const warningCount = progressList.filter((p) => p.progress.status === 'WARNING').length;
  const slowCount = progressList.filter((p) => p.progress.status === 'SLOW').length;

  const filteredList = progressList.filter((item) => {
    if (filterType === 'ACHIEVED') return item.progress.status === 'ACHIEVED';
    if (filterType === 'WARNING') return item.progress.status === 'WARNING';
    if (filterType === 'SLOW') return item.progress.status === 'SLOW';
    return true;
  });

  return (
    <div className="space-y-4 pb-24 pt-2 px-3 sm:px-6 max-w-4xl mx-auto animate-in fade-in">
      {/* Header card */}
      <div className="bg-gradient-to-br from-[#00274B] via-[#003B70] to-[#005FA8] rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-blue-100 uppercase tracking-wider">
                BÁO CÁO TỔNG HỢP SỐ LIỆU
              </span>
              <span className="text-xs text-blue-200">{formatDateVN(selectedDate)}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              BÁO CÁO TIẾN ĐỘ THỰC HIỆN KPI CÁ NHÂN
            </h1>
            <p className="text-xs text-blue-100/90 mt-0.5">
              Cán bộ: <span className="font-bold text-white">{currentUser.fullName}</span> ({currentUser.username}) • {currentUser.title}
            </p>
          </div>

          {onBackToEntry && (
            <button
              onClick={onBackToEntry}
              className="px-3.5 py-2 rounded-xl bg-white text-[#003B70] hover:bg-blue-50 text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>← Báo cáo số liệu hàng ngày</span>
            </button>
          )}
        </div>

        {/* Aggregate Metas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-white/15">
          <div className="bg-white/10 rounded-xl p-2.5">
            <div className="text-[10px] text-blue-200">Tiến độ thời gian</div>
            <div className="text-base font-bold text-amber-300 font-mono-num mt-0.5">
              {timeProgressRate}%
            </div>
            <div className="text-[10px] text-blue-100/70">Kỳ năm {selectedYear}</div>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5">
            <div className="text-[10px] text-blue-200">Hoàn thành bình quân</div>
            <div className="text-base font-bold text-emerald-300 font-mono-num mt-0.5">
              {formatPercentage(averagePercentage)}
            </div>
            <div className="text-[10px] text-blue-100/70">
              {averagePercentage >= timeProgressRate ? '🟢 Vượt tiến độ' : '🟡 Chậm tiến độ'}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5">
            <div className="text-[10px] text-blue-200">Chỉ tiêu đạt chuẩn</div>
            <div className="text-base font-bold text-white font-mono-num mt-0.5">
              {achievedCount} / {activeKpis.length}
            </div>
            <div className="text-[10px] text-emerald-300">Đạt ≥ {timeProgressRate}%</div>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5">
            <div className="text-[10px] text-blue-200">Cần tăng tốc</div>
            <div className="text-base font-bold text-amber-300 font-mono-num mt-0.5">
              {warningCount + slowCount} chỉ tiêu
            </div>
            <div className="text-[10px] text-rose-300">{slowCount} chỉ tiêu chậm</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            filterType === 'ALL'
              ? 'bg-[#003B70] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Tất cả 8 chỉ tiêu ({activeKpis.length})
        </button>
        <button
          onClick={() => setFilterType('ACHIEVED')}
          className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            filterType === 'ACHIEVED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-slate-200'
          }`}
        >
          Đạt tiến độ ({achievedCount})
        </button>
        <button
          onClick={() => setFilterType('WARNING')}
          className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            filterType === 'WARNING'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-slate-200'
          }`}
        >
          Cần theo dõi ({warningCount})
        </button>
        <button
          onClick={() => setFilterType('SLOW')}
          className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            filterType === 'SLOW'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-slate-200'
          }`}
        >
          Chậm tiến độ ({slowCount})
        </button>
      </div>

      {/* KPI Progress Cards */}
      <div className="space-y-3">
        {filteredList.map(({ kpi, progress, todayActual }) => {
          const isAchieved = progress.status === 'ACHIEVED';
          const isWarning = progress.status === 'WARNING';
          const isSlow = progress.status === 'SLOW';

          return (
            <div
              key={kpi.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-blue-200 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {kpi.code}
                    </span>
                    <span className="text-xs text-slate-400">Đơn vị: {kpi.unit}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{kpi.name}</h3>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAchieved
                        ? 'bg-emerald-100 text-emerald-800'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isAchieved
                      ? '🟢 Đạt tiến độ'
                      : isWarning
                      ? '🟡 Cần theo dõi'
                      : '🔴 Chậm tiến độ'}
                  </span>
                  <div className="text-base font-extrabold text-slate-900 font-mono-num mt-0.5">
                    {formatPercentage(progress.percentage)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isAchieved
                        ? 'bg-emerald-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  />
                  {/* Time progress indicator line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-700 z-10"
                    style={{ left: `${Math.min(timeProgressRate, 100)}%` }}
                    title={`Tiến độ thời gian: ${timeProgressRate}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Thực hiện: {formatNumberWithDots(progress.cumulativeValue)} {kpi.unit}</span>
                  <span className="font-semibold text-slate-700">Kế hoạch: {formatNumberWithDots(progress.target)} {kpi.unit}</span>
                </div>
              </div>

              {/* Data Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[10px] text-slate-500">Phát sinh hôm nay</div>
                  <div className="text-xs font-bold text-[#003B70] font-mono-num mt-0.5">
                    {todayActual > 0
                      ? `+${formatNumberWithDots(todayActual)}`
                      : todayActual === 0
                      ? '0 (Không phát sinh)'
                      : 'Chưa cập nhật'}
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[10px] text-slate-500">Lũy kế thực hiện</div>
                  <div className="text-xs font-bold text-slate-800 font-mono-num mt-0.5">
                    {formatNumberWithDots(progress.cumulativeValue)}
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[10px] text-slate-500">Còn thiếu để đạt 100%</div>
                  <div className="text-xs font-bold text-rose-600 font-mono-num mt-0.5">
                    {progress.remaining > 0 ? formatNumberWithDots(progress.remaining) : '✓ Đã hoàn thành'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
