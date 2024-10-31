# Nanoleaf Raycast Extension MVP

This Raycast extension allows you to control your Nanoleaf smart home lights directly from the Raycast interface. The initial MVP includes the following features:

- **Add New Device**: Add a new Nanoleaf device by providing its IP address and retrieving the access token.
- **Toggle Power**: Toggle the power state of a single device or all connected devices.
- **Adjust Brightness**: Change the brightness of a single device or all connected devices.

Below are the code files and deployment instructions for setting up the extension.

## Code Structure

The extension consists of the following files:

```
nanoleaf-raycast-extension/
├── package.json
├── tsconfig.json
├── src/
    ├── index.ts
    ├── add-device.tsx
    ├── toggle-power.tsx
    ├── adjust-brightness.tsx
    ├── utils/
        ├── nanoleaf-client.ts
        ├── storage.ts
    ├── types.ts
```

### `package.json`

```json:package.json
{
  "name": "nanoleaf-raycast-extension",
  "version": "1.0.0",
  "description": "Control your Nanoleaf devices from Raycast",
  "main": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "lint": "eslint . --ext .ts,.tsx",
    "publish": "ray publish"
  },
  "keywords": ["raycast", "nanoleaf", "smart-home", "extension"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@raycast/api": "^1.57.1",
    "nanoleaf-client": "^1.1.0"
  },
  "devDependencies": {
    "@types/node": "^18.11.18",
    "@types/react": "^18.0.28",
    "@typescript-eslint/eslint-plugin": "^5.49.0",
    "@typescript-eslint/parser": "^5.49.0",
    "eslint": "^8.32.0",
    "typescript": "^4.9.5"
  },
  "raycast": {
    "schemaVersion": 1,
    "title": "Nanoleaf Controller",
    "icon": "command-icon.png",
    "commands": [
      {
        "name": "add-device",
        "title": "Add Nanoleaf Device",
        "description": "Add a new Nanoleaf device",
        "mode": "view",
        "arguments": []
      },
      {
        "name": "toggle-power",
        "title": "Toggle Power",
        "description": "Toggle power for a device or all devices",
        "mode": "view",
        "arguments": []
      },
      {
        "name": "adjust-brightness",
        "title": "Adjust Brightness",
        "description": "Adjust brightness for a device or all devices",
        "mode": "view",
        "arguments": []
      }
    ]
  }
}
```

### `tsconfig.json`

```json:tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022", "DOM"],
    "jsx": "react",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### `src/types.ts`

```typescript:src/types.ts
export type Device = {
  ip: string;
  token: string;
  name: string;
};
```

### `src/utils/nanoleaf-client.ts`

```typescript:src/utils/nanoleaf-client.ts
import { NanoleafClient } from 'nanoleaf-client';
import { Device } from '../types';

export class NanoleafController {
  private client: NanoleafClient;
  public device: Device;

  constructor(device: Device) {
    this.device = device;
    this.client = new NanoleafClient(device.ip, device.token);
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

  async setBrightness(brightness: number): Promise<void> {
    await this.client.setBrightness(brightness);
  }
}
```

### `src/utils/storage.ts`

```typescript:src/utils/storage.ts
import { LocalStorage } from '@raycast/api';
import { Device } from '../types';

const DEVICES_KEY = 'nanoleaf_devices';

export async function saveDevice(device: Device): Promise<void> {
  const devices = await getDevices();
  devices.push(device);
  await LocalStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
}

export async function getDevices(): Promise<Device[]> {
  const devicesJson = await LocalStorage.getItem<string>(DEVICES_KEY);
  if (devicesJson) {
    return JSON.parse(devicesJson) as Device[];
  }
  return [];
}

export async function removeDevice(ip: string): Promise<void> {
  const devices = await getDevices();
  const updatedDevices = devices.filter((device) => device.ip !== ip);
  await LocalStorage.setItem(DEVICES_KEY, JSON.stringify(updatedDevices));
}
```

### `src/add-device.tsx`

```typescript:src/add-device.tsx
import { ActionPanel, Form, Action, showToast, Toast, useNavigation } from '@raycast/api';
import { useState } from 'react';
import { Device } from './types';
import { saveDevice } from './utils/storage';
import { NanoleafClient } from 'nanoleaf-client';

export default function AddDeviceCommand() {
  const [ip, setIp] = useState('');
  const [name, setName] = useState('');
  const { pop } = useNavigation();

  async function handleSubmit() {
    const toast = await showToast({ style: Toast.Style.Animated, title: 'Connecting to device...' });
    try {
      const client = new NanoleafClient(ip);
      const token = await client.createAuthToken();

      const device: Device = { ip, token, name: name || 'Nanoleaf Device' };
      await saveDevice(device);

      toast.style = Toast.Style.Success;
      toast.title = 'Device added successfully!';
      pop();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = 'Failed to add device';
      toast.message = (error as Error).message;
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Connect" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="ip" title="IP Address" placeholder="192.168.x.x" value={ip} onChange={setIp} />
      <Form.TextField id="name" title="Device Name" placeholder="Optional" value={name} onChange={setName} />
    </Form>
  );
}
```

### `src/toggle-power.tsx`

```typescript:src/toggle-power.tsx
import { ActionPanel, List, Action, showToast, Toast } from '@raycast/api';
import { useEffect, useState } from 'react';
import { Device } from './types';
import { getDevices } from './utils/storage';
import { NanoleafController } from './utils/nanoleaf-client';

export default function TogglePowerCommand() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    async function fetchDevices() {
      const storedDevices = await getDevices();
      setDevices(storedDevices);
    }
    fetchDevices();
  }, []);

  async function togglePower(device: Device) {
    const toast = await showToast({ style: Toast.Style.Animated, title: `Toggling power for ${device.name}...` });
    try {
      const controller = new NanoleafController(device);
      await controller.togglePower();
      toast.style = Toast.Style.Success;
      toast.title = 'Power toggled!';
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = 'Failed to toggle power';
      toast.message = (error as Error).message;
    }
  }

  async function togglePowerAll() {
    const toast = await showToast({ style: Toast.Style.Animated, title: 'Toggling power for all devices...' });
    try {
      for (const device of devices) {
        const controller = new NanoleafController(device);
        await controller.togglePower();
      }
      toast.style = Toast.Style.Success;
      toast.title = 'All devices toggled!';
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = 'Failed to toggle power for all devices';
      toast.message = (error as Error).message;
    }
  }

  return (
    <List isLoading={devices.length === 0} searchBarPlaceholder="Select a device to toggle power">
      <List.Section title="Devices">
        {devices.map((device) => (
          <List.Item
            key={device.ip}
            title={device.name}
            subtitle={device.ip}
            actions={
              <ActionPanel>
                <Action title="Toggle Power" onAction={() => togglePower(device)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
      {devices.length > 1 && (
        <List.Section>
          <List.Item
            title="All Devices"
            subtitle="Toggle power for all devices"
            actions={
              <ActionPanel>
                <Action title="Toggle Power for All" onAction={togglePowerAll} />
              </ActionPanel>
            }
          />
        </List.Section>
      )}
    </List>
  );
}
```

### `src/adjust-brightness.tsx`

```typescript:src/adjust-brightness.tsx
import { ActionPanel, List, Action, Form, Toast, showToast } from '@raycast/api';
import { useEffect, useState } from 'react';
import { Device } from './types';
import { getDevices } from './utils/storage';
import { NanoleafController } from './utils/nanoleaf-client';

export default function AdjustBrightnessCommand() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    async function fetchDevices() {
      const storedDevices = await getDevices();
      setDevices(storedDevices);
    }
    fetchDevices();
  }, []);

  function adjustBrightness(device: Device) {
    return async (brightness: number) => {
      const toast = await showToast({ style: Toast.Style.Animated, title: 'Adjusting brightness...' });
      try {
        const controller = new NanoleafController(device);
        await controller.setBrightness(brightness);
        toast.style = Toast.Style.Success;
        toast.title = 'Brightness adjusted!';
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = 'Failed to adjust brightness';
        toast.message = (error as Error).message;
      }
    };
  }

  function adjustBrightnessAll(brightness: number) {
    return async () => {
      const toast = await showToast({ style: Toast.Style.Animated, title: 'Adjusting brightness for all devices...' });
      try {
        for (const device of devices) {
          const controller = new NanoleafController(device);
          await controller.setBrightness(brightness);
        }
        toast.style = Toast.Style.Success;
        toast.title = 'All devices adjusted!';
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = 'Failed to adjust brightness for all devices';
        toast.message = (error as Error).message;
      }
    };
  }

  return (
    <List isLoading={devices.length === 0} searchBarPlaceholder="Select a device to adjust brightness">
      <List.Section title="Devices">
        {devices.map((device) => (
          <List.Item
            key={device.ip}
            title={device.name}
            subtitle={device.ip}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Set Brightness"
                  target={<BrightnessForm device={device} onSubmit={adjustBrightness(device)} />}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
      {devices.length > 1 && (
        <List.Section>
          <List.Item
            title="All Devices"
            subtitle="Adjust brightness for all devices"
            actions={
              <ActionPanel>
                <Action.Push
                  title="Set Brightness for All"
                  target={<BrightnessForm onSubmit={adjustBrightnessAll} />}
                />
              </ActionPanel>
            }
          />
        </List.Section>
      )}
    </List>
  );
}

function BrightnessForm(props: { device?: Device; onSubmit: (brightness: number) => Promise<void> }) {
  const [brightness, setBrightness] = useState<number>(50);

  async function handleSubmit() {
    await props.onSubmit(brightness);
  }

  return (
    <Form
      navigationTitle={`Set Brightness${props.device ? ` - ${props.device.name}` : ''}`}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Set Brightness" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Slider
        id="brightness"
        title="Brightness"
        min={0}
        max={100}
        step={1}
        value={brightness}
        onChange={setBrightness}
      />
    </Form>
  );
}
```

### `src/index.ts`

```typescript:src/index.ts
// Export commands for the extension
export { default as addDevice } from './add-device';
export { default as togglePower } from './toggle-power';
export { default as adjustBrightness } from './adjust-brightness';
```

## Deployment Instructions

1. **Install the Raycast Extension Development Tools:**

   Ensure you have the Raycast extension development tools installed. If not, install them by running:

   ```bash
   npm install -g @raycast/api
   ```

2. **Clone the Repository or Create a New Project:**

   ```bash
   mkdir nanoleaf-raycast-extension
   cd nanoleaf-raycast-extension
   ```

3. **Initialize a New NPM Package:**

   ```bash
   npm init -y
   ```

4. **Install Dependencies:**

   ```bash
   npm install @raycast/api nanoleaf-client
   npm install --save-dev typescript @types/node @types/react
   ```

5. **Set Up TypeScript Configuration:**

   Create a `tsconfig.json` file (as provided above).

6. **Create the File Structure:**

   Create the `src` directory and add the files as shown in the code structure.

7. **Build the Extension:**

   Add a build script in your `package.json` and run:

   ```bash
   npm run build
   ```

8. **Install ESLint (Optional but Recommended):**

   ```bash
   npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```

   Configure ESLint according to your preference.

9. **Link the Extension to Raycast:**

   In the root directory of your extension, run:

   ```bash
   ray link
   ```

   This will symlink your extension to Raycast for local development.

10. **Test the Extension:**

    - Open Raycast and search for your commands, e.g., "Add Nanoleaf Device".
    - Test each command to ensure they work as expected.

11. **Publish the Extension:**

    When you're ready to publish your extension:

    ```bash
    ray publish
    ```

    Follow the prompts to submit your extension for review. Ensure you comply with the [Raycast Store Guidelines](https://developers.raycast.com/basics/prepare-an-extension-for-store).

## Feature List and Development Plan

### MVP Features (Completed)

1. **Add New Device**
   - **Action Item:** Implement a command to add new devices.
   - **Description:** Users can add a new Nanoleaf device by entering its IP address. The extension retrieves the access token and saves the device info.

2. **Toggle Power**
   - **Action Item:** Implement a command to toggle power.
   - **Description:** Users can toggle the power state of a selected device or all connected devices.

3. **Adjust Brightness**
   - **Action Item:** Implement a command to adjust brightness.
   - **Description:** Users can set the brightness level (0-100%) of a selected device or all devices.

### Future Features and Development Plan

1. **Select and Apply Effects**
   - **Action Item:** Implement a command to change light effects.
   - **Description:** Allow users to select and apply different lighting effects available on the device.
   - **Development Steps:**
     - Update `NanoleafController` to fetch available effects.
     - Create a new command `change-effect.tsx`.
     - Implement UI to display and select effects.

2. **Color Adjustment**
   - **Action Item:** Implement a command to change colors.
   - **Description:** Provide an interface for users to set specific colors on their Nanoleaf devices.
   - **Development Steps:**
     - Update `NanoleafController` with methods to set colors.
     - Use Raycast's color picker component in the UI.

3. **Group Devices**
   - **Action Item:** Allow grouping of devices.
   - **Description:** Users can create groups to manage multiple devices simultaneously.
   - **Development Steps:**
     - Modify the storage to handle device groups.
     - Update commands to include group selection.

4. **Scene Management**
   - **Action Item:** Implement scene creation and activation.
   - **Description:** Users can create scenes with predefined settings and activate them easily.
   - **Development Steps:**
     - Create storage and types for scenes.
     - Implement commands to save, list, and activate scenes.

5. **Automations and Scheduling**
   - **Action Item:** Add scheduling capabilities.
   - **Description:** Users can schedule actions (like turning on/off lights) at specific times.
   - **Development Steps:**
     - Research scheduling options within Raycast or use external tools.
     - Implement a scheduler interface.

6. **Integration with Other Services**
   - **Action Item:** Integrate with smart home ecosystems.
   - **Description:** Expand functionality to interact with other devices or services (e.g., HomeKit, IFTTT).
   - **Development Steps:**
     - Investigate APIs and integration possibilities.
     - Implement necessary authentication and commands.

7. **User Interface Enhancements**
   - **Action Item:** Improve the UI and user experience.
   - **Description:** Add icons, images, and better navigation to enhance usability.
   - **Development Steps:**
     - Utilize Raycast's UI components to enrich the interface.
     - Implement feedback mechanisms like progress indicators.

8. **Localization Support**
   - **Action Item:** Add multi-language support.
   - **Description:** Make the extension accessible to non-English users.
   - **Development Steps:**
     - Externalize strings.
     - Add language selection options.

9. **Error Handling and Logging**
   - **Action Item:** Improve error handling.
   - **Description:** Provide detailed error messages and logging for troubleshooting.
   - **Development Steps:**
     - Enhance try-catch blocks.
     - Implement logging mechanisms.

### Proposed Timeline

- **Week 1:**
  - Implement effect selection and application.
- **Week 2:**
  - Add color adjustment capabilities.
- **Week 3:**
  - Enable grouping of devices.
- **Week 4:**
  - Develop scene management features.
- **Week 5:**
  - Introduce automations and scheduling.
- **Week 6:**
  - Work on UI enhancements and user feedback implementation.
- **Week 7:**
  - Start integration with other services.
- **Week 8:**
  - Add localization support.
- **Week 9:**
  - Focus on improving error handling and logging.
- **Week 10:**
  - Perform thorough testing and prepare for the next release.

## References

- [Raycast API Documentation](https://developers.raycast.com)
- [Raycast Extension Examples](https://github.com/raycast/extensions/tree/main/examples)
- [Nanoleaf OpenAPI Documentation](https://forum.nanoleaf.me/docs/openapi)

---

Feel free to customize the extension further and implement additional features as needed. If you have any questions or need assistance with development, don't hesitate to ask!