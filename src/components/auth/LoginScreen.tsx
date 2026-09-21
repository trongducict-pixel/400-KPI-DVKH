import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

export const LoginScreen: React.FC = () => {
  const { users, login } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quickRoleFilter, setQuickRoleFilter] = useState<'ALL' | 'CAN_BO' | 'LANH_DAO' | 'ADMIN'>('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = login(identifier, password);
    if (!result.success) {
      setErrorMessage(result.message || 'Đăng nhập không thành công.');
    }
  };

  const handleQuickLogin = (u: User) => {
    setIdentifier(u.username);
    setPassword(u.password || '123');
    setErrorMessage(null);
    const result = login(u.username, u.password || '123');
    if (!result.success) {
      setErrorMessage(result.message || 'Đăng nhập không thành công.');
    }
  };

  // Group users for quick selection
  const filteredQuickUsers = users.filter(u => {
    if (quickRoleFilter === 'LANH_DAO') return u.role === 'TRUONG_PHONG';
    if (quickRoleFilter === 'ADMIN') return u.role === 'ADMIN';
    if (quickRoleFilter === 'CAN_BO') return u.role === 'NHAN_VIEN';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00274B] via-[#003B70] to-[#001D38] text-white flex flex-col justify-between py-6 px-3 sm:px-6 font-sans">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto text-center space-y-2 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold tracking-wider uppercase text-blue-200">
          <Building2 className="w-3.5 h-3.5 text-blue-300" />
          <span>VIETINBANK CHI NHÁNH NINH BÌNH</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          DVKH DAILY KPI
        </h1>
        <p className="text-xs sm:text-sm text-blue-200 font-medium">
          Hệ thống Báo cáo Số liệu & Quản trị KPI Phòng Dịch vụ khách hàng
        </p>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-4 bg-white text-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 border border-blue-100 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-[#003B70] flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-[#0072CE]" />
            <span>Đăng nhập hệ thống cán bộ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sử dụng tài khoản nội bộ (User/Mã CB) đã được phân quyền
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-xs text-red-700 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Tên đăng nhập / Mã cán bộ / Email
            </label>
            <div className="relative">
              <input
                id="login-input-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ví dụ: thuth, pthiha, 00015042..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">
                Mật khẩu
              </label>
              <span className="text-[11px] font-semibold text-blue-600">
                Mặc định: 123
              </span>
            </div>
            <div className="relative">
              <input
                id="login-input-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-btn-submit"
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#003B70] to-[#0072CE] hover:from-[#002D56] hover:to-[#005FA8] text-white font-bold text-sm shadow-md shadow-blue-900/20 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>ĐĂNG NHẬP HỆ THỐNG</span>
          </button>
        </form>

        {/* Quick Select Section */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Đăng nhập nhanh 1 chạm (21 Cán bộ)</span>
            </span>
          </div>

          {/* Quick Filter tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 text-center">
            <button
              type="button"
              onClick={() => setQuickRoleFilter('ALL')}
              className={`py-1 rounded-md transition-all ${quickRoleFilter === 'ALL' ? 'bg-white text-[#003B70] shadow-xs' : ''}`}
            >
              Tất cả (21)
            </button>
            <button
              type="button"
              onClick={() => setQuickRoleFilter('CAN_BO')}
              className={`py-1 rounded-md transition-all ${quickRoleFilter === 'CAN_BO' ? 'bg-white text-[#003B70] shadow-xs' : ''}`}
            >
              Cán bộ (16)
            </button>
            <button
              type="button"
              onClick={() => setQuickRoleFilter('LANH_DAO')}
              className={`py-1 rounded-md transition-all ${quickRoleFilter === 'LANH_DAO' ? 'bg-white text-[#003B70] shadow-xs' : ''}`}
            >
              Lãnh đạo (4)
            </button>
            <button
              type="button"
              onClick={() => setQuickRoleFilter('ADMIN')}
              className={`py-1 rounded-md transition-all ${quickRoleFilter === 'ADMIN' ? 'bg-white text-[#003B70] shadow-xs' : ''}`}
            >
              Admin (1)
            </button>
          </div>

          {/* User List Pills */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
            {filteredQuickUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="w-full p-2 flex items-center justify-between rounded-xl hover:bg-blue-50/80 transition-colors text-left group"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <img
                    src={u.avatar}
                    alt={u.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <span>{u.fullName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({u.username})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {u.title} • Mã: {u.staffCode}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {u.role === 'TRUONG_PHONG' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Lãnh đạo
                    </span>
                  )}
                  {u.role === 'ADMIN' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0072CE] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-blue-200/80 space-y-1">
        <p className="font-semibold">
          Phòng Dịch vụ khách hàng • VietinBank Ninh Bình
        </p>
        <p className="text-[11px] text-blue-300/60">
          Chỉ sử dụng nội bộ • Hỗ trợ kỹ thuật: Nguyễn Trọng Đức (0943.882.109)
        </p>
      </div>
    </div>
  );
};
