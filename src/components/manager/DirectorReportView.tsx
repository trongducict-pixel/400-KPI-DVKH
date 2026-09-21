import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  History,
  Lock,
  Mail,
  Printer,
  RotateCcw,
  Send,
  Settings2,
  SlidersHorizontal,
  Unlock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateDepartmentCumulative, getTimeProgressRate } from '../../utils/calculations';
import { exportDirectorReportToExcel } from '../../utils/exportUtils';
import { formatDateVN, formatDateTimeVN, formatKpiValue, formatNumberWithDots, formatPercentage } from '../../utils/formatters';
import { EmailModal } from './EmailModal';

export const DirectorReportView: React.FC = () => {
  const {
    currentUser,
    selectedDate,
    users,
    kpis,
    targets,
    dailyEntries,
    reportConfig,
    updateReportConfig,
    reportHistory,
    finalizeReport,
    dayLocks,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'PREVIEW' | 'CONFIG' | 'HISTORY'>('PREVIEW');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const activeKpis = kpis.filter(k => k.status === 'ACTIVE').sort((a, b) => a.order - b.order);
  const staffUsers = users.filter(u => u.role === 'NHAN_VIEN');
  const { rate: timeProgressRate } = getTimeProgressRate(selectedDate);

  // Check if today's report has already been locked
  const currentReportLock = reportHistory.find(r => r.date === selectedDate);
  const isReportFinalized = !!currentReportLock;

  // Selected KPIs based on config
  const selectedKpiObjects = useMemo(() => {
    return activeKpis.filter(k => reportConfig.selectedKpiIds.includes(k.id));
  }, [activeKpis, reportConfig.selectedKpiIds]);

  // Calculations for selected KPIs
  const reportCalculations = useMemo(() => {
    return selectedKpiObjects.map(kpi => {
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
        cumulativeValue: totalCumulative,
        todayValue: totalToday,
        yesterdayValue: 0,
        percentage,
        remaining,
        forecastEndPeriod: Math.round((totalCumulative / Math.max(1, 21)) * 30),
        forecastPercentage: totalTarget > 0 ? (Math.round((totalCumulative / Math.max(1, 21)) * 30) / totalTarget) * 100 : 0,
        status,
        timeProgressRate,
      };
    });
  }, [selectedKpiObjects, targets, dailyEntries, selectedDate, staffUsers, timeProgressRate]);

  // Overall rate of the report
  const totalReportRate = useMemo(() => {
    const valid = reportCalculations.filter(r => r.target > 0);
    return valid.length > 0 ? valid.reduce((acc, r) => acc + r.percentage, 0) / valid.length : 0;
  }, [reportCalculations]);

  // Officer summaries for Excel export
  const officerSummaries = useMemo(() => {
    return staffUsers.map(u => {
      const userTgts = targets.filter(t => t.userId === u.id && t.year === 2026);
      const sumRates = userTgts.reduce((acc, t) => {
        const cum = dailyEntries.filter(e => e.userId === u.id && e.kpiId === t.kpiId && e.date <= selectedDate).reduce((s, e) => s + e.value, 0);
        return acc + (t.targetValue > 0 ? (cum / t.targetValue) * 100 : 0);
      }, 0);
      const overall = userTgts.length > 0 ? sumRates / userTgts.length : 0;
      return { user: u, overallRate: overall };
    });
  }, [staffUsers, targets, dailyEntries, selectedDate]);

  // Toggle KPI inclusion in director report
  const handleToggleKpiSelection = (kpiId: string) => {
    const currentList = reportConfig.selectedKpiIds;
    let updated: string[];
    if (currentList.includes(kpiId)) {
      if (currentList.length <= 1) {
        alert('Phải chọn tối thiểu ít nhất 1 chỉ tiêu đưa lên Báo cáo Giám đốc!');
        return;
      }
      updated = currentList.filter(id => id !== kpiId);
    } else {
      updated = [...currentList, kpiId];
    }
    updateReportConfig(updated);
  };

  // Finalize report
  const handleFinalize = () => {
    const res = finalizeReport(selectedDate);
    if (res.success) {
      alert(`Đã chốt thành công báo cáo ngày ${formatDateVN(selectedDate)} (Phiên bản ${res.version}). Hệ thống đã khóa số liệu để đảm bảo tính nhất quán.`);
    }
  };

  // Export Excel action
  const handleExportExcel = () => {
    exportDirectorReportToExcel(selectedDate, reportCalculations, totalReportRate, officerSummaries);
  };

  // Trigger browser print for printable PDF
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveSubTab('PREVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'PREVIEW'
                ? 'bg-[#003B70] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dashboard Báo cáo Giám đốc</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CONFIG')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'CONFIG'
                ? 'bg-[#003B70] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Cấu hình Chỉ tiêu ({selectedKpiObjects.length}/{activeKpis.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'HISTORY'
                ? 'bg-[#003B70] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử ({reportHistory.length})</span>
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500 hidden sm:block">
          Ngày: <strong className="text-slate-800">{formatDateVN(selectedDate)}</strong>
        </div>
      </div>

      {/* VIEW 1: EXECUTIVE PREVIEW (Section 18, 19, 20, 21) */}
      {activeSubTab === 'PREVIEW' && (
        <div className="space-y-4">
          {/* Status Lock Warning or Notification Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border transition-colors bg-white">
            {isReportFinalized ? (
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>🟢 BÁO CÁO ĐÃ CHỐT</span>
                    <span className="text-[10px] bg-emerald-100 px-1.5 py-0.2 rounded font-mono font-bold">
                      {currentReportLock?.reportVersion}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Chốt bởi: {currentReportLock?.lockedBy} lúc {formatDateTimeVN(currentReportLock?.lockedAt || '')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    KIỂM TRA BÁO CÁO TRƯỚC KHI CHỐT
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Vui lòng rà soát kỹ các chỉ tiêu trước khi chốt phiên bản và gửi email cho Ban Giám đốc.
                  </div>
                </div>
              </div>
            )}

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {!isReportFinalized ? (
                <button
                  onClick={handleFinalize}
                  className="px-4 py-2 rounded-xl bg-[#003B70] text-white text-xs font-bold hover:bg-[#002D56] shadow-sm flex items-center space-x-1.5"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>CHỐT BÁO CÁO</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleExportExcel}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <span>XUẤT EXCEL</span>
                  </button>

                  <button
                    onClick={handlePrintPdf}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-slate-700" />
                    <span>IN / XUẤT PDF</span>
                  </button>

                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#003B70] to-[#0072CE] text-white text-xs font-bold hover:brightness-110 shadow-md flex items-center space-x-1.5"
                  >
                    <Mail className="w-4 h-4 text-blue-200" />
                    <span>✉ GỬI BÁO CÁO CHO GIÁM ĐỐC</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Printable Official Executive Report Container */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-sm print:shadow-none print:border-0 print:p-0 space-y-6">
            {/* Bank Standard Formal Header */}
            <div className="border-b-2 border-[#003B70] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-extrabold uppercase tracking-widest text-[#003B70]">
                  VIETINBANK • NGÂN HÀNG TMCP CÔNG THƯƠNG VIỆT NAM
                </div>
                <div className="text-xs font-bold text-slate-700 uppercase">
                  CHI NHÁNH NINH BÌNH — PHÒNG DỊCH VỤ KHÁCH HÀNG
                </div>
                <div className="text-[11px] text-slate-500">
                  Số: ....../BC-DVKH • Ninh Bình, ngày {formatDateVN(selectedDate)}
                </div>
              </div>

              <div className="text-left sm:text-right space-y-0.5">
                <h2 className="text-lg sm:text-xl font-black text-[#003B70]">
                  BÁO CÁO PHÒNG DVKH
                </h2>
                <div className="text-xs text-slate-600 font-medium">
                  Kết quả thực hiện các chỉ tiêu ngày <strong>{formatDateVN(selectedDate)}</strong>
                </div>
                {isReportFinalized && (
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                    Bản chính thức: {currentReportLock?.reportVersion}
                  </span>
                )}
              </div>
            </div>

            {/* High-Level Executive Summary Pill */}
            <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Đánh giá chung toàn phòng</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  Tỷ lệ hoàn thành tổng thể:{' '}
                  <span className="text-[#003B70] text-base font-black font-mono-num">
                    {formatPercentage(totalReportRate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <div>
                  <span className="text-slate-500">Tiến độ thời gian: </span>
                  <strong className="text-amber-700 font-mono-num">{timeProgressRate}%</strong>
                </div>
                <div className="w-px h-5 bg-slate-200" />
                <div>
                  <span className="text-slate-500">Số chỉ tiêu báo cáo: </span>
                  <strong className="text-[#003B70] font-mono-num">{reportCalculations.length}</strong>
                </div>
              </div>
            </div>

            {/* Selected KPIs Grid Cards (As requested in Section 18) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider">
                CHI TIẾT CÁC CHỈ TIÊU BÁO CÁO GIÁM ĐỐC
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {reportCalculations.map((calc, idx) => {
                  const { kpi, target, cumulativeValue, percentage, remaining, todayValue, status } = calc;

                  let statusText = '🟢 Đạt tiến độ';
                  let statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  if (status === 'WARNING') {
                    statusText = '🟡 Cần theo dõi';
                    statusBg = 'bg-amber-50 text-amber-800 border-amber-200';
                  } else if (status === 'SLOW') {
                    statusText = '🔴 Chậm tiến độ';
                    statusBg = 'bg-red-50 text-red-800 border-red-200';
                  }

                  return (
                    <div
                      key={kpi.id}
                      className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono-num font-bold text-slate-400">
                            {idx + 1}. {kpi.code}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                            {kpi.name}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBg}`}>
                          {statusText}
                        </span>
                      </div>

                      {/* Prominent Exact Numbers Line */}
                      <div className="space-y-1">
                        <div className="text-[11px] text-slate-500">Lũy kế thực hiện:</div>
                        <div className="font-mono-num text-lg sm:text-xl font-extrabold text-[#003B70]">
                          {formatNumberWithDots(cumulativeValue)}{' '}
                          <span className="text-xs font-semibold text-slate-500">{kpi.unit}</span>
                        </div>
                      </div>

                      {/* Percentage and Target */}
                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-500">Mức KPI giao: </span>
                          <strong className="font-mono-num text-slate-800">
                            {formatNumberWithDots(target)} {kpi.unit}
                          </strong>
                        </div>

                        <div className="text-right">
                          <span className="font-mono-num text-base font-black text-emerald-700">
                            {formatPercentage(percentage)} KPI
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percentage >= timeProgressRate ? 'bg-emerald-600' : percentage >= timeProgressRate - 15 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Hôm nay: <strong className="font-mono-num text-slate-700">{formatKpiValue(todayValue, kpi.unit)}</strong></span>
                        <span>Còn thiếu: <strong className="font-mono-num text-slate-700">{formatKpiValue(remaining, kpi.unit)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Report Sign-off Section */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-6 text-xs text-slate-600">
              <div>
                <div className="font-semibold text-slate-800">Nơi nhận:</div>
                <div>- Ban Giám đốc Chi nhánh Ninh Bình (để báo cáo);</div>
                <div>- Lưu: Phòng DVKH.</div>
              </div>

              <div className="text-left sm:text-center space-y-1 sm:min-w-[200px]">
                <div className="font-bold text-slate-800 uppercase">TRƯỞNG PHÒNG DVKH</div>
                <div className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên và đóng dấu nếu cần)</div>
                <div className="h-12 flex items-center justify-center font-serif text-slate-400 italic">
                  {currentUser.role === 'TRUONG_PHONG' ? currentUser.fullName : 'Vũ Thị Thanh Hương'}
                </div>
                <div className="font-bold text-[#003B70]">
                  {currentUser.role === 'TRUONG_PHONG' ? currentUser.fullName : 'Vũ Thị Thanh Hương'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CONFIGURATION (Section 17) */}
      {activeSubTab === 'CONFIG' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase text-[#003B70] flex items-center space-x-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#0072CE]" />
              <span>CẤU HÌNH DASHBOARD BÁO CÁO GIÁM ĐỐC</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn các chỉ tiêu KPI được phép xuất hiện trên Dashboard và Báo cáo gửi Ban Giám đốc. Khi bỏ chọn, dữ liệu nội bộ không bị xóa.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            {activeKpis.map(kpi => {
              const isChecked = reportConfig.selectedKpiIds.includes(kpi.id);

              return (
                <div
                  key={kpi.id}
                  onClick={() => handleToggleKpiSelection(kpi.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-blue-50/70 border-[#0072CE] text-[#003B70]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isChecked ? 'bg-[#003B70] border-[#003B70] text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center space-x-1.5">
                        <span className="font-mono-num text-[11px] text-slate-400">{kpi.code}</span>
                        <span>{kpi.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Đơn vị: {kpi.unit} • {kpi.description || 'Chỉ tiêu kinh doanh phòng DVKH'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isChecked ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isChecked ? 'ĐƯỢC BÁO CÁO GĐ' : 'NỘI BỘ PHÒNG'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Director Email Recipient Configuration */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold uppercase text-slate-600">
              Email mặc định Ban Giám đốc nhận báo cáo:
            </label>
            <input
              type="email"
              value={reportConfig.directorEmail}
              onChange={(e) => updateReportConfig(reportConfig.selectedKpiIds, e.target.value)}
              className="w-full sm:w-96 px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* VIEW 3: REPORT HISTORY (Section 22) */}
      {activeSubTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase text-[#003B70] flex items-center space-x-1.5">
              <History className="w-4 h-4 text-[#0072CE]" />
              <span>LỊCH SỬ CHỐT VÀ GỬI BÁO CÁO GIÁM ĐỐC</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn bộ các phiên bản báo cáo đã chốt và lịch sử gửi email cho Ban Giám đốc
            </p>
          </div>

          <div className="space-y-2.5">
            {reportHistory.map(rep => (
              <div
                key={rep.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Báo cáo ngày {formatDateVN(rep.date)}
                      </span>
                      <span className="font-mono font-bold text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {rep.reportVersion}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Chốt bởi: <strong className="text-slate-700">{rep.lockedBy}</strong> lúc{' '}
                      {formatDateTimeVN(rep.lockedAt)}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rep.status === 'SENT_DIRECTOR'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rep.status === 'SENT_DIRECTOR' ? 'ĐÃ GỬI GĐ' : 'ĐÃ CHỐT'}
                  </span>
                </div>

                {rep.emailedAt && (
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex flex-wrap gap-y-1 justify-between">
                    <div>
                      <span>Người nhận: </span>
                      <strong className="text-slate-800">{rep.emailRecipient}</strong>
                    </div>
                    <div>
                      <span>Thời gian gửi: </span>
                      <span className="font-mono">{formatDateTimeVN(rep.emailedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        reportDate={selectedDate}
        reportVersion={currentReportLock?.reportVersion || 'v1.0-CHOT'}
        selectedKpiNames={selectedKpiObjects.map(k => k.name)}
      />
    </div>
  );
};
