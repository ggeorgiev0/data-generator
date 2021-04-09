import random from "random";
// import seedrandom from 'seedrandom';
import { Reader } from "./Reader";
import { Writer } from "./Writer";
import { TimeSlotController } from "./TimeSlotController";
import { Config } from "../enums/config";
import { IRealEstateConfiguration } from "../interfaces/IRealEstateConfiguration";
import { IHeadcount } from "../interfaces/IHeadcount";
import { Workbooks } from "../enums/workbookPaths";
import { Headers } from "../enums/headers";
import { ICapacity } from "../interfaces/ICapacity";

// random.use(seedrandom(seed));

export default class HeadcountController {
  constructor(
    private capacities: ICapacity[],
    private relationalConfigurations: IRealEstateConfiguration[]
  ) {}

  private calculateRandomHeadcount(capacity: number | undefined): number {
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
    capacity: number | undefined,
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
    // eslint-disable-next-line no-restricted-syntax
    for (const configuration of this.relationalConfigurations) {
      const index = this.relationalConfigurations.indexOf(configuration);
      // eslint-disable-next-line no-await-in-loop
      const activeFromDates = await TimeSlotController.getRandomActiveFrom(
        reader
      );
      const capacity = this.capacities[index]?.capacity;
      const assignedHeadcount = this.calculateRandomHeadcount(capacity);
      const visitorHeadcount = this.calculateRandomVisitorHeadcount(
        capacity,
        assignedHeadcount
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const activeFrom = activeFromDates[
        random.int(0, activeFromDates.length - 1)
      ]!;
      const activeTill = "";

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
    }

    return headcounts;
  }
}
