export enum Headers {
  OCCUPANCY_V1 = "ID,RegionId,SiteId,BuildingId,FloorId,ZoneId,SpaceId,SpaceTypeId,SensorId,DepartmentId,DateId,TimeSlotId,Occupancy,CapacityId,HeadcountId",
  OCCUPANCY_V2 = "ID,RegionId,SiteId,BuildingId,FloorId,ZoneId,SpaceId,SpaceTypeId,SensorId,DepartmentId,DateId,TimeSlotId,Occupancy,Capacity,Assigned Headcount,Visitor Headcount",
  CAPACITY = "ID,_RegionId,_SiteId,_BuildingId,_FloorId,_ZoneId,_SpaceId,_SensorId,Capacity,_ActiveFrom,_ActiveTill",
  HEADCOUNT = "ID,_RegionId,_SiteId,_BuildingId,_FloorId,_ZoneId,_SpaceId,_SensorId,VisitorsHeadcount,AssignedHeadcount,_ActiveFrom,_ActiveTill",
}
