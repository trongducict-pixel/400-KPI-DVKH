import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CornerDownLeft,
  Edit3,
  HelpCircle,
  Lock,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KpiMaster } from '../../types';
import { checkEntryAnomaly, computeKpiProgress } from '../../utils/calculations';
import {
  formatDateVN,
  formatKpiValue,
  formatNumberWithDots,
  parseRawNumericInput,
} from '../../utils/formatters';

interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKpiId?: string;
}

export const DailyEntryModal: React.FC<DailyEntryModalProps> = ({
  isOpen,
  onClose,
  initialKpiId,
}) => {
  const {
    currentUser,
    selectedDate,
    kpis,
    targets,
    dailyEntries,
    saveDailyEntry,
    isDateLocked,
  } = useApp();

  const activeKpis = kpis
    .filter((k) => k.status === 'ACTIVE')
    .sort((a, b) => a.order - b.order);

  const initialIndex = initialKpiId
    ? Math.max(0, activeKpis.findIndex((k) => k.id === initialKpiId))
    : 0;

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [stage, setStage] = useState<'INPUT' | 'CONFIRM' | 'COMPLETED'>('INPUT');
  const [rawInput, setRawInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentKpi = activeKpis[currentIndex] || activeKpis[0];
  const isLocked = isDateLocked(selectedDate);

  // Sync state whenever KPI index or modal open changes
  useEffect(() => {
    if (isOpen && currentKpi) {
      const existing = dailyEntries.find(
        (e) =>
          e.userId === currentUser.id &&
          e.kpiId === currentKpi.id &&
          e.date === selectedDate
      );
      if (existing !== undefined) {
        setRawInput(existing.value.toString());
      } else {
        setRawInput('');
      }
      setStage('INPUT');
      setErrorMessage(null);
    }
  }, [currentIndex, isOpen, selectedDate, currentKpi?.id, currentUser.id]);

  useEffect(() => {
    if (initialKpiId && isOpen) {
      const idx = activeKpis.findIndex((k) => k.id === initialKpiId);
      if (idx >= 0) {
        setCurrentIndex(idx);
        setStage('INPUT');
      }
    }
  }, [initialKpiId, isOpen]);

  if (!isOpen || !currentKpi) return null;

  // Target for current user & KPI
  const targetVal =
    targets.find(
      (t) =>
        t.userId === currentUser.id &&
        t.kpiId === currentKpi.id &&
        t.year === new Date(selectedDate).getFullYear()
    )?.targetValue || 0;

  // Progress metrics
  const currentProgress = computeKpiProgress(
    currentKpi,
    targetVal,
    dailyEntries,
    currentUser.id,
    selectedDate
  );

  // Parse current input value
  const currentValue = rawInput.trim() === '' ? 0 : parseRawNumericInput(rawInput);

  // Handle typing inside numeric input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleaned = val.replace(/\D/g, '');
    setRawInput(cleaned);
  };

  // Move from INPUT to CONFIRM stage (Section X)
  const handleProceedToConfirm = () => {
    if (isLocked) {
      setErrorMessage(`Số liệu ngày ${formatDateVN(selectedDate)} đã bị khóa.`);
      return;
    }
    setErrorMessage(null);
    setStage('CONFIRM');
  };

  // Save the value after confirmation & proceed to next KPI (Section XI)
  const handleConfirmAndSave = () => {
    if (isLocked) {
      setErrorMessage(`Số liệu ngày ${formatDateVN(selectedDate)} đã bị khóa.`);
      return;
    }

    const res = saveDailyEntry(currentUser.id, currentKpi.id, currentValue, selectedDate);
    if (!res.success) {
      setErrorMessage(res.message || 'Không thể lưu số liệu.');
      return;
    }

    // Advance to next KPI or complete
    if (currentIndex < activeKpis.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStage('INPUT');
    } else {
      setStage('COMPLETED');
    }
  };

  // Jump to specific step from dots indicator
  const handleJumpToStep = (index: number) => {
    setCurrentIndex(index);
    setStage('INPUT');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Navigation Bar */}
        <div className="bg-[#003B70] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              VIETINBANK
            </span>
            <span className="text-blue-300">|</span>
            <span className="text-xs font-medium text-white truncate">
              {stage === 'COMPLETED' ? 'Báo cáo hoàn tất' : `Nhập số liệu ngày ${formatDateVN(selectedDate)}`}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= STAGE 1: NHẬP TỪNG CHỈ TIÊU (Section VII & VIII) ================= */}
        {stage === 'INPUT' && (
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
            {/* Step indicator header */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#0072CE] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                BƯỚC {currentIndex + 1}/{activeKpis.length}
              </span>
              <span className="text-slate-400 font-medium">
                {currentKpi.dataType === 'CURRENCY' ? 'Chỉ tiêu tiền tệ (VNĐ)' : 'Chỉ tiêu số lượng'}
              </span>
            </div>

            {/* Step Dots Indicator */}
            <div className="flex items-center justify-center space-x-1.5 py-1">
              {activeKpis.map((k, idx) => {
                const isDone = dailyEntries.some(
                  (e) => e.userId === currentUser.id && e.kpiId === k.id && e.date === selectedDate
                );
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={k.id}
                    onClick={() => handleJumpToStep(idx)}
                    title={k.name}
                    className={`transition-all rounded-full ${
                      isCurrent
                        ? 'w-6 h-2.5 bg-[#0072CE]'
                        : isDone
                        ? 'w-2.5 h-2.5 bg-emerald-500'
                        : 'w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                );
              })}
            </div>

            {/* KPI Title */}
            <div className="text-center pt-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#003B70] tracking-tight uppercase">
                {currentKpi.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã: <span className="font-mono font-bold">{currentKpi.code}</span> • Đơn vị tính:{' '}
                <strong className="text-slate-700">{currentKpi.unit}</strong>
              </p>
            </div>

            {/* Reference info box (KPI, Lũy kế, Thực hiện hôm qua) */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mức giao KPI năm:</span>
                <span className="font-mono-num font-bold text-slate-800">
                  {formatNumberWithDots(currentProgress.target)} {currentKpi.unit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lũy kế đã thực hiện:</span>
                <span className="font-mono-num font-extrabold text-[#003B70]">
                  {formatNumberWithDots(currentProgress.cumulativeValue)} {currentKpi.unit}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Thực hiện hôm qua:</span>
                <span className="font-mono-num font-semibold text-slate-700">
                  {formatNumberWithDots(currentProgress.yesterdayValue)} {currentKpi.unit}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input Section */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                SỐ THỰC HIỆN HÔM NAY ({currentKpi.unit})
              </label>

              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={rawInput ? formatNumberWithDots(rawInput) : ''}
                  onChange={handleInputChange}
                  placeholder="0"
                  autoFocus
                  disabled={isLocked}
                  className="w-full px-4 py-3.5 text-right font-mono-num text-2xl sm:text-3xl font-black text-slate-900 bg-white border-2 border-slate-300 focus:border-[#0072CE] focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {currentKpi.unit}
                </span>
              </div>

              {/* Exact VND note */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Nhập chính xác đến từng {currentKpi.unit}</span>
                <button
                  type="button"
                  onClick={() => setRawInput('0')}
                  className="font-bold text-[#0072CE] hover:underline"
                >
                  [ 0 - Không phát sinh ]
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleProceedToConfirm}
                disabled={isLocked}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#003B70] to-[#0072CE] text-white font-extrabold text-base shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>LƯU & TIẾP TỤC</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={() => handleJumpToStep(currentIndex - 1)}
                  className="w-full py-2.5 text-xs text-slate-500 font-semibold hover:text-slate-800 flex items-center justify-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại chỉ tiêu trước</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STAGE 2: XÁC NHẬN SỐ LIỆU (Section X) ================= */}
        {stage === 'CONFIRM' && (
          <div className="p-5 flex-1 overflow-y-auto space-y-5 animate-in fade-in">
            <div className="text-center pt-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#003B70] mx-auto flex items-center justify-center border border-blue-200 mb-2">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                XÁC NHẬN SỐ LIỆU
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Vui lòng kiểm tra lại số liệu trước khi ghi nhận vào hệ thống
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Chỉ tiêu:</span>
                <span className="font-extrabold text-slate-900">{currentKpi.name}</span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Ngày báo cáo:</span>
                <span className="font-bold text-slate-800">{formatDateVN(selectedDate)}</span>
              </div>

              <div className="pt-1 text-center space-y-1">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  SỐ THỰC HIỆN GHI NHẬN:
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#003B70] font-mono-num break-all">
                  {currentValue === 0 ? '0' : formatNumberWithDots(currentValue)}{' '}
                  <span className="text-sm font-bold text-slate-500">{currentKpi.unit}</span>
                </div>
                {currentValue === 0 && (
                  <div className="text-xs text-amber-600 font-medium italic">
                    (Ghi nhận: Không phát sinh trong ngày)
                  </div>
                )}
              </div>
            </div>

            {/* Buttons: [ SỬA LẠI ] and [ XÁC NHẬN & LƯU ] */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStage('INPUT')}
                className="py-3.5 px-4 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 active:scale-98 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>SỬA LẠI</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="py-3.5 px-4 rounded-xl bg-[#0072CE] hover:bg-[#005FA8] text-white font-extrabold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>XÁC NHẬN & LƯU</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: HOÀN TẤT BÁO CÁO (Section XII) ================= */}
        {stage === 'COMPLETED' && (
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ✓ ĐÃ HOÀN TẤT BÁO CÁO
              </h3>
              <p className="text-xs text-slate-500">
                Ngày: <strong className="text-slate-800">{formatDateVN(selectedDate)}</strong>
              </p>
            </div>

            <div className="w-full bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-xs text-emerald-800 space-y-1 font-medium">
              <div className="font-extrabold text-sm text-emerald-900">
                Đã cập nhật: {activeKpis.length}/{activeKpis.length} chỉ tiêu
              </div>
              <p className="text-emerald-700">
                Số liệu trong ngày đã được ghi nhận và đồng bộ lên hệ thống.
              </p>
            </div>

            {/* Button: [ ← VỀ TRANG CHỦ ] */}
            <div className="w-full pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 px-6 rounded-2xl bg-[#003B70] hover:bg-[#00284D] text-white font-extrabold text-base shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>← VỀ TRANG CHỦ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
