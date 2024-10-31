"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustBrightness = exports.togglePower = exports.addDevice = void 0;
// Export commands for the extension
var add_device_1 = require("./add-device");
Object.defineProperty(exports, "addDevice", { enumerable: true, get: function () { return __importDefault(add_device_1).default; } });
var toggle_power_1 = require("./toggle-power");
Object.defineProperty(exports, "togglePower", { enumerable: true, get: function () { return __importDefault(toggle_power_1).default; } });
var adjust_brightness_1 = require("./adjust-brightness");
Object.defineProperty(exports, "adjustBrightness", { enumerable: true, get: function () { return __importDefault(adjust_brightness_1).default; } });
