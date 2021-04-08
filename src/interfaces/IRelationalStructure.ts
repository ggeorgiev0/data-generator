export interface IRelationalStructure {
  regions: IRegion[];
  departments: IDepartment[];
  space_types: ISpaceType[];
}

interface IRegion {
  sites: ISite[];
  id: number;
}

interface ISite {
  buildings: IBuilding[];
  id: number;
}

interface IBuilding {
  floors: IFloor[];
  id: number;
}

interface IFloor {
  zones: IZone[];
  id: number;
}

interface IZone {
  spaces: ISpace[];
  id: number;
}

interface ISpace {
  sensors: ISensor[];
  id: number;
}

interface ISensor {
  id: number;
}

interface IDepartment {
  id: number;
}

interface ISpaceType {
  id: number;
}
