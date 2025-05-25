import dayjs, { Dayjs } from "dayjs";

/**
 * Calculate the number of days between two dates
 */
export const calculateDaysBetween = (
  startDate: string | Date | Dayjs,
  endDate: string | Date | Dayjs
): number => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return end.diff(start, "day");
};

/**
 * Format a date to a human-readable string
 */
export const formatDate = (
  date: string | Date | Dayjs,
  format: string = "MMMM D, YYYY"
): string => {
  return dayjs(date).format(format);
};

/**
 * Check if a date is in the past
 */
export const isDateInPast = (date: string | Date | Dayjs): boolean => {
  return dayjs(date).isBefore(dayjs());
};

/**
 * Check if a date is in the future
 */
export const isDateInFuture = (date: string | Date | Dayjs): boolean => {
  return dayjs(date).isAfter(dayjs());
};

/**
 * Get the current date as a Dayjs object
 */
export const getCurrentDate = (): Dayjs => {
  return dayjs();
};
