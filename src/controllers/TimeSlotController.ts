import { Workbooks } from "../enums/workbookPaths";
import Reader from "./Reader";
import ITimeSlotConfiguration from "../interfaces/ITimeSlotConfiguration";

export default class TimeSlotController {
  public static async getRandomActiveFrom(
    reader: Reader
  ): Promise<(string | undefined)[]> {
    const dateWorksheet = await reader.readWorkbook(Workbooks.DATE);
    const dates = reader.getAllValuesForColumn("FullDate", dateWorksheet);
    const halfOfAllDates = Math.ceil(dates.length / 2);
    return dates.splice(0, halfOfAllDates);
  }

  public static async createTimeSlotConfigurations(
    reader: Reader
  ): Promise<ITimeSlotConfiguration[]> {
    const configurations: ITimeSlotConfiguration[] = [];
    const dateWorksheet = await reader.readWorkbook(Workbooks.DATE);
    const timeSlotWorksheet = await reader.readWorkbook(Workbooks.TIME_SLOT);

    const dateIds = reader.getAllValuesForColumn("ID", dateWorksheet);
    const timeSlotIds = reader.getAllValuesForColumn("ID", timeSlotWorksheet);

    dateIds.forEach((dateId) => {
      if (dateId) {
        timeSlotIds.forEach((timeSlotId) => {
          if (timeSlotId) {
            configurations.push({
              dateId: +dateId,
              timeSlotId: +timeSlotId,
            });
          }
        });
      }
    });

    return configurations;
  }
}
