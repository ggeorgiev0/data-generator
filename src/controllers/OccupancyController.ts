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

  private calculateRandomOccupancy(
    timeSlotId: number,
    capacity: number,
    headcount: number
  ): number {
    let occupancy = 0;
    if (
      timeSlotId >= Config.TIME_SLOT_LOWER_BOUNDARY &&
      timeSlotId <= Config.TIME_SLOT_UPPER_BOUNDARY
    ) {
      // Set unoccupied to 10% of the 'should be' occupied entries.
      const unoccupiedFlag = random.int(1, 10) === 10;
      if (!unoccupiedFlag) {
        if (capacity && headcount && capacity > Config.OCCUPANCY_MIN_POSITIVE) {
          occupancy = random.int(Config.OCCUPANCY_MIN_POSITIVE, headcount);
        } else if (capacity === Config.OCCUPANCY_MIN_POSITIVE) {
          occupancy = Config.OCCUPANCY_MIN_POSITIVE;
        }
      }
    }
    return occupancy;
  }

  public async createOccupancies(): Promise<void> {
    const writerOne = new Writer(Workbooks.OCCUPANCY_V1);
    const writerTwo = new Writer(Workbooks.OCCUPANCY_V2);

    writerOne.createHeaders(Headers.OCCUPANCY_V1);
    writerTwo.createHeaders(Headers.OCCUPANCY_V2);

    const bar = new ProgressBar("Generating occupancy data [:bar] :percent", {
      total: this.timeSlotConfigurations.length,
    });
    let id = 1;
    this.timeSlotConfigurations.forEach((timeSlotConfiguration) => {
      this.realEstateConfigurations.forEach(
        (realEstateConfiguration, index) => {
          const headcount = this.headcounts[index];
          const currentCapacity = this.capacities[index];

          let rowData: (number | string)[] = [];
          if (
            realEstateConfiguration.spaceTypeId !== undefined &&
            realEstateConfiguration.departmentId !== undefined &&
            currentCapacity !== undefined &&
            headcount?.assignedHeadcount !== undefined &&
            headcount.visitorHeadcount !== undefined
          ) {
            const occupancy = this.calculateRandomOccupancy(
              timeSlotConfiguration.timeSlotId,
              currentCapacity.capacity,
              headcount?.assignedHeadcount + headcount?.visitorHeadcount
            );

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

          const v1Data = [...rowData, currentCapacity?.id, headcount?.id];
          const v2Data = [
            ...rowData,
            currentCapacity?.capacity,
            headcount?.assignedHeadcount,
            headcount?.visitorHeadcount,
          ];
          writerOne.writeRow(v1Data.toString());
          writerTwo.writeRow(v2Data.toString());
          id += 1;
        }
      );
      bar.tick();
    });
  }
}
