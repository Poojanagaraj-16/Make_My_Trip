import { expect, type Locator, type Page } from "@playwright/test";

export class BusFilters {
  constructor(private readonly page: Page) {}

  async apply(name: "AC" | "Sleeper" | "Seater" | "Single Seat"): Promise<void> {
    if (name === "Single Seat") {
      await this.page.getByRole("checkbox", { name: /Filter by Single Seats/ }).check();
      return;
    }
    const control = this.filterControl(name);
    await expect(control).toBeVisible();
    await control.click();
  }

  async applyDepartureTime(time: string): Promise<void> {
    const control = this.page
      .getByRole("listitem")
      .filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(time)}\\s*$`) })
      .first();
    await expect(control).toBeVisible();
    await control.click();
  }

  async applyAllRequestedFilters(): Promise<void> {
    await this.apply("AC");
    await this.apply("Seater");
    await this.apply("Single Seat");
  }

  async expectNoResults(expectedMessage: string): Promise<void> {
    const warning = this.page.getByText(
      expectedMessage,
      { exact: true },
    );
    await expect(warning).toBeVisible();
  }

  async expectVisibleResultsMatch(filter: "AC" | "Sleeper" | "Departure Time"): Promise<void> {
    const cards = this.busCards();
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count, "At least one bus result should remain after filtering").toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      const busType = cards.nth(index).getByTestId("bus-type");
      if (filter === "AC") {
        await expect(busType).toContainText(/A\/C|AC|Air.?Condition/i);
      } else if (filter === "Sleeper") {
        await expect(busType).toContainText(/Sleeper/i);
      } else {
        const cardText = await cards.nth(index).innerText();
        const departure = cardText.match(/\b([01]\d|2[0-3]):[0-5]\d\b/)?.[0];
        expect(departure, "Filtered bus should expose its departure time").toBeDefined();
        const hour = Number(departure?.slice(0, 2));
        expect(hour).toBeLessThan(6);
      }
    }
  }

  private filterControl(name: string): Locator {
    return this.page
      .getByRole("listitem")
      .filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(name)}\\s*$`) })
      .first();
  }

  private busCards(): Locator {
    return this.page.getByTestId("bus-card");
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
