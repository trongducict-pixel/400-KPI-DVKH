import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  Filter,
  Globe,
  PiggyBank,
  Search,
  Shield,
  Smartphone,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KpiMaster, User as UserType } from '../../types';
import {
  calculateDepartmentCumulative,
  computeKpiProgress,
  getTimeProgressRate,
} from '../../utils/calculations';
import {
  formatCompactVND,
  formatDateVN,
  formatKpiValue,
  formatNumberWithDots,
  formatPercentage,
} from '../../utils/formatters';

interface ManagerKpiLookupProps {
  onBackToHome: () => void;
}

type LookupMode = 'MENU' | 'BY_OFFICER' | 'BY_KPI' | 'DEPARTMENT_SUMMARY';

export const ManagerKpiLookup: React.FC<ManagerKpiLookupProps> = ({ onBackToHome }) => {
  const { users, kpis, targets, dailyEntries, selectedDate } = useApp();

  const [mode, setMode] = useState<LookupMode>('MENU');
  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'>('YEAR');

  // By Officer states
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);
  const [officerSearch, setOfficerSearch] = useState('');
  const [officerKpiDeepDiveId, setOfficerKpiDeepDiveId] = useState<string | null>(null);

  // By KPI states
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);
  const [kpiSortBy, setKpiSortBy] = useState<'PERCENT' | 'VALUE' | 'NAME'>('PERCENT');

  const staffUsers = useMemo(() => users.filter((u) => u.role === 'NHAN_VIEN'), [users]);
  const activeKpis = useMemo(
    () => kpis.filter((k) => k.status === 'ACTIVE').sort((a, b) => a.order - b.order),
    [kpis]
  );
  const selectedYear = new Date(selectedDate).getFullYear();
  const { rate: timeProgressRate } = getTimeProgressRate(selectedDate);

  // Helper: Overall percentage for a user
  const getUserStats = (user: UserType) => {
    const userCalcs = activeKpis.map((kpi) => {
      const tgt =
        targets.find((t) => t.userId === user.id && t.kpiId === kpi.id && t.year === selectedYear)
          ?.targetValue || 0;
      return computeKpiProgress(kpi, tgt, dailyEntries, user.id, selectedDate);
    });

    const targetedCalcs = userCalcs.filter((c) => c.target > 0);
    const avgPercent =
      targetedCalcs.length > 0
        ? targetedCalcs.reduce((acc, c) => acc + c.percentage, 0) / targetedCalcs.length
        : 0;

    const hasUpdatedToday = dailyEntries.some(
      (e) => e.userId === user.id && e.date === selectedDate
    );

    let status: 'ACHIEVED' | 'WARNING' | 'SLOW' = 'SLOW';
    if (avgPercent >= timeProgressRate) {
      status = 'ACHIEVED';
    } else if (avgPercent >= timeProgressRate * 0.8) {
      status = 'WARNING';
    }

    return {
      avgPercent,
      hasUpdatedToday,
      status,
      calcs: userCalcs,
    };
  };

  // 1. Calculations for Department Summary (Section XXII)
  const departmentSummary = useMemo(() => {
    const kpiSummaries = activeKpis.map((kpi) => {
      const totalTarget = targets
        .filter((t) => t.kpiId === kpi.id && t.year === selectedYear && staffUsers.some((u) => u.id === t.userId))
        .reduce((sum, t) => sum + t.targetValue, 0);

      const cumulative = calculateDepartmentCumulative(dailyEntries, kpi.id, selectedDate);
      const percentage = totalTarget > 0 ? (cumulative / totalTarget) * 100 : 0;
      const remaining = Math.max(0, totalTarget - cumulative);

      let status: 'ACHIEVED' | 'WARNING' | 'SLOW' = 'SLOW';
      if (percentage >= timeProgressRate) {
        status = 'ACHIEVED';
      } else if (percentage >= timeProgressRate * 0.8) {
        status = 'WARNING';
      }

      return {
        kpi,
        totalTarget,
        cumulative,
        percentage,
        remaining,
        status,
      };
    });

    // Staff situation
    let achievedCount = 0;
    let warningCount = 0;
    let slowCount = 0;
    let notUpdatedCount = 0;

    staffUsers.forEach((u) => {
      const stats = getUserStats(u);
      if (!stats.hasUpdatedToday) {
        notUpdatedCount++;
      }
      if (stats.status === 'ACHIEVED') achievedCount++;
      else if (stats.status === 'WARNING') warningCount++;
      else slowCount++;
    });

    return {
      kpiSummaries,
      achievedCount,
      warningCount,
      slowCount,
      notUpdatedCount,
    };
  }, [activeKpis, targets, staffUsers, dailyEntries, selectedDate, selectedYear, timeProgressRate]);

  // Selected officer object
  const selectedOfficer = staffUsers.find((u) => u.id === selectedOfficerId);
  const selectedOfficerStats = selectedOfficer ? getUserStats(selectedOfficer) : null;

  // Selected KPI object
  const selectedKpiObj = activeKpis.find((k) => k.id === selectedKpiId);
  const selectedKpiSummary = departmentSummary.kpiSummaries.find(
    (s) => s.kpi.id === selectedKpiId
  );

  // Staff breakdown for selected KPI
  const kpiStaffBreakdown = useMemo(() => {
    if (!selectedKpiObj) return [];
    const list = staffUsers.map((u) => {
      const tgt =
        targets.find(
          (t) => t.userId === u.id && t.kpiId === selectedKpiObj.id && t.year === selectedYear
        )?.targetValue || 0;
      const progress = computeKpiProgress(
        selectedKpiObj,
        tgt,
        dailyEntries,
        u.id,
        selectedDate
      );
      return {
        user: u,
        target: tgt,
        cumulative: progress.cumulativeValue,
        percentage: progress.percentage,
        status: progress.status,
      };
    });

    return list.sort((a, b) => {
      if (kpiSortBy === 'PERCENT') return b.percentage - a.percentage;
      if (kpiSortBy === 'VALUE') return b.cumulative - a.cumulative;
      return a.user.fullName.localeCompare(b.user.fullName);
    });
  }, [selectedKpiObj, staffUsers, targets, dailyEntries, selectedDate, selectedYear, kpiSortBy]);

  return (
    <div className="pb-28 pt-2 px-3 sm:px-6 max-w-lg mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Top Back / Header Navigation */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => {
            if (officerKpiDeepDiveId) {
              setOfficerKpiDeepDiveId(null);
            } else if (selectedOfficerId) {
              setSelectedOfficerId(null);
            } else if (selectedKpiId) {
              setSelectedKpiId(null);
            } else if (mode !== 'MENU') {
              setMode('MENU');
            } else {
              onBackToHome();
            }
          }}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#003B70] bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {officerKpiDeepDiveId
              ? 'Chi tiết cán bộ'
              : selectedOfficerId
              ? 'Danh sách cán bộ'
              : selectedKpiId
              ? 'Chọn chỉ tiêu'
              : mode !== 'MENU'
              ? 'Menu tra cứu'
              : 'Trang chủ'}
          </span>
        </button>

        <span className="text-xs font-medium text-slate-500">
          Ngày: <strong className="text-slate-800">{formatDateVN(selectedDate)}</strong>
        </span>
      </div>

      {/* ================= LEVEL 1: MENU 3 LỰA CHỌN (Section XVII) ================= */}
      {mode === 'MENU' && (
        <div className="space-y-4">
          <div className="text-center py-2">
            <h2 className="text-lg sm:text-xl font-black text-[#003B70] tracking-tight uppercase">
              TRA CỨU KẾT QUẢ KPI PHÒNG
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn phương thức tra cứu dữ liệu phù hợp
            </p>
          </div>

          <div className="space-y-3">
            {/* 1. THEO CÁN BỘ */}
            <button
              onClick={() => {
                setMode('BY_OFFICER');
                setSelectedOfficerId(null);
              }}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0072CE] hover:shadow-md transition-all active:scale-98 text-left shadow-xs flex items-center justify-between group cursor-pointer min-h-[90px]"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003B70] group-hover:bg-[#003B70] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 group-hover:text-[#003B70] transition-colors">
                    👤 THEO CÁN BỘ
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Xem kết quả KPI của từng cán bộ
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#003B70] transition-colors shrink-0" />
            </button>

            {/* 2. THEO CHỈ TIÊU */}
            <button
              onClick={() => {
                setMode('BY_KPI');
                setSelectedKpiId(null);
              }}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0072CE] hover:shadow-md transition-all active:scale-98 text-left shadow-xs flex items-center justify-between group cursor-pointer min-h-[90px]"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003B70] group-hover:bg-[#003B70] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 group-hover:text-[#003B70] transition-colors">
                    📊 THEO CHỈ TIÊU
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Xem kết quả từng KPI trong toàn phòng
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#003B70] transition-colors shrink-0" />
            </button>

            {/* 3. TỔNG HỢP TOÀN PHÒNG */}
            <button
              onClick={() => setMode('DEPARTMENT_SUMMARY')}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0072CE] hover:shadow-md transition-all active:scale-98 text-left shadow-xs flex items-center justify-between group cursor-pointer min-h-[90px]"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003B70] group-hover:bg-[#003B70] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 group-hover:text-[#003B70] transition-colors">
                    🏢 TỔNG HỢP TOÀN PHÒNG
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Xem kết quả tổng thể của Phòng DVKH
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#003B70] transition-colors shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* ================= LUỒNG 1: THEO CÁN BỘ (Sections XVIII & XIX) ================= */}
      {mode === 'BY_OFFICER' && !selectedOfficerId && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          <div className="text-center">
            <h2 className="text-lg font-black text-[#003B70] uppercase">
              👤 TRA CỨU THEO CÁN BỘ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn cán bộ để theo dõi tiến độ chi tiết
            </p>
          </div>

          {/* Time Filter Tabs (Section XXIII) */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-[11px] font-bold">
            {(['TODAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all whitespace-nowrap ${
                  timeFilter === t
                    ? 'bg-white text-[#003B70] shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'TODAY'
                  ? 'HÔM NAY'
                  : t === 'WEEK'
                  ? 'TUẦN NÀY'
                  : t === 'MONTH'
                  ? 'THÁNG NÀY'
                  : t === 'QUARTER'
                  ? 'QUÝ NÀY'
                  : 'NĂM'}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm cán bộ theo tên hoặc mã..."
              value={officerSearch}
              onChange={(e) => setOfficerSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0072CE] focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Officer Cards List (Section XVIII) */}
          <div className="space-y-2.5">
            {staffUsers
              .filter(
                (u) =>
                  u.fullName.toLowerCase().includes(officerSearch.toLowerCase()) ||
                  u.staffCode.toLowerCase().includes(officerSearch.toLowerCase())
              )
              .map((officer) => {
                const stats = getUserStats(officer);
                return (
                  <div
                    key={officer.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase">
                        {officer.fullName}
                      </h3>
                      <div className="text-xs text-slate-500">
                        KPI tổng thể:{' '}
                        <span className="font-mono-num font-bold text-slate-800">
                          {formatPercentage(stats.avgPercent)}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            stats.status === 'ACHIEVED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : stats.status === 'WARNING'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          <span>
                            {stats.status === 'ACHIEVED'
                              ? '🟢 Đạt tiến độ'
                              : stats.status === 'WARNING'
                              ? '🟡 Cần theo dõi'
                              : '🔴 Chậm tiến độ'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedOfficerId(officer.id)}
                      className="px-3 py-2 rounded-xl bg-[#003B70] text-white hover:bg-[#00274B] text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      XEM CHI TIẾT →
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* CHI TIẾT KPI CỦA 1 CÁN BỘ (Section XIX) */}
      {mode === 'BY_OFFICER' && selectedOfficer && selectedOfficerStats && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Header of officer */}
          <div className="bg-gradient-to-r from-[#003B70] to-[#005FA8] rounded-2xl p-4 text-white shadow-md">
            <div className="text-xs text-blue-200">CHI TIẾT KPI CÁN BỘ:</div>
            <h2 className="text-lg font-black uppercase text-white mt-0.5">
              {selectedOfficer.fullName}
            </h2>
            <div className="text-xs text-blue-100 mt-1">
              KPI tổng thể:{' '}
              <span className="font-extrabold text-white text-sm font-mono-num">
                {formatPercentage(selectedOfficerStats.avgPercent)}
              </span>{' '}
              • {selectedOfficer.title}
            </div>
          </div>

          {/* Deep dive of 1 specific KPI for this officer */}
          {officerKpiDeepDiveId ? (
            (() => {
              const deepKpi = activeKpis.find((k) => k.id === officerKpiDeepDiveId);
              const deepCalc = selectedOfficerStats.calcs.find(
                (c) => c.kpi.id === officerKpiDeepDiveId
              );
              if (!deepKpi || !deepCalc) return null;

              const recent = dailyEntries
                .filter((e) => e.userId === selectedOfficer.id && e.kpiId === deepKpi.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

              return (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#003B70] bg-blue-50 px-2 py-0.5 rounded">
                        {deepKpi.code}
                      </span>
                      <h3 className="text-base font-black text-[#003B70] mt-1">
                        {deepKpi.name}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      Đơn vị: {deepKpi.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-500 text-[10px]">KPI được giao:</span>
                      <div className="font-bold text-slate-800 font-mono-num">
                        {formatNumberWithDots(deepCalc.target)} {deepKpi.unit}
                      </div>
                    </div>
                    <div className="bg-blue-50/60 p-2.5 rounded-xl">
                      <span className="text-[#003B70] text-[10px]">Lũy kế thực hiện:</span>
                      <div className="font-extrabold text-[#003B70] font-mono-num">
                        {formatNumberWithDots(deepCalc.cumulativeValue)} {deepKpi.unit}
                      </div>
                    </div>
                    <div className="bg-emerald-50/60 p-2.5 rounded-xl">
                      <span className="text-emerald-800 text-[10px]">% hoàn thành:</span>
                      <div className="font-black text-emerald-700 font-mono-num">
                        {formatPercentage(deepCalc.percentage)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-500 text-[10px]">Còn thiếu:</span>
                      <div className="font-bold text-rose-600 font-mono-num">
                        {formatNumberWithDots(deepCalc.remaining)} {deepKpi.unit}
                      </div>
                    </div>
                  </div>

                  {/* Forecast */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <span className="text-slate-500">Dự báo kết quả cuối kỳ:</span>
                    <span className="font-mono-num font-bold text-slate-800">
                      {formatNumberWithDots(deepCalc.forecastEndPeriod)} ({formatPercentage(deepCalc.forecastPercentage)})
                    </span>
                  </div>

                  {/* Recent entries history */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-700 mb-2">Lịch sử thực hiện gần nhất:</div>
                    {recent.length === 0 ? (
                      <div className="text-xs text-slate-400 italic">Chưa có phát sinh</div>
                    ) : (
                      <div className="space-y-1.5 text-xs">
                        {recent.map((r) => (
                          <div key={r.id} className="flex justify-between">
                            <span className="text-slate-500">{formatDateVN(r.date)}:</span>
                            <span className="font-mono-num font-bold text-slate-800">
                              {r.value === 0 ? '0 (Không phát sinh)' : `${formatNumberWithDots(r.value)} ${deepKpi.unit}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setOfficerKpiDeepDiveId(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    ← Quay lại danh sách KPI của cán bộ
                  </button>
                </div>
              );
            })()
          ) : (
            /* List of KPI for this officer (Section XIX) */
            <div className="space-y-2.5">
              {selectedOfficerStats.calcs.map((calc) => (
                <div
                  key={calc.kpi.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 uppercase">
                      {calc.kpi.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-num text-sm font-extrabold text-[#003B70]">
                        {formatPercentage(calc.percentage)}
                      </span>
                      <span>
                        {calc.status === 'ACHIEVED' ? '🟢' : calc.status === 'WARNING' ? '🟡' : '🔴'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setOfficerKpiDeepDiveId(calc.kpi.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#003B70] hover:bg-blue-100 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    XEM →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= LUỒNG 2: THEO CHỈ TIÊU (Sections XX & XXI) ================= */}
      {mode === 'BY_KPI' && !selectedKpiId && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="text-center">
            <h2 className="text-lg font-black text-[#003B70] uppercase">
              📊 TRA CỨU THEO CHỈ TIÊU
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn KPI để xem tiến độ toàn phòng và danh sách cán bộ
            </p>
          </div>

          <div className="space-y-2.5">
            {activeKpis.map((kpi) => (
              <button
                key={kpi.id}
                onClick={() => setSelectedKpiId(kpi.id)}
                className="w-full bg-white border border-slate-200 hover:border-[#0072CE] hover:shadow-md active:scale-98 transition-all rounded-2xl p-4 flex items-center justify-between text-left group shadow-xs cursor-pointer min-h-[75px]"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003B70] group-hover:bg-[#003B70] group-hover:text-white transition-colors flex items-center justify-center font-bold font-mono shrink-0 text-xs">
                    {kpi.code}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 group-hover:text-[#003B70] transition-colors truncate">
                      {kpi.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Đơn vị: {kpi.unit}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#003B70] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CHI TIẾT KPI TOÀN PHÒNG (Section XXI) */}
      {mode === 'BY_KPI' && selectedKpiObj && selectedKpiSummary && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Department KPI Summary Box */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#003B70] bg-blue-50 px-2 py-0.5 rounded">
                  {selectedKpiObj.code}
                </span>
                <h2 className="text-lg font-black text-[#003B70] mt-1">
                  {selectedKpiObj.name}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Đơn vị: {selectedKpiObj.unit}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">KPI TOÀN PHÒNG:</span>
                <span className="font-mono-num font-bold text-slate-900">
                  {formatNumberWithDots(selectedKpiSummary.totalTarget)} {selectedKpiObj.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">LŨY KẾ TOÀN PHÒNG:</span>
                <span className="font-mono-num font-extrabold text-[#003B70]">
                  {formatNumberWithDots(selectedKpiSummary.cumulative)} {selectedKpiObj.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">HOÀN THÀNH:</span>
                <span className="font-mono-num font-black text-emerald-700 text-sm">
                  {formatPercentage(selectedKpiSummary.percentage)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">CÒN THIẾU:</span>
                <span className="font-mono-num font-bold text-rose-600">
                  {formatNumberWithDots(selectedKpiSummary.remaining)} {selectedKpiObj.unit}
                </span>
              </div>
            </div>
          </div>

          {/* CHI TIẾT THEO CÁN BỘ (Section XXI) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                CHI TIẾT THEO CÁN BỘ
              </h3>

              {/* Sort pills */}
              <div className="flex items-center space-x-1 text-[10px] font-bold">
                <button
                  onClick={() => setKpiSortBy('PERCENT')}
                  className={`px-2 py-1 rounded-lg ${
                    kpiSortBy === 'PERCENT' ? 'bg-[#003B70] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  % Đạt
                </button>
                <button
                  onClick={() => setKpiSortBy('VALUE')}
                  className={`px-2 py-1 rounded-lg ${
                    kpiSortBy === 'VALUE' ? 'bg-[#003B70] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Số thực hiện
                </button>
                <button
                  onClick={() => setKpiSortBy('NAME')}
                  className={`px-2 py-1 rounded-lg ${
                    kpiSortBy === 'NAME' ? 'bg-[#003B70] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Tên
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {kpiStaffBreakdown.map((item) => (
                <div
                  key={item.user.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{item.user.fullName}</div>
                    <div className="font-mono-num text-slate-500 mt-0.5">
                      {formatNumberWithDots(item.cumulative)} {selectedKpiObj.unit}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-mono-num font-extrabold text-[#003B70]">
                      {formatPercentage(item.percentage)}
                    </span>
                    <span>
                      {item.status === 'ACHIEVED' ? '🟢' : item.status === 'WARNING' ? '🟡' : '🔴'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedKpiId(null)}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer mt-2"
            >
              ← CHỌN CHỈ TIÊU KHÁC
            </button>
          </div>
        </div>
      )}

      {/* ================= LUỒNG 3: TỔNG HỢP TOÀN PHÒNG (Section XXII) ================= */}
      {mode === 'DEPARTMENT_SUMMARY' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="text-center">
            <h2 className="text-lg font-black text-[#003B70] uppercase">
              🏢 KẾT QUẢ PHÒNG DVKH
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ngày: <strong className="text-slate-800">{formatDateVN(selectedDate)}</strong>
            </p>
          </div>

          {/* Time filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-[11px] font-bold">
            {(['TODAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all whitespace-nowrap ${
                  timeFilter === t
                    ? 'bg-white text-[#003B70] shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'TODAY'
                  ? 'HÔM NAY'
                  : t === 'WEEK'
                  ? 'TUẦN NÀY'
                  : t === 'MONTH'
                  ? 'THÁNG NÀY'
                  : t === 'QUARTER'
                  ? 'QUÝ NÀY'
                  : 'NĂM'}
              </button>
            ))}
          </div>

          {/* TÌNH HÌNH CÁN BỘ (Card tóm tắt Section XXII) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              TÌNH HÌNH CÁN BỘ
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800 flex items-center justify-between">
                <span>🟢 Đạt tiến độ:</span>
                <strong className="font-mono-num">{departmentSummary.achievedCount}</strong>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl text-amber-800 flex items-center justify-between">
                <span>🟡 Cần theo dõi:</span>
                <strong className="font-mono-num">{departmentSummary.warningCount}</strong>
              </div>
              <div className="p-2 bg-red-50 rounded-xl text-red-800 flex items-center justify-between">
                <span>🔴 Chậm tiến độ:</span>
                <strong className="font-mono-num">{departmentSummary.slowCount}</strong>
              </div>
              <div className="p-2 bg-slate-100 rounded-xl text-slate-700 flex items-center justify-between">
                <span>⚪ Chưa cập nhật:</span>
                <strong className="font-mono-num">{departmentSummary.notUpdatedCount}</strong>
              </div>
            </div>
          </div>

          {/* Danh sách KPI tổng hợp (Section XXII) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 px-1">
              TIẾN ĐỘ TỪNG CHỈ TIÊU (Chạm để xem sâu)
            </h3>

            {departmentSummary.kpiSummaries.map((summary) => (
              <button
                key={summary.kpi.id}
                onClick={() => {
                  setMode('BY_KPI');
                  setSelectedKpiId(summary.kpi.id);
                }}
                className="w-full bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-[#0072CE] shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900 group-hover:text-[#003B70] uppercase">
                    {summary.kpi.name}
                  </div>
                  <div className="font-mono-num text-sm font-bold text-slate-700 mt-0.5">
                    {formatCompactVND(summary.cumulative, summary.kpi.unit)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono-num font-black text-emerald-700 text-sm">
                    {formatPercentage(summary.percentage)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#003B70]" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
