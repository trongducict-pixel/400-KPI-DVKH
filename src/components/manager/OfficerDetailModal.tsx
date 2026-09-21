import React from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  TrendingDown,
  TrendingUp,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { computeKpiProgress, getTimeProgressRate } from '../../utils/calculations';
import { formatDateVN, formatKpiValue, formatNumberWithDots, formatPercentage } from '../../utils/formatters';

interface OfficerDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficerDetailModal: React.FC<OfficerDetailModalProps> = ({ user, isOpen, onClose }) => {
  const { selectedDate, kpis, targets, dailyEntries } = useApp();

  if (!isOpen || !user) return null;

  const activeKpis = kpis.filter(k => k.status === 'ACTIVE').sort((a, b) => a.order - b.order);
  const { rate: timeProgressRate } = getTimeProgressRate(selectedDate);

  const kpiProgressList = activeKpis.map(kpi => {
    const tgt = targets.find(t => t.userId === user.id && t.kpiId === kpi.id && t.year === 2026)?.targetValue || 0;
    return computeKpiProgress(kpi, tgt, dailyEntries, user.id, selectedDate);
  });

  // Calculate overall completion rate
  const validTargets = kpiProgressList.filter(p => p.target > 0);
  const overallRate = validTargets.length > 0
    ? validTargets.reduce((acc, p) => acc + p.percentage, 0) / validTargets.length
    : 0;

  const hasUpdatedToday = dailyEntries.some(e => e.userId === user.id && e.date === selectedDate);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#003B70] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/40 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white">{user.fullName}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-100 font-medium">
                  {user.title}
                </span>
              </div>
              <p className="text-xs text-blue-200">{user.email} • {user.phone || '0912.xxx.xxx'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Status Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="text-xs text-slate-500">
              Ngày xem: <strong className="text-slate-800">{formatDateVN(selectedDate)}</strong>
            </div>
            <div className="text-xs">
              Trạng thái hôm nay:{' '}
              {hasUpdatedToday ? (
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  🟢 Đã cập nhật
                </span>
              ) : (
                <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  🔴 Chưa cập nhật
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 font-medium">KPI tổng thể:</span>
            <span className={`text-base font-extrabold font-mono-num px-2.5 py-0.5 rounded-lg ${
              overallRate >= timeProgressRate
                ? 'bg-emerald-100 text-emerald-800'
                : overallRate >= timeProgressRate - 15
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {formatPercentage(overallRate)}
            </span>
          </div>
        </div>

        {/* Scrollable KPI Progress List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Chi tiết tiến độ từng chỉ tiêu
          </h4>

          <div className="space-y-3">
            {kpiProgressList.map(item => {
              const { kpi, target, cumulativeValue, percentage, remaining, forecastEndPeriod, forecastPercentage, status, todayValue } = item;

              let statusConfig = {
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                text: '🟢 Có khả năng hoàn thành',
              };
              if (status === 'WARNING') {
                statusConfig = {
                  badge: 'bg-amber-50 text-amber-700 border-amber-200',
                  text: '🟡 Cần theo dõi tiến độ',
                };
              } else if (status === 'SLOW') {
                statusConfig = {
                  badge: 'bg-red-50 text-red-700 border-red-200',
                  text: '🔴 Có nguy cơ không hoàn thành',
                };
              }

              return (
                <div key={kpi.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono-num font-bold text-slate-400">{kpi.code}</span>
                        <span className="text-sm font-bold text-slate-900">{kpi.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Đơn vị: <strong className="text-slate-700">{kpi.unit}</strong>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig.badge}`}>
                      {statusConfig.text}
                    </span>
                  </div>

                  {/* Grid 4 Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-500">Mức KPI giao</div>
                      <div className="font-mono-num font-bold text-slate-800 truncate" title={formatKpiValue(target, kpi.unit)}>
                        {formatKpiValue(target, kpi.unit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Lũy kế thực hiện</div>
                      <div className="font-mono-num font-bold text-[#003B70] truncate" title={formatKpiValue(cumulativeValue, kpi.unit)}>
                        {formatKpiValue(cumulativeValue, kpi.unit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Hoàn thành / Thiếu</div>
                      <div className="font-mono-num font-bold text-emerald-700">
                        {formatPercentage(percentage)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">(-{formatNumberWithDots(remaining)})</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Dự báo cuối kỳ</div>
                      <div className="font-mono-num font-bold text-blue-800 truncate">
                        {formatNumberWithDots(forecastEndPeriod)} ({formatPercentage(forecastPercentage, 0)})
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Thực hiện hôm nay: <strong className="font-mono-num text-slate-700">{formatKpiValue(todayValue, kpi.unit)}</strong></span>
                      <span>Mục tiêu kỳ: 100%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          status === 'ACHIEVED' ? 'bg-emerald-500' : status === 'WARNING' ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#003B70] text-white text-xs font-bold hover:bg-[#002D56] shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
