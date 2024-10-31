export type Device = {
  ip: string;
  mac: string;
  name?: string;
  token?: string;
  serial?: string;
  model?: string;
  state?: DeviceState;
};

export type DeviceState = {
  powerStatus?: boolean;
  brightness?: number;
  selectedEffect?: string;
};