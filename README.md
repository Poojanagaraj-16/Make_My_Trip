# MakeMyTrip Bus Automation

Playwright + TypeScript functional automation scoped to the MakeMyTrip Bus module. The project contains exactly 16 business functional tests across `REQ_BUS_01` through `REQ_BUS_04`. It does not automate other MakeMyTrip modules or submit payment.

## Architecture

Functional specs use custom fixtures to receive page objects. Page objects compose reusable city/date/filter components and framework utilities. Playwright's reporter API supplies actual executed `test.step()` records to the custom HTML reporter.

## Structure

```text
src/
  components/     City suggestion, journey-date picker, bus filters
  fixtures/       Page-object fixtures
  pages/          Bus search, results, passenger details, booking summary
  reporter/       Actual-result HTML reporter
  tests/functional/ Four requirement-specific spec files
  types/          Shared test-data types
  utils/          Element actions, date utilities, JSON reader, logger
test-data/        Fixed search, date, filter, and passenger input
config/           QA and development base URL settings
reports/          Generated custom report
```

## Installation

```powershell
npm install
npx playwright install chromium firefox webkit
```

Node.js and npm are required. On networks that restrict the MakeMyTrip site, tests will expose actual browser/network errors instead of producing synthetic pass results.

## Configuration and data

`playwright.config.ts` sets the live site base URL, timeouts, single-worker execution, failure artifacts, and Chromium/Firefox/WebKit projects. In this Windows environment the `chromium` project uses the installed Microsoft Edge Chromium engine because application-control policy blocks Playwright's downloaded Chromium binary. The other browser projects remain configured. The 16-case execution command uses the Chromium engine only to run each listed case once. Fixed inputs and relative travel-date offsets live in `test-data/*.json`; no Faker or random input is used.

## Running tests

```powershell
npm run typecheck
npm run test:chromium
npm run test:headed
npm run test:search
npm run test:dates
npm run test:filters
npm run test:booking
npx playwright test src/tests/functional/bus-search.functional.spec.ts --project=chromium -g "TC_01"
```

Run all configured browser projects with `npm test`. The default suite uses one worker so interactions with the live site are serialized.

## Custom report

Every run writes `reports/custom-report.html` in a filterable table layout with All/Passed/Failed/Skipped/Blocked tabs and columns for test number, test name, source file and line, duration, retry count, and status. Expand a test name to see its requirement, test ID, category, browser, and actual executed steps with status, duration, and any error. Step details are collected from `TestResult.steps` in `CustomReporter.ts`; no duplicate step-name list is maintained. Open the generated file directly or run `npm run report:open`.

The report totals reflect final results per test case (after any retries, if configured). `BLOCKED` is used when Playwright reports recognizable site/network access restrictions; other errors remain `FAILED`.

## Troubleshooting

- If browsers are not installed, run `npx playwright install chromium firefox webkit`.
- If the live site shows a login prompt, the search page object closes the observed `data-cy="closeModal"` modal before interacting with the bus form.
- A CAPTCHA, denial, regional restriction, changed UI, or missing live route may prevent downstream tests from reaching results or booking details; inspect the failure and trace in `test-results`.
- Passenger booking tests stop before payment and never enter payment credentials or complete a transaction.
