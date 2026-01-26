Chrome 120: Starting in Chrome 120, the minimum alarm interval has been reduced from 1 minute to 30 seconds. For an alarm to trigger in 30 seconds, set `periodInMinutes: 0.5`.

Chrome 117: Starting in Chrome 117, the number of active alarms is limited to 500. Once this limit is reached, `chrome.alarms.create()` will fail. When using a callback, ``[chrome.runtime.lastError](/docs/extensions/reference/api/runtime#property-lastError) will be set. When using promises, the promise will be rejected.

## Description

Use the `chrome.alarms` API to schedule code to run periodically or at a specified time in the future.

## Permissions

`alarms`

To use the `chrome.alarms` API, declare the `"alarms"` permission in the [manifest](/docs/extensions/reference/manifest):

```
{
  "name": "My extension",
  ...
  "permissions": [
    "alarms"
  ],
  ...
}

```

## Concepts and usage

To ensure reliable behavior, it is helpful to understand how the API behaves.

### Device sleep

Alarms continue to run while a device is sleeping. However, an alarm will not
wake up a device. When the device wakes up, any missed alarms will fire.
Repeating alarms will fire at most once and then be rescheduled using the
specified period starting from when the device wakes, not taking into account
any time that has already elapsed since the alarm was originally set to run.

### Persistence

Alarms generally persist until an extension is updated. However, this is not guaranteed, and alarms
may be cleared when the browser is restarted. Consequently, ensure it exists each time your service worker starts up. For example:

```
async function checkAlarmState() {
  const alarm = await chrome.alarms.get("my-alarm");

  if (!alarm) {
    await chrome.alarms.create("my-alarm", { periodInMinutes: 1 });
  }
}

checkAlarmState();

```

## Examples

The following examples show how to use and respond to an alarm. To try this API,
install the [Alarm API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/alarms) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
repository.

### Set an alarm

The following example sets an alarm in the service worker when the extension is installed:
service-worker.js:

```
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install') {
    return;
  }

  // Create an alarm so we have something to look at in the demo
  await chrome.alarms.create('demo-default-alarm', {
    delayInMinutes: 1,
    periodInMinutes: 1
  });
});

```

### Respond to an alarm

The following example sets the [action toolbar icon](/docs/extensions/reference/api/action#icon) based on the name of the alarm that went off.
service-worker.js:

```
chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.action.setIcon({
    path: getIconPath(alarm.name),
  });
});

```

## Types

### Alarm

#### Properties

- name
  string
  Name of this alarm.
- periodInMinutes
  number optional
  If not null, the alarm is a repeating alarm and will fire again in `periodInMinutes` minutes.
- scheduledTime
  number
  Time at which this alarm was scheduled to fire, in milliseconds past the epoch (e.g. `Date.now() + n`). For performance reasons, the alarm may have been delayed an arbitrary amount beyond this.

### AlarmCreateInfo

#### Properties

- delayInMinutes
  number optional
  Length of time in minutes after which the `onAlarm` event should fire.
- periodInMinutes
  number optional
  If set, the onAlarm event should fire every `periodInMinutes` minutes after the initial event specified by `when` or `delayInMinutes`. If not set, the alarm will only fire once.
- when
  number optional
  Time at which the alarm should fire, in milliseconds past the epoch (e.g. `Date.now() + n`).

## Methods

### clear()

```
chrome.alarms.clear(
  name?: string,
): Promise<boolean>
```

Clears the alarm with the given name.

#### Parameters

- name
  string optional
  The name of the alarm to clear. Defaults to the empty string.

#### Returns

Promise<boolean>Chrome 91+

### clearAll()

```
chrome.alarms.clearAll(): Promise<boolean>
```

Clears all alarms.

#### Returns

Promise<boolean>Chrome 91+

### create()

```
chrome.alarms.create(
  name?: string,
  alarmInfo: [AlarmCreateInfo](#type-AlarmCreateInfo),
): Promise<void>
```

Creates an alarm. Near the time(s) specified by `alarmInfo`, the `onAlarm` event is fired. If there is another alarm with the same name (or no name if none is specified), it will be cancelled and replaced by this alarm.
In order to reduce the load on the user's machine, Chrome limits alarms to at most once every 30 seconds but may delay them an arbitrary amount more. That is, setting `delayInMinutes` or `periodInMinutes` to less than `0.5` will not be honored and will cause a warning. `when` can be set to less than 30 seconds after "now" without warning but won't actually cause the alarm to fire for at least 30 seconds.
To help you debug your app or extension, when you've loaded it unpacked, there's no limit to how often the alarm can fire.

#### Parameters

- name
  string optional
  Optional name to identify this alarm. Defaults to the empty string.
- alarmInfo
  [AlarmCreateInfo](#type-AlarmCreateInfo)
  Describes when the alarm should fire. The initial time must be specified by either `when` or `delayInMinutes` (but not both). If `periodInMinutes` is set, the alarm will repeat every `periodInMinutes` minutes after the initial event. If neither `when` or `delayInMinutes` is set for a repeating alarm, `periodInMinutes` is used as the default for `delayInMinutes`.

#### Returns

Promise<void>Chrome 111+

Promise that resolves when the alarm has been created.

### get()

```
chrome.alarms.get(
  name?: string,
): Promise<[Alarm](#type-Alarm) | undefined>
```

Retrieves details about the specified alarm.

#### Parameters

- name
  string optional
  The name of the alarm to get. Defaults to the empty string.

#### Returns

Promise<[Alarm](#type-Alarm) | undefined>Chrome 91+

### getAll()

```
chrome.alarms.getAll(): Promise<[Alarm](#type-Alarm)[]>
```

Gets an array of all the alarms.

#### Returns

Promise<[Alarm](#type-Alarm)[]>Chrome 91+

## Events

### onAlarm

```
chrome.alarms.onAlarm.addListener(
  callback: function,
)
```

Fired when an alarm has elapsed. Useful for event pages.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(alarm: [Alarm](#type-Alarm)) => void
```

- alarm
  [Alarm](#type-Alarm)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-07 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
