import { test as base } from "@playwright/test";
import { BookingSummaryPage } from "../pages/BookingSummaryPage";
import { BusResultsPage } from "../pages/BusResultsPage";
import { BusSearchPage } from "../pages/BusSearchPage";
import { PassengerDetailsPage } from "../pages/PassengerDetailsPage";

interface BusFixtures {
  readonly busSearchPage: BusSearchPage;
  readonly busResultsPage: BusResultsPage;
  readonly passengerDetailsPage: PassengerDetailsPage;
  readonly bookingSummaryPage: BookingSummaryPage;
}

export const test = base.extend<BusFixtures>({
  busSearchPage: async ({ page }, use) => use(new BusSearchPage(page)),
  busResultsPage: async ({ page }, use) => use(new BusResultsPage(page)),
  passengerDetailsPage: async ({ page }, use) => use(new PassengerDetailsPage(page)),
  bookingSummaryPage: async ({ page }, use) => use(new BookingSummaryPage(page)),
});

export { expect } from "@playwright/test";
