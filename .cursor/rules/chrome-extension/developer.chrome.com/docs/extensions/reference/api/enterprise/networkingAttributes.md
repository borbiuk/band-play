This API is only for [extensions installed by a policy](https://support.google.com/chrome/a/answer/1375694).
Important:
This API works only on ChromeOS.

## Description

Use the `chrome.enterprise.networkingAttributes` API to read information about your current network. Note: This API is only available to extensions force-installed by enterprise policy.

## Permissions

`enterprise.networkingAttributes`

## Availability

Chrome 85+

        ChromeOS only
      [Requires policy](https://support.google.com/chrome/a/answer/9296680)

## Types

### NetworkDetails

#### Properties

- ipv4
  string optional
  The device's local IPv4 address (undefined if not configured).
- ipv6
  string optional
  The device's local IPv6 address (undefined if not configured).
- macAddress
  string
  The device's MAC address.

## Methods

### getNetworkDetails()

```
chrome.enterprise.networkingAttributes.getNetworkDetails(): Promise<[NetworkDetails](#type-NetworkDetails)>
```

Retrieves the network details of the device's default network. If the user is not affiliated or the device is not connected to a network, ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime/#property-lastError) will be set with a failure reason.

#### Returns

Promise<[NetworkDetails](#type-NetworkDetails)>Chrome 96+

Returns a Promise which resolves with the device's default network's ``[NetworkDetails](#type-NetworkDetails).
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-01-07 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
