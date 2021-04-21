import TimeSlotController from "./controllers/TimeSlotController";
import RealEstateController from "./controllers/RealEstateController";
import OccupancyController from "./controllers/OccupancyController";
import CapacityController from "./controllers/CapacityController";
import HeadcountController from "./controllers/HeadcountController";
import Reader from "./controllers/Reader";
import Writer from "./controllers/Writer";

async function main() {
  await Writer.createOutputFiles();
  // Used to read the .csv tables
  const reader = new Reader();

  // Create all possible sensor configurations and store them in an array.
  let realEstateController: RealEstateController | null = new RealEstateController();
  const realEstateConfigurations = await realEstateController.createRelationalConfiguration();

  // Create all possible time slot configurations for each day in the dimDate table.
  const timeSlotConfigurations = await TimeSlotController.createTimeSlotConfigurations(
    reader
  );

  // Create the capacities for each sensor in each real estate configuration.
  let capacityController: CapacityController | null = new CapacityController(
    realEstateConfigurations
  );
  const capacities = await capacityController.createCapacities(reader);

  // Create the headcounts for each sensor in each real estate configuration.
  let headcountController: HeadcountController | null = new HeadcountController(
    capacities,
    realEstateConfigurations
  );
  const headcounts = await headcountController.createHeadcounts(reader);

  // Free up some memory
  realEstateController = null;
  capacityController = null;
  headcountController = null;

  /**
   * Generate occupancy for each time slot for each date for each sensor
   * in each real estate configuration based on its capacity and headcount and stream it into the output tables.
   */
  const occupancy = new OccupancyController(
    realEstateConfigurations,
    capacities,
    headcounts,
    timeSlotConfigurations
  );
  await occupancy.createOccupancies();
}

main();
