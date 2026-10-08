import { test, expect } from "../../fixtures/test.fixture";
import { DateUtils } from "../../utils/DateUtils";
import { TestDataReader } from "../../utils/TestDataReader";
import type { BusSearchTestData, RelativeTravelDates } from "../../types/BusTypes";

const data = TestDataReader.read<BusSearchTestData>("busSearchData.json");
const dates = TestDataReader.read<RelativeTravelDates>("journeyDateData.json");

test.describe("REQ_BUS_02 - Verify Journey Date Selection Functionality", () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.annotations.push({ type: "requirement", description: "REQ_BUS_02" });
  });

  test("TC_01 - Search buses using valid future journey date and verify results", async ({
    busSearchPage,
    busResultsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    const date = DateUtils.dateFromToday(dates.futureDaysFromToday);
    await test.step("Open the Bus module and configure the route", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(data.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(data.validSearch.destinationCity);
    });
    await test.step("Select a valid future journey date", () => busSearchPage.selectJourneyDate(date));
    await test.step("Search and verify buses are displayed", async () => {
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
    });
  });

  test("TC_02 - Change selected journey date and verify bus results refresh", async ({
    busSearchPage,
    busResultsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    const firstDate = DateUtils.dateFromToday(dates.futureDaysFromToday);
    const nextDate = DateUtils.dateFromToday(dates.changedDaysFromToday);
    await test.step("Search for buses on the first future date", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(data.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(data.validSearch.destinationCity);
      await busSearchPage.selectJourneyDate(firstDate);
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
    });
    await test.step("Change the date and verify results refresh", async () => {
      const previousDate = await busResultsPage.selectedJourneyDate();
      await busResultsPage.changeJourneyDate(nextDate);
      await busResultsPage.verifyResultsRefreshed(previousDate, nextDate);
    });
  });

  test("TC_03 - Verify selected journey date is correctly reflected on results page", async ({
    busSearchPage,
    busResultsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    const date = DateUtils.dateFromToday(dates.futureDaysFromToday);
    await test.step("Search with a selected future travel date", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(data.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(data.validSearch.destinationCity);
      await busSearchPage.selectJourneyDate(date);
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
    });
    await test.step("Verify the journey date shown on results", () =>
      busResultsPage.verifyJourneyDate(date));
  });

  test("TC_04 - Verify past dates are disabled and cannot be selected", async ({
    busSearchPage,
    busResultsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Negative" });
    const pastDate = DateUtils.dateFromToday(-dates.pastDaysAgo);
    await test.step("Open the Bus module and travel-date picker", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.openDatePicker();
    });
    await test.step("Verify past dates are disabled", () =>
      busSearchPage.expectPastDatesDisabled());
    await test.step("Verify past date cannot be selected", async () => {
      expect(await busSearchPage.isTravelDateDisabled(pastDate)).toBe(true);
      await expect(busSearchPage.selectJourneyDate(pastDate)).rejects.toThrow(
        "Cannot select a past travel date.",
      );
    });
  });
});
