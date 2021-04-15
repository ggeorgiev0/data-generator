import fs from "fs";
import { Workbooks } from "../enums/workbookPaths";

export default class Writer {
  public writeStream: fs.WriteStream;

  constructor(private filePath: fs.PathLike) {
    this.writeStream = fs.createWriteStream(this.filePath);
  }

  public createHeaders(headers: string): void {
    this.writeRow(headers);
  }

  public writeRow(rowValues: string): void {
    this.writeStream.write(`${rowValues}\n`, "utf-8");
  }

  public static async createOutputFiles(): Promise<void> {
    // Exception to the rule, because we need to iterate over an enumerator
    // eslint-disable-next-line no-restricted-syntax
    for (const workbook in Workbooks) {
      if (Object.prototype.hasOwnProperty.call(Workbooks, workbook)) {
        try {
          fs.existsSync(workbook);
        } catch (e) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise<void>((resolve, reject) => {
            fs.writeFile(workbook, "", (error) => {
              if (error) reject(error);
              resolve();
            });
          });
        }
      }
    }
  }
}
