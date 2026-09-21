import * as XLSX from 'xlsx';
import {
  AuditLog,
  DailyDataEntry,
  KpiHistory,
  KpiMaster,
  KpiProgressCalculation,
  KpiTarget,
  ReportConfig,
  ReportHistory,
  User,
} from '../types';
import { formatDateVN, formatDateTimeVN, formatNumberWithDots, formatPercentage } from './formatters';

/**
 * Export Director Report to Excel (.xlsx)
 */
export function exportDirectorReportToExcel(
  reportDate: string,
  selectedKpis: KpiProgressCalculation[],
  totalDepartmentRate: number,
  officerSummaries: { user: User; overallRate: number }[]
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Báo Cáo Tổng Hợp
  const rows: any[] = [
    ['VIETINBANK - NGÂN HÀNG TMCP CÔNG THƯƠNG VIỆT NAM'],
    ['CHI NHÁNH NINH BÌNH - PHÒNG DỊCH VỤ KHÁCH HÀNG'],
    [''],
    [`BÁO CÁO KẾT QUẢ THỰC HIỆN CÁC CHỈ TIÊU KPI NGÀY ${formatDateVN(reportDate)}`],
    [`Tỷ lệ hoàn thành tổng thể toàn phòng: ${formatPercentage(totalDepartmentRate)}`],
    [''],
    [
      'STT',
      'Mã KPI',
      'Tên Chỉ tiêu KPI',
      'Đơn vị tính',
      'Giao cả kỳ (KPI)',
      'Thực hiện hôm nay',
      'Lũy kế thực hiện',
      'Tỷ lệ hoàn thành (%)',
      'Còn thiếu',
      'Dự báo cuối kỳ',
      'Đánh giá tiến độ',
    ],
  ];

  selectedKpis.forEach((item, idx) => {
    let statusText = 'Đạt tiến độ';
    if (item.status === 'WARNING') statusText = 'Cần theo dõi';
    if (item.status === 'SLOW') statusText = 'Chậm tiến độ';

    rows.push([
      idx + 1,
      item.kpi.code,
      item.kpi.name,
      item.kpi.unit,
      item.target,
      item.todayValue,
      item.cumulativeValue,
      Number(item.percentage.toFixed(2)),
      item.remaining,
      item.forecastEndPeriod,
      statusText,
    ]);
  });

  rows.push(['']);
  rows.push(['TÌNH HÌNH CÁN BỘ PHÒNG']);
  rows.push(['STT', 'Họ và tên cán bộ', 'Chức danh', 'Tỷ lệ hoàn thành KPI tổng thể']);

  officerSummaries.forEach((off, idx) => {
    rows.push([
      idx + 1,
      off.user.fullName,
      off.user.title,
      Number(off.overallRate.toFixed(2)) + '%',
    ]);
  });

  rows.push(['']);
  rows.push([`Báo cáo được lập tự động từ hệ thống DVKH DAILY KPI vào lúc ${new Date().toLocaleString('vi-VN')}`]);
  rows.push(['Người phê duyệt / Chốt báo cáo: Trưởng phòng DVKH']);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Ma KPI
    { wch: 30 }, // Ten KPI
    { wch: 12 }, // Don vi
    { wch: 18 }, // Giao ca ky
    { wch: 18 }, // Hom nay
    { wch: 20 }, // Luy ke
    { wch: 16 }, // % Hoan thanh
    { wch: 18 }, // Con thieu
    { wch: 18 }, // Du bao
    { wch: 16 }, // Trang thai
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Bao_Cao_Giam_Doc');

  // Download file
  const fileName = `VietinBank_BaoCao_DVKH_${reportDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export all 8 database sheets for Google Sheets offline backup or sync
 */
export function exportAll8SheetsToExcel(data: {
  users: User[];
  kpis: KpiMaster[];
  targets: KpiTarget[];
  dailyEntries: DailyDataEntry[];
  kpiHistory: KpiHistory[];
  auditLogs: AuditLog[];
  reportConfig: ReportConfig;
  reportHistory: ReportHistory[];
}) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet USERS
  const usersRows = data.users.map(u => ({
    'User ID': u.id,
    'Username': u.username,
    'Họ tên': u.fullName,
    'Email': u.email,
    'Vai trò': u.role,
    'Chức danh': u.title,
    'Trạng thái': u.status,
    'Điện thoại': u.phone || '',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(usersRows), 'USERS');

  // 2. Sheet KPI_MASTER
  const kpiRows = data.kpis.map(k => ({
    'KPI ID': k.id,
    'Mã KPI': k.code,
    'Tên KPI': k.name,
    'Đơn vị': k.unit,
    'Loại dữ liệu': k.dataType,
    'Kiểu nhập': k.inputMethod,
    'Trạng thái': k.status,
    'Thứ tự': k.order,
    'Hiện trên Dashboard': k.showOnDashboard ? 'CÓ' : 'KHÔNG',
    'Báo cáo Giám đốc': k.reportToDirector ? 'CÓ' : 'KHÔNG',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpiRows), 'KPI_MASTER');

  // 3. Sheet KPI_TARGET
  const targetRows = data.targets.map(t => {
    const user = data.users.find(u => u.id === t.userId);
    const kpi = data.kpis.find(k => k.id === t.kpiId);
    return {
      'ID': t.id,
      'Năm': t.year,
      'User ID': t.userId,
      'Họ tên': user?.fullName || t.userId,
      'KPI ID': t.kpiId,
      'Tên KPI': kpi?.name || t.kpiId,
      'KPI được giao': t.targetValue,
      'Ngày thiết lập': t.setAt,
      'Người thiết lập': t.setBy,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(targetRows), 'KPI_TARGET');

  // 4. Sheet DAILY_DATA
  const dailyRows = data.dailyEntries.map(d => {
    const user = data.users.find(u => u.id === d.userId);
    const kpi = data.kpis.find(k => k.id === d.kpiId);
    return {
      'ID': d.id,
      'Ngày': d.date,
      'User ID': d.userId,
      'Cán bộ': user?.fullName || d.userId,
      'KPI ID': d.kpiId,
      'Chỉ tiêu': kpi?.name || d.kpiId,
      'Số thực hiện': d.value,
      'Thời gian nhập': d.createdAt,
      'Người nhập': d.createdBy,
      'Thời gian cập nhật': d.updatedAt || '',
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailyRows), 'DAILY_DATA');

  // 5. Sheet KPI_HISTORY
  const historyRows = data.kpiHistory.map(h => ({
    'ID': h.id,
    'KPI ID': h.kpiId,
    'User ID': h.userId,
    'Năm': h.year,
    'KPI Cũ': h.oldValue,
    'KPI Mới': h.newValue,
    'Người chỉnh sửa': h.updatedBy,
    'Thời gian': h.updatedAt,
    'Lý do': h.reason,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(historyRows), 'KPI_HISTORY');

  // 6. Sheet AUDIT_LOG
  const logRows = data.auditLogs.map(l => ({
    'ID': l.id,
    'Hành động': l.action,
    'User ID': l.userId,
    'Tên người dùng': l.userName,
    'Chi tiết': l.details,
    'Thời gian': l.timestamp,
    'Địa chỉ IP': l.ipAddress || '',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logRows), 'AUDIT_LOG');

  // 7. Sheet REPORT_CONFIG
  const configRows = [{
    'Danh sách KPI Báo cáo': data.reportConfig.selectedKpiIds.join(', '),
    'Email Giám đốc': data.reportConfig.directorEmail,
    'Tên Ban Giám đốc': data.reportConfig.directorName,
    'Cập nhật lần cuối': data.reportConfig.lastUpdated,
  }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(configRows), 'REPORT_CONFIG');

  // 8. Sheet REPORT_HISTORY
  const repRows = data.reportHistory.map(r => ({
    'ID': r.id,
    'Ngày báo cáo': r.date,
    'Thời gian chốt': r.lockedAt,
    'Người chốt': r.lockedBy,
    'Phiên bản': r.reportVersion,
    'Trạng thái': r.status,
    'Thời gian gửi Email': r.emailedAt || '',
    'Email Người nhận': r.emailRecipient || '',
    'Tiêu đề': r.emailSubject || '',
    'Trạng thái gửi': r.emailStatus || '',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(repRows), 'REPORT_HISTORY');

  const fileName = `VietinBank_NinhBinh_DVKH_Database_8Sheets_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportAllSheetsToExcel(
  users: User[],
  kpis: KpiMaster[],
  targets: KpiTarget[],
  dailyEntries: DailyDataEntry[],
  kpiHistory: KpiHistory[],
  auditLogs: AuditLog[],
  reportConfig: ReportConfig,
  reportHistory: ReportHistory[]
) {
  exportAll8SheetsToExcel({
    users,
    kpis,
    targets,
    dailyEntries,
    kpiHistory,
    auditLogs,
    reportConfig,
    reportHistory,
  });
}
