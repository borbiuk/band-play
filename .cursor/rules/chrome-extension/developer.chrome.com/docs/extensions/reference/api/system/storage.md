## Description

Use the `chrome.system.storage` API to query storage device information and be notified when a removable storage device is attached and detached.

## Permissions

`system.storage`

## Types

### EjectDeviceResultCode

#### Enum

"success"
The ejection command is successful -- the application can prompt the user to remove the device.
"in_use"
The device is in use by another application. The ejection did not succeed; the user should not remove the device until the other application is done with the device.
"no_such_device"
There is no such device known.
"failure"
The ejection command failed.

### StorageAvailableCapacityInfo

#### Properties

- availableCapacity
  number
  The available capacity of the storage device, in bytes.
- id
  string
  A copied `id` of getAvailableCapacity function parameter `id`.

### StorageUnitInfo

#### Properties

- capacity
  number
  The total amount of the storage space, in bytes.
- id
  string
  The transient ID that uniquely identifies the storage device. This ID will be persistent within the same run of a single application. It will not be a persistent identifier between different runs of an application, or between different applications.
- name
  string
  The name of the storage unit.
- type
  [StorageUnitType](#type-StorageUnitType)
  The media type of the storage unit.

### StorageUnitType

#### Enum

"fixed"
The storage has fixed media, e.g. hard disk or SSD.
"removable"
The storage is removable, e.g. USB flash drive.
"unknown"
The storage type is unknown.

## Methods

### ejectDevice()

```
chrome.system.storage.ejectDevice(
  id: string,
): Promise<[EjectDeviceResultCode](#type-EjectDeviceResultCode)>
```

Ejects a removable storage device.

#### Parameters

- id
  string

#### Returns

Promise<[EjectDeviceResultCode](#type-EjectDeviceResultCode)>Chrome 91+

### getAvailableCapacity()

        Dev channel

```
chrome.system.storage.getAvailableCapacity(
  id: string,
): Promise<[StorageAvailableCapacityInfo](#type-StorageAvailableCapacityInfo)>
```

Get the available capacity of a specified `id` storage device. The `id` is the transient device ID from StorageUnitInfo.

#### Parameters

- id
  string

#### Returns

Promise<[StorageAvailableCapacityInfo](#type-StorageAvailableCapacityInfo)>

### getInfo()

```
chrome.system.storage.getInfo(): Promise<[StorageUnitInfo](#type-StorageUnitInfo)[]>
```

Get the storage information from the system. The argument passed to the callback is an array of StorageUnitInfo objects.

#### Returns

Promise<[StorageUnitInfo](#type-StorageUnitInfo)[]>Chrome 91+

## Events

### onAttached

```
chrome.system.storage.onAttached.addListener(
  callback: function,
)
```

Fired when a new removable storage is attached to the system.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(info: [StorageUnitInfo](#type-StorageUnitInfo)) => void
```

- info
  [StorageUnitInfo](#type-StorageUnitInfo)

### onDetached

```
chrome.system.storage.onDetached.addListener(
  callback: function,
)
```

Fired when a removable storage is detached from the system.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(id: string) => void
```

- id
  string
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
