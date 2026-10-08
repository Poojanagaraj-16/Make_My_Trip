import { test } from "../../fixtures/test.fixture";
import { TestDataReader } from "../../utils/TestDataReader";
import type { BusSearchTestData, PassengerTestData, RelativeTravelDates } from "../../types/BusTypes";
import { DateUtils } from "../../utils/DateUtils";

const search = TestDataReader.read<BusSearchTestData>("busSearchData.json");
const dates = TestDataReader.read<RelativeTravelDates>("journeyDateData.json");
const passengers = TestDataReader.read<PassengerTestData>("passengerData.json");

test.describe("REQ_BUS_04 - Verify Passenger Details and Booking Functionality", () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.annotations.push({ type: "requirement", description: "REQ_BUS_04" });
  });

  test("TC_01 - Enter valid passenger details and proceed to Booking Summary", async ({
    busSearchPage,
    busResultsPage,
    passengerDetailsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    await test.step("Search and choose an available bus", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(search.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(search.validSearch.destinationCity);
      await busSearchPage.selectJourneyDate(DateUtils.dateFromToday(dates.futureDaysFromToday));
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
      await busResultsPage.chooseBus();
    });
    await test.step("Enter passenger details and continue", async () => {
      await passengerDetailsPage.enterPassengerDetails(passengers.validPassenger);
      await passengerDetailsPage.continue();
      await passengerDetailsPage.expectBookingSummary();
    });
  });

  test("TC_02 - Verify Booking Summary displays selected bus, passenger details and fare correctly", async ({
    busSearchPage,
    busResultsPage,
    passengerDetailsPage,
    bookingSummaryPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Positive" });
    await test.step("Search for buses and select an available bus", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(search.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(search.validSearch.destinationCity);
      await busSearchPage.selectJourneyDate(DateUtils.dateFromToday(dates.futureDaysFromToday));
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
      await busResultsPage.chooseBus();
    });
    await test.step("Enter fixed passenger data and proceed", async () => {
      await passengerDetailsPage.enterPassengerDetails(passengers.validPassenger);
      await passengerDetailsPage.continue();
      await passengerDetailsPage.expectBookingSummary();
    });
    await test.step("Verify bus, passenger details and dynamic fare", async () => {
      await bookingSummaryPage.verifySelectedBus();
      await bookingSummaryPage.verifyPassengerDetails(passengers.validPassenger);
      await bookingSummaryPage.verifyFare();
      await bookingSummaryPage.verifyBookingSummary(passengers.validPassenger);
    });
  });

  test("TC_03 - Enter invalid mobile number and verify validation", async ({
    busSearchPage,
    busResultsPage,
    passengerDetailsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Negative" });
    await test.step("Search for buses and open passenger details", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(search.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(search.validSearch.destinationCity);
      await busSearchPage.selectJourneyDate(DateUtils.dateFromToday(dates.futureDaysFromToday));
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
      await busResultsPage.chooseBus();
    });
    await test.step("Enter an invalid mobile number and verify validation", async () => {
      await passengerDetailsPage.enterPassengerDetails(passengers.validPassenger);
      await passengerDetailsPage.enterInvalidMobile(passengers.invalidMobile.mobile);
      await passengerDetailsPage.continue();
      await passengerDetailsPage.expectInvalidMobileValidation();
    });
  });

  test("TC_04 - Leave mandatory passenger fields blank and verify validation messages", async ({
    busSearchPage,
    busResultsPage,
    passengerDetailsPage,
  }, testInfo) => {
    testInfo.annotations.push({ type: "test-type", description: "Negative" });
    await test.step("Search for buses and open passenger details", async () => {
      await busSearchPage.openBusModule();
      await busSearchPage.selectSourceCity(search.validSearch.sourceCity);
      await busSearchPage.selectDestinationCity(search.validSearch.destinationCity);
      await busSearchPage.selectJourneyDate(DateUtils.dateFromToday(dates.futureDaysFromToday));
      await busSearchPage.clickSearch();
      await busResultsPage.verifyBusResults();
      await busResultsPage.chooseBus();
    });
    await test.step("Clear mandatory passenger fields and verify required-field errors", async () => {
      await passengerDetailsPage.enterPassengerDetails(passengers.blankPassenger);
      await passengerDetailsPage.expectMandatoryFieldValidation();
    });
  });
});
