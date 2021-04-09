export default interface IRealEstateConfiguration {
  regionId: number;
  siteId: number;
  buildingId: number;
  floorId: number;
  zoneId: number;
  spaceId: number;
  sensorId: number;
  departmentId: number | undefined;
  spaceTypeId: number | undefined;
}
