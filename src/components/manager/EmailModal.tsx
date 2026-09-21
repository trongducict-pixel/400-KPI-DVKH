import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Mail,
  Paperclip,
  Send,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateVN } from '../../utils/formatters';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportDate: string;
  reportVersion: string;
  selectedKpiNames: string[];
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  reportDate,
  reportVersion,
  selectedKpiNames,
}) => {
  const { currentUser, reportConfig, sendReportEmail } = useApp();

  const [recipient, setRecipient] = useState(reportConfig.directorEmail || 'giamdoc.ninhbinh@vietinbank.vn');
  const [subject, setSubject] = useState(`Báo cáo số liệu Phòng DVKH ngày ${formatDateVN(reportDate)}`);
  const [content, setContent] = useState(
    `Kính gửi Ban Giám đốc VietinBank Chi nhánh Ninh Bình,\n\nPhòng Dịch vụ khách hàng kính báo cáo kết quả thực hiện các chỉ tiêu kinh doanh ngày ${formatDateVN(reportDate)} (Phiên bản: ${reportVersion}).\n\nCác chỉ tiêu báo cáo chính:\n${selectedKpiNames.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\nChi tiết số liệu thực hiện và lũy kế được thể hiện tại Dashboard và tệp đính kèm.\n\nKính trình Giám đốc xem xét và chỉ đạo.\n\nTrân trọng,\n${currentUser.fullName}\n${currentUser.title} - Phòng DVKH VietinBank Chi nhánh Ninh Bình`
  );

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    setIsSending(true);
    const ok = await sendReportEmail(reportDate, recipient, subject, content);
    setIsSending(false);
    if (ok) {
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#003B70] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">GỬI BÁO CÁO CHO GIÁM ĐỐC</h3>
              <p className="text-xs text-blue-200">Xác nhận gửi email báo cáo số liệu chính thức</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sendSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">GỬI BÁO CÁO THÀNH CÔNG!</h4>
            <p className="text-xs text-slate-600">
              Báo cáo ngày {formatDateVN(reportDate)} đã được gửi đến <strong>{recipient}</strong>. Hệ thống đã lưu lịch sử gửi.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-3.5">
            {/* Recipient */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-600">
                Người nhận:
              </label>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-600">
                Tiêu đề Email:
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Content Body */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-600">
                Nội dung Email:
              </label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Attachments list */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-600 flex items-center space-x-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                <span>TỆP ĐÍNH KÈM TỰ ĐỘNG (2 tệp):</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center space-x-1.5 text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span className="font-medium font-mono">BaoCao_DVKH_{reportDate}.pdf</span>
                </div>
                <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center space-x-1.5 text-slate-700">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium font-mono">SoLieu_DVKH_{reportDate}.xlsx</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#003B70] to-[#0072CE] text-white text-xs font-bold hover:brightness-110 shadow-md flex items-center justify-center space-x-1.5"
              >
                {isSending ? (
                  <span>Đang gửi email...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>GỬI EMAIL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
