import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * Formats a Julian Day to a time string with timezone offset.
 * 
 * @param jd Julian Day Number
 * @param timezone Timezone string (e.g., "+05:30", "-08:00")
 * @returns Formatted time string (HH:mm)
 */
export const formatTimeWithTimezone = (jd: number, timezone: string): string => {
  // JD to Unix Milliseconds (UTC)
  // 2440587.5 is the JD for 1970-01-01 00:00:00 UTC
  const unixMs = (jd - 2440587.5) * 86400000;

  // Create Date object
  const date = new Date(unixMs);

  try {
    // Handle numeric offsets manually if date-fns-tz doesn't support "+05:30" format directly
    // Ideally, timezone should be an IANA string like "Asia/Kolkata". 
    // If it's an offset string, we might need a different approach or rely on the offset logic provided.

    // Check if timezone is an offset like "+05:30"
    if (timezone.startsWith('+') || timezone.startsWith('-')) {
      const sign = timezone.startsWith('-') ? -1 : 1;
      const [h, m] = timezone.replace(/[+-]/, '').split(':').map(Number);
      const offsetMs = sign * ((h * 60) + (m || 0)) * 60000;
      const localDate = new Date(unixMs + offsetMs);
      return format(localDate, 'HH:mm');
    }

    // Use date-fns-tz for IANA timezones
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, 'HH:mm');
  } catch (e) {
    console.error("Time formatting error:", e);
    // Fallback to simple UTC or local
    return format(date, 'HH:mm');
  }
};

/**
 * Standardizes date string to DD/MM/YYYY format.
 * 
 * @param date Input date (string YYYY-MM-DD or DD/MM/YYYY, or Date object)
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return "";

  if (date instanceof Date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  if (date.includes('-')) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  return date;
};
