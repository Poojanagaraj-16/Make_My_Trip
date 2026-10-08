import type { Page } from "@playwright/test";
import { ElementActions } from "../utils/ElementActions";

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly actions: ElementActions;

  protected constructor(page: Page) {
    this.page = page;
    this.actions = new ElementActions();
  }
}
