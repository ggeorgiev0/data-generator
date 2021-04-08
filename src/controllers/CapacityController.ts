import random from "random";
// import seedrandom from 'seedrandom';
import { Writer } from "./Writer";
import { Reader } from "./Reader";
import { Config } from "../enums/config";
import { IRealEstateConfiguration } from "../interfaces/IRealEstateConfiguration";
import { Workbooks } from "../enums/workbookPaths";
import { Headers } from "../enums/headers";
import { TimeSlotController } from "./TimeSlotController";

// random.use(seedrandom(Config.SEED));

export class CapacityController {
  public calculateRandomCapacity(): number {
    let capacity = 1;
    // 20% of the time capacity will be bigger than the minimum
    const highCapacityFlag = random.int(1, 5) === 5;
    if (highCapacityFlag) {
      capacity = random.int(
        Config.CAPACITY_MINIMUM,
        Config.CAPACITY_MAXIMUM_DEVIANCE
      );
    }
    return capacity;
  }

  public async createCapacities(
    relationalConfigurations: IRealEstateConfiguration[]
  ): Promise<{ id: number; capacity: number }[]> {
    const reader = new Reader();
    const writer = new Writer(Workbooks.CAPACITY);
    writer.createHeaders(Headers.CAPACITY);
    const id = 1;
    const capacities: { id: number; capacity: number }[] = [];
    console.log("Generating capacity data ...");
    /**
     * Iterate through all real estate configurations and
     * create capacity configurations for all sensors.
     */
    // eslint-disable-next-line no-restricted-syntax
    for (const configuration of relationalConfigurations) {
      const capacity = this.calculateRandomCapacity();
      // eslint-disable-next-line no-await-in-loop
      const activeFromDates = await TimeSlotController.getRandomActiveFrom(
        reader
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
        capacity,
        activeFrom,
        activeTill,
      ];
      capacities.push({
        id,
        capacity,
      });

      writer.writeRow(rowData.toString());
    }

    return capacities;
  }
}
