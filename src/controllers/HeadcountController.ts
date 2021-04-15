import random from "random";
// import seedrandom from 'seedrandom';
import Reader from "./Reader";
import Writer from "./Writer";
import TimeSlotController from "./TimeSlotController";
import IRealEstateConfiguration from "../interfaces/IRealEstateConfiguration";
import IHeadcount from "../interfaces/IHeadcount";
import ICapacity from "../interfaces/ICapacity";
import { Workbooks } from "../enums/workbookPaths";
import { Headers } from "../enums/headers";
import { Config } from "../enums/config";

// random.use(seedrandom(seed));

export default class HeadcountController {
  constructor(
    private capacities: ICapacity[],
    private relationalConfigurations: IRealEstateConfiguration[]
  ) {}

  private calculateRandomHeadcount(capacity: number): number {
    let headcount = 1;
    if (capacity) {
      headcount =
        capacity +
        random.int(
          Config.HEADCOUNT_NEGATIVE_DEVIANCE,
          Config.HEADCOUNT_POSITIVE_DEVIANCE
        );
    }
    if (headcount < 1) headcount = 1;
    return headcount;
  }

  private calculateRandomVisitorHeadcount(
    capacity: number,
    employeeHeadcount: number
  ): number {
    let visitorHeadcount = 0;
    if (capacity && capacity > 1 && employeeHeadcount < capacity) {
      visitorHeadcount = capacity - employeeHeadcount;
    }
    return visitorHeadcount;
  }

  public async createHeadcounts(): Promise<IHeadcount[]> {
    const reader = new Reader();
    const writer = new Writer(Workbooks.HEADCOUNT);
    writer.createHeaders(Headers.HEADCOUNT);
    let id = 1;
    const headcounts: IHeadcount[] = [];
    console.log("Generating headcount data...");
    this.relationalConfigurations.forEach(async (configuration, index) => {
      const activeFromDates = await TimeSlotController.getRandomActiveFrom(
        reader
      );
      const capacity = this.capacities[index]?.capacity;
      if (capacity) {
        const assignedHeadcount = this.calculateRandomHeadcount(capacity);
        const visitorHeadcount = this.calculateRandomVisitorHeadcount(
          capacity,
          assignedHeadcount
        );
        const activeFrom =
          activeFromDates[random.int(0, activeFromDates.length - 1)];
        const activeTill = "";
        if (activeFrom) {
          const rowData: (number | string)[] = [
            id,
            configuration.regionId,
            configuration.siteId,
            configuration.buildingId,
            configuration.floorId,
            configuration.zoneId,
            configuration.spaceId,
            configuration.sensorId,
            visitorHeadcount,
            assignedHeadcount,
            activeFrom,
            activeTill,
          ];
          headcounts.push({
            id,
            assignedHeadcount,
            visitorHeadcount,
          });
          id += 1;
          writer.writeRow(rowData.toString());
        } else throw new Error("Could not set ActiveTill!");
      }
    });
    return headcounts;
  }
}
