import {
  AuditLog,
  DailyDataEntry,
  DayLockStatus,
  KpiHistory,
  KpiMaster,
  KpiTarget,
  ReportConfig,
  ReportHistory,
  User,
} from '../types';

// Danh sách 21 cán bộ nhân viên Phòng Dịch vụ khách hàng - VietinBank Chi nhánh Ninh Bình
export const INITIAL_USERS: User[] = [
  {
    stt: 15,
    id: 'user_dandq',
    staffCode: '00006935',
    username: 'dandq',
    fullName: 'Đinh Quang Dân',
    department: 'Phòng DVKH',
    title: 'Phó phòng Dịch vụ KH (TTKQ)',
    phone: '0947676868',
    email: 'DANDQ@VIETINBANK.VN',
    role: 'TRUONG_PHONG',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 16,
    id: 'user_pthiha',
    staffCode: '00006948',
    username: 'pthiha',
    fullName: 'Phạm Thị Hà',
    department: 'Phòng DVKH',
    title: 'Trưởng phòng Dịch vụ KH',
    phone: '0915209091',
    email: 'PTHIHA@VIETINBANK.VN',
    role: 'TRUONG_PHONG',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 17,
    id: 'user_dthue',
    staffCode: '00006950',
    username: 'dt.hue',
    fullName: 'Đỗ Thị Huế',
    department: 'Phòng DVKH',
    title: 'Phó phòng Dịch vụ KH (Kế toán)',
    phone: '0945268885',
    email: 'DT.HUE@VIETINBANK.VN',
    role: 'TRUONG_PHONG',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 18,
    id: 'user_vunm',
    staffCode: '00006959',
    username: 'vunm',
    fullName: 'Nguyễn Minh Vũ',
    department: 'Phòng DVKH',
    title: 'Thủ quỹ',
    phone: '0838608888',
    email: 'VUNM@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 19,
    id: 'user_lienltk',
    staffCode: '00006978',
    username: 'lien.ltk',
    fullName: 'Lương Thị Kim Liên',
    department: 'Phòng DVKH',
    title: 'Thủ quỹ',
    phone: '0973122679',
    email: 'LIEN.LTK@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 20,
    id: 'user_thuanpty',
    staffCode: '00006980',
    username: 'thuanpty',
    fullName: 'Phạm Thị Yến Thuận',
    department: 'Phòng DVKH',
    title: 'Thủ quỹ',
    phone: '0917900250',
    email: 'THUANPTY@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 21,
    id: 'user_thuynt400',
    staffCode: '00006994',
    username: 'thuynt400',
    fullName: 'Nguyễn Thị Thủy',
    department: 'Phòng DVKH',
    title: 'Thủ quỹ',
    phone: '0948422368',
    email: 'THUYNT400@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 22,
    id: 'user_thuth',
    staffCode: '00015042',
    username: 'thuth',
    fullName: 'Tạ Hà Thu',
    department: 'Phòng DVKH',
    title: 'GDV độc lập',
    phone: '0949128737',
    email: 'THUTH@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 23,
    id: 'user_yenvth',
    staffCode: '00015048',
    username: 'yenvth',
    fullName: 'Vũ Thị Hải Yến',
    department: 'Phòng DVKH',
    title: 'GDV độc lập',
    phone: '0915378184',
    email: 'YENVTH@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 24,
    id: 'user_dthphuong',
    staffCode: '00015062',
    username: 'dthphuong',
    fullName: 'Đoàn Thị Hải Phượng',
    department: 'Phòng DVKH',
    title: 'GDV độc lập',
    phone: '0979051287',
    email: 'DTHPHUONG@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 25,
    id: 'user_oanhth',
    staffCode: '00015065',
    username: 'oanh.th',
    fullName: 'Trần Hoàng Oanh',
    department: 'Phòng DVKH',
    title: 'Nhân viên kế toán tài chính',
    phone: '0912872173',
    email: 'OANH.TH@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 26,
    id: 'user_tuyetdtl',
    staffCode: '00015068',
    username: 'tuyetdtl',
    fullName: 'Đinh Thị Lệ Tuyết',
    department: 'Phòng DVKH',
    title: 'Thủ kho',
    phone: '0344790810',
    email: 'TUYETDTL@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 27,
    id: 'user_ttquy',
    staffCode: '00021989',
    username: 'ttquy',
    fullName: 'Trương Thanh Quý',
    department: 'Phòng DVKH',
    title: 'Phó phòng Dịch vụ KH (Kế toán)',
    phone: '0916884849',
    email: 'TTQUY@VIETINBANK.VN',
    role: 'TRUONG_PHONG',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 28,
    id: 'user_anhct',
    staffCode: '00030000',
    username: 'anhct',
    fullName: 'Cù Thế Anh',
    department: 'Phòng DVKH',
    title: 'Thủ quỹ',
    phone: '0977935552',
    email: 'ANHCT@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 29,
    id: 'user_anhltn1',
    staffCode: '00030628',
    username: 'anhltn1',
    fullName: 'Lê Thị Ngọc Anh',
    department: 'Phòng DVKH',
    title: 'GDV độc lập',
    phone: '0948326676',
    email: 'ANHLTN1@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 30,
    id: 'user_huent14',
    staffCode: '00038210',
    username: 'huent14',
    fullName: 'Nguyễn Thị Huế',
    department: 'Phòng DVKH',
    title: 'GDV độc lập',
    phone: '0966877969',
    email: 'HUENT14@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 31,
    id: 'user_locltm',
    staffCode: '00041358',
    username: 'locltm',
    fullName: 'Lê Thị Mỹ Lộc',
    department: 'Phòng DVKH',
    title: 'GDV độc lập',
    phone: '0946894152',
    email: 'LOCLTM@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 32,
    id: 'user_thuytt18',
    staffCode: '00041361',
    username: 'thuytt18',
    fullName: 'Thái Thị Thủy',
    department: 'Phòng DVKH',
    title: 'GDV độc lập',
    phone: '0973710152',
    email: 'THUYTT18@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 33,
    id: 'user_phly',
    staffCode: '00051875',
    username: 'phly',
    fullName: 'Phạm Hương Ly',
    department: 'Phòng DVKH',
    title: 'GDV độc lập',
    phone: '0367123462',
    email: 'PHLY@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 34,
    id: 'user_ducnt4',
    staffCode: '00053550',
    username: 'ducnt4',
    fullName: 'Nguyễn Trọng Đức',
    department: 'Phòng DVKH',
    title: 'Kỹ sư Điện toán',
    phone: '0943882109',
    email: 'DUCNT4@VIETINBANK.VN',
    role: 'ADMIN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
  {
    stt: 35,
    id: 'user_chihl',
    staffCode: '00055890',
    username: 'chihl',
    fullName: 'Hoàng Linh Chi',
    department: 'Phòng DVKH',
    title: 'GDV độc lập',
    phone: '0918889999',
    email: 'CHIHL@VIETINBANK.VN',
    role: 'NHAN_VIEN',
    status: 'ACTIVE',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
];

// Danh mục 8 Chỉ tiêu KPI chuẩn Phòng DVKH VietinBank
export const INITIAL_KPIS: KpiMaster[] = [
  {
    id: 'kpi_nv',
    code: 'NGUON_VON',
    name: 'Nguồn vốn bình quân',
    unit: 'VNĐ',
    dataType: 'CURRENCY',
    inputMethod: 'INTEGER',
    status: 'ACTIVE',
    order: 1,
    showOnDashboard: true,
    reportToDirector: true,
    description: 'Huy động tiền gửi tiết kiệm và tiền gửi thanh toán từ khách hàng',
  },
  {
    id: 'kpi_thuphi',
    code: 'THU_PHI',
    name: 'Thu thuần phí dịch vụ',
    unit: 'VNĐ',
    dataType: 'CURRENCY',
    inputMethod: 'INTEGER',
    status: 'ACTIVE',
    order: 2,
    showOnDashboard: true,
    reportToDirector: true,
    description: 'Tổng thu thuần từ phí dịch vụ thanh toán, chuyển tiền, quản lý tài khoản...',
  },
  {
    id: 'kpi_kdnt',
    code: 'KDNT',
    name: 'Lợi nhuận KD ngoại tệ',
    unit: 'VNĐ',
    dataType: 'CURRENCY',
    inputMethod: 'INTEGER',
    status: 'ACTIVE',
    order: 3,
    showOnDashboard: true,
    reportToDirector: true,
    description: 'Chênh lệch mua bán và kinh doanh ngoại tệ tại quầy giao dịch',
  },
  {
    id: 'kpi_manu',
    code: 'MANULIFE',
    name: 'Bảo hiểm Manulife (FYA)',
    unit: 'Hợp đồng',
    dataType: 'COUNT',
    inputMethod: 'INTEGER',
    status: 'ACTIVE',
    order: 4,
    showOnDashboard: true,
    reportToDirector: true,
    description: 'Hợp đồng bảo hiểm nhân thọ Manulife phát hành mới thành công',
  },
  {
    id: 'kpi_vbi',
    code: 'VBI',
    name: 'Bảo hiểm phi nhân thọ VBI',
    unit: 'Hợp đồng',
    dataType: 'COUNT',
    inputMethod: 'INTEGER',
    status: 'ACTIVE',
    order: 5,
    showOnDashboard: true,
    reportToDirector: true,
    description: 'Hợp đồng bảo hiểm tài sản, ô tô, sức khỏe VietinBank Insurance (VBI)',
  },
  {
    id: 'kpi_ipay',
    code: 'IPAY',
    name: 'Tài khoản VietinBank iPay',
    unit: 'Tài khoản',
    dataType: 'COUNT',
    inputMethod: 'INTEGER',
    status: 'ACTIVE',
    order: 6,
    showOnDashboard: true,
    reportToDirector: true,
    description: 'Tài khoản ngân hàng số VietinBank iPay Mobile mở mới và kích hoạt',
  },
  {
    id: 'kpi_efast',
    code: 'EFAST',
    name: 'Tài khoản Efast',
    unit: 'Tài khoản',
    dataType: 'COUNT',
    inputMethod: 'INTEGER',
    status: 'ACTIVE',
    order: 7,
    showOnDashboard: true,
    reportToDirector: false,
    description: 'Ngân hàng số doanh nghiệp VietinBank eFAST',
  },
  {
    id: 'kpi_the',
    code: 'THE_TD',
    name: 'Phát hành Thẻ (Ghi nợ & Tín dụng)',
    unit: 'Thẻ',
    dataType: 'COUNT',
    inputMethod: 'INTEGER',
    status: 'ACTIVE',
    order: 8,
    showOnDashboard: true,
    reportToDirector: true,
    description: 'Thẻ ghi nợ quốc tế, thẻ nội địa và thẻ tín dụng VietinBank phát hành thành công',
  },
];

// Helper to generate base targets for users
const generateDefaultTargets = (): KpiTarget[] => {
  const result: KpiTarget[] = [];
  const targetProfiles: Record<string, { nv: number; tp: number; kdnt: number; manu: number; vbi: number; ipay: number; efast: number; the: number }> = {
    // GDV standard profile
    gdv: { nv: 40000000000, tp: 250000000, kdnt: 80000000, manu: 80, vbi: 40, ipay: 250, efast: 30, the: 120 },
    // Thu quy profile
    thuquy: { nv: 25000000000, tp: 150000000, kdnt: 50000000, manu: 40, vbi: 25, ipay: 150, efast: 15, the: 60 },
    // Ke toan / admin profile
    ketoan: { nv: 30000000000, tp: 200000000, kdnt: 60000000, manu: 50, vbi: 30, ipay: 180, efast: 25, the: 80 },
    // Truong phong / Pho phong
    lanhdao: { nv: 50000000000, tp: 320000000, kdnt: 100000000, manu: 100, vbi: 50, ipay: 300, efast: 40, the: 150 },
  };

  INITIAL_USERS.forEach(u => {
    let profileKey = 'gdv';
    if (u.role === 'TRUONG_PHONG') profileKey = 'lanhdao';
    else if (u.title.includes('Thủ quỹ') || u.title.includes('Thủ kho')) profileKey = 'thuquy';
    else if (u.title.includes('Kế toán') || u.role === 'ADMIN') profileKey = 'ketoan';

    const p = targetProfiles[profileKey];
    result.push(
      { id: `tgt_${u.id}_nv`, year: 2026, userId: u.id, kpiId: 'kpi_nv', targetValue: p.nv, setAt: '2026-01-05', setBy: 'user_pthiha' },
      { id: `tgt_${u.id}_tp`, year: 2026, userId: u.id, kpiId: 'kpi_thuphi', targetValue: p.tp, setAt: '2026-01-05', setBy: 'user_pthiha' },
      { id: `tgt_${u.id}_kdnt`, year: 2026, userId: u.id, kpiId: 'kpi_kdnt', targetValue: p.kdnt, setAt: '2026-01-05', setBy: 'user_pthiha' },
      { id: `tgt_${u.id}_manu`, year: 2026, userId: u.id, kpiId: 'kpi_manu', targetValue: p.manu, setAt: '2026-01-05', setBy: 'user_pthiha' },
      { id: `tgt_${u.id}_vbi`, year: 2026, userId: u.id, kpiId: 'kpi_vbi', targetValue: p.vbi, setAt: '2026-01-05', setBy: 'user_pthiha' },
      { id: `tgt_${u.id}_ipay`, year: 2026, userId: u.id, kpiId: 'kpi_ipay', targetValue: p.ipay, setAt: '2026-01-05', setBy: 'user_pthiha' },
      { id: `tgt_${u.id}_efast`, year: 2026, userId: u.id, kpiId: 'kpi_efast', targetValue: p.efast, setAt: '2026-01-05', setBy: 'user_pthiha' },
      { id: `tgt_${u.id}_the`, year: 2026, userId: u.id, kpiId: 'kpi_the', targetValue: p.the, setAt: '2026-01-05', setBy: 'user_pthiha' },
    );
  });

  return result;
};

export const INITIAL_TARGETS: KpiTarget[] = generateDefaultTargets();

// Sample daily entries with realistic data for September 2026
const generateDefaultEntries = (): DailyDataEntry[] => {
  const list: DailyDataEntry[] = [];
  const targetMap = new Map<string, number>();
  INITIAL_TARGETS.forEach(t => targetMap.set(`${t.userId}_${t.kpiId}`, t.targetValue));

  // Cumulative performance ratios: ~70% to 92% to represent late September (day 264 of 365)
  INITIAL_USERS.forEach((u, index) => {
    // Variations so some users are achieved (e.g. 85%), some warning (72%), some slow (60%)
    let perfRatio = 0.78;
    if (index % 3 === 0) perfRatio = 0.88; // Top performers
    if (index % 4 === 1) perfRatio = 0.69; // Warning
    if (index === 7 || index === 8) perfRatio = 0.84; // Tạ Hà Thu, Vũ Thị Hải Yến

    // 1. Entry up to yesterday (2026-09-20)
    INITIAL_KPIS.forEach(k => {
      const tgt = targetMap.get(`${u.id}_${k.id}`) || 100;
      const accumVal = Math.round(tgt * perfRatio);

      list.push({
        id: `d_${u.id}_${k.id}_20`,
        date: '2026-09-20',
        userId: u.id,
        kpiId: k.id,
        value: accumVal,
        createdAt: '2026-09-20T17:15:00',
        createdBy: u.id,
        note: 'Số liệu tích lũy đến 20/09/2026',
      });
    });

    // 2. Entries on today (2026-09-21) for select users to test today's entries
    if (index % 2 === 0) {
      // Half of the users already entered today
      const tgtNv = targetMap.get(`${u.id}_kpi_nv`) || 40000000000;
      const todayNv = Math.round(tgtNv * 0.005); // 200 mil
      list.push({
        id: `d_${u.id}_kpi_nv_21`,
        date: '2026-09-21',
        userId: u.id,
        kpiId: 'kpi_nv',
        value: todayNv,
        createdAt: '2026-09-21T16:15:00',
        createdBy: u.id,
      });
      list.push({
        id: `d_${u.id}_kpi_thuphi_21`,
        date: '2026-09-21',
        userId: u.id,
        kpiId: 'kpi_thuphi',
        value: 1200000,
        createdAt: '2026-09-21T16:16:00',
        createdBy: u.id,
      });
      list.push({
        id: `d_${u.id}_kpi_kdnt_21`,
        date: '2026-09-21',
        userId: u.id,
        kpiId: 'kpi_kdnt',
        value: 0,
        createdAt: '2026-09-21T16:16:30',
        createdBy: u.id,
        note: 'Không phát sinh',
      });
      list.push({
        id: `d_${u.id}_kpi_manu_21`,
        date: '2026-09-21',
        userId: u.id,
        kpiId: 'kpi_manu',
        value: 1,
        createdAt: '2026-09-21T16:17:00',
        createdBy: u.id,
      });
      list.push({
        id: `d_${u.id}_kpi_vbi_21`,
        date: '2026-09-21',
        userId: u.id,
        kpiId: 'kpi_vbi',
        value: 0,
        createdAt: '2026-09-21T16:17:30',
        createdBy: u.id,
        note: 'Không phát sinh',
      });
      list.push({
        id: `d_${u.id}_kpi_ipay_21`,
        date: '2026-09-21',
        userId: u.id,
        kpiId: 'kpi_ipay',
        value: 3,
        createdAt: '2026-09-21T16:18:00',
        createdBy: u.id,
      });
      list.push({
        id: `d_${u.id}_kpi_efast_21`,
        date: '2026-09-21',
        userId: u.id,
        kpiId: 'kpi_efast',
        value: 0,
        createdAt: '2026-09-21T16:18:30',
        createdBy: u.id,
        note: 'Không phát sinh',
      });
      list.push({
        id: `d_${u.id}_kpi_the_21`,
        date: '2026-09-21',
        userId: u.id,
        kpiId: 'kpi_the',
        value: 2,
        createdAt: '2026-09-21T16:19:00',
        createdBy: u.id,
      });
    }
  });

  return list;
};

export const INITIAL_DAILY_ENTRIES: DailyDataEntry[] = generateDefaultEntries();

export const INITIAL_KPI_HISTORY: KpiHistory[] = [
  {
    id: 'hist_1',
    kpiId: 'kpi_manu',
    userId: 'user_thuth',
    year: 2026,
    oldValue: 70,
    newValue: 80,
    reason: 'Giao tăng chỉ tiêu bảo hiểm Manulife quý 3/2026 theo QĐ số 114/QĐ-NBH',
    changedAt: '2026-07-01T09:00:00',
    changedBy: 'user_pthiha',
  },
  {
    id: 'hist_2',
    kpiId: 'kpi_nv',
    userId: 'user_yenvth',
    year: 2026,
    oldValue: 35000000000,
    newValue: 40000000000,
    reason: 'Điều chỉnh kế hoạch nguồn vốn do tăng lượng khách hàng VIP',
    changedAt: '2026-06-15T14:30:00',
    changedBy: 'user_pthiha',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    action: 'ĐĂNG NHẬP',
    userId: 'user_thuth',
    userName: 'Tạ Hà Thu',
    details: 'Đăng nhập hệ thống cán bộ DVKH trên thiết bị di động',
    timestamp: '2026-09-21T16:05:12',
    ipAddress: '10.24.18.92',
  },
  {
    id: 'log_2',
    action: 'CẬP NHẬT SỐ LIỆU',
    userId: 'user_thuth',
    userName: 'Tạ Hà Thu',
    details: 'Nhập số liệu ngày 21/09/2026: Nguồn vốn: 180.000.000 VNĐ, Thu phí: 1.200.000 VNĐ, Manulife: 1 HĐ, iPay: 3 TK',
    timestamp: '2026-09-21T16:19:45',
    ipAddress: '10.24.18.92',
  },
  {
    id: 'log_3',
    action: 'ĐỒNG BỘ GOOGLE SHEETS',
    userId: 'user_pthiha',
    userName: 'Phạm Thị Hà',
    details: 'Tự động đồng bộ 8 sheets sang Google Sheets trung tâm Chi nhánh',
    timestamp: '2026-09-21T16:42:00',
    ipAddress: '10.24.18.10',
  },
];

export const INITIAL_REPORT_CONFIG: ReportConfig = {
  selectedKpiIds: ['kpi_nv', 'kpi_thuphi', 'kpi_kdnt', 'kpi_manu', 'kpi_ipay', 'kpi_the'],
  directorEmail: 'giamdoc.ninhbinh@vietinbank.vn',
  directorName: 'Ban Giám đốc VietinBank Chi nhánh Ninh Bình',
  lastUpdated: '2026-09-21T10:00:00',
};

export const INITIAL_REPORT_HISTORY: ReportHistory[] = [
  {
    id: 'rep_20260920',
    date: '2026-09-20',
    lockedAt: '2026-09-20T17:45:00',
    lockedBy: 'Phạm Thị Hà (Trưởng phòng)',
    reportVersion: 'v1.0-CHOT',
    selectedKpis: ['kpi_nv', 'kpi_thuphi', 'kpi_kdnt', 'kpi_manu', 'kpi_ipay', 'kpi_the'],
    status: 'SENT_DIRECTOR',
    emailedAt: '2026-09-20T17:50:12',
    emailRecipient: 'giamdoc.ninhbinh@vietinbank.vn',
    emailSubject: 'Báo cáo số liệu Phòng DVKH ngày 20/09/2026',
    emailStatus: 'SUCCESS',
    totalKpiAchievedRate: 88.5,
  },
];

export const INITIAL_DAY_LOCKS: Record<string, DayLockStatus> = {
  '2026-09-20': {
    date: '2026-09-20',
    isLocked: true,
    lockedBy: 'Phạm Thị Hà',
    lockedAt: '2026-09-20T17:45:00',
  },
  '2026-09-21': {
    date: '2026-09-21',
    isLocked: false,
  },
};
