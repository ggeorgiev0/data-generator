import fs from "fs";

export class Writer {
  constructor(private filePath: fs.PathLike) {}

  get writeStream(): fs.WriteStream {
    return fs.createWriteStream(this.filePath);
  }

  public createHeaders(headers: string): void {
    this.writeStream.write(`${headers}\n`, "utf-8");
  }

  public writeRow(rowValues: string): void {
    this.writeStream.write(`${rowValues}\n`, "utf-8");
  }
}
