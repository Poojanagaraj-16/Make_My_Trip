import { readFileSync } from "node:fs";
import path from "node:path";

export class TestDataReader {
  static read<T>(fileName: string): T {
    const filePath = path.resolve(process.cwd(), "test-data", fileName);
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  }
}
