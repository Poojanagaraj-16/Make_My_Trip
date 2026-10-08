import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class ElementActions {
  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async getText(locator: Locator): Promise<string> {
    return (await locator.innerText()).trim();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  async waitForVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async waitForEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }
}
