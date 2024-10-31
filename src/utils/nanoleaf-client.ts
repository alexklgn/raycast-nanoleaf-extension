import { NanoleafClient } from "nanoleaf-client";
import { Device } from "../types";
import { saveDevice, getDevice } from "./storage";

export class NanoleafDevice {
  private client!: InstanceType<typeof NanoleafClient>;
  public device!: Device;

  private constructor() {}

  static async create(ip: string, mac: string): Promise<NanoleafDevice> {
    const instance = new NanoleafDevice();
    await instance.initialize(ip, mac);
    return instance;
  }

  private async initialize(ip: string, mac: string): Promise<void> {
    const savedDevice = await this.getSavedDevice(ip);
    if (savedDevice) {
      this.device = savedDevice;
    } else {
      this.device = await this.authorizeDevice(ip, mac);
    }
    this.client = await new NanoleafClient(this.device.ip, this.device.token);
  }

  private async getSavedDevice(ip: string): Promise<Device | undefined> { 
    const savedDevice = await getDevice(ip);
    return savedDevice;
  }

  private async authorizeDevice(ip: string, mac: string): Promise<Device> { 
    const token = await new NanoleafClient(ip).authorize();
    const deviceInfo = await new NanoleafClient(ip, token).getInfo();
    const device = {
      ip: ip,
      mac: mac,
      token: token,
      name: deviceInfo.name,
      serial: deviceInfo.serialNo,
      model: deviceInfo.model
    };
    saveDevice(device);
    return device;
  }

  getInfo(): Device {
    if (!this.device) {
      throw new Error("Device is not initialized");
    }
    return this.device;
  }

  async getFullInfo(): Promise<any> {
    const info = await this.client.getInfo();
    return info;
  }

  async getEffect(): Promise<string> {
    const effect = await this.client.getSelectedEffect();
    return effect;
  }

  async getPowerStatus(): Promise<boolean> {
    const powerStatus = await this.client.getPowerStatus();
    return powerStatus.value;
  }

  async togglePower(): Promise<void> {
    const isOn = await this.getPowerStatus();
    if (isOn) {
      await this.client.turnOff();
    } else {
      await this.client.turnOn();
    }
  }

  async getBrightness(): Promise<number> {
    const brightness = await this.client.getBrightness();
    return brightness.value;
  }

  async setBrightness(brightness: number): Promise<void> {
    await this.client.setBrightness(brightness);
  }
}
