## Description

Use the `chrome.dom` API to access special DOM APIs for Extensions

## Availability

Chrome 88+

## Methods

### openOrClosedShadowRoot()

```
chrome.dom.openOrClosedShadowRoot(
  element: HTMLElement,
): object
```

Gets the open shadow root or the closed shadow root hosted by the specified element. If the element doesn't attach the shadow root, it will return null.

#### Parameters

- element
  HTMLElement

#### Returns

object
See [https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
