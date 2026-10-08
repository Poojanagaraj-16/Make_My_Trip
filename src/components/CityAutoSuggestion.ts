import { expect, type Locator, type Page } from "@playwright/test";

export class CityAutoSuggestion {
  constructor(private readonly page: Page) {}

  async openSourcePicker(): Promise<void> {
    const input = this.page.getByPlaceholder("From", { exact: true });
    if (!(await input.isVisible().catch(() => false))) {
      await this.page.locator("#fromCity").click();
    }
  }

  async openDestinationPicker(): Promise<void> {
    const input = this.page.getByPlaceholder("To", { exact: true });
    if (!(await input.isVisible().catch(() => false))) {
      await this.page.locator("#toCity").click();
    }
  }

  async sourceSuggestions(city: string): Promise<Locator> {
    await this.openSourcePicker();
    const input = this.page.getByPlaceholder("From", { exact: true });
    await input.fill(city);
    return this.suggestionFor(city);
  }

  async destinationSuggestions(city: string): Promise<Locator> {
    await this.openDestinationPicker();
    const input = this.page.getByPlaceholder("To", { exact: true });
    await input.fill(city);
    return this.suggestionFor(city);
  }

  async selectSource(city: string): Promise<void> {
    const suggestion = await this.sourceSuggestions(city);
    await expect(suggestion).toBeVisible();
    await suggestion.click();
  }

  async selectDestination(city: string): Promise<void> {
    const suggestion = await this.destinationSuggestions(city);
    await expect(suggestion).toBeVisible();
    await suggestion.click();
  }

  private suggestionFor(city: string): Locator {
    return this.page
      .getByRole("option")
      .filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(city)}(?:\\s|,|$)`, "i") })
      .first();
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
