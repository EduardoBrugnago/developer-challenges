export const MACHINE_TYPES = ["FAN", "PUMP"] as const;
export type MachineType = (typeof MACHINE_TYPES)[number];

export const MACHINE_TYPE_LABELS: Record<MachineType, string> = {
  FAN: "Fan",
  PUMP: "Pump",
};

export const SENSOR_MODELS = ["HF_PLUS", "TC_AG", "TC_AS"] as const;
export type SensorModel = (typeof SENSOR_MODELS)[number];

export const SENSOR_MODEL_LABELS: Record<SensorModel, string> = {
  HF_PLUS: "HF+",
  TC_AG: "TcAg",
  TC_AS: "TcAs",
};

/** Sensors limited by machine type. */
const FORBIDDEN_SENSOR_MODELS: Record<MachineType, readonly SensorModel[]> = {
  PUMP: ['TC_AG', 'TC_AS'],
  FAN: [],
};

/** Validate if sensor can be installed in the machine type */
export function isSensorModelAllowed(machineType: MachineType, model: SensorModel): boolean {
  return !FORBIDDEN_SENSOR_MODELS[machineType].includes(model);
}

/** List of sensor allowed for a machine type */
export function allowedSensorModels(machineType: MachineType): SensorModel[] {
  return SENSOR_MODELS.filter((model) => isSensorModelAllowed(machineType, model));
}

/** Columns of monitoring points + Pagination info */
export const MONITORING_POINT_SORT_FIELDS = [
  'machineName',
  'machineType',
  'monitoringPointName',
  'sensorModel',
] as const;
export type MonitoringPointSortField = (typeof MONITORING_POINT_SORT_FIELDS)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const MONITORING_POINTS_PAGE_SIZE = 5;

export const MACHINE_SORT_FIELDS = ["name", "type", "createdAt"] as const;
export type MachineSortField = (typeof MACHINE_SORT_FIELDS)[number];

export const MACHINES_PAGE_SIZE = 10;

export const MAX_POINTS_PER_REQUEST = 10_000;