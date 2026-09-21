import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Edit2,
  FileSpreadsheet,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  Unlock,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role, User } from '../../types';

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus, resetUserPassword, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'NHAN_VIEN' | 'TRUONG_PHONG' | 'ADMIN'>('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New user form state
  const [newUserData, setNewUserData] = useState<Omit<User, 'id'>>({
    staffCode: '',
    username: '',
    fullName: '',
    department: 'Phòng DVKH',
    title: 'GDV độc lập',
    phone: '',
    email: '',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      u.fullName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      (u.staffCode && u.staffCode.toLowerCase().includes(term)) ||
      u.title.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term)) ||
      u.email.toLowerCase().includes(term);

    return matchesRole && matchesSearch;
  });

  const handleResetPassword = (u: User) => {
    if (confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu của cán bộ ${u.fullName} về mặc định "123"?`)) {
      resetUserPassword(u.id);
      showToast(`Đã reset mật khẩu của ${u.fullName} về "123"!`);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.id, editingUser);
    setEditingUser(null);
    showToast(`Đã lưu thay đổi thông tin cán bộ ${editingUser.fullName}!`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.fullName.trim() || !newUserData.username.trim() || !newUserData.staffCode.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên, Tên đăng nhập và Mã cán bộ.');
      return;
    }

    // Check duplicate
    if (users.some((u) => u.username.toLowerCase() === newUserData.username.trim().toLowerCase())) {
      alert('Tên đăng nhập (user) này đã tồn tại!');
      return;
    }

    addUser(newUserData);
    setIsAddModalOpen(false);
    showToast(`Đã thêm mới cán bộ ${newUserData.fullName} vào hệ thống!`);
    // Reset form
    setNewUserData({
      staffCode: '',
      username: '',
      fullName: '',
      department: 'Phòng DVKH',
      title: 'GDV độc lập',
      phone: '',
      email: '',
      role: 'NHAN_VIEN',
      status: 'ACTIVE',
      password: '123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#003B70] text-white uppercase tracking-wider">
                QUẢN TRỊ NGƯỜI DÙNG
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Phòng Dịch vụ khách hàng ({users.length} Cán bộ)
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              DANH SÁCH TÀI KHOẢN & PHÂN QUYỀN CÁN BỘ
            </h2>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-[#0072CE] hover:bg-[#005FA8] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ THÊM CÁN BỘ MỚI</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Họ tên, Mã cán bộ, User (vd: thuth, pthiha), SĐT, Email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
            />
          </div>

          <div className="sm:col-span-4 flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${roleFilter === 'ALL' ? 'bg-white text-[#003B70] shadow-xs' : ''}`}
            >
              Tất cả ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('NHAN_VIEN')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${roleFilter === 'NHAN_VIEN' ? 'bg-white text-[#003B70] shadow-xs' : ''}`}
            >
              Cán bộ
            </button>
            <button
              onClick={() => setRoleFilter('TRUONG_PHONG')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${roleFilter === 'TRUONG_PHONG' ? 'bg-white text-[#003B70] shadow-xs' : ''}`}
            >
              Lãnh đạo
            </button>
            <button
              onClick={() => setRoleFilter('ADMIN')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${roleFilter === 'ADMIN' ? 'bg-white text-[#003B70] shadow-xs' : ''}`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#00274B] text-white text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-3">Cán bộ nhân viên</th>
                <th className="py-3 px-3">Mã cán bộ</th>
                <th className="py-3 px-3">Tên đăng nhập</th>
                <th className="py-3 px-3">Chức vụ & Phòng</th>
                <th className="py-3 px-3">Liên hệ</th>
                <th className="py-3 px-3 text-center">Mật khẩu</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u, idx) => (
                <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                    {u.stt || idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={u.avatar}
                        alt={u.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{u.fullName}</span>
                          {u.role === 'TRUONG_PHONG' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              Lãnh đạo
                            </span>
                          )}
                          {u.role === 'ADMIN' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#003B70]">
                    {u.staffCode}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                      {u.username}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800">{u.title}</div>
                    <div className="text-[11px] text-slate-500">{u.department}</div>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-600">
                    <div>{u.phone || 'Chưa có SĐT'}</div>
                    <div className="text-slate-400 truncate max-w-[120px]">{u.email}</div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleResetPassword(u)}
                      title="Bấm để đặt lại mật khẩu về mặc định (123)"
                      className="px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-lg text-[11px] font-semibold flex items-center space-x-1 mx-auto transition-colors"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-600" />
                      <span>{u.password || '123'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 mx-auto transition-colors ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Hoạt động</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Đã khóa</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="p-1.5 text-slate-500 hover:text-[#0072CE] hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center"
                      title="Sửa thông tin cán bộ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-[#0072CE]" />
                <span>Chỉnh sửa thông tin cán bộ</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã cán bộ</label>
                  <input
                    type="text"
                    value={editingUser.staffCode}
                    onChange={(e) => setEditingUser({ ...editingUser, staffCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên đăng nhập (user)</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chức vụ</label>
                  <input
                    type="text"
                    value={editingUser.title}
                    onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phân quyền</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  >
                    <option value="NHAN_VIEN">Cán bộ (Nhân viên)</option>
                    <option value="TRUONG_PHONG">Lãnh đạo phòng</option>
                    <option value="ADMIN">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mật khẩu</label>
                  <input
                    type="text"
                    value={editingUser.password || '123'}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email VietinBank</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0072CE] hover:bg-[#005FA8] text-white rounded-xl font-bold shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-[#0072CE]" />
                <span>Thêm mới cán bộ Phòng DVKH</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên cán bộ *</label>
                <input
                  type="text"
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn X..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã cán bộ *</label>
                  <input
                    type="text"
                    value={newUserData.staffCode}
                    onChange={(e) => setNewUserData({ ...newUserData, staffCode: e.target.value })}
                    placeholder="0005xxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên đăng nhập (user) *</label>
                  <input
                    type="text"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    placeholder="vd: xnv..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chức vụ</label>
                  <input
                    type="text"
                    value={newUserData.title}
                    onChange={(e) => setNewUserData({ ...newUserData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phân quyền</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as Role })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  >
                    <option value="NHAN_VIEN">Cán bộ (Nhân viên)</option>
                    <option value="TRUONG_PHONG">Lãnh đạo phòng</option>
                    <option value="ADMIN">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="09xxxxxxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mật khẩu ban đầu</label>
                  <input
                    type="text"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email VietinBank *</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="USER@VIETINBANK.VN"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0072CE]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0072CE] hover:bg-[#005FA8] text-white rounded-xl font-bold shadow-xs"
                >
                  Tạo cán bộ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
