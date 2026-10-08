import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestResult,
  TestStep,
} from "@playwright/test/reporter";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

interface StepRecord {
  readonly title: string;
  readonly status: "PASSED" | "FAILED" | "SKIPPED";
  readonly durationMs: number;
  readonly error?: string;
}

interface TestRecord {
  readonly key: string;
  readonly requirement: string;
  readonly testId: string;
  readonly testName: string;
  readonly testType: string;
  readonly browser: string;
  readonly file: string;
  readonly status: "PASSED" | "FAILED" | "SKIPPED" | "BLOCKED";
  readonly durationMs: number;
  readonly retry: number;
  readonly steps: readonly StepRecord[];
  readonly error?: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Readonly<Record<string, string>> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function errorMessage(error: TestResult["error"]): string | undefined {
  return error?.message ?? error?.stack;
}

function collectSteps(steps: readonly TestStep[]): StepRecord[] {
  const collected: StepRecord[] = [];
  const visit = (step: TestStep): void => {
    if (step.category === "test.step") {
      collected.push({
        title: step.title,
        status: step.error ? "FAILED" : "PASSED",
        durationMs: step.duration,
        error: step.error?.message,
      });
    }
    step.steps.forEach(visit);
  };
  steps.forEach(visit);
  return collected;
}

function classifyStatus(result: TestResult): TestRecord["status"] {
  if (result.status === "passed") return "PASSED";
  if (result.status === "skipped") return "SKIPPED";
  const message = errorMessage(result.error) ?? "";
  if (
    /captcha|access denied|blocked by|robot check|geo.?restrict|service unavailable|200-OK/i.test(
      message,
    )
  ) {
    return "BLOCKED";
  }
  return "FAILED";
}

export default class CustomReporter implements Reporter {
  private readonly results = new Map<string, TestRecord>();
  private reportPath = "";
  private rootDir = process.cwd();
  private startedAt = 0;
  private command = "npx playwright test --project=chromium";

  onBegin(config: FullConfig): void {
    this.startedAt = Date.now();
    const projectRoot = config.configFile
      ? path.dirname(config.configFile)
      : path.resolve(__dirname, "..", "..");
    this.rootDir = projectRoot;
    this.reportPath = path.resolve(projectRoot, "reports", "custom-report.html");
    mkdirSync(path.dirname(this.reportPath), { recursive: true });
    this.command = process.env.PLAYWRIGHT_TEST_COMMAND ?? this.command;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const requirement =
      test.annotations.find((annotation) => annotation.type === "requirement")?.description ??
      test.titlePath().find((title) => /^REQ_BUS_\d{2}$/.test(title)) ??
      "UNMAPPED";
    const testType =
      test.annotations.find((annotation) => annotation.type === "test-type")?.description ??
      "FUNCTIONAL";
    const testId = test.title.match(/\bTC_\d{2}\b/)?.[0] ?? "UNMAPPED";
    const messages = errorMessage(result.error);
    this.results.set(test.id, {
      key: `${requirement}:${testId}`,
      requirement,
      testId,
      testName: test.title,
      testType,
      browser:
        test.parent.project()?.use.channel === "msedge"
          ? "Microsoft Edge (Chromium)"
          : test.parent.project()?.name ?? "unknown",
      file: `${path.relative(this.rootDir, test.location.file)}:${test.location.line}`,
      status: classifyStatus(result),
      durationMs: result.duration,
      retry: result.retry,
      steps: collectSteps(result.steps),
      error: messages,
    });
  }

  onEnd(result: FullResult): void {
    const records = [...this.results.values()].sort((left, right) =>
      left.key.localeCompare(right.key),
    );
    if (records.length === 0) return;
    const counts = records.reduce(
      (summary, record) => {
        summary[record.status] += 1;
        return summary;
      },
      { PASSED: 0, FAILED: 0, SKIPPED: 0, BLOCKED: 0 },
    );
    const bodyRows = records
      .map((record, index) => {
        const steps =
          record.steps.length > 0
            ? `<ul class="steps">${record.steps
                .map((step) => {
                  const icon =
                    step.status === "PASSED" ? "✓" : step.status === "FAILED" ? "✗" : "–";
                  return `<li class="${step.status.toLowerCase()}"><span class="step-icon">${icon}</span> ${escapeHtml(step.title)} <span class="step-duration">(${(step.durationMs / 1000).toFixed(1)}s)</span>${step.error ? `<div class="step-error">${escapeHtml(step.error)}</div>` : ""}</li>`;
                })
                .join("")}</ul>`
            : '<p class="no-steps">No test.step() blocks were executed.</p>';
        const detail =
          record.error && !record.steps.some((step) => step.error === record.error)
            ? `<pre class="test-error">${escapeHtml(record.error)}</pre>`
            : "";
        const expanded = index === 0 ? " open" : "";
        return `<tr class="test-row ${record.status.toLowerCase()}" data-status="${record.status}">
          <td class="number">${index + 1}</td>
          <td class="test-name"><details${expanded}><summary><span class="test-title">${escapeHtml(record.testName)}</span><span class="meta">${escapeHtml(record.requirement)} <span class="separator">·</span> ${escapeHtml(record.testId)} <span class="separator">·</span> ${escapeHtml(record.testType)} <span class="separator">·</span> ${escapeHtml(record.browser)}</span></summary><div class="detail-panel"><h3>Steps</h3>${steps}${detail}</div></details></td>
          <td class="file">${escapeHtml(record.file)}</td>
          <td>${(record.durationMs / 1000).toFixed(1)}s</td>
          <td>${record.retry}</td>
          <td><span class="badge ${record.status.toLowerCase()}">${record.status}</span></td>
        </tr>`;
      })
      .join("\n");
    const elapsed = result.duration || Date.now() - this.startedAt;
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MakeMyTrip Bus Automation Report</title>
<style>
*{box-sizing:border-box}body{font:14px/1.5 Arial,sans-serif;margin:0;color:#20242b;background:#f3f5f9}
header{background:#fff;padding:22px max(24px,calc((100% - 1200px)/2));border-bottom:1px solid #e1e5ed}
h1{font-size:22px;margin:0 0 5px;color:#182233}.subtitle{color:#647084;font-size:13px}
main{max-width:1200px;margin:22px auto;padding:0 20px}.summary{display:flex;gap:20px;flex-wrap:wrap;padding:14px 18px;margin-bottom:16px;background:#fff;border:1px solid #e2e6ee;border-radius:7px}
.summary strong{color:#182233}.filters{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}.filters button{border:0;border-radius:5px;padding:8px 14px;background:#263448;color:#fff;font-weight:600;cursor:pointer}.filters button.active{background:#1672d4}.filters button:hover{background:#354b68}
.table-wrap{overflow-x:auto;background:#fff;border:1px solid #e2e6ee;border-radius:7px}table{border-collapse:collapse;width:100%;min-width:850px}
th{background:#111a2a;color:#fff;font-weight:600;text-align:left;padding:10px 12px}td{padding:10px 12px;border-bottom:1px solid #e9edf3;vertical-align:top}
.test-row{border-left:3px solid #9aa4b2}.test-row.passed{border-left-color:#24a45a}.test-row.failed{border-left-color:#d84242}.test-row.skipped{border-left-color:#d39b16}.test-row.blocked{border-left-color:#8353bf}
.number{width:42px}.test-name{min-width:370px}.file{min-width:190px;color:#596579;font-size:13px}.test-title{font-weight:700;color:#2868c7}.meta{display:block;margin-top:4px;color:#677386;font-size:12px}.separator{padding:0 4px;color:#9ca5b1}
details summary{cursor:pointer;list-style:none}details summary::-webkit-details-marker{display:none}details summary:before{content:"›";display:inline-block;color:#69788e;font-size:18px;margin-right:8px;transition:transform .12s}details[open] summary:before{transform:rotate(90deg)}
.detail-panel{margin:12px 0 0 22px;padding:16px;background:#f7f8fa;border-radius:6px;max-width:780px}.detail-panel h3{font-size:14px;margin:0 0 10px}.steps{margin:0;padding-left:20px;color:#34764d}.steps li{padding:2px 0}.steps li.failed{color:#b42318}.steps li.skipped{color:#788394}.step-icon{font-weight:700}.step-duration{color:#687386}.step-error{margin:3px 0 6px 20px;color:#b42318;font-size:12px;white-space:pre-wrap}
.badge{display:inline-block;padding:3px 9px;border-radius:12px;font-size:11px;font-weight:700}.badge.passed{background:#d9f5e4;color:#18733c}.badge.failed{background:#ffe1df;color:#ad261e}.badge.skipped{background:#fff0c2;color:#856000}.badge.blocked{background:#eadffc;color:#63339a}
.no-steps{color:#707b8c;margin:0}.test-error{white-space:pre-wrap;overflow:auto;background:#fff2f1;border-left:3px solid #d84242;padding:10px;margin:12px 0 0;font-size:12px}
.footer{margin:14px 0;color:#707b8c;font-size:12px}
</style></head><body>
<header><h1>MAKE MY TRIP BUS AUTOMATION — EXECUTION REPORT</h1><div class="subtitle">Playwright functional results and executed step details</div></header>
<main><div class="summary"><span><strong>Total Tests:</strong> ${records.length}</span><span class="passed"><strong>Passed:</strong> ${counts.PASSED}</span><span class="failed"><strong>Failed:</strong> ${counts.FAILED}</span><span class="skipped"><strong>Skipped:</strong> ${counts.SKIPPED}</span><span class="blocked"><strong>Blocked:</strong> ${counts.BLOCKED}</span><span><strong>Execution Time:</strong> ${(elapsed / 1000).toFixed(2)}s</span></div>
<nav class="filters" aria-label="Filter tests"><button class="active" data-filter="ALL">All (${records.length})</button><button data-filter="PASSED">Passed (${counts.PASSED})</button><button data-filter="FAILED">Failed (${counts.FAILED})</button><button data-filter="SKIPPED">Skipped (${counts.SKIPPED})</button><button data-filter="BLOCKED">Blocked (${counts.BLOCKED})</button></nav>
<div class="table-wrap"><table><thead><tr><th>#</th><th>Test Name</th><th>File</th><th>Duration</th><th>Retry</th><th>Status</th></tr></thead><tbody>${bodyRows}</tbody></table></div>
<p class="footer"><strong>Execution command:</strong> ${escapeHtml(this.command)}<br>Step names, statuses, durations, and errors are collected from Playwright's executed <code>TestResult.steps</code>. Details expand by selecting a test name.</p></main>
<script>
document.querySelectorAll(".filters button").forEach(button=>button.addEventListener("click",()=>{document.querySelectorAll(".filters button").forEach(item=>item.classList.remove("active"));button.classList.add("active");const filter=button.dataset.filter;document.querySelectorAll(".test-row").forEach(row=>{row.hidden=filter!=="ALL"&&row.dataset.status!==filter})}));
</script>
</body></html>`;
    writeFileSync(this.reportPath, html, "utf8");
  }
}
