import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_DAILY_ENTRIES,
  INITIAL_DAY_LOCKS,
  INITIAL_KPI_HISTORY,
  INITIAL_KPIS,
  INITIAL_REPORT_CONFIG,
  INITIAL_REPORT_HISTORY,
  INITIAL_TARGETS,
  INITIAL_USERS,
} from '../data/initialData';
import {
  AuditLog,
  DailyDataEntry,
  DayLockStatus,
  KpiHistory,
  KpiMaster,
  KpiTarget,
  ReportConfig,
  ReportHistory,
  Role,
  User,
} from '../types';

interface GoogleSheetsStatus {
  lastSynced: string;
  isSyncing: boolean;
  status: 'SYNCED' | 'ERROR' | 'IDLE';
  errorMessage?: string;
  sheetUrl?: string;
}

interface AppContextType {
  currentUser: User;
  selectedDate: string;
  users: User[];
  kpis: KpiMaster[];
  targets: KpiTarget[];
  dailyEntries: DailyDataEntry[];
  kpiHistory: KpiHistory[];
  auditLogs: AuditLog[];
  reportConfig: ReportConfig;
  reportHistory: ReportHistory[];
  dayLocks: Record<string, DayLockStatus>;
  googleSheetsStatus: GoogleSheetsStatus;
  
  // Auth state & actions
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  resetUserPassword: (userId: string) => void;
  updateUser: (userId: string, data: Partial<User>) => void;

  // Navigation active tab helper
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Actions
  switchUser: (userId: string) => void;
  setSelectedDate: (date: string) => void;
  saveDailyEntry: (userId: string, kpiId: string, value: number, date?: string) => { success: boolean; message?: string };
  isDateLocked: (date: string) => boolean;
  toggleLockDay: (date: string) => void;
  addKpi: (kpi: Omit<KpiMaster, 'id'>) => void;
  updateKpi: (id: string, partial: Partial<KpiMaster>) => void;
  setKpiTarget: (userId: string, kpiId: string, year: number, newValue: number, reason: string) => void;
  copyKpiTargets: (sourceUserId: string, targetUserId: string, year: number, reason: string) => void;
  updateReportConfig: (selectedKpiIds: string[], directorEmail?: string, directorName?: string) => void;
  finalizeReport: (date: string) => { success: boolean; version: string };
  sendReportEmail: (date: string, recipient: string, subject: string, content?: string) => Promise<boolean>;
  triggerGoogleSheetsSync: (simulateError?: boolean) => Promise<boolean>;
  addUser: (user: Omit<User, 'id'>) => void;
  toggleUserStatus: (userId: string) => void;
  resetToDemoData: () => void;
  logAudit: (action: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or use INITIAL data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dvkh_users_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 21 && parsed[0].staffCode) {
          return parsed;
        }
      } catch (e) {
        // fall back
      }
    }
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('dvkh_current_user_id');
    if (saved && INITIAL_USERS.some(u => u.id === saved)) {
      return saved;
    }
    return 'user_thuth'; // Mặc định Cán bộ Tạ Hà Thu
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('dvkh_authenticated');
    return saved !== 'false';
  });

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-21');
  const [activeTab, setActiveTab] = useState<string>('home');

  const [kpis, setKpis] = useState<KpiMaster[]>(() => {
    const saved = localStorage.getItem('dvkh_kpis');
    return saved ? JSON.parse(saved) : INITIAL_KPIS;
  });

  const [targets, setTargets] = useState<KpiTarget[]>(() => {
    const saved = localStorage.getItem('dvkh_targets');
    return saved ? JSON.parse(saved) : INITIAL_TARGETS;
  });

  const [dailyEntries, setDailyEntries] = useState<DailyDataEntry[]>(() => {
    const saved = localStorage.getItem('dvkh_daily_entries');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_ENTRIES;
  });

  const [kpiHistory, setKpiHistory] = useState<KpiHistory[]>(() => {
    const saved = localStorage.getItem('dvkh_kpi_history');
    return saved ? JSON.parse(saved) : INITIAL_KPI_HISTORY;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('dvkh_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [reportConfig, setReportConfig] = useState<ReportConfig>(() => {
    const saved = localStorage.getItem('dvkh_report_config');
    return saved ? JSON.parse(saved) : INITIAL_REPORT_CONFIG;
  });

  const [reportHistory, setReportHistory] = useState<ReportHistory[]>(() => {
    const saved = localStorage.getItem('dvkh_report_history');
    return saved ? JSON.parse(saved) : INITIAL_REPORT_HISTORY;
  });

  const [dayLocks, setDayLocks] = useState<Record<string, DayLockStatus>>(() => {
    const saved = localStorage.getItem('dvkh_day_locks');
    return saved ? JSON.parse(saved) : INITIAL_DAY_LOCKS;
  });

  const [googleSheetsStatus, setGoogleSheetsStatus] = useState<GoogleSheetsStatus>({
    lastSynced: '21/09/2026 16:42',
    isSyncing: false,
    status: 'SYNCED',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1_VIETINBANK_NINHBINH_DVKH_KPI_2026',
  });

  // Current user object
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('dvkh_users_v2', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('dvkh_current_user_id', currentUserId);
  }, [currentUserId]);
  useEffect(() => {
    localStorage.setItem('dvkh_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);
  useEffect(() => {
    localStorage.setItem('dvkh_kpis', JSON.stringify(kpis));
  }, [kpis]);
  useEffect(() => {
    localStorage.setItem('dvkh_targets', JSON.stringify(targets));
  }, [targets]);
  useEffect(() => {
    localStorage.setItem('dvkh_daily_entries', JSON.stringify(dailyEntries));
  }, [dailyEntries]);
  useEffect(() => {
    localStorage.setItem('dvkh_kpi_history', JSON.stringify(kpiHistory));
  }, [kpiHistory]);
  useEffect(() => {
    localStorage.setItem('dvkh_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('dvkh_report_config', JSON.stringify(reportConfig));
  }, [reportConfig]);
  useEffect(() => {
    localStorage.setItem('dvkh_report_history', JSON.stringify(reportHistory));
  }, [reportHistory]);
  useEffect(() => {
    localStorage.setItem('dvkh_day_locks', JSON.stringify(dayLocks));
  }, [dayLocks]);

  // Audit logging helper
  const logAudit = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now(),
      action,
      userId: currentUser.id,
      userName: currentUser.fullName,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '10.24.18.' + Math.floor(Math.random() * 80 + 10),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const isDateLocked = (date: string): boolean => {
    return !!dayLocks[date]?.isLocked;
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      logAudit('CHUYỂN NGƯỜI DÙNG', `Chuyển phiên làm việc sang ${target.fullName} (${target.title})`);
      // Reset active tab to default for that role
      if (target.role === 'NHAN_VIEN') {
        setActiveTab('home');
      } else {
        setActiveTab('overview');
      }
    }
  };

  const saveDailyEntry = (userId: string, kpiId: string, value: number, targetDate?: string) => {
    const date = targetDate || selectedDate;

    // Check date lock
    if (isDateLocked(date) && currentUser.role === 'NHAN_VIEN') {
      return {
        success: false,
        message: `Số liệu ngày ${date} đã được Trưởng phòng khóa chốt. Không thể tự sửa! Vui lòng liên hệ Trưởng phòng để mở khóa.`,
      };
    }

    const targetKpi = kpis.find(k => k.id === kpiId);
    const existingIndex = dailyEntries.findIndex(e => e.userId === userId && e.kpiId === kpiId && e.date === date);

    let prevValue = 0;
    const nowIso = new Date().toISOString();

    if (existingIndex >= 0) {
      prevValue = dailyEntries[existingIndex].value;
      const updated = [...dailyEntries];
      updated[existingIndex] = {
        ...updated[existingIndex],
        value,
        updatedAt: nowIso,
        updatedBy: currentUser.id,
        previousValue: prevValue,
      };
      setDailyEntries(updated);
    } else {
      const newEntry: DailyDataEntry = {
        id: `d_${userId}_${kpiId}_${date}_${Date.now()}`,
        date,
        userId,
        kpiId,
        value,
        createdAt: nowIso,
        createdBy: currentUser.id,
      };
      setDailyEntries(prev => [...prev, newEntry]);
    }

    logAudit(
      'NHẬP SỐ LIỆU',
      `Cán bộ ${users.find(u => u.id === userId)?.fullName || userId} nhập chỉ tiêu "${targetKpi?.name || kpiId}" ngày ${date}: ${value.toLocaleString('vi-VN')} ${targetKpi?.unit || ''}` +
        (prevValue ? ` (Trước sửa: ${prevValue.toLocaleString('vi-VN')})` : '')
    );

    // Also trigger mock Google Sheets sync in background
    setGoogleSheetsStatus(prev => ({
      ...prev,
      lastSynced: new Date().toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'SYNCED',
    }));

    return { success: true };
  };

  const toggleLockDay = (date: string) => {
    const currentStatus = dayLocks[date]?.isLocked || false;
    const nextStatus = !currentStatus;

    setDayLocks(prev => ({
      ...prev,
      [date]: {
        date,
        isLocked: nextStatus,
        lockedBy: currentUser.fullName,
        lockedAt: new Date().toISOString(),
      },
    }));

    logAudit(
      nextStatus ? 'KHÓA CHỐT SỐ LIỆU NGÀY' : 'MỞ KHÓA SỐ LIỆU NGÀY',
      `${currentUser.fullName} đã ${nextStatus ? 'khóa chốt' : 'mở khóa'} số liệu ngày ${date}.`
    );
  };

  const addKpi = (newKpiData: Omit<KpiMaster, 'id'>) => {
    const id = 'kpi_' + Date.now();
    const newKpi: KpiMaster = {
      ...newKpiData,
      id,
    };
    setKpis(prev => [...prev, newKpi]);
    logAudit('THÊM CHỈ TIÊU KPI', `Thêm mới chỉ tiêu: ${newKpi.name} (${newKpi.code}), Đơn vị: ${newKpi.unit}`);
  };

  const updateKpi = (id: string, partial: Partial<KpiMaster>) => {
    setKpis(prev => prev.map(k => (k.id === id ? { ...k, ...partial } : k)));
    const kpi = kpis.find(k => k.id === id);
    logAudit('CẬP NHẬT CHỈ TIÊU KPI', `Cập nhật thông tin chỉ tiêu "${kpi?.name || id}"`);
  };

  const setKpiTarget = (userId: string, kpiId: string, year: number, newValue: number, reason: string) => {
    const existing = targets.find(t => t.userId === userId && t.kpiId === kpiId && t.year === year);
    const oldValue = existing ? existing.targetValue : 0;
    const nowIso = new Date().toISOString();

    if (existing) {
      setTargets(prev =>
        prev.map(t => (t.id === existing.id ? { ...t, targetValue: newValue, setAt: nowIso, setBy: currentUser.id } : t))
      );
    } else {
      const newTgt: KpiTarget = {
        id: `tgt_${userId}_${kpiId}_${year}_${Date.now()}`,
        year,
        userId,
        kpiId,
        targetValue: newValue,
        setAt: nowIso,
        setBy: currentUser.id,
      };
      setTargets(prev => [...prev, newTgt]);
    }

    // Save history
    const historyItem: KpiHistory = {
      id: 'kh_' + Date.now(),
      kpiId,
      userId,
      year,
      oldValue,
      newValue,
      updatedBy: currentUser.fullName,
      updatedAt: nowIso,
      reason,
    };
    setKpiHistory(prev => [historyItem, ...prev]);

    const targetUser = users.find(u => u.id === userId);
    const targetKpi = kpis.find(k => k.id === kpiId);
    logAudit(
      'GIAO/ĐIỀU CHỈNH KPI',
      `Điều chỉnh KPI ${targetKpi?.name} cho cán bộ ${targetUser?.fullName}: từ ${oldValue.toLocaleString('vi-VN')} thành ${newValue.toLocaleString('vi-VN')} ${targetKpi?.unit}. Lý do: ${reason}`
    );
  };

  const copyKpiTargets = (sourceUserId: string, targetUserId: string, year: number, reason: string) => {
    const sourceTargets = targets.filter(t => t.userId === sourceUserId && t.year === year);
    const nowIso = new Date().toISOString();
    const sourceUser = users.find(u => u.id === sourceUserId);
    const targetUser = users.find(u => u.id === targetUserId);

    sourceTargets.forEach(st => {
      setKpiTarget(targetUserId, st.kpiId, year, st.targetValue, `Sao chép từ cán bộ ${sourceUser?.fullName}: ${reason}`);
    });

    logAudit(
      'SAO CHÉP KPI',
      `Sao chép toàn bộ bộ chỉ tiêu năm ${year} từ ${sourceUser?.fullName} sang ${targetUser?.fullName}`
    );
  };

  const updateReportConfig = (selectedKpiIds: string[], directorEmail?: string, directorName?: string) => {
    setReportConfig(prev => ({
      ...prev,
      selectedKpiIds,
      directorEmail: directorEmail || prev.directorEmail,
      directorName: directorName || prev.directorName,
      lastUpdated: new Date().toISOString(),
    }));
    logAudit('CẤU HÌNH BÁO CÁO GIÁM ĐỐC', `Cập nhật danh sách ${selectedKpiIds.length} chỉ tiêu báo cáo Giám đốc`);
  };

  const finalizeReport = (date: string) => {
    const version = `v1.${reportHistory.filter(r => r.date === date).length + 1}-CHOT`;
    const newReport: ReportHistory = {
      id: 'rep_' + date.replace(/-/g, '') + '_' + Date.now(),
      date,
      lockedAt: new Date().toISOString(),
      lockedBy: `${currentUser.fullName} (${currentUser.title})`,
      reportVersion: version,
      selectedKpis: reportConfig.selectedKpiIds,
      status: 'LOCKED',
    };

    setReportHistory(prev => [newReport, ...prev]);

    // Also automatically lock day so staff cannot modify
    setDayLocks(prev => ({
      ...prev,
      [date]: {
        date,
        isLocked: true,
        lockedBy: currentUser.fullName,
        lockedAt: new Date().toISOString(),
      },
    }));

    logAudit('CHỐT BÁO CÁO NGÀY', `Trưởng phòng chốt phiên bản báo cáo ${version} ngày ${date}`);
    return { success: true, version };
  };

  const sendReportEmail = async (date: string, recipient: string, subject: string, content?: string): Promise<boolean> => {
    // Simulate sending email to Director
    await new Promise(r => setTimeout(r, 600));

    const nowIso = new Date().toISOString();
    setReportHistory(prev => {
      const idx = prev.findIndex(r => r.date === date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          status: 'SENT_DIRECTOR',
          emailedAt: nowIso,
          emailRecipient: recipient,
          emailSubject: subject,
          emailStatus: 'SUCCESS',
        };
        return updated;
      }
      return [
        {
          id: 'rep_' + date.replace(/-/g, ''),
          date,
          lockedAt: nowIso,
          lockedBy: currentUser.fullName,
          reportVersion: 'v1.0-CHOT',
          selectedKpis: reportConfig.selectedKpiIds,
          status: 'SENT_DIRECTOR',
          emailedAt: nowIso,
          emailRecipient: recipient,
          emailSubject: subject,
          emailStatus: 'SUCCESS',
        },
        ...prev,
      ];
    });

    logAudit(
      'GỬI EMAIL GIÁM ĐỐC',
      `Gửi báo cáo số liệu ngày ${date} tới ${recipient} thành công. Tiêu đề: "${subject}"`
    );

    return true;
  };

  const triggerGoogleSheetsSync = async (simulateError: boolean = false): Promise<boolean> => {
    setGoogleSheetsStatus(prev => ({ ...prev, isSyncing: true, status: 'IDLE' }));
    await new Promise(r => setTimeout(r, 900));

    if (simulateError) {
      setGoogleSheetsStatus(prev => ({
        ...prev,
        isSyncing: false,
        status: 'ERROR',
        errorMessage: 'Không thể kết nối đến Google Sheets Server (HTTP 503). Vui lòng thử lại!',
      }));
      logAudit('LỖI ĐỒNG BỘ GOOGLE SHEETS', 'Đồng bộ Google Sheets thất bại (Mô phỏng ngắt kết nối)');
      return false;
    }

    const timeStr = new Date().toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setGoogleSheetsStatus({
      lastSynced: timeStr,
      isSyncing: false,
      status: 'SYNCED',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1_VIETINBANK_NINHBINH_DVKH_KPI_2026',
    });

    logAudit('ĐỒNG BỘ GOOGLE SHEETS', `Đồng bộ thành công 8 Sheets dữ liệu sang Google Sheets tập trung lúc ${timeStr}`);
    return true;
  };

  const login = (identifier: string, password: string): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId) {
      return { success: false, message: 'Vui lòng nhập Tên đăng nhập, Mã cán bộ hoặc Email.' };
    }

    if (!cleanPass) {
      return { success: false, message: 'Vui lòng nhập Mật khẩu (mặc định là 123).' };
    }

    const found = users.find(
      u =>
        u.username.toLowerCase() === cleanId ||
        (u.staffCode && u.staffCode.toLowerCase() === cleanId) ||
        u.email.toLowerCase() === cleanId
    );

    if (!found) {
      return { success: false, message: 'Tài khoản không tồn tại trên hệ thống Phòng DVKH.' };
    }

    if (found.status === 'LOCKED') {
      return { success: false, message: 'Tài khoản cán bộ đã bị khóa. Vui lòng liên hệ Trưởng phòng hoặc Quản trị viên.' };
    }

    const expectedPass = found.password || '123';
    if (cleanPass !== expectedPass) {
      return { success: false, message: 'Mật khẩu không chính xác. Mật khẩu mặc định là 123.' };
    }

    setCurrentUserId(found.id);
    setIsAuthenticated(true);
    localStorage.setItem('dvkh_authenticated', 'true');
    localStorage.setItem('dvkh_current_user_id', found.id);
    logAudit('ĐĂNG NHẬP', `Cán bộ ${found.fullName} (${found.username}) đăng nhập thành công`);

    // Chuyển tab tương ứng với vai trò
    if (found.role === 'NHAN_VIEN') {
      setActiveTab('home');
    } else {
      setActiveTab('overview');
    }

    return { success: true };
  };

  const logout = () => {
    logAudit('ĐĂNG XUẤT', `Cán bộ ${currentUser.fullName} đăng xuất khỏi hệ thống`);
    setIsAuthenticated(false);
    localStorage.setItem('dvkh_authenticated', 'false');
  };

  const resetUserPassword = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          logAudit('RESET MẬT KHẨU', `Khôi phục mật khẩu mặc định (123) cho cán bộ: ${u.fullName} (${u.username})`);
          return { ...u, password: '123' };
        }
        return u;
      })
    );
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          logAudit('CẬP NHẬT USER', `Cập nhật thông tin cán bộ: ${u.fullName}`);
          return { ...u, ...data };
        }
        return u;
      })
    );
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const id = 'user_' + Date.now();
    const newUser: User = { ...userData, id, password: userData.password || '123' };
    setUsers(prev => [...prev, newUser]);
    logAudit('TẠO USER MỚI', `Tạo tài khoản cán bộ: ${newUser.fullName} (${newUser.username}) - ${newUser.role}`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
          logAudit(nextStatus === 'LOCKED' ? 'KHÓA USER' : 'MỞ KHÓA USER', `Cập nhật trạng thái của ${u.fullName} thành ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserId('user_pthiha');
    setKpis(INITIAL_KPIS);
    setTargets(INITIAL_TARGETS);
    setDailyEntries(INITIAL_DAILY_ENTRIES);
    setKpiHistory(INITIAL_KPI_HISTORY);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setReportConfig(INITIAL_REPORT_CONFIG);
    setReportHistory(INITIAL_REPORT_HISTORY);
    setDayLocks(INITIAL_DAY_LOCKS);
    setSelectedDate('2026-09-21');
    setActiveTab('home');
    setIsAuthenticated(true);
    localStorage.setItem('dvkh_authenticated', 'true');
    localStorage.setItem('dvkh_users_v2', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('dvkh_current_user_id', 'user_pthiha');
    setGoogleSheetsStatus({
      lastSynced: '21/09/2026 16:42',
      isSyncing: false,
      status: 'SYNCED',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1_VIETINBANK_NINHBINH_DVKH_KPI_2026',
    });
    alert('Đã khôi phục dữ liệu 21 cán bộ nhân viên Phòng DVKH VietinBank Chi nhánh Ninh Bình!');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        selectedDate,
        users,
        kpis,
        targets,
        dailyEntries,
        kpiHistory,
        auditLogs,
        reportConfig,
        reportHistory,
        dayLocks,
        googleSheetsStatus,
        activeTab,
        setActiveTab,
        isAuthenticated,
        login,
        logout,
        resetUserPassword,
        updateUser,
        switchUser,
        setSelectedDate,
        saveDailyEntry,
        isDateLocked,
        toggleLockDay,
        addKpi,
        updateKpi,
        setKpiTarget,
        copyKpiTargets,
        updateReportConfig,
        finalizeReport,
        sendReportEmail,
        triggerGoogleSheetsSync,
        addUser,
        toggleUserStatus,
        resetToDemoData,
        logAudit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
