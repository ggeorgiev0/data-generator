import { Workbook, Worksheet } from "exceljs";

export default class Reader {
  public workbook = new Workbook();

  public readWorkbook(filePath: string): Promise<Worksheet> {
    return this.workbook.csv.readFile(filePath);
  }

  private getColumnHeaders(worksheet: Worksheet) {
    const headers: string[] = [];
    const row = worksheet.getRow(1);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (cell.value) {
        headers[colNumber] = cell.value?.toString();
      }
    });
    return headers;
  }

  private getValueByCellLocation(
    columnHeader: string,
    rowNumber: number,
    worksheet: Worksheet
  ) {
    const columnIndex = this.getColumnHeaders(worksheet).indexOf(columnHeader);
    const row = worksheet.getRow(rowNumber);
    return row.getCell(columnIndex).value;
  }

  public getAllValuesForColumn(
    columnHeader: string,
    worksheet: Worksheet
  ): string[] {
    const { actualRowCount } = worksheet;
    const rows = worksheet.getRows(2, actualRowCount - 1);
    const values: string[] = [];
    rows?.forEach((row: { number: number }, index) => {
      const value = this.getValueByCellLocation(
        columnHeader,
        row.number,
        worksheet
      );
      if (value) {
        values[index] = value?.toString();
      } else {
        values[index] = "";
      }
    });
    return values;
  }
}
