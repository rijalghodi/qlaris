import { formatDate as formatDateFn, isThisYear, isToday, isTomorrow, isYesterday } from "date-fns";

export function formatDate(
  date: Date | string,
  options?: { format?: string; includeTime?: boolean }
) {
  const { format, includeTime } = options || {};

  if (format) return formatDateFn(date, format);

  const timeFormat = "hh:mm a";

  if (isToday(date)) {
    return includeTime ? formatDateFn(date, timeFormat) : "Today";
  }
  if (isYesterday(date)) {
    return includeTime ? `Yesterday, ${formatDateFn(date, timeFormat)}` : "Yesterday";
  }
  if (isTomorrow(date)) {
    return includeTime ? `Tomorrow, ${formatDateFn(date, timeFormat)}` : "Tomorrow";
  }
  if (isThisYear(date)) {
    return includeTime ? formatDateFn(date, "MMM dd, " + timeFormat) : formatDateFn(date, "MMM dd");
  }
  return includeTime
    ? formatDateFn(date, "MMM dd, yyyy, " + timeFormat)
    : formatDateFn(date, "MMM dd, yyyy");
}
