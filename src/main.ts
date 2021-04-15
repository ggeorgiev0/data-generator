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
  const realEstate = new RealEstateController();

  const timeSlotConfigurations = await TimeSlotController.createTimeSlotConfigurations(
    reader
  );
  const realEstateConfigurations = await realEstate.createRelationalConfiguration();

  const capacity = new CapacityController(realEstateConfigurations);
  const capacities = await capacity.createCapacities();

  const headcount = new HeadcountController(
    capacities,
    realEstateConfigurations
  );
  const headcounts = await headcount.createHeadcounts();

  const occupancy = new OccupancyController(
    realEstateConfigurations,
    capacities,
    headcounts,
    timeSlotConfigurations
  );

  await occupancy.createOccupancies();
}

main();
