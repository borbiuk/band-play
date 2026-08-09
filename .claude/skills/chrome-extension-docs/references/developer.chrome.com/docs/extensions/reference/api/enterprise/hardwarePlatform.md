This API is only for [extensions installed by a policy](https://cloud.google.com/blog/products/chrome-enterprise/how-to-manage-chrome-extensions-on-windows-and-mac). The ``[EnterpriseHardwarePlatformAPIEnabled](https://chromeenterprise.google/policies/?policy=EnterpriseHardwarePlatformAPIEnabled) key must also be set.

## Description

Use the `chrome.enterprise.hardwarePlatform` API to get the manufacturer and model of the hardware platform where the browser runs. Note: This API is only available to extensions installed by enterprise policy.

## Permissions

`enterprise.hardwarePlatform`

## Availability

Chrome 71+
[Requires policy](https://support.google.com/chrome/a/answer/9296680)

## Types

### HardwarePlatformInfo

#### Properties

- manufacturer
  string
- model
  string

## Methods

### getHardwarePlatformInfo()

```
chrome.enterprise.hardwarePlatform.getHardwarePlatformInfo(): Promise<[HardwarePlatformInfo](#type-HardwarePlatformInfo)>
```

Obtains the manufacturer and model for the hardware platform and, if the extension is authorized, returns it via `callback`.

#### Returns

Promise<[HardwarePlatformInfo](#type-HardwarePlatformInfo)>Chrome 96+

Returns a Promise which resolves with the hardware platform info.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-01-07 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
