import TimeSlotController from "./controllers/TimeSlotController";
import RealEstateController from "./controllers/RealEstateController";
import OccupancyController from "./controllers/OccupancyController";
import CapacityController from "./controllers/CapacityController";
import HeadcountController from "./controllers/HeadcountController";
import Reader from "./controllers/Reader";
import Writer from "./controllers/Writer";

async function main() {
  await Writer.createOutputFiles();
  const reader = new Reader();
  let realEstateController: RealEstateController | null = new RealEstateController();

  const timeSlotConfigurations = await TimeSlotController.createTimeSlotConfigurations(
    reader
  );
  const realEstateConfigurations = await realEstateController.createRelationalConfiguration();

  let capacityController: CapacityController | null = new CapacityController(
    realEstateConfigurations
  );
  const capacities = await capacityController.createCapacities();

  let headcountController: HeadcountController | null = new HeadcountController(
    capacities,
    realEstateConfigurations
  );
  const headcounts = await headcountController.createHeadcounts();

  // Free up some memory
  realEstateController = null;
  capacityController = null;
  headcountController = null;

  const occupancy = new OccupancyController(
    realEstateConfigurations,
    capacities,
    headcounts,
    timeSlotConfigurations
  );

  await occupancy.createOccupancies();
}

main();
