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

  /**
   * Runs for each sensor in a real estate configuration
   * @returns a random assigned headcount based on the configuration.
   */
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

  /**
   * Runs for each sensor in a real estate configuration
   * @returns a random visitor headcount based on the configuration.
   */
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

  /**
   * @returns an array of headcounts
   */
  public async createHeadcounts(reader: Reader): Promise<IHeadcount[]> {
    const writer = new Writer(Workbooks.HEADCOUNT);
    writer.createHeaders(Headers.HEADCOUNT);
    let id = 1;
    const headcounts: IHeadcount[] = [];
    const activeFromDates = await TimeSlotController.getRandomActiveFrom(
      reader
    );
    console.log("Generating headcount data ...");
    this.relationalConfigurations.forEach((configuration, index) => {
      const capacity = this.capacities[index]?.capacity;
      if (capacity) {
        const assignedHeadcount = this.calculateRandomHeadcount(capacity);
        const visitorHeadcount = this.calculateRandomVisitorHeadcount(
          capacity,
          assignedHeadcount
        );
        const activeFrom =
          activeFromDates[random.int(0, activeFromDates.length - 1)];
        // Active till is intentionally left empty, so that there is no complicated versioning of the headcounts.
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
