## Description

Use the `chrome.sessions` API to query and restore tabs and windows from a browsing session.

## Permissions

`sessions`

## Types

### Device

#### Properties

- deviceName
  string
  The name of the foreign device.
- sessions
  [Session](#type-Session)[]
  A list of open window sessions for the foreign device, sorted from most recently to least recently modified session.

### Filter

#### Properties

- maxResults
  number optional
  The maximum number of entries to be fetched in the requested list. Omit this parameter to fetch the maximum number of entries (``[sessions.MAX_SESSION_RESULTS](#property-MAX_SESSION_RESULTS)).

### Session

#### Properties

- lastModified
  number
  The time when the window or tab was closed or modified, represented in seconds since the epoch.
- tab
  [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)optional
  The `[tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab), if this entry describes a tab. Either this or `[sessions.Session.window](#property-Session-window) will be set.
- window
  [Window](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window)optional
  The `[windows.Window](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window), if this entry describes a window. Either this or `[sessions.Session.tab](#property-Session-tab) will be set.

## Properties

### MAX_SESSION_RESULTS

The maximum number of ``[sessions.Session](#type-Session) that will be included in a requested list.

#### Value

25

## Methods

### getDevices()

```
chrome.sessions.getDevices(
  filter?: [Filter](#type-Filter),
): Promise<[Device](#type-Device)[]>
```

Retrieves all devices with synced sessions.

#### Parameters

- filter
  [Filter](#type-Filter)optional

#### Returns

Promise<[Device](#type-Device)[]>Chrome 96+

### getRecentlyClosed()

```
chrome.sessions.getRecentlyClosed(
  filter?: [Filter](#type-Filter),
): Promise<[Session](#type-Session)[]>
```

Gets the list of recently closed tabs and/or windows.

#### Parameters

- filter
  [Filter](#type-Filter)optional

#### Returns

Promise<[Session](#type-Session)[]>Chrome 96+

### restore()

```
chrome.sessions.restore(
  sessionId?: string,
): Promise<[Session](#type-Session)>
```

Reopens a `[windows.Window](https://developer.chrome.com/docs/extensions/reference/windows/#type-Window) or `[tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab), with an optional callback to run when the entry has been restored.

#### Parameters

- sessionId
  string optional
  The `[windows.Window.sessionId](https://developer.chrome.com/docs/extensions/reference/windows/#property-Window-sessionId), or `[tabs.Tab.sessionId](https://developer.chrome.com/docs/extensions/reference/tabs/#property-Tab-sessionId) to restore. If this parameter is not specified, the most recently closed session is restored.

#### Returns

Promise<[Session](#type-Session)>Chrome 96+

## Events

### onChanged

```
chrome.sessions.onChanged.addListener(
  callback: function,
)
```

Fired when recently closed tabs and/or windows are changed. This event does not monitor synced sessions changes.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
() => void
```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
