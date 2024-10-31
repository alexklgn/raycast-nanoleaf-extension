"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TogglePowerCommand;
const react_1 = __importDefault(require("react")); // Add this import
const api_1 = require("@raycast/api");
const react_2 = require("react");
const storage_1 = require("./utils/storage");
const nanoleaf_client_1 = require("./utils/nanoleaf-client");
function TogglePowerCommand() {
    const [devices, setDevices] = (0, react_2.useState)([]);
    (0, react_2.useEffect)(() => {
        async function fetchDevices() {
            const storedDevices = await (0, storage_1.getDevices)();
            setDevices(storedDevices);
        }
        fetchDevices();
    }, []);
    async function togglePower(device) {
        const toast = await (0, api_1.showToast)({ style: api_1.Toast.Style.Animated, title: `Toggling power for ${device.name}...` });
        try {
            const controller = new nanoleaf_client_1.NanoleafController(device);
            await controller.togglePower();
            toast.style = api_1.Toast.Style.Success;
            toast.title = 'Power toggled!';
        }
        catch (error) {
            toast.style = api_1.Toast.Style.Failure;
            toast.title = 'Failed to toggle power';
            toast.message = error.message;
        }
    }
    async function togglePowerAll() {
        const toast = await (0, api_1.showToast)({ style: api_1.Toast.Style.Animated, title: 'Toggling power for all devices...' });
        try {
            for (const device of devices) {
                const controller = new nanoleaf_client_1.NanoleafController(device);
                await controller.togglePower();
            }
            toast.style = api_1.Toast.Style.Success;
            toast.title = 'All devices toggled!';
        }
        catch (error) {
            toast.style = api_1.Toast.Style.Failure;
            toast.title = 'Failed to toggle power for all devices';
            toast.message = error.message;
        }
    }
    return (react_1.default.createElement(api_1.List, { isLoading: devices.length === 0, searchBarPlaceholder: "Select a device to toggle power" },
        react_1.default.createElement(api_1.List.Section, { title: "Devices" }, devices.map((device) => (react_1.default.createElement(api_1.List.Item, { key: device.ip, title: device.name, subtitle: device.ip, actions: react_1.default.createElement(api_1.ActionPanel, null,
                react_1.default.createElement(api_1.Action, { title: "Toggle Power", onAction: () => togglePower(device) })) })))),
        devices.length > 1 && (react_1.default.createElement(api_1.List.Section, null,
            react_1.default.createElement(api_1.List.Item, { title: "All Devices", subtitle: "Toggle power for all devices", actions: react_1.default.createElement(api_1.ActionPanel, null,
                    react_1.default.createElement(api_1.Action, { title: "Toggle Power for All", onAction: togglePowerAll })) })))));
}
