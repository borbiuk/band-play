## Description

Use the `chrome.idle` API to detect when the machine's idle state changes.

## Permissions

`idle`

You must declare the `"idle"` permission in your extension's manifest to use the idle API. For
example:

```
{
  "name": "My extension",
  ...
  "permissions": [
    "idle"
  ],
  ...
}

```

## Types

### IdleState

Chrome 44+

#### Enum

"active"

"idle"

"locked"

## Methods

### getAutoLockDelay()

Chrome 73+

        ChromeOS only

```
chrome.idle.getAutoLockDelay(): Promise<number>
```

Gets the time, in seconds, it takes until the screen is locked automatically while idle. Returns a zero duration if the screen is never locked automatically. Currently supported on Chrome OS only.

#### Returns

Promise<number>Chrome 116+

### queryState()

```
chrome.idle.queryState(
  detectionIntervalInSeconds: number,
): Promise<[IdleState](#type-IdleState)>
```

Returns "locked" if the system is locked, "idle" if the user has not generated any input for a specified number of seconds, or "active" otherwise.

#### Parameters

- detectionIntervalInSeconds
  number
  The system is considered idle if detectionIntervalInSeconds seconds have elapsed since the last user input detected.

#### Returns

Promise<[IdleState](#type-IdleState)>Chrome 116+

### setDetectionInterval()

```
chrome.idle.setDetectionInterval(
  intervalInSeconds: number,
): void
```

Sets the interval, in seconds, used to determine when the system is in an idle state for onStateChanged events. The default interval is 60 seconds.

#### Parameters

- intervalInSeconds
  number
  Threshold, in seconds, used to determine when the system is in an idle state.

## Events

### onStateChanged

```
chrome.idle.onStateChanged.addListener(
  callback: function,
)
```

Fired when the system changes to an active, idle or locked state. The event fires with "locked" if the screen is locked or the screensaver activates, "idle" if the system is unlocked and the user has not generated any input for a specified number of seconds, and "active" when the user generates input on an idle system.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(newState: [IdleState](#type-IdleState)) => void
```

- newState
  [IdleState](#type-IdleState)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
