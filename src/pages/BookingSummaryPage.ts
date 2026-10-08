import { expect, type Page } from "@playwright/test";
import type { Passenger } from "../types/BusTypes";
import { BasePage } from "./BasePage";

export class BookingSummaryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyBookingSummary(passenger: Passenger): Promise<void> {
    await expect(
      this.page.getByText(/booking summary|review your booking|traveller details/i).first(),
    ).toBeVisible();
    await expect(this.page.getByText(passenger.name, { exact: false })).toBeVisible();
    await expect(this.page.getByText(/₹|INR|fare|total/i).first()).toBeVisible();
  }

  async verifySelectedBus(): Promise<void> {
    await expect(this.page.getByText(/bus|travels/i).first()).toBeVisible();
  }

  async verifyPassengerDetails(passenger: Passenger): Promise<void> {
    await expect(this.page.getByText(passenger.name, { exact: false })).toBeVisible();
    await expect(this.page.getByText(passenger.age, { exact: true })).toBeVisible();
  }

  async verifyFare(): Promise<void> {
    await expect(this.page.getByText(/₹\s?[\d,]+|INR\s?[\d,]+/).first()).toBeVisible();
  }

  async stopBeforePayment(): Promise<void> {
    const paymentStage = this.page.getByText(/payment|pay securely/i).first();
    if (await paymentStage.isVisible().catch(() => false)) {
      await expect(paymentStage).toBeVisible();
    }
  }
}
