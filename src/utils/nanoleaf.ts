import { NanoleafClient } from 'nanoleaf-client';
import { getLocalNetwork, NetworkDevice } from './local-network';
import { NanoleafDevice } from './nanoleaf-client';
import { Device } from '../types';

export const getNanoleafDevices = async (): Promise<Device[]> => {
    let networkDevices = (await getLocalNetwork()).networkDevices;
    let nanoleafDevices: Device[] = [];

    networkDevices = networkDevices.filter(device => device.mac.startsWith('80:8a:f7')).map(device => ({ip: device.ip, mac: device.mac}));

    for (let device of networkDevices) { 
      const nanoleafDevice = await NanoleafDevice.create(device.ip, device.mac);
      const deviceInfo = nanoleafDevice.getInfo();

      // Fetch additional data
      const powerStatus = await nanoleafDevice.getPowerStatus();
      const brightness = await nanoleafDevice.getBrightness();
      const selectedEffect = await nanoleafDevice.getEffect();

      nanoleafDevices.push({...deviceInfo, state: {powerStatus, brightness, selectedEffect}});
    }

    return nanoleafDevices;
  }

export const getDeviceState = async (device: Device): Promise<Device> => {
    const nanoleafDevice = await NanoleafDevice.create(device.ip, device.mac);

    const powerStatus = await nanoleafDevice.getPowerStatus();
    const brightness = await nanoleafDevice.getBrightness();
    const selectedEffect = await nanoleafDevice.getEffect();

    return { ...device, state: { powerStatus, brightness, selectedEffect } } 
}

const getFullInfoState = async (device: Device) => {
    const nanoleafDevice = await NanoleafDevice.create(device.ip, device.mac);
    const fullInfo = await nanoleafDevice.getFullInfo();
    return fullInfo.state;
}

export async function toggleDevicePower(client: InstanceType<typeof NanoleafClient>) {
    const powerStatus = await client.getPowerStatus();
    await (powerStatus.value ? client.turnOff() : client.client.turnOn()); 
}

export async function toggleAllDevicesPower(clients: {client: InstanceType<typeof NanoleafClient>, deviceName: string}[]) {
    for (const client of clients) {
        await toggleDevicePower(client.client);
    }
}

export async function setDeviceBrightness(client: InstanceType<typeof NanoleafClient>, brightness: number) {
    await client.setBrightness(brightness);
}

export async function setAllDevicesBrightness(clients: {client: InstanceType<typeof NanoleafClient>, deviceName: string}[], brightness: number) {
    for (const client of clients) {
        await setDeviceBrightness(client.client, brightness);
    }
}

export async function getDeviceBrightness(client: InstanceType<typeof NanoleafClient>) {
    return await client.getBrightness();
}

export async function setDeviceEffect(client: InstanceType<typeof NanoleafClient>, effect: string) {
    await client.setEffect(effect);
}
