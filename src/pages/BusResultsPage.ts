import { expect, type Page } from "@playwright/test";
import { BusFilters } from "../components/BusFilters";
import { BasePage } from "./BasePage";
import { DateUtils } from "../utils/DateUtils";

export class BusResultsPage extends BasePage {
  readonly filters: BusFilters;

  constructor(page: Page) {
    super(page);
    this.filters = new BusFilters(page);
  }

  async verifyBusResults(): Promise<void> {
    await expect(this.page).toHaveURL(/bus-tickets/i);
    const pageText = await this.page.locator("body").innerText();
    if (/^\s*200-OK\s*$/m.test(pageText)) {
      throw new Error(
        "The live MakeMyTrip results route rendered a plain 200-OK response instead of the bus listings.",
      );
    }
    const busCount = this.page.getByTestId("bus-count");
    await expect(busCount).toBeVisible();
    await expect(busCount).toContainText(/[1-9]\d*\s+bus(es)? found/i);
  }

  async verifyResultsRefreshed(previousDate: string, nextDate: Date): Promise<void> {
    const nextDateValue = [
      String(nextDate.getDate()).padStart(2, "0"),
      String(nextDate.getMonth() + 1).padStart(2, "0"),
      nextDate.getFullYear(),
    ].join("-");
    await expect(this.page).toHaveURL(new RegExp(`departureDate=${nextDateValue}`));
    expect(new URL(this.page.url()).searchParams.get("departureDate")).not.toBe(
      previousDate,
    );
    await this.verifyBusResults();
  }

  async changeJourneyDate(date: Date): Promise<void> {
    const label = DateUtils.formatResultCarouselDate(date);
    const day = this.page
      .getByRole("listitem")
      .filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(label)}\\s*$`) });
    await expect(day).toBeVisible();
    await day.click();
  }

  async verifyJourneyDate(date: Date): Promise<void> {
    await expect(
      this.page.getByText(DateUtils.formatResultHeaderDate(date), { exact: true }),
    ).toBeVisible();
  }

  async selectedJourneyDate(): Promise<string> {
    return new URL(this.page.url()).searchParams.get("departureDate") ?? "";
  }

  async chooseBus(): Promise<void> {
    const bus = this.page.getByTestId("bus-card").first();
    await expect(bus).toBeVisible();
    const continueButton = bus.getByTestId("select-seats");
    await expect(continueButton).toBeVisible();
    await continueButton.click();
  }

  async getSelectedBusSummary(): Promise<string> {
    const bus = this.page.getByTestId("bus-card").first();
    await expect(bus).toBeVisible();
    return this.actions.getText(bus);
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
