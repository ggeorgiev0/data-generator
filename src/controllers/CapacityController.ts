import random from "random";
// import seedrandom from 'seedrandom';
import Writer from "./Writer";
import Reader from "./Reader";
import TimeSlotController from "./TimeSlotController";
import ICapacity from "../interfaces/ICapacity";
import IRealEstateConfiguration from "../interfaces/IRealEstateConfiguration";
import { Workbooks } from "../enums/workbookPaths";
import { Headers } from "../enums/headers";
import { Config } from "../enums/config";

// random.use(seedrandom(Config.SEED));

export default class CapacityController {
  constructor(private relationalConfigurations: IRealEstateConfiguration[]) {}

  /**
   * Runs for each sensor in a real estate configuration
   * @returns a random capacity based on the configuration.
   */
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

  /**
   * @returns an array of capacities
   */
  public async createCapacities(reader: Reader): Promise<ICapacity[]> {
    const writer = new Writer(Workbooks.CAPACITY);
    writer.createHeaders(Headers.CAPACITY);
    let id = 1;
    const capacities: ICapacity[] = [];
    const activeFromDates = await TimeSlotController.getRandomActiveFrom(
      reader
    );
    console.log("Generating capacity data ...");
    /**
     * Iterate through all real estate configurations and
     * create capacity configurations for all sensors.
     */
    this.relationalConfigurations.forEach((configuration) => {
      const capacity = this.calculateRandomCapacity();
      const activeFrom =
        activeFromDates[random.int(0, activeFromDates.length - 1)];
      // Active till is intentionally left empty, so that there is no complicated versioning of the capacities.
      const activeTill = "";
      let rowData: (number | string)[] = [];
      if (activeFrom) {
        rowData = [
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
        id += 1;
        writer.writeRow(rowData.toString());
      } else throw new Error("Could not set ActiveFrom date!");
    });
    return capacities;
  }
}
