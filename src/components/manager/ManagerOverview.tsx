import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  Filter,
  Lock,
  Search,
  TrendingDown,
  TrendingUp,
  Unlock,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  calculateCumulative,
  calculateDepartmentCumulative,
  computeKpiProgress,
  getTimeProgressRate,
} from '../../utils/calculations';
import {
  formatDateVN,
  formatKpiValue,
  formatNumberWithDots,
  formatPercentage,
} from '../../utils/formatters';
import { OfficerDetailModal } from './OfficerDetailModal';

export const ManagerOverview: React.FC = () => {
  const {
    selectedDate,
    users,
    kpis,
    targets,
    dailyEntries,
    dayLocks,
    toggleLockDay,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOfficerModal, setSelectedOfficerModal] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPDATED' | 'NOT_UPDATED' | 'SLOW'>('ALL');
  const [kpiFilter, setKpiFilter] = useState<string>('ALL');

  const isLocked = !!dayLocks[selectedDate]?.isLocked;
  const staffUsers = users.filter(u => u.role === 'NHAN_VIEN');
  const activeKpis = kpis.filter(k => k.status === 'ACTIVE').sort((a, b) => a.order - b.order);

  const { rate: timeProgressRate } = getTimeProgressRate(selectedDate);

  // 1. Tình hình cập nhật hôm nay (Who updated today?)
  const updateStatus = useMemo(() => {
    const updatedUsers: User[] = [];
    const notUpdatedUsers: User[] = [];

    staffUsers.forEach(u => {
      const hasToday = dailyEntries.some(e => e.userId === u.id && e.date === selectedDate);
      if (hasToday) {
        updatedUsers.push(u);
      } else {
        notUpdatedUsers.push(u);
      }
    });

    return {
      updatedCount: updatedUsers.length,
      notUpdatedCount: notUpdatedUsers.length,
      totalCount: staffUsers.length,
      updatedUsers,
      notUpdatedUsers,
    };
  }, [staffUsers, dailyEntries, selectedDate]);

  // 2. Department-level cumulative for each KPI
  const departmentKpis = useMemo(() => {
    return activeKpis.map(kpi => {
      // Total target across department
      const totalTarget = targets
        .filter(t => t.kpiId === kpi.id && t.year === 2026 && staffUsers.some(u => u.id === t.userId))
        .reduce((sum, t) => sum + t.targetValue, 0);

      const totalCumulative = calculateDepartmentCumulative(dailyEntries, kpi.id, selectedDate);
      const totalToday = dailyEntries
        .filter(e => e.kpiId === kpi.id && e.date === selectedDate)
        .reduce((sum, e) => sum + e.value, 0);

      const percentage = totalTarget > 0 ? (totalCumulative / totalTarget) * 100 : 0;
      const remaining = Math.max(0, totalTarget - totalCumulative);

      let status: 'ACHIEVED' | 'WARNING' | 'SLOW' = 'SLOW';
      if (percentage >= timeProgressRate) {
        status = 'ACHIEVED';
      } else if (percentage >= timeProgressRate - 15) {
        status = 'WARNING';
      } else {
        status = 'SLOW';
      }

      return {
        kpi,
        target: totalTarget,
        cumulative: totalCumulative,
        today: totalToday,
        percentage,
        remaining,
        status,
      };
    });
  }, [activeKpis, targets, dailyEntries, selectedDate, staffUsers, timeProgressRate]);

  // Overall Department Completion Rate
  const totalDepartmentRate = useMemo(() => {
    const valid = departmentKpis.filter(d => d.target > 0);
    return valid.length > 0 ? valid.reduce((sum, d) => sum + d.percentage, 0) / valid.length : 0;
  }, [departmentKpis]);

  const kpiAchievedCount = departmentKpis.filter(k => k.status === 'ACHIEVED').length;
  const kpiWarningCount = departmentKpis.filter(k => k.status === 'WARNING').length;
  const kpiSlowCount = departmentKpis.filter(k => k.status === 'SLOW').length;

  // 3. Officers performance breakdown
  const officersProgress = useMemo(() => {
    return staffUsers.map(user => {
      const hasUpdatedToday = dailyEntries.some(e => e.userId === user.id && e.date === selectedDate);

      const calculations = activeKpis.map(kpi => {
        const tgt = targets.find(t => t.userId === user.id && t.kpiId === kpi.id && t.year === 2026)?.targetValue || 0;
        return computeKpiProgress(kpi, tgt, dailyEntries, user.id, selectedDate);
      });

      const validTgts = calculations.filter(c => c.target > 0);
      const overall = validTgts.length > 0
        ? validTgts.reduce((sum, c) => sum + c.percentage, 0) / validTgts.length
        : 0;

      // Find any critical slow KPIs for this officer
      const slowKpis = calculations.filter(c => c.status === 'SLOW' && c.target > 0);
      const warningKpis = calculations.filter(c => c.status === 'WARNING' && c.target > 0);

      return {
        user,
        hasUpdatedToday,
        overallPercentage: overall,
        calculations,
        slowKpis,
        warningKpis,
      };
    });
  }, [staffUsers, activeKpis, targets, dailyEntries, selectedDate]);

  // Critical officers needing attention (slow progress or slow in key KPI)
  const officersNeedingAttention = useMemo(() => {
    return officersProgress.filter(
      op => op.overallPercentage < timeProgressRate - 10 || op.slowKpis.length > 0 || !op.hasUpdatedToday
    );
  }, [officersProgress, timeProgressRate]);

  // Filtered officers list for bottom table
  const filteredOfficers = useMemo(() => {
    return officersProgress.filter(op => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = op.user.fullName.toLowerCase().includes(q) || op.user.username.toLowerCase().includes(q);
        if (!matchName) return false;
      }
      if (statusFilter === 'UPDATED' && !op.hasUpdatedToday) return false;
      if (statusFilter === 'NOT_UPDATED' && op.hasUpdatedToday) return false;
      if (statusFilter === 'SLOW' && op.overallPercentage >= timeProgressRate - 10) return false;

      return true;
    });
  }, [officersProgress, searchQuery, statusFilter, timeProgressRate]);

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-4 animate-in fade-in duration-150">
      {/* 5 Core Questions Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#003B70] text-white uppercase tracking-wider">
                LÃNH ĐẠO PHÒNG
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Ngày {formatDateVN(selectedDate)}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#003B70] mt-0.5">
              DASHBOARD PHÒNG DVKH
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleLockDay(selectedDate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                isLocked
                  ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isLocked ? '🔒 Đã chốt số liệu ngày' : 'Mở nhập - Bấm chốt ngày'}</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="px-3 py-1.5 rounded-xl bg-[#003B70] text-white text-xs font-bold hover:bg-[#002D56] shadow-sm flex items-center space-x-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Báo cáo Giám đốc</span>
            </button>
          </div>
        </div>

        {/* 5 Questions Quick-Answer Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Question 1: Đã cập nhật đủ chưa? */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-between">
              <span>1. TÌNH HÌNH CẬP NHẬT</span>
              <span className="text-[10px] text-slate-400">Hôm nay</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <div className="font-mono-num text-2xl font-black text-[#003B70]">
                {updateStatus.updatedCount}/{updateStatus.totalCount}
              </div>
              <span className="text-xs text-slate-600 font-medium">cán bộ</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] pt-1">
              <span className="text-emerald-700 font-semibold">
                ✓ Đã cập nhật: {updateStatus.updatedCount}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-red-600 font-semibold">
                ✗ Chưa: {updateStatus.notUpdatedCount}
              </span>
            </div>
          </div>

          {/* Question 2: Tổng thể phòng đạt bao nhiêu % KPI? */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-between">
              <span>2. TIẾN ĐỘ TOÀN PHÒNG</span>
              <span className="text-[10px] text-amber-700 font-semibold">Kỳ: {timeProgressRate}%</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <div className="font-mono-num text-2xl font-black text-emerald-700">
                {formatPercentage(totalDepartmentRate)}
              </div>
              <span className="text-xs text-slate-500 font-normal">mục tiêu kỳ</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${Math.min(100, totalDepartmentRate)}%` }}
              />
            </div>
          </div>

          {/* Question 4: Các chỉ tiêu đạt / chậm? */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-between">
              <span>4. TIẾN ĐỘ CHỈ TIÊU</span>
              <span className="text-[10px] text-slate-400">{activeKpis.length} chỉ tiêu</span>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              <div className="flex items-center space-x-1 text-xs font-bold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>{kpiAchievedCount} đạt</span>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>{kpiWarningCount} theo dõi</span>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-red-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>{kpiSlowCount} chậm</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              {kpiSlowCount > 0 ? '⚠️ Cần đôn đốc các chỉ tiêu chậm' : '🟢 Toàn phòng duy trì nhịp tốt'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: CÁN BỘ CẦN QUAN TÂM (Priority Action Alert) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-bold uppercase text-red-700 tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>CÁN BỘ CẦN QUAN TÂM ({officersNeedingAttention.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            Phát hiện cán bộ chậm tiến độ hoặc chưa cập nhật
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {officersNeedingAttention.map(({ user, overallPercentage, slowKpis, hasUpdatedToday }) => {
            const firstSlow = slowKpis[0];

            return (
              <div
                key={user.id}
                className="bg-white rounded-xl p-3.5 border-l-4 border-l-red-500 border border-slate-200 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-red-600">🔴</span>
                        <span>{user.fullName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{user.title}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedOfficerModal(user)}
                    className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold transition-colors flex items-center space-x-1"
                  >
                    <span>XEM CHI TIẾT</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Specific Attention Reason */}
                <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100 text-xs space-y-1">
                  {!hasUpdatedToday && (
                    <div className="text-red-700 font-medium flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Chưa hoàn thành nhập số liệu ngày hôm nay</span>
                    </div>
                  )}

                  {firstSlow && (
                    <div className="text-slate-700">
                      <span className="font-bold text-[#003B70]">{firstSlow.kpi.name}: </span>
                      <strong className="text-red-700 font-mono-num">{formatPercentage(firstSlow.percentage)}</strong>
                      {' • '}
                      <span>Còn thiếu: </span>
                      <strong className="font-mono-num text-slate-900">{formatKpiValue(firstSlow.remaining, firstSlow.kpi.unit)}</strong>
                      <div className="text-[11px] text-red-600 font-medium mt-0.5">
                        Dự báo: Có nguy cơ không hoàn thành nếu giữ nhịp hiện tại
                      </div>
                    </div>
                  )}

                  {!firstSlow && hasUpdatedToday && (
                    <div className="text-amber-700 text-[11px]">
                      KPI tổng thể đang ở mức {formatPercentage(overallPercentage)}, thấp hơn tiến độ thời gian.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4 & 5: CHI TIẾT CHỈ TIÊU TOÀN PHÒNG & BẢNG CÁN BỘ */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-800 tracking-wider">
            DANH SÁCH CÁN BỘ PHÒNG DVKH ({filteredOfficers.length})
          </h3>

          {/* Search and Filters */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Tìm cán bộ (ví dụ: Nguyễn Văn A)..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả cán bộ</option>
              <option value="UPDATED">Đã cập nhật hôm nay</option>
              <option value="NOT_UPDATED">Chưa cập nhật hôm nay</option>
              <option value="SLOW">Đang chậm tiến độ</option>
            </select>
          </div>
        </div>

        {/* Officers Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredOfficers.map(({ user, hasUpdatedToday, overallPercentage, calculations }) => {
            const isAhead = overallPercentage >= timeProgressRate;

            return (
              <div
                key={user.id}
                onClick={() => setSelectedOfficerModal(user)}
                className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-[#0072CE] hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#003B70] transition-colors flex items-center gap-1.5">
                        <span>{user.fullName}</span>
                      </h4>
                      <div className="text-[11px] text-slate-500">{user.title}</div>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="text-[10px] text-slate-400">KPI tổng thể</div>
                    <div className={`font-mono-num text-base font-extrabold ${
                      isAhead ? 'text-emerald-700' : overallPercentage >= timeProgressRate - 15 ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {formatPercentage(overallPercentage)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isAhead ? 'bg-emerald-500' : overallPercentage >= timeProgressRate - 15 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, overallPercentage)}%` }}
                  />
                </div>

                {/* Micro preview of 3 key KPIs */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] text-slate-600 border-t border-slate-100">
                  {calculations.slice(0, 3).map(c => (
                    <div key={c.kpi.id} className="truncate">
                      <div className="text-[10px] text-slate-400 truncate">{c.kpi.name}</div>
                      <div className="font-mono-num font-bold text-slate-800">
                        {formatPercentage(c.percentage, 0)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className={hasUpdatedToday ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                    {hasUpdatedToday ? '🟢 Đã cập nhật hôm nay' : '🔴 Chưa cập nhật hôm nay'}
                  </span>

                  <span className="text-[#0072CE] font-semibold group-hover:underline flex items-center space-x-0.5">
                    <span>Xem Dashboard</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Officer Detail Drilldown Modal */}
      <OfficerDetailModal
        user={selectedOfficerModal}
        isOpen={!!selectedOfficerModal}
        onClose={() => setSelectedOfficerModal(null)}
      />
    </div>
  );
};
