import fs from "fs";
import random from "random";
import { IRealEstateConfiguration } from "../interfaces/IRealEstateConfiguration";
// import seedrandom from 'seedrandom';
// import { Config } from '../enums/config';
import { IRelationalStructure } from "../interfaces/IRelationalStructure";

// random.use(seedrandom(Config.SEED));

export class RealEstateController {
  private readJsonConfiguration(): Promise<IRelationalStructure> {
    let pathToJson: fs.PathLike;
    if (!process.argv[2]) {
      throw new Error(
        "The path to the json file, containing the relational structure was not provided!"
      );
    } else if (typeof process.argv[2] !== "string") {
      throw new Error(
        "Invalid path for the relational structure was provided."
      );
    } else {
      [, , pathToJson] = process.argv;
    }
    return new Promise((resolve, reject) => {
      fs.readFile(pathToJson, (error, data) => {
        if (error) reject(new Error(`Error during file read: ${error.stack}`));
        resolve(JSON.parse(data.toString()));
      });
    });
  }

  public async createRelationalConfiguration(): Promise<
    IRealEstateConfiguration[]
  > {
    const relationalMetadataStructure = await this.readJsonConfiguration();

    const configurations: IRealEstateConfiguration[] = [];
    relationalMetadataStructure.regions.forEach((region) => {
      region.sites.forEach((site) => {
        site.buildings.forEach((building) => {
          building.floors.forEach((floor) => {
            floor.zones.forEach((zone) => {
              zone.spaces.forEach((space) => {
                space.sensors.forEach((sensor) => {
                  const randomDepartmentIndex = random.int(
                    0,
                    relationalMetadataStructure.departments.length - 1
                  );
                  const randomSpaceTypeIndex = random.int(
                    0,
                    relationalMetadataStructure.space_types.length - 1
                  );
                  const departmentId =
                    relationalMetadataStructure.departments[
                      randomDepartmentIndex
                    ]?.id;
                  const spaceTypeId =
                    relationalMetadataStructure.departments[
                      randomSpaceTypeIndex
                    ]?.id;
                  configurations.push({
                    regionId: region.id,
                    siteId: site.id,
                    buildingId: building.id,
                    floorId: floor.id,
                    zoneId: zone.id,
                    spaceId: space.id,
                    sensorId: sensor.id,
                    departmentId,
                    spaceTypeId,
                  });
                });
              });
            });
          });
        });
      });
    });

    return configurations;
  }
}
