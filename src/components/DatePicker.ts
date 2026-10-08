import { expect, type Locator, type Page } from "@playwright/test";
import { DateUtils } from "../utils/DateUtils";

export class DatePicker {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    const calendar = this.page.locator(".DayPicker-Month");
    if (!(await calendar.first().isVisible().catch(() => false))) {
      await this.page.locator("#travelDate").click();
    }
  }

  async selectDate(date: Date): Promise<void> {
    if (DateUtils.isPast(date)) {
      throw new RangeError("Cannot select a past travel date.");
    }
    await this.open();
    const calendarDay = this.page.getByRole("gridcell", {
      name: date.toDateString(),
      exact: true,
    });
    await expect(calendarDay).toBeVisible();
    await calendarDay.click();
    await this.expectSelectedDate(date);
  }

  async selectedDate(): Promise<string> {
    return (await this.page.locator("#travelDate").locator("..").innerText()).trim();
  }

  async expectSelectedDate(date: Date): Promise<void> {
    const day = String(date.getDate()).padStart(2, "0");
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
    const year = String(date.getFullYear()).slice(-2);
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    await expect(
      this.page.getByRole("textbox", {
        name: new RegExp(`Travel Date ${day} ${month}'${year} ${weekday}`),
      }),
    ).toBeVisible();
  }

  async expectPastDatesDisabled(): Promise<void> {
    await this.open();
    const disabledDays: Locator = this.page.locator(
      ".DayPicker-Day[aria-disabled='true']",
    );
    await expect(disabledDays.first()).toBeVisible();
  }

  async isDateDisabled(date: Date): Promise<boolean> {
    const cell = this.page.getByRole("gridcell", {
      name: date.toDateString(),
      exact: true,
    });
    await expect(cell).toBeVisible();
    return (await cell.getAttribute("aria-disabled")) === "true";
  }
}
