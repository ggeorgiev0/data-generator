import random from "random";
import ProgressBar from "progress";
// import seedrandom from 'seedrandom';
import Writer from "./Writer";
import IRealEstateConfiguration from "../interfaces/IRealEstateConfiguration";
import IHeadcount from "../interfaces/IHeadcount";
import ICapacity from "../interfaces/ICapacity";
import ITimeSlotConfiguration from "../interfaces/ITimeSlotConfiguration";
import { Workbooks } from "../enums/workbookPaths";
import { Headers } from "../enums/headers";
import { Config } from "../enums/config";

// random.use(seedrandom(seed));

export default class OccupancyController {
  constructor(
    private realEstateConfigurations: IRealEstateConfiguration[],
    private capacities: ICapacity[],
    private headcounts: IHeadcount[],
    private timeSlotConfigurations: ITimeSlotConfiguration[]
  ) {}

  /**
   * Only returns occupancy larger than 0 if in working hours, set in the config file.
   * @param timeSlotId - The 10 minute time slot id
   * @param capacity - Capacity for the sensor
   * @param headcount - Total Headcount for the sensor
   * @returns occupancy amount
   */
  private calculateRandomOccupancy(
    capacity: number,
    headcount: number
  ): number {
    let occupancy = 0;
    // Set unoccupied to 10% of the 'should be' occupied entries.
    const unoccupiedFlag = random.int(1, 10) === 10;
    if (!unoccupiedFlag) {
      if (capacity && headcount && capacity > Config.OCCUPANCY_MIN_POSITIVE) {
        occupancy = random.int(Config.OCCUPANCY_MIN_POSITIVE, headcount);
      } else if (capacity === Config.OCCUPANCY_MIN_POSITIVE) {
        occupancy = Config.OCCUPANCY_MIN_POSITIVE;
      }
    }
    return occupancy;
  }

  /**
   * Iterate over all time slot configurations and all real estate configurations to generate and save the main occupancy tables.
   */
  public async createOccupancies(): Promise<void> {
    // Create the two write streams for the different occupancy table models.
    const writerOne = new Writer(Workbooks.OCCUPANCY_V1);
    const writerTwo = new Writer(Workbooks.OCCUPANCY_V2);

    // Write the column headers.
    writerOne.createHeaders(Headers.OCCUPANCY_V1);
    writerTwo.createHeaders(Headers.OCCUPANCY_V2);

    // Set up the console progress bar.
    const bar = new ProgressBar("Generating occupancy data [:bar] :percent", {
      total: this.timeSlotConfigurations.length,
    });

    // The program overwrites the output files each time, so it is safe to start with an id of 1.
    let id = 1;

    // Iterate over all time slot configurations - 144 configurations per day in the dimDate.csv table.
    this.timeSlotConfigurations.forEach((timeSlotConfiguration) => {
      // Iterate over all real estate configurations - basically the amount of sensors in the relational structure.
      this.realEstateConfigurations.forEach(
        (realEstateConfiguration, index) => {
          /**
           * The headcount and capacity of sensors is stored based on the amount of sensors,
           * so it is safe to assume that the values will not be undefined.
           */
          const headcount = this.headcounts[index];
          const currentCapacity = this.capacities[index];

          // Row data will contain all the basic values that are shared between the two models.
          let rowData: (number | string)[] = [];
          if (
            realEstateConfiguration.spaceTypeId !== undefined &&
            realEstateConfiguration.departmentId !== undefined &&
            currentCapacity !== undefined &&
            headcount?.assignedHeadcount !== undefined &&
            headcount.visitorHeadcount !== undefined
          ) {
            // Start with 0 occupancy and only change the value if between the working hours, set in the Config file.
            let occupancy = 0;
            if (
              timeSlotConfiguration.timeSlotId >=
                Config.TIME_SLOT_LOWER_BOUNDARY &&
              timeSlotConfiguration.timeSlotId <=
                Config.TIME_SLOT_UPPER_BOUNDARY
            ) {
              occupancy = this.calculateRandomOccupancy(
                currentCapacity.capacity,
                headcount?.assignedHeadcount + headcount?.visitorHeadcount
              );
            }

            rowData = [
              id,
              realEstateConfiguration.regionId,
              realEstateConfiguration.siteId,
              realEstateConfiguration.buildingId,
              realEstateConfiguration.floorId,
              realEstateConfiguration.zoneId,
              realEstateConfiguration.spaceId,
              realEstateConfiguration.spaceTypeId,
              realEstateConfiguration.sensorId,
              realEstateConfiguration.departmentId,
              timeSlotConfiguration.dateId,
              timeSlotConfiguration.timeSlotId,
              occupancy,
            ];
          }

          // This is the difference between the models:
          const v1Data = [...rowData, currentCapacity?.id, headcount?.id];
          const v2Data = [
            ...rowData,
            currentCapacity?.capacity,
            headcount?.assignedHeadcount,
            headcount?.visitorHeadcount,
          ];

          // Use the write stream to populate the occupancy tables.
          writerOne.writeRow(v1Data.toString());
          writerTwo.writeRow(v2Data.toString());

          // Increase the id for the next entry.
          id += 1;
        }
      );
      // Visualize the progress.
      bar.tick();
    });
  }
}
