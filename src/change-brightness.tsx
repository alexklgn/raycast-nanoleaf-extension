import { useEffect, useState } from "react";
import { Action, ActionPanel, Color, Icon, LaunchProps, List, showToast, Toast } from "@raycast/api";
import { Device } from "./types";
import { NanoleafDevice } from "./utils/nanoleaf-client";
import { getDeviceState, getNanoleafDevices } from "./utils/nanoleaf";

export default function ChangebrightnessCommand(props: LaunchProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [newBrightness, setNewBrightness] = useState<number>(props.arguments.Brightness);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    findLocalDevices();
  }, []);

  const findLocalDevices = async () => {
    try {
      console.log('newBrightness', newBrightness);
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

  const changeBrightness = async (device: Device, brightness: number) => {
    console.log(device.name, brightness);
    const nanoleafDevice = await NanoleafDevice.create(device.ip, device.mac);
    await nanoleafDevice.setBrightness(brightness);
    await updateDeviceState(device);
  }

  const updateDeviceState = async (device: Device) => {
    const updatedDevice: Device = await getDeviceState(device);  
    setDevices(devices.map(d => d.ip === device.ip ? updatedDevice : d));
  }

  const formatDeviceItem = (device: Device) => {  
    const productIcon = `products/${device.name?.split(' ')[0].toLowerCase()}.svg`;

    return (
      <List.Item
        key={device.ip}
        title={device.name?.split(' ')[0] || "Some Nanoleaf device"}
        icon={{ source: productIcon, fallback: Icon.LightBulb, tintColor: Color.SecondaryText }}
        accessories={[
          { tag: { value: device.state?.selectedEffect, color: Color.Purple }, icon: Icon.Image, tooltip: "Effect" },
          { tag: { value: `${device.state?.brightness}%`, color: Color.Orange }, icon: Icon.Sun, tooltip: "Brightness" },
          { tag: { value: device.state?.powerStatus ? 'ON' : 'OFF', color: device.state?.powerStatus ? Color.Green : Color.Red }, icon: device.state?.powerStatus ? Icon.CircleProgress100 : Icon.Circle, tooltip: "Power status" },
          { text: `IP`, icon: Icon.Globe, tooltip: `IP: ${device.ip} | MAC: ${device.mac} | Serial: ${device.serial} | Model: ${device.model}` },
        ]}
        actions={
          <ActionPanel> 
            {device.state?.brightness !== undefined && (
              <Action 
                title={`Change brightness to ${newBrightness}%`} 
                onAction={async () => {
                  let brightness = Number(newBrightness) || 50;
                  await changeBrightness(device, brightness);
                  await showToast(Toast.Style.Success, "Brightness changed");
            }} />
            )}
            {device.state?.brightness !== undefined && (
              <Action 
                title="Increase brightness" 
                shortcut={{ modifiers: ["cmd"], key: "=" }}
                onAction={async () => {
                  let brightness = device.state?.brightness || 0;
                  await changeBrightness(device, brightness + 10);
                  await showToast(Toast.Style.Success, "Brightness increased");
              }} />
            )}
            {device.state?.brightness !== undefined && (
              <Action 
                title="Decrease brightness" 
                shortcut={{ modifiers: ["cmd"], key: "-" }}
                onAction={async () => {
                  let brightness = device.state?.brightness || 20;
                  await changeBrightness(device, brightness - 10);
                  await showToast(Toast.Style.Success, "Brightness decreased");
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
    <List isLoading={isLoading} searchBarPlaceholder={`Select device to change brightness to ${newBrightness}%`}>
      {formatDevicesList(devices)}
    </List>
  );
}
