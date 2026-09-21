export type Role = 'ADMIN' | 'TRUONG_PHONG' | 'NHAN_VIEN';

export type KpiDataType = 'CURRENCY' | 'COUNT';
export type KpiInputMethod = 'INTEGER' | 'DECIMAL';
export type KpiStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  stt?: number;
  staffCode: string; // Mã cán bộ (ví dụ: '00006935', '00006948')
  username: string; // Tên đăng nhập (ví dụ: 'dandq', 'pthiha')
  fullName: string;
  department: string; // 'Phòng DVKH'
  email: string;
  role: Role;
  title: string;
  status: 'ACTIVE' | 'LOCKED';
  avatar?: string;
  phone?: string;
  password?: string; // Mật khẩu mặc định là '123'
}

export interface KpiMaster {
  id: string;
  code: string;
  name: string;
  unit: string;
  dataType: KpiDataType;
  inputMethod: KpiInputMethod;
  status: KpiStatus;
  order: number;
  showOnDashboard: boolean;
  reportToDirector: boolean;
  description?: string;
}

export interface KpiTarget {
  id: string;
  year: number;
  userId: string;
  kpiId: string;
  targetValue: number;
  setAt: string;
  setBy: string;
}

export interface DailyDataEntry {
  id: string;
  date: string; // YYYY-MM-DD
  userId: string;
  kpiId: string;
  value: number; // Exact integer value (e.g., 1256387425 VND)
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  previousValue?: number; // to track edits
  note?: string;
}

export interface KpiHistory {
  id: string;
  kpiId: string;
  userId: string;
  year: number;
  oldValue: number;
  newValue: number;
  updatedBy?: string;
  updatedAt?: string;
  changedAt?: string;
  changedBy?: string;
  reason: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface ReportConfig {
  selectedKpiIds: string[];
  directorEmail: string;
  directorName: string;
  lastUpdated: string;
}

export interface ReportHistory {
  id: string;
  date: string; // YYYY-MM-DD
  lockedAt: string;
  lockedBy: string;
  reportVersion: string;
  selectedKpis: string[];
  status: 'DRAFT' | 'LOCKED' | 'SENT_DIRECTOR';
  emailedAt?: string;
  emailRecipient?: string;
  emailSubject?: string;
  emailStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
  totalKpiAchievedRate?: number;
}

export interface DayLockStatus {
  date: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export interface KpiProgressCalculation {
  kpi: KpiMaster;
  target: number;
  todayValue: number;
  yesterdayValue: number;
  cumulativeValue: number;
  percentage: number;
  remaining: number;
  forecastEndPeriod: number;
  forecastPercentage: number;
  status: 'ACHIEVED' | 'WARNING' | 'SLOW';
  timeProgressRate: number; // e.g. 80% through period
}

export interface OfficerSummary {
  user: User;
  hasUpdatedToday: boolean;
  overallPercentage: number;
  achievedCount: number;
  warningCount: number;
  slowCount: number;
  kpiProgress: Record<string, KpiProgressCalculation>;
}
