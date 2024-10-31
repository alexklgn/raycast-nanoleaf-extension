"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AddDeviceCommand;
const react_1 = __importDefault(require("react"));
const api_1 = require("@raycast/api");
const react_2 = require("react");
const storage_1 = require("./utils/storage");
const nanoleaf_client_1 = require("nanoleaf-client");
function AddDeviceCommand() {
    const [ip, setIp] = (0, react_2.useState)('');
    const [name, setName] = (0, react_2.useState)('');
    const { pop } = (0, api_1.useNavigation)();
    async function handleSubmit() {
        const toast = await (0, api_1.showToast)({ style: api_1.Toast.Style.Animated, title: 'Connecting to device...' });
        try {
            const client = new nanoleaf_client_1.NanoleafClient(ip);
            const token = await client.createAuthToken();
            const device = { ip, token, name: name || 'Nanoleaf Device' };
            await (0, storage_1.saveDevice)(device);
            toast.style = api_1.Toast.Style.Success;
            toast.title = 'Device added successfully!';
            pop();
        }
        catch (error) {
            toast.style = api_1.Toast.Style.Failure;
            toast.title = 'Failed to add device';
            toast.message = error.message;
        }
    }
    return (react_1.default.createElement(api_1.Form, { actions: react_1.default.createElement(api_1.ActionPanel, null,
            react_1.default.createElement(api_1.Action.SubmitForm, { title: "Connect", onSubmit: handleSubmit })) },
        react_1.default.createElement(api_1.Form.TextField, { id: "ip", title: "IP Address", placeholder: "192.168.x.x", value: ip, onChange: setIp }),
        react_1.default.createElement(api_1.Form.TextField, { id: "name", title: "Device Name", placeholder: "Optional", value: name, onChange: setName })));
}
