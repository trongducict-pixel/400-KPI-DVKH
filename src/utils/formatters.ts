/**
 * Formatting utilities for DVKH DAILY KPI
 * Enforces exact number representation without truncation or unsolicited rounding
 */

/**
 * Format a number with Vietnamese thousand dot separators
 * e.g., 1256387425 -> "1.256.387.425"
 */
export function formatNumberWithDots(val: number | string): string {
  if (val === '' || val === null || val === undefined) return '0';
  const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) : Math.round(val);
  if (isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format value with unit based on KPI datatype
 */
export function formatKpiValue(val: number, unit: string, dataType?: 'CURRENCY' | 'COUNT'): string {
  const formatted = formatNumberWithDots(val);
  return `${formatted} ${unit}`;
}

/**
 * Format percentage with Vietnamese comma separator: 94,05%
 */
export function formatPercentage(val: number, decimals: number = 2): string {
  if (isNaN(val) || !isFinite(val)) return '0,00%';
  const fixed = val.toFixed(decimals);
  return `${fixed.replace('.', ',')}%`;
}

/**
 * Parse input string to positive integer, stripping out non-digit characters
 */
export function parseRawNumericInput(input: string): number {
  if (!input) return 0;
  const cleaned = input.toString().replace(/\D/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format standard date to DD/MM/YYYY
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Format date time to DD/MM/YYYY HH:mm
 */
export function formatDateTimeVN(isoStr: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return isoStr;
  }
}

/**
 * Format currency compactly for high-level cards (e.g. 435,53 tỷ or 820 triệu)
 * Always maintains exact number in detailed views
 */
export function formatCompactVND(val: number, unit?: string): string {
  if (unit && unit.toUpperCase() !== 'VND' && unit.toUpperCase() !== 'ĐỒNG') {
    return `${formatNumberWithDots(val)} ${unit}`;
  }
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) {
    const billions = val / 1_000_000_000;
    return `${billions.toFixed(2).replace('.', ',')} tỷ`;
  }
  if (abs >= 1_000_000) {
    const millions = val / 1_000_000;
    return `${millions.toFixed(1).replace('.', ',')} triệu`;
  }
  return `${formatNumberWithDots(val)} VNĐ`;
}
