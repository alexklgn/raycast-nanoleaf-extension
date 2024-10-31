"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NanoleafController = void 0;
const nanoleaf_client_1 = require("nanoleaf-client");
class NanoleafController {
    client;
    device;
    constructor(device) {
        this.device = device;
        this.client = new nanoleaf_client_1.NanoleafClient(device.ip, device.token);
    }
    async getPowerStatus() {
        const powerStatus = await this.client.getPowerStatus();
        return powerStatus.value;
    }
    async togglePower() {
        const isOn = await this.getPowerStatus();
        if (isOn) {
            await this.client.turnOff();
        }
        else {
            await this.client.turnOn();
        }
    }
    async setBrightness(brightness) {
        await this.client.setBrightness(brightness);
    }
}
exports.NanoleafController = NanoleafController;
