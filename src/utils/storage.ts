import { LocalStorage } from "@raycast/api";
import { Device } from "../types";

const DEVICES_KEY = "nanoleaf_devices";

export async function saveDevice(device: Device): Promise<Device> {
  const devices = await getDevices();
  const existingDeviceIndex = devices.findIndex(d => d.mac === device.mac);
  if (existingDeviceIndex !== -1) {
    devices[existingDeviceIndex] = device;
  } else {
    devices.push(device);
  }

  await LocalStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
  console.log('Saved device', device);

  return device;
}

export async function getDevices(): Promise<Device[]> {
  const devicesJson = await LocalStorage.getItem<string>(DEVICES_KEY);
  if (devicesJson) {
    return JSON.parse(devicesJson) as Device[];
  }
  return [];
}

export async function getDevice(ip: string): Promise<Device | undefined> {
  const devices = await getDevices();
  return devices.find((device) => device.ip === ip);
}

export async function removeDevice(ip: string): Promise<void> {
  const devices = await getDevices();
  const updatedDevices = devices.filter((device) => device.ip !== ip);
  await LocalStorage.setItem(DEVICES_KEY, JSON.stringify(updatedDevices));
}