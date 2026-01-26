## Description

Use the `chrome.systemLog` API to record Chrome system logs from extensions.

## Permissions

`systemLog`

## Availability

Chrome 125+

        ChromeOS only
      [Requires policy](https://support.google.com/chrome/a/answer/9296680)

## Types

### MessageOptions

#### Properties

- message
  string

## Methods

### add()

```
chrome.systemLog.add(
  options: [MessageOptions](#type-MessageOptions),
): Promise<void>
```

Adds a new log record.

#### Parameters

- options
  [MessageOptions](#type-MessageOptions)
  The logging options.

#### Returns

Promise<void>
Returns a Promise which resolves once the log has been added.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-01-07 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
