import { expect, type Page } from "@playwright/test";
import { CityAutoSuggestion } from "../components/CityAutoSuggestion";
import { DatePicker } from "../components/DatePicker";
import { BasePage } from "./BasePage";

export class BusSearchPage extends BasePage {
  private readonly citySuggestions: CityAutoSuggestion;
  private readonly datePicker: DatePicker;

  constructor(page: Page) {
    super(page);
    this.citySuggestions = new CityAutoSuggestion(page);
    this.datePicker = new DatePicker(page);
  }

  async openBusModule(): Promise<void> {
    await this.page.goto("/bus-tickets/");
    const pageText = await this.page.locator("body").innerText();
    if (/^\s*200-OK\s*$/m.test(pageText)) {
      throw new Error(
        "The live MakeMyTrip Bus module returned a plain 200-OK response instead of the search form.",
      );
    }
    const closeLogin = this.page.locator("[data-cy='closeModal']");
    await closeLogin
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => closeLogin.click())
      .catch((error: unknown) => {
        if (!(error instanceof Error) || error.name !== "TimeoutError") throw error;
      });
    await expect(this.page.locator("#fromCity")).toBeVisible();
    await expect(this.page.locator("#toCity")).toBeVisible();
    await expect(closeLogin).toBeHidden();
  }

  async selectSourceCity(city: string): Promise<void> {
    await this.citySuggestions.selectSource(city);
  }

  async selectDestinationCity(city: string): Promise<void> {
    await this.citySuggestions.selectDestination(city);
  }

  async sourceSuggestions(city: string) {
    return this.citySuggestions.sourceSuggestions(city);
  }

  async destinationSuggestions(city: string) {
    return this.citySuggestions.destinationSuggestions(city);
  }

  async selectJourneyDate(date: Date): Promise<void> {
    await this.datePicker.selectDate(date);
  }

  async openDatePicker(): Promise<void> {
    await this.datePicker.open();
  }

  async expectPastDatesDisabled(): Promise<void> {
    await this.datePicker.expectPastDatesDisabled();
  }

  async isTravelDateDisabled(date: Date): Promise<boolean> {
    return this.datePicker.isDateDisabled(date);
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }

  async selectSameCity(sourceCity: string, destinationCity: string): Promise<void> {
    await this.selectSourceCity(sourceCity);
    await this.selectDestinationCity(destinationCity);
  }

  async clickSearch(): Promise<void> {
    await this.page.getByRole("button", { name: "Search", exact: true }).click();
  }

  async expectSameCityValidation(): Promise<void> {
    await expect(
      this.page.getByText(/source and destination.*same|different.*cities|select.*different/i),
    ).toBeVisible();
  }

  async selectedSourceCity(): Promise<string> {
    return (await this.page.locator("#fromCity").inputValue()).trim();
  }

  async selectedDestinationCity(): Promise<string> {
    return (await this.page.locator("#toCity").inputValue()).trim();
  }

  async expectSourceSuggestion(city: string): Promise<void> {
    await expect(await this.sourceSuggestions(city)).toBeVisible();
  }

  async expectDestinationSuggestion(city: string): Promise<void> {
    await expect(await this.destinationSuggestions(city)).toBeVisible();
  }
}
