import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface NetworkDevice {
  ip: string;
  mac: string;
}

export async function getLocalNetwork(): Promise<{ networkDevices: NetworkDevice[] }> {
  // Get local IP
  const { stdout: ipOutput } = await execAsync(
    `/sbin/ifconfig | grep 'inet ' | grep -v '127.0.0.1'`
  );

  const match = ipOutput.match(/inet (\d+\.\d+\.\d+\.\d+)/);
  if (!match) {
    throw new Error("Could not determine local IP");
  }

  const localIP = match[1];

  // Get subnet base
  const subnet = localIP.substring(0, localIP.lastIndexOf("."));
  
  // Ping sweep (run multiple pings in parallel)
  const pingPromises = [];
  for (let i = 1; i < 255; i++) {
    pingPromises.push(
      execAsync(`ping -c 1 -W 1 ${subnet}.${i}`).catch(() => {/* ignore errors */})
    );
  }
  
  // Wait for all pings to complete
  await Promise.all(pingPromises);

  // Get ARP table using full path
  const { stdout: arpOutput } = await execAsync("/usr/sbin/arp -a");
  
  // Parse ARP table
  const networkDevices: NetworkDevice[] = arpOutput
    .split("\n")
    .filter(Boolean)
    .map(line => {
      const match = line.match(/^([^\s]+)\s+\((\d+\.\d+\.\d+\.\d+)\)\s+at\s+([0-9a-f:]+)/i);
      if (!match) return null;
      
      return {
        ip: match[2],
        mac: match[3].toLowerCase()
      };
    })
    .filter((device): device is NetworkDevice => device !== null);

  return { networkDevices };
}

