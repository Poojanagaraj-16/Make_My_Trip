import { test, expect } from "../../fixtures/test.fixture";
import { TestDataReader } from "../../utils/TestDataReader";
import type { BusSearchTestData } from "../../types/BusTypes";
import { DateUtils } from "../../utils/DateUtils";

const data = TestDataReader.read<BusSearchTestData>("busSearchData.json");
const dates = TestDataReader.read<{ futureDaysFromToday: number }>("journeyDateData.json");

test.describe("REQ_BUS_01 - Verify Bus Search Functionality", () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.annotations.push({ type: "requirement", description: "REQ_BUS_01" });
  });

  test("TC_01 - Search bus with valid source city, destination city and future travel date", async ({
    busSearchPage,
    busResultsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    await test.step("Open the Bus module", () => busSearchPage.openBusModule());
    await test.step("Select source and destination cities", async () => {
      await busSearchPage.selectSourceCity(data.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(data.validSearch.destinationCity);
    });
    await test.step("Select a future travel date", () =>
      busSearchPage.selectJourneyDate(DateUtils.dateFromToday(dates.futureDaysFromToday)));
    await test.step("Search and verify bus results", async () => {
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
    });
  });

  test("TC_02 - Verify source city auto-suggestions while entering source city", async ({
    busSearchPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    await test.step("Open the Bus module", () => busSearchPage.openBusModule());
    await test.step("Enter the source city and verify suggestions", async () => {
      const suggestions = await busSearchPage.sourceSuggestions(data.sourceSuggestion.city);
      await expect(suggestions).toBeVisible();
    });
  });

  test("TC_03 - Verify destination city auto-suggestions while entering destination city", async ({
    busSearchPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    await test.step("Open the Bus module", () => busSearchPage.openBusModule());
    await test.step("Enter the destination city and verify suggestions", async () => {
      const suggestions = await busSearchPage.destinationSuggestions(
        data.destinationSuggestion.city,
      );
      await expect(suggestions).toBeVisible();
    });
  });

  test("TC_04 - Verify validation when source and destination cities are same", async ({
    busSearchPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Negative" });
    await test.step("Open the Bus module", () => busSearchPage.openBusModule());
    await test.step("Set the same source and destination city", () =>
      busSearchPage.selectSameCity(
        data.sameCitySearch.sourceCity,
        data.sameCitySearch.destinationCity,
      ));
    await test.step("Search and verify same-city validation", async () => {
      await busSearchPage.clickSearch();
      await busSearchPage.expectSameCityValidation();
    });
  });
});
