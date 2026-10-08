import { expect, type Page } from "@playwright/test";
import type { Passenger } from "../types/BusTypes";
import { BasePage } from "./BasePage";

export class PassengerDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async enterPassengerDetails(passenger: Passenger): Promise<void> {
    await this.fillIfPresent(/name/i, passenger.name);
    await this.fillIfPresent(/age/i, passenger.age);
    if (passenger.gender) {
      await this.page.getByLabel(new RegExp(passenger.gender, "i")).check();
    }
    await this.fillIfPresent(/mobile|phone/i, passenger.mobile);
  }

  async enterInvalidMobile(mobile: string): Promise<void> {
    await this.fillIfPresent(/mobile|phone/i, mobile);
  }

  async expectInvalidMobileValidation(): Promise<void> {
    await expect(
      this.page.getByText(/valid.*mobile|mobile.*valid|10 digit|invalid.*number/i),
    ).toBeVisible();
  }

  async expectMandatoryFieldValidation(): Promise<void> {
    await this.continue();
    await expect(
      this.page.getByText(/required|mandatory|enter.*name|select.*gender/i).first(),
    ).toBeVisible();
  }

  async continue(): Promise<void> {
    await this.page.getByRole("button", { name: /continue|proceed|submit/i }).last().click();
  }

  async expectBookingSummary(): Promise<void> {
    await expect(
      this.page.getByText(/booking summary|traveller details|passenger details/i).first(),
    ).toBeVisible();
  }

  private async fillIfPresent(label: RegExp, value: string): Promise<void> {
    const byLabel = this.page.getByLabel(label).first();
    const byPlaceholder = this.page.getByPlaceholder(label).first();
    const locator = (await byLabel.count()) > 0 ? byLabel : byPlaceholder;
    if ((await locator.count()) > 0) {
      await locator.fill(value);
    }
  }
}
