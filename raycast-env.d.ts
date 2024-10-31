/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `my-devices` command */
  export type MyDevices = ExtensionPreferences & {}
  /** Preferences accessible in the `change-brightness` command */
  export type ChangeBrightness = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `my-devices` command */
  export type MyDevices = {}
  /** Arguments passed to the `change-brightness` command */
  export type ChangeBrightness = {
  /** Brightness in % (0-100) */
  "Brightness": string
}
}



