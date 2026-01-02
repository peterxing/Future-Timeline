import { differenceInMonths, parse, addMonths, format } from "date-fns";

export const START_DATE = new Date(2026, 0, 1); // Jan 2026
export const END_DATE = new Date(2034, 11, 31); // Dec 2034
export const TOTAL_MONTHS = differenceInMonths(END_DATE, START_DATE) + 1;

export function getMonthIndex(dateStr: string): number {
  try {
    const date = parse(dateStr, "yyyy-MM", new Date());
    return differenceInMonths(date, START_DATE);
  } catch (e) {
    console.error("Invalid date format", dateStr);
    return -1;
  }
}

export function getMonthLabel(index: number): string {
  const date = addMonths(START_DATE, index);
  return format(date, "MMM ''yy");
}

export function getYearLabel(index: number): string | null {
  const date = addMonths(START_DATE, index);
  if (date.getMonth() === 0) {
    return format(date, "yyyy");
  }
  return null;
}
