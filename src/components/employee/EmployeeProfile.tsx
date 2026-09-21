import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Phone,
  Settings,
  Shield,
  Target,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateVN, formatKpiValue, formatPercentage } from '../../utils/formatters';

export const EmployeeProfile: React.FC = () => {
  const { currentUser, selectedDate, kpis, targets, dailyEntries, logout, updateUser, setActiveTab } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [passMessage, setPassMessage] = useState<string | null>(null);

  const activeKpis = kpis.filter(k => k.status === 'ACTIVE').sort((a, b) => a.order - b.order);
  const myTargets = targets.filter(t => t.userId === currentUser.id && t.year === 2026);

  // Compute total entries count
  const myEntriesCount = dailyEntries.filter(e => e.userId === currentUser.id).length;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.trim()) return;
    updateUser(currentUser.id, { password: newPass.trim() });
    setIsChangingPass(false);
    setNewPass('');
    setPassMessage('Đã cập nhật mật khẩu mới thành công!');
    setTimeout(() => setPassMessage(null), 3000);
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-2xl mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-3.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#003B70] shadow-sm shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 truncate">{currentUser.fullName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                {currentUser.role === 'NHAN_VIEN' ? 'CÁN BỘ DVKH' : 'LÃNH ĐẠO PHÒNG'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.title} • Phòng DVKH</p>
            <p className="text-xs text-[#003B70] font-medium truncate">VietinBank Chi nhánh Ninh Bình</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{currentUser.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{currentUser.phone || '0912.345.678'}</span>
          </div>
        </div>
      </div>

      {/* Account & Security Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center space-x-1.5">
          <KeyRound className="w-4 h-4 text-[#0072CE]" />
          <span>THÔNG TIN TÀI KHOẢN & ĐĂNG NHẬP</span>
        </h3>

        {passMessage && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
            {passMessage}
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Mã cán bộ (Staff Code):</span>
            <span className="font-mono font-bold text-[#003B70]">{currentUser.staffCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Tên đăng nhập (Username):</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">{currentUser.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Mật khẩu hiện tại:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-slate-700">
                {showPassword ? (currentUser.password || '123') : '••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {isChangingPass ? (
          <form onSubmit={handleChangePassword} className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <label className="block font-bold text-slate-700">Nhập mật khẩu mới</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Mật khẩu mới..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0072CE] focus:outline-none"
                required
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#0072CE] text-white rounded-xl font-bold hover:bg-[#005FA8]"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPass(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-xl font-semibold"
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setIsChangingPass(true)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Đổi mật khẩu cá nhân
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>

      {/* Target Commitments */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center space-x-1.5">
            <Target className="w-4 h-4 text-[#0072CE]" />
            <span>ĐỊNH MỨC CHỈ TIÊU KPI ĐƯỢC GIAO (NĂM 2026)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            {myTargets.length} chỉ tiêu
          </span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {activeKpis.map(kpi => {
            const tgt = myTargets.find(t => t.kpiId === kpi.id)?.targetValue || 0;
            return (
              <div key={kpi.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <div className="font-bold text-slate-800">{kpi.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{kpi.code} • Đơn vị: {kpi.unit}</div>
                </div>
                <div className="font-mono-num font-bold text-sm text-[#003B70]">
                  {formatKpiValue(tgt, kpi.unit)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quản trị hệ thống shortcut */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003B70] flex items-center justify-center border border-blue-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">TRUNG TÂM QUẢN TRỊ DVKH</div>
            <div className="text-[11px] text-slate-500">Quản lý cán bộ, KPI, dữ liệu Sheets & Audit Log</div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('settings')}
          className="px-3 py-1.5 bg-[#003B70] hover:bg-[#002d56] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          Truy cập
        </button>
      </div>

      {/* App & Workflow Info */}
      <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-200 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-[#003B70] flex items-center space-x-1.5">
          <Shield className="w-4 h-4 text-[#0072CE]" />
          <span>QUY TRÌNH BÁO CÁO PHÒNG DVKH</span>
        </div>
        <p className="leading-relaxed">
          <strong>1.</strong> Cán bộ hoàn thành nhập số liệu trước 17h00 hàng ngày.<br />
          <strong>2.</strong> Hệ thống tự động đồng bộ số liệu vào Google Sheets và tính toán tiến độ.<br />
          <strong>3.</strong> Trưởng phòng duyệt, chốt số liệu và lập Dashboard báo cáo Giám đốc Chi nhánh.
        </p>
        <div className="text-[11px] text-slate-500 pt-1 border-t border-blue-200/60">
          Tổng lượt nhập số liệu ghi nhận: <strong className="font-mono text-slate-800">{myEntriesCount}</strong> bản ghi
        </div>
      </div>
    </div>
  );
};
