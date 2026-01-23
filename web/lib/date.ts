import { formatDate as formatDateFn, isThisYear, isToday, isTomorrow, isYesterday } from "date-fns";

export function formatDate(
  date: Date | string,
  options?: { format?: string; withTime?: boolean; humanReadable?: boolean }
) {
  const { format, withTime = false, humanReadable = true } = options || {};

  if (format) return formatDateFn(date, format);

  const timeFormat = "HH:mm";

  if (!humanReadable) {
    return withTime
      ? formatDateFn(date, "MMM dd, yyyy, " + timeFormat)
      : formatDateFn(date, "MMM dd, yyyy");
  }

  if (isToday(date)) {
    return withTime ? formatDateFn(date, timeFormat) : "Today";
  }
  if (isYesterday(date)) {
    return withTime ? `Yesterday, ${formatDateFn(date, timeFormat)}` : "Yesterday";
  }
  if (isTomorrow(date)) {
    return withTime ? `Tomorrow, ${formatDateFn(date, timeFormat)}` : "Tomorrow";
  }
  if (isThisYear(date)) {
    return withTime ? formatDateFn(date, "MMM dd, " + timeFormat) : formatDateFn(date, "MMM dd");
  }
  return withTime
    ? formatDateFn(date, "MMM dd, yyyy, " + timeFormat)
    : formatDateFn(date, "MMM dd, yyyy");
}
