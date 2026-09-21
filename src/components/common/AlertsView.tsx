import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Send,
  ShieldAlert,
  TrendingDown,
  UserX,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { computeKpiProgress, getTimeProgressRate } from '../../utils/calculations';
import { formatDateVN, formatKpiValue, formatPercentage } from '../../utils/formatters';
import { OfficerDetailModal } from '../manager/OfficerDetailModal';

export const AlertsView: React.FC = () => {
  const { currentUser, selectedDate, users, kpis, targets, dailyEntries } = useApp();
  const [selectedUserModal, setSelectedUserModal] = useState<User | null>(null);
  const [remindedUsers, setRemindedUsers] = useState<Record<string, boolean>>({});

  const isStaff = currentUser.role === 'NHAN_VIEN';
  const staffUsers = users.filter(u => u.role === 'NHAN_VIEN');
  const activeKpis = kpis.filter(k => k.status === 'ACTIVE');
  const { rate: timeProgressRate } = getTimeProgressRate(selectedDate);

  // Relevant users for alerts
  const targetUsers = isStaff ? staffUsers.filter(u => u.id === currentUser.id) : staffUsers;

  // 1. Un-updated alerts
  const unupdatedAlerts = targetUsers.filter(u => {
    return !dailyEntries.some(e => e.userId === u.id && e.date === selectedDate);
  }).map(u => ({
    id: `unupdated_${u.id}`,
    user: u,
    type: 'UNUPDATED' as const,
    title: `Chưa cập nhật số liệu ngày ${formatDateVN(selectedDate)}`,
    desc: `Cán bộ ${u.fullName} chưa hoàn tất nhập số liệu ngày hôm nay.`,
    severity: 'HIGH' as const,
  }));

  // 2. Slow KPI progress alerts
  const slowKpiAlerts: Array<{
    id: string;
    user: User;
    type: 'SLOW';
    title: string;
    desc: string;
    kpiName: string;
    percentage: number;
    severity: 'MEDIUM' | 'HIGH';
  }> = [];

  targetUsers.forEach(u => {
    activeKpis.forEach(k => {
      const tgt = targets.find(t => t.userId === u.id && t.kpiId === k.id && t.year === 2026)?.targetValue || 0;
      if (tgt <= 0) return;

      const calc = computeKpiProgress(k, tgt, dailyEntries, u.id, selectedDate);
      if (calc.status === 'SLOW') {
        slowKpiAlerts.push({
          id: `slow_${u.id}_${k.id}`,
          user: u,
          type: 'SLOW',
          title: `Chậm tiến độ chỉ tiêu ${k.name}`,
          desc: `Chỉ tiêu ${k.name} của cán bộ ${u.fullName} đang đạt ${formatPercentage(calc.percentage)}, chậm hơn nhiều so với tiến độ thời gian (${timeProgressRate}%). Còn thiếu ${formatKpiValue(calc.remaining, k.unit)}.`,
          kpiName: k.name,
          percentage: calc.percentage,
          severity: calc.percentage < timeProgressRate - 20 ? 'HIGH' : 'MEDIUM',
        });
      }
    });
  });

  // 3. At-risk forecast alerts
  const atRiskAlerts: Array<{
    id: string;
    user: User;
    type: 'RISK';
    title: string;
    desc: string;
    severity: 'HIGH';
  }> = [];

  targetUsers.forEach(u => {
    activeKpis.forEach(k => {
      const tgt = targets.find(t => t.userId === u.id && t.kpiId === k.id && t.year === 2026)?.targetValue || 0;
      if (tgt <= 0) return;

      const calc = computeKpiProgress(k, tgt, dailyEntries, u.id, selectedDate);
      if (calc.forecastPercentage < 85 && calc.percentage < timeProgressRate - 15) {
        atRiskAlerts.push({
          id: `risk_${u.id}_${k.id}`,
          user: u,
          type: 'RISK',
          title: `Nguy cơ không hoàn thành chỉ tiêu ${k.name}`,
          desc: `Dự báo cuối kỳ chỉ tiêu ${k.name} của cán bộ ${u.fullName} chỉ đạt ${formatPercentage(calc.forecastPercentage, 0)} (${formatKpiValue(calc.forecastEndPeriod, k.unit)}). Cần có giải pháp bứt phá.`,
          severity: 'HIGH',
        });
      }
    });
  });

  // 4. Anomaly alerts
  const anomalyAlerts = [
    {
      id: 'anomaly_1',
      title: 'Biến động số liệu đột biến',
      desc: 'Hệ thống đã ghi nhận cảnh báo số liệu tăng trưởng cao đột biến trong các giao dịch phát sinh gần nhất.',
      type: 'ANOMALY' as const,
      severity: 'LOW' as const,
    }
  ];

  const handleSendReminder = (userName: string, id: string) => {
    setRemindedUsers(prev => ({ ...prev, [id]: true }));
    alert(`Đã gửi thông báo nhắc nhở cập nhật số liệu đến cán bộ ${userName}!`);
  };

  const totalCount = unupdatedAlerts.length + slowKpiAlerts.length + atRiskAlerts.length;

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-4xl mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">
              CẢNH BÁO TỰ ĐỘNG
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Ngày {formatDateVN(selectedDate)}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            TRUNG TÂM CẢNH BÁO & GIÁM SÁT TIẾN ĐỘ
          </h2>
          <p className="text-xs text-slate-500">
            Hệ thống tự động phát hiện số liệu chậm trễ, nguy cơ hụt chỉ tiêu và biến động bất thường
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-bold flex items-center space-x-1.5">
            <Bell className="w-4 h-4" />
            <span>{totalCount} cảnh báo cần xử lý</span>
          </div>
        </div>
      </div>

      {/* 1. Unupdated Section */}
      {unupdatedAlerts.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase text-red-700 tracking-wider flex items-center space-x-1.5 px-1">
            <UserX className="w-4 h-4" />
            <span>1. CÁN BỘ CHƯA CẬP NHẬT SỐ LIỆU HÔM NAY ({unupdatedAlerts.length})</span>
          </h3>

          <div className="space-y-2">
            {unupdatedAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-white rounded-xl p-3.5 border-l-4 border-l-red-500 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={alert.user.avatar}
                    alt={alert.user.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{alert.user.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({alert.user.title})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{alert.desc}</p>
                  </div>
                </div>

                {!isStaff && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleSendReminder(alert.user.fullName, alert.id)}
                      disabled={remindedUsers[alert.id]}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                        remindedUsers[alert.id]
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{remindedUsers[alert.id] ? 'Đã gửi nhắc nhở' : 'Gửi nhắc nhở'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedUserModal(alert.user)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-[#003B70] hover:bg-slate-100"
                      title="Xem Dashboard cán bộ"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Slow KPI Progress Section */}
      {slowKpiAlerts.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase text-amber-800 tracking-wider flex items-center space-x-1.5 px-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>2. CẢNH BÁO CHẬM TIẾN ĐỘ CHỈ TIÊU ({slowKpiAlerts.length})</span>
          </h3>

          <div className="space-y-2">
            {slowKpiAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-white rounded-xl p-3.5 border-l-4 border-l-amber-500 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-amber-600">⚠️</span>
                    <span>{alert.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({alert.user.fullName})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{alert.desc}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setSelectedUserModal(alert.user)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003B70] text-xs font-bold flex items-center space-x-1"
                  >
                    <span>Xem Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. At Risk Section */}
      {atRiskAlerts.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase text-red-800 tracking-wider flex items-center space-x-1.5 px-1">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>3. CẢNH BÁO NGUY CƠ KHÔNG HOÀN THÀNH CUỐI KỲ ({atRiskAlerts.length})</span>
          </h3>

          <div className="space-y-2">
            {atRiskAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-white rounded-xl p-3.5 border-l-4 border-l-red-600 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-red-900 flex items-center gap-2">
                    <span className="text-red-600">🔴</span>
                    <span>{alert.title}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({alert.user.fullName})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{alert.desc}</p>
                </div>

                <button
                  onClick={() => setSelectedUserModal(alert.user)}
                  className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center space-x-1 shrink-0"
                >
                  <span>Kế hoạch hành động</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <OfficerDetailModal
        user={selectedUserModal}
        isOpen={!!selectedUserModal}
        onClose={() => setSelectedUserModal(null)}
      />
    </div>
  );
};
