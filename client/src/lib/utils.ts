import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  let dayFormat = "EEEE";
  let dayPrefix = "";
  
  if (isToday(dateObj)) {
    dayPrefix = "Today";
    dayFormat = "";
  } else if (isTomorrow(dateObj)) {
    dayPrefix = "Tomorrow";
    dayFormat = "";
  } else if (isYesterday(dateObj)) {
    dayPrefix = "Yesterday";
    dayFormat = "";
  }
  
  const timeFormat = format(dateObj, "h:mm a");
  
  if (dayFormat) {
    return `${dayPrefix ? dayPrefix + ", " : ""}${format(dateObj, dayFormat)}, ${timeFormat}`;
  }
  
  return `${dayPrefix}, ${timeFormat}`;
}

export function formatBookingTimeRange(startTime: Date | string, endTime: Date | string): string {
  if (!startTime || !endTime) return "";
  
  const startDate = typeof startTime === "string" ? new Date(startTime) : startTime;
  const endDate = typeof endTime === "string" ? new Date(endTime) : endTime;
  
  let dayPrefix = "";
  
  if (isToday(startDate)) {
    dayPrefix = "Today";
  } else if (isTomorrow(startDate)) {
    dayPrefix = "Tomorrow";
  } else {
    dayPrefix = format(startDate, "EEE, MMM d");
  }
  
  const startTimeStr = format(startDate, "h:mm a");
  const endTimeStr = format(endDate, "h:mm a");
  
  return `${dayPrefix}, ${startTimeStr} - ${endTimeStr}`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "accepted":
      return "text-blue-600 bg-blue-100";
    case "pending":
      return "text-yellow-700 bg-yellow-100";
    case "completed":
      return "text-green-700 bg-green-100";
    case "cancelled":
      return "text-red-600 bg-red-100";
    default:
      return "text-slate-600 bg-slate-100";
  }
}
