import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Edit2,
  History,
  Layers,
  Plus,
  Search,
  Sliders,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KpiMaster } from '../../types';
import { formatDateVN, formatDateTimeVN, formatKpiValue, formatNumberWithDots } from '../../utils/formatters';

export const KpiManagement: React.FC = () => {
  const {
    currentUser,
    users,
    kpis,
    targets,
    kpiHistory,
    setKpiTarget,
    copyKpiTargets,
    addKpi,
    updateKpi,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'MASTER' | 'TARGETS' | 'HISTORY'>('TARGETS');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
  const [searchKpi, setSearchKpi] = useState<string>('');

  // Target editing modal / state
  const [editingTarget, setEditingTarget] = useState<{
    userId: string;
    kpiId: string;
    currentValue: number;
    userName: string;
    kpiName: string;
    unit: string;
  } | null>(null);

  const [newTargetValue, setNewTargetValue] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Copy target state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [sourceUserId, setSourceUserId] = useState(users.find(u => u.role === 'NHAN_VIEN')?.id || '');
  const [targetUserId, setTargetUserId] = useState('');

  // Add / Edit KPI Master state
  const [editingKpiMaster, setEditingKpiMaster] = useState<KpiMaster | null>(null);

  const staffUsers = users.filter(u => u.role === 'NHAN_VIEN');
  const activeKpis = kpis.filter(k => k.status === 'ACTIVE').sort((a, b) => a.order - b.order);

  // Save new KPI target with audit logging
  const handleSaveTarget = () => {
    if (!editingTarget) return;
    const num = parseFloat(newTargetValue.replace(/\D/g, ''));
    if (isNaN(num)) {
      alert('Vui lòng nhập giá trị hợp lệ');
      return;
    }
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do điều chỉnh chỉ tiêu!');
      return;
    }

    setKpiTarget(
      editingTarget.userId,
      editingTarget.kpiId,
      selectedYear,
      num,
      reason.trim()
    );

    setEditingTarget(null);
    setNewTargetValue('');
    setReason('');
  };

  // Handle Copy KPI from user to user
  const handleExecuteCopy = () => {
    if (!sourceUserId || !targetUserId) {
      alert('Vui lòng chọn đầy đủ cán bộ nguồn và cán bộ đích');
      return;
    }
    if (sourceUserId === targetUserId) {
      alert('Cán bộ nguồn và cán bộ đích không được trùng nhau');
      return;
    }

    copyKpiTargets(
      sourceUserId,
      targetUserId,
      selectedYear,
      `Sao chép chỉ tiêu từ cán bộ ${users.find(u => u.id === sourceUserId)?.fullName}`
    );

    setShowCopyModal(false);
    alert('Đã sao chép thành công bộ chỉ tiêu!');
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-4 animate-in fade-in duration-150">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#003B70] text-white uppercase tracking-wider">
              QUẢN TRỊ CHỈ TIÊU
            </span>
            <span className="text-xs text-slate-500 font-semibold">Năm {selectedYear}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            GIAO & QUẢN LÝ KPI PHÒNG DVKH
          </h2>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveSubTab('TARGETS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'TARGETS'
                ? 'bg-[#003B70] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Giao KPI</span>
          </button>

          <button
            onClick={() => setActiveSubTab('MASTER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'MASTER'
                ? 'bg-[#003B70] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Danh mục ({kpis.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('HISTORY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'HISTORY'
                ? 'bg-[#003B70] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử sửa ({kpiHistory.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: GIAO KPI THEO CÁN BỘ (Section 6) */}
      {activeSubTab === 'TARGETS' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600">Lọc cán bộ:</span>
              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="ALL">Tất cả cán bộ phòng ({staffUsers.length})</option>
                {staffUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.title})</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowCopyModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003B70] border border-blue-200 text-xs font-bold flex items-center space-x-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép KPI giữa cán bộ</span>
            </button>
          </div>

          {/* Matrix of Officers and Targets */}
          <div className="space-y-3">
            {staffUsers
              .filter(u => selectedUserFilter === 'ALL' || u.id === selectedUserFilter)
              .map(officer => {
                const officerTargets = targets.filter(t => t.userId === officer.id && t.year === selectedYear);

                return (
                  <div
                    key={officer.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={officer.avatar}
                          alt={officer.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{officer.fullName}</div>
                          <div className="text-[10px] text-slate-500">{officer.title} • {officer.email}</div>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-slate-500">
                        {officerTargets.length} chỉ tiêu đã giao
                      </span>
                    </div>

                    {/* KPI Target Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {activeKpis.map(kpi => {
                        const targetObj = officerTargets.find(t => t.kpiId === kpi.id);
                        const val = targetObj?.targetValue || 0;

                        return (
                          <div
                            key={kpi.id}
                            className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-[11px] font-bold text-slate-700 truncate">{kpi.name}</div>
                              <div className="font-mono-num font-extrabold text-[#003B70] text-sm truncate">
                                {formatKpiValue(val, kpi.unit)}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setEditingTarget({
                                  userId: officer.id,
                                  kpiId: kpi.id,
                                  currentValue: val,
                                  userName: officer.fullName,
                                  kpiName: kpi.name,
                                  unit: kpi.unit,
                                });
                                setNewTargetValue(val.toString());
                                setReason('');
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#003B70] hover:bg-white border border-transparent hover:border-slate-200 transition-all shrink-0"
                              title="Điều chỉnh chỉ tiêu"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DANH MỤC KPI (Section 5) */}
      {activeSubTab === 'MASTER' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase text-[#003B70]">
                DANH MỤC CHỈ TIÊU KPI CHÍNH THỨC
              </h3>
              <p className="text-xs text-slate-500">
                Quản lý mã, tên chỉ tiêu, đơn vị tính và trạng thái áp dụng
              </p>
            </div>

            <button
              onClick={() => {
                setEditingKpiMaster({
                  id: `KPI_${Date.now()}`,
                  code: `KPI_${kpis.length + 1}`,
                  name: '',
                  unit: 'VNĐ',
                  dataType: 'CURRENCY',
                  inputMethod: 'INTEGER',
                  status: 'ACTIVE',
                  order: kpis.length + 1,
                  showOnDashboard: true,
                  reportToDirector: true,
                  description: '',
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-[#003B70] text-white text-xs font-bold hover:bg-[#002D56] flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mới chỉ tiêu</span>
            </button>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
            {kpis.map(k => (
              <div key={k.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {k.code}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{k.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {k.unit}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {k.description || 'Chỉ tiêu giao cho cán bộ phòng DVKH'}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    k.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {k.status === 'ACTIVE' ? 'ĐANG SỬ DỤNG' : 'TẠM NGỪNG'}
                  </span>

                  <button
                    onClick={() => setEditingKpiMaster(k)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LỊCH SỬ THAY ĐỔI KPI (Section 6) */}
      {activeSubTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase text-[#003B70]">
              LỊCH SỬ ĐIỀU CHỈNH CHỈ TIÊU KPI
            </h3>
            <p className="text-xs text-slate-500">
              Nhật ký kiểm soát thay đổi chỉ tiêu: mức cũ, mức mới, người thực hiện và lý do
            </p>
          </div>

          <div className="space-y-2.5">
            {kpiHistory.map(hist => {
              const targetOfficer = users.find(u => u.id === hist.userId);
              const targetKpi = kpis.find(k => k.id === hist.kpiId);

              return (
                <div
                  key={hist.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="font-bold text-slate-900">
                      {targetOfficer?.fullName || hist.userId} • <span className="text-[#003B70]">{targetKpi?.name || hist.kpiId}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDateTimeVN(hist.updatedAt || hist.changedAt || '')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-700 font-mono-num">
                    <span className="line-through text-slate-400">
                      {formatNumberWithDots(hist.oldValue)}
                    </span>
                    <span>➔</span>
                    <span className="font-bold text-emerald-700">
                      {formatNumberWithDots(hist.newValue)}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                    <strong className="text-slate-700">Lý do:</strong> {hist.reason}
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Người duyệt thay đổi: {hist.updatedBy}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: Edit Target Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <div>
              <h4 className="text-base font-bold text-[#003B70]">ĐIỀU CHỈNH CHỈ TIÊU KPI</h4>
              <div className="text-xs text-slate-600 mt-1">
                Cán bộ: <strong className="text-slate-800">{editingTarget.userName}</strong>
              </div>
              <div className="text-xs text-slate-600">
                Chỉ tiêu: <strong className="text-slate-800">{editingTarget.kpiName}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Mức KPI mới ({editingTarget.unit}):
                </label>
                <input
                  type="text"
                  value={formatNumberWithDots(newTargetValue)}
                  onChange={(e) => setNewTargetValue(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 text-sm font-mono-num font-bold rounded-xl border border-slate-300 text-[#003B70] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Lý do điều chỉnh (Bắt buộc để lưu nhật ký):
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ví dụ: Giám đốc phê duyệt tăng chỉ tiêu Quý 3..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={handleSaveTarget}
                className="flex-1 py-2 rounded-xl bg-[#003B70] text-white text-xs font-bold hover:bg-[#002D56] shadow-sm"
              >
                LƯU ĐIỀU CHỈNH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Copy KPI Targets */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <div>
              <h4 className="text-base font-bold text-[#003B70]">SAO CHÉP CHỈ TIÊU KPI</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Sao chép nhanh toàn bộ định mức KPI của một cán bộ sang cán bộ khác
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Sao chép TỪ cán bộ (Nguồn):</label>
                <select
                  value={sourceUserId}
                  onChange={(e) => setSourceUserId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  {staffUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.title})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Gán SANG cán bộ (Đích):</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="">-- Chọn cán bộ nhận chỉ tiêu --</option>
                  {staffUsers.filter(u => u.id !== sourceUserId).map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.title})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={handleExecuteCopy}
                className="flex-1 py-2.5 rounded-xl bg-[#003B70] text-white text-xs font-bold hover:bg-[#002D56] shadow-sm"
              >
                THỰC HIỆN SAO CHÉP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit KPI Master */}
      {editingKpiMaster && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <h4 className="text-base font-bold text-[#003B70]">CẬP NHẬT CHỈ TIÊU DANH MỤC</h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Mã chỉ tiêu:</label>
                <input
                  type="text"
                  value={editingKpiMaster.code}
                  onChange={(e) => setEditingKpiMaster({ ...editingKpiMaster, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Tên chỉ tiêu:</label>
                <input
                  type="text"
                  value={editingKpiMaster.name}
                  onChange={(e) => setEditingKpiMaster({ ...editingKpiMaster, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Đơn vị tính:</label>
                  <input
                    type="text"
                    value={editingKpiMaster.unit}
                    onChange={(e) => setEditingKpiMaster({ ...editingKpiMaster, unit: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Loại dữ liệu:</label>
                  <select
                    value={editingKpiMaster.dataType}
                    onChange={(e: any) => setEditingKpiMaster({ ...editingKpiMaster, dataType: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="CURRENCY">Tiền tệ (VNĐ)</option>
                    <option value="COUNT">Số lượng (Số)</option>
                    <option value="PERCENTAGE">Tỷ lệ (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Trạng thái:</label>
                <select
                  value={editingKpiMaster.status}
                  onChange={(e: any) => setEditingKpiMaster({ ...editingKpiMaster, status: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="ACTIVE">Đang sử dụng (Active)</option>
                  <option value="INACTIVE">Tạm dừng (Inactive)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingKpiMaster(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingKpiMaster.name.trim()) {
                    alert('Vui lòng nhập tên chỉ tiêu!');
                    return;
                  }
                  const exists = kpis.some(k => k.id === editingKpiMaster.id);
                  if (exists) {
                    updateKpi(editingKpiMaster.id, editingKpiMaster);
                  } else {
                    const { id, ...newKpi } = editingKpiMaster;
                    addKpi(newKpi);
                  }
                  setEditingKpiMaster(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#003B70] text-white text-xs font-bold hover:bg-[#002D56] shadow-sm"
              >
                LƯU CHỈ TIÊU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
