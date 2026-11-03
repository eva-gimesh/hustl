/**
 * HUSTL India-First Currency Utilities
 * Formats, parses, and validates Indian Rupee (INR / ₹) values using en-IN locale standards.
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
export const DEFAULT_LOCALE = 'en-IN';

export interface FormatOptions {
  compact?: boolean;
  symbol?: boolean;
  showZero?: boolean;
  maximumFractionDigits?: number;
}

/**
 * Formats a numeric value into an Indian Rupee string using en-IN grouping (e.g. ₹1,50,000).
 */
export function formatINR(amount: number | string | undefined | null, options: FormatOptions = {}): string {
  const {
    compact = false,
    symbol = true,
    showZero = false,
    maximumFractionDigits = 0,
  } = options;

  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return showZero ? (symbol ? '₹0' : '0') : '';
  }

  const num = Number(amount);
  if (num === 0 && !showZero) return '';

  if (compact) {
    if (Math.abs(num) >= 10000000) {
      const cr = (num / 10000000).toFixed(1).replace(/\.0$/, '');
      return `${symbol ? '₹' : ''}${cr} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      const lakh = (num / 100000).toFixed(1).replace(/\.0$/, '');
      return `${symbol ? '₹' : ''}${lakh}L`;
    }
    if (Math.abs(num) >= 1000) {
      const k = (num / 1000).toFixed(1).replace(/\.0$/, '');
      return `${symbol ? '₹' : ''}${k}k`;
    }
  }

  const formatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: symbol ? 'currency' : 'decimal',
    currency: CURRENCY_CODE,
    maximumFractionDigits,
  });

  return formatter.format(num);
}

/**
 * Formats a budget range in INR (e.g. "₹5,000 – ₹12,000" or "₹1,500").
 */
export function formatBudgetRange(
  min?: number | string | null,
  max?: number | string | null,
  fallback: string = 'Budget upon discussion'
): string {
  const minNum = min !== undefined && min !== null ? Number(min) : undefined;
  const maxNum = max !== undefined && max !== null ? Number(max) : undefined;

  const hasMin = minNum !== undefined && !isNaN(minNum) && minNum > 0;
  const hasMax = maxNum !== undefined && !isNaN(maxNum) && maxNum > 0;

  if (hasMin && hasMax) {
    if (minNum === maxNum) {
      return formatINR(minNum);
    }
    return `${formatINR(minNum)} – ${formatINR(maxNum)}`;
  }

  if (hasMin) {
    return `From ${formatINR(minNum)}`;
  }

  if (hasMax) {
    return `Up to ${formatINR(maxNum)}`;
  }

  return fallback;
}

/**
 * Formats a salary/stipend with support for LPA (lakhs per annum) or monthly stipends.
 */
export function formatSalaryINR(
  min?: number | string | null,
  max?: number | string | null,
  period: 'month' | 'year' | 'lpa' | 'hourly' = 'month',
  fallback: string = 'Competitive Stipend'
): string {
  const minNum = min !== undefined && min !== null ? Number(min) : undefined;
  const maxNum = max !== undefined && max !== null ? Number(max) : undefined;

  const hasMin = minNum !== undefined && !isNaN(minNum) && minNum > 0;
  const hasMax = maxNum !== undefined && !isNaN(maxNum) && maxNum > 0;

  if (!hasMin && !hasMax) return fallback;

  if (period === 'lpa') {
    // If numbers are in full Rupees (e.g., 360000 to 600000) or already in Lakhs (3.6 to 6)
    const toLakh = (n: number) => (n > 1000 ? (n / 100000).toFixed(1).replace(/\.0$/, '') : n.toString());
    if (hasMin && hasMax) {
      if (minNum === maxNum) return `₹${toLakh(minNum!)} LPA`;
      return `₹${toLakh(minNum!)} – ₹${toLakh(maxNum!)} LPA`;
    }
    if (hasMin) return `From ₹${toLakh(minNum!)} LPA`;
    return `Up to ₹${toLakh(maxNum!)} LPA`;
  }

  const rangeStr = formatBudgetRange(minNum, maxNum, fallback);
  const suffix = period === 'month' ? '/mo' : period === 'hourly' ? '/hr' : '/yr';
  return `${rangeStr} ${suffix}`;
}

/**
 * Parses user typed input string into a pure number, removing ₹, commas, and whitespace.
 */
export function parseINRInput(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validates whether an amount is within a realistic Indian student/startup range for HUSTL.
 */
export function validateINRAmount(
  amount: number,
  category: 'micro' | 'freelance' | 'internship' | 'job' = 'freelance'
): { isValid: boolean; warning?: string } {
  if (amount < 0) {
    return { isValid: false, warning: 'Amount cannot be negative.' };
  }

  switch (category) {
    case 'micro':
      if (amount < 300) return { isValid: true, warning: 'Micro-tasks usually start around ₹500.' };
      break;
    case 'freelance':
      if (amount < 500) return { isValid: true, warning: 'Most freelance deliverables in India start at ₹500+.' };
      if (amount > 500000) return { isValid: true, warning: 'Large enterprise project budget detected.' };
      break;
    case 'internship':
      if (amount < 2000 && amount > 0) return { isValid: true, warning: 'Standard student internships in India range from ₹5,000–₹20,000/mo.' };
      break;
    case 'job':
      if (amount < 20000) return { isValid: true, warning: 'Full-time entry salaries usually start from ₹3.0 LPA (₹25k+/mo).' };
      break;
  }

  return { isValid: true };
}

/**
 * Formats an amount in whichever currency a listing was created in.
 * INR (₹ or "INR") always uses Indian digit grouping (₹15,00,000); other currencies use their own locale.
 * The stored amount is never converted — only displayed.
 */
export function formatMoney(amount: number | string | null | undefined, currency: string = '₹'): string {
  const n = Number(amount);
  if (amount === null || amount === undefined || isNaN(n)) return '';
  const code = currency === '₹' || currency === 'INR' ? 'INR' : currency === '$' || currency === 'USD' ? 'USD' : currency === '€' || currency === 'EUR' ? 'EUR' : null;
  if (!code) return `${currency}${n.toLocaleString(DEFAULT_LOCALE)}`;
  return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatMoneyRange(
  min: number | string | null | undefined,
  max: number | string | null | undefined,
  currency: string = '₹'
): string {
  const a = formatMoney(min, currency);
  const b = formatMoney(max, currency);
  if (a && b && Number(min) !== Number(max)) return `${a} – ${b}`;
  return a || b || 'Budget upon discussion';
}
