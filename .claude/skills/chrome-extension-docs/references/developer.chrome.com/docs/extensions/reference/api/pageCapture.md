## Description

Use the `chrome.pageCapture` API to save a tab as MHTML.
MHTML is a [standard format](https://tools.ietf.org/html/rfc2557) supported by most browsers. It encapsulates in a single file a page
and all its resources (CSS files, images..).
Note that for security reasons a MHTML file can only be loaded from the file system and that it can
only be loaded in the main frame.

## Permissions

`pageCapture`

You must declare the "pageCapture" permission in the [extension manifest](/docs/extensions/reference/manifest) to use the pageCapture
API. For example:

```
{
  "name": "My extension",
  ...
  "permissions": [
    "pageCapture"
  ],
  ...
}

```

## Methods

### saveAsMHTML()

```
chrome.pageCapture.saveAsMHTML(
  details: object,
): Promise<Blob | undefined>
```

Saves the content of the tab with given id as MHTML.

#### Parameters

- details
  object

- tabId
  number
  The id of the tab to save as MHTML.

#### Returns

Promise<Blob | undefined>Chrome 116+

Resolves when the MHTML has been generated.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-01-07 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
