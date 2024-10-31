"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdjustBrightnessCommand;
const react_1 = __importDefault(require("react")); // Add this import
const api_1 = require("@raycast/api");
const react_2 = require("react");
const storage_1 = require("./utils/storage");
const nanoleaf_client_1 = require("./utils/nanoleaf-client");
function AdjustBrightnessCommand() {
    const [devices, setDevices] = (0, react_2.useState)([]);
    (0, react_2.useEffect)(() => {
        async function fetchDevices() {
            const storedDevices = await (0, storage_1.getDevices)();
            setDevices(storedDevices);
        }
        fetchDevices();
    }, []);
    function adjustBrightness(device) {
        return async (brightness) => {
            const toast = await (0, api_1.showToast)({ style: api_1.Toast.Style.Animated, title: 'Adjusting brightness...' });
            try {
                const controller = new nanoleaf_client_1.NanoleafController(device);
                await controller.setBrightness(brightness);
                toast.style = api_1.Toast.Style.Success;
                toast.title = 'Brightness adjusted!';
            }
            catch (error) {
                toast.style = api_1.Toast.Style.Failure;
                toast.title = 'Failed to adjust brightness';
                toast.message = error.message;
            }
        };
    }
    async function adjustBrightnessAll(brightness) {
        const toast = await (0, api_1.showToast)({ style: api_1.Toast.Style.Animated, title: 'Adjusting brightness for all devices...' });
        try {
            for (const device of devices) {
                const controller = new nanoleaf_client_1.NanoleafController(device);
                await controller.setBrightness(brightness);
            }
            toast.style = api_1.Toast.Style.Success;
            toast.title = 'All devices adjusted!';
        }
        catch (error) {
            toast.style = api_1.Toast.Style.Failure;
            toast.title = 'Failed to adjust brightness for all devices';
            toast.message = error.message;
        }
    }
    return (react_1.default.createElement(api_1.List, { isLoading: devices.length === 0, searchBarPlaceholder: "Select a device to adjust brightness" },
        react_1.default.createElement(api_1.List.Section, { title: "Devices" }, devices.map((device) => (react_1.default.createElement(api_1.List.Item, { key: device.ip, title: device.name, subtitle: device.ip, actions: react_1.default.createElement(api_1.ActionPanel, null,
                react_1.default.createElement(api_1.Action.Push, { title: "Set Brightness", target: react_1.default.createElement(BrightnessForm, { device: device, onSubmit: adjustBrightness(device) }) })) })))),
        devices.length > 1 && (react_1.default.createElement(api_1.List.Section, null,
            react_1.default.createElement(api_1.List.Item, { title: "All Devices", subtitle: "Adjust brightness for all devices", actions: react_1.default.createElement(api_1.ActionPanel, null,
                    react_1.default.createElement(api_1.Action.Push, { title: "Set Brightness for All", target: react_1.default.createElement(BrightnessForm, { onSubmit: adjustBrightnessAll }) })) })))));
}
function BrightnessForm(props) {
    const [brightness, setBrightness] = (0, react_2.useState)(50);
    async function handleSubmit() {
        await props.onSubmit(brightness);
    }
    return (react_1.default.createElement(api_1.Form, { navigationTitle: `Set Brightness${props.device ? ` - ${props.device.name}` : ''}`, actions: react_1.default.createElement(api_1.ActionPanel, null,
            react_1.default.createElement(api_1.Action.SubmitForm, { title: "Set Brightness", onSubmit: handleSubmit })) },
        react_1.default.createElement(api_1.Form.TextField, { id: "brightness", title: "Brightness", placeholder: "Enter brightness (0-100)", value: brightness.toString(), onChange: (value) => setBrightness(Number(value)) })));
}
