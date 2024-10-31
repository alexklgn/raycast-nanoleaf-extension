"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDevice = saveDevice;
exports.getDevices = getDevices;
exports.removeDevice = removeDevice;
const api_1 = require("@raycast/api");
const DEVICES_KEY = 'nanoleaf_devices';
async function saveDevice(device) {
    const devices = await getDevices();
    devices.push(device);
    await api_1.LocalStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
}
async function getDevices() {
    const devicesJson = await api_1.LocalStorage.getItem(DEVICES_KEY);
    if (devicesJson) {
        return JSON.parse(devicesJson);
    }
    return [];
}
async function removeDevice(ip) {
    const devices = await getDevices();
    const updatedDevices = devices.filter((device) => device.ip !== ip);
    await api_1.LocalStorage.setItem(DEVICES_KEY, JSON.stringify(updatedDevices));
}
