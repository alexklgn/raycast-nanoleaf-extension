import { useEffect, useState } from "react";
import { Action, ActionPanel, Color, Icon, List, showToast, Toast } from "@raycast/api";

import { getNanoleafDevices, getDeviceState } from "./utils/nanoleaf";
import { NanoleafDevice } from "./utils/nanoleaf-client";
import { Device } from "./types";

export default function Command() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    findLocalDevices();
  }, []);

  const findLocalDevices = async () => {
    try {
      const nanoleafDevices: Device[] = await getNanoleafDevices();
      setDevices(nanoleafDevices);
      await showToast(Toast.Style.Success, `Found ${nanoleafDevices.length} devices`);
    } catch (error) {
      console.error(error);
      await showToast(Toast.Style.Failure, "Error scanning network");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePower = async (device: Device) => {
    const nanoleafDevice = await NanoleafDevice.create(device.ip, device.mac);
    await nanoleafDevice.togglePower();
    await updateDeviceState(device);
  }
  const changeBrightness = async (device: Device, brightness: number) => {
    const nanoleafDevice = await NanoleafDevice.create(device.ip, device.mac);
    await nanoleafDevice.setBrightness(brightness);
    await updateDeviceState(device);
  }

  const updateDeviceState = async (device: Device) => {
    const updatedDevice: Device = await getDeviceState(device);  
    setDevices(devices.map(d => d.ip === device.ip ? updatedDevice : d));
  }

  const updateAllDevicesState = async () => {
    for (const device of devices) {
      await updateDeviceState(device);
    }
  }

  const formatDeviceItem = (device: Device) => {  
    const productName = device.name?.split(' ')[0] || "Some Nanoleaf device";
    const productIcon = `products/${productName.toLowerCase()}.svg`;

    return (
      <List.Item
        key={device.ip}
        title={productName}
        subtitle={'Nanoleaf Device'}
        icon={{ source: productIcon, fallback: Icon.LightBulb, tintColor: Color.SecondaryText }}
        accessories={[
          { tag: { value: device.state?.selectedEffect, color: Color.Purple }, icon: Icon.Image, tooltip: "Effect" },
          { tag: { value: `${device.state?.brightness}%`, color: Color.Orange }, icon: Icon.Sun, tooltip: "Brightness" },
          { tag: { value: device.state?.powerStatus ? 'ON' : 'OFF', color: device.state?.powerStatus ? Color.Green : Color.Red }, icon: device.state?.powerStatus ? Icon.CircleProgress100 : Icon.Circle, tooltip: "Power status" },
          { text: `IP`, icon: Icon.Globe, tooltip: `IP: ${device.ip} | MAC: ${device.mac} | Serial: ${device.serial} | Model: ${device.model}` },
        ]}
        actions={
          <ActionPanel> 
            {device.state?.powerStatus !== undefined && (
              <Action 
                title={device.state?.powerStatus ? `Turn Off the ${productName}` : `Turn On the ${productName}`}  
                shortcut={{ modifiers: ["cmd"], key: "0" }}
                onAction={async () => {
                  await togglePower(device);
                  await showToast(Toast.Style.Success, device.state?.powerStatus ? `Turned off the ${productName}` : `Turned on the ${productName}`);
              }} />
            )}
            {device.state?.brightness !== undefined && (
              <Action 
                title={`Increase ${productName} brightness by 10%`} 
                shortcut={{ modifiers: ["cmd"], key: "=" }}
                onAction={async () => {
                  let brightness = device.state?.brightness || 0;
                  await changeBrightness(device, brightness + 10);
                  await showToast(Toast.Style.Success, `${productName} brightness increased by 10%`);
              }} />
            )}
            {device.state?.brightness !== undefined && (
              <Action 
                title={`Decrease ${productName} brightness by 10%`} 
                shortcut={{ modifiers: ["cmd"], key: "-" }}
                onAction={async () => {
                  let brightness = device.state?.brightness || 20;
                  await changeBrightness(device, brightness - 10);
                  await showToast(Toast.Style.Success, `${productName} brightness decreased by 10%`);
              }} />
            )}
          </ActionPanel>
        }
      />
    );
  };

  const formatDevicesList = (devices: Device[]) => {
    let output: JSX.Element[] = []  ;
    
    if (isLoading) output.push(<List.Item key="loading" title="Scanning network for Nanoleaf devices..." icon={Icon.QuestionMark} />);
    else if (devices.length === 0) output.push(<List.Item key="no-devices" title="No Nanoleaf devices found =(" icon={Icon.QuestionMark} />);
    else output = devices.map(formatDeviceItem);

    return output;
  }

  return (
    <List isLoading={isLoading}>
      {formatDevicesList(devices)}
    </List>
  );

}
