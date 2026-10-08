import { test } from "../../fixtures/test.fixture";
import { TestDataReader } from "../../utils/TestDataReader";
import type { BusFilterTestData, BusSearchTestData, RelativeTravelDates } from "../../types/BusTypes";
import { DateUtils } from "../../utils/DateUtils";

const search = TestDataReader.read<BusSearchTestData>("busSearchData.json");
const dates = TestDataReader.read<RelativeTravelDates>("journeyDateData.json");
const filters = TestDataReader.read<BusFilterTestData>("busFilterData.json");

test.describe("REQ_BUS_03 - Verify Bus Filter Functionality", () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.annotations.push({ type: "requirement", description: "REQ_BUS_03" });
  });

  test("TC_01 - Apply AC filter and verify only AC buses are displayed", async ({
    busSearchPage,
    busResultsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    await test.step("Search for buses on a future date", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(search.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(search.validSearch.destinationCity);
      await busSearchPage.selectJourneyDate(DateUtils.dateFromToday(dates.futureDaysFromToday));
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
    });
    await test.step("Apply AC and validate the filtered buses", async () => {
      await busResultsPage.filters.apply("AC");
      await busResultsPage.filters.expectVisibleResultsMatch("AC");
    });
  });

  test("TC_02 - Apply Sleeper filter and verify only Sleeper buses are displayed", async ({
    busSearchPage,
    busResultsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    await test.step("Search for buses on a future date", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(search.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(search.validSearch.destinationCity);
      await busSearchPage.selectJourneyDate(DateUtils.dateFromToday(dates.futureDaysFromToday));
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
    });
    await test.step("Apply Sleeper and validate the filtered buses", async () => {
      await busResultsPage.filters.apply("Sleeper");
      await busResultsPage.filters.expectVisibleResultsMatch("Sleeper");
    });
  });

  test("TC_03 - Apply Departure Time filter and verify filtered results", async ({
    busSearchPage,
    busResultsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    await test.step("Search for buses on a future date", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(search.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(search.validSearch.destinationCity);
      await busSearchPage.selectJourneyDate(DateUtils.dateFromToday(dates.futureDaysFromToday));
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
    });
    await test.step("Apply a predefined departure-time filter", async () => {
      await busResultsPage.filters.applyDepartureTime(filters.departureTime);
      await busResultsPage.filters.expectVisibleResultsMatch("Departure Time");
    });
  });

  test("TC_04 - Apply AC, Seater and Single Seat filters and verify the too-many-filters message", async ({
    busSearchPage,
    busResultsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Negative" });
    await test.step("Search for buses on a future date", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(search.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(search.validSearch.destinationCity);
      await busSearchPage.selectJourneyDate(DateUtils.dateFromToday(dates.futureDaysFromToday));
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
    });
    await test.step("Apply all three filters and check the warning", async () => {
      await busResultsPage.filters.applyAllRequestedFilters();
      await busResultsPage.filters.expectNoResults(filters.multiFilterError);
    });
  });
});
