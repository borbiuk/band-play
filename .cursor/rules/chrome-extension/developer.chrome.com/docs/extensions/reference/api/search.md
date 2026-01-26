## Description

Use the `chrome.search` API to search via the default provider.

## Permissions

`search`

## Availability

Chrome 87+

## Types

### Disposition

#### Enum

"CURRENT_TAB"
Specifies that the search results display in the calling tab or the tab from the active browser.
"NEW_TAB"
Specifies that the search results display in a new tab.
"NEW_WINDOW"
Specifies that the search results display in a new window.

### QueryInfo

#### Properties

- disposition
  [Disposition](#type-Disposition)optional
  Location where search results should be displayed. `CURRENT_TAB` is the default.
- tabId
  number optional
  Location where search results should be displayed. `tabId` cannot be used with `disposition`.
- text
  string
  String to query with the default search provider.

## Methods

### query()

```
chrome.search.query(
  queryInfo: [QueryInfo](#type-QueryInfo),
): Promise<void>
```

Used to query the default search provider. In case of an error, ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set.

#### Parameters

- queryInfo
  [QueryInfo](#type-QueryInfo)

#### Returns

Promise<void>Chrome 96+

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
