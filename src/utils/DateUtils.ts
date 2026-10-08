export class DateUtils {
  static dateFromToday(daysFromToday: number): Date {
    if (!Number.isInteger(daysFromToday)) {
      throw new TypeError("Date offset must be an integer.");
    }
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + daysFromToday);
    return date;
  }

  static formatCalendarDay(date: Date): string {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  static formatTravelDate(date: Date): string {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  static formatResultCarouselDate(date: Date): string {
    const dayAndMonth = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
    }).format(date);
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
    return `${dayAndMonth}, ${weekday}`;
  }

  static formatResultHeaderDate(date: Date): string {
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
    return `${weekday}, ${DateUtils.formatResultCarouselDate(date).replace(/, [A-Za-z]{3}$/, "")} ${date.getFullYear()}`;
  }

  static toIsoDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  static compare(left: Date, right: Date): number {
    const leftDay = DateUtils.toIsoDate(left);
    const rightDay = DateUtils.toIsoDate(right);
    return leftDay.localeCompare(rightDay);
  }

  static isPast(date: Date, today = new Date()): boolean {
    return DateUtils.compare(date, today) < 0;
  }

  static isFuture(date: Date, today = new Date()): boolean {
    return DateUtils.compare(date, today) > 0;
  }
}
