## Description

The `chrome.extension` API has utilities that can be used by any extension page. It includes support for exchanging messages between an extension and its content scripts or between extensions, as described in detail in [Message Passing](https://developer.chrome.com/docs/extensions/messaging).

## Types

### ViewType

Chrome 44+

The type of extension view.

#### Enum

"tab"

"popup"

## Properties

### inIncognitoContext

True for content scripts running inside incognito tabs, and for extension pages running inside an incognito process. The latter only applies to extensions with 'split' incognito_behavior.

#### Type

boolean

## Methods

### getBackgroundPage()

        Foreground only

```
chrome.extension.getBackgroundPage(): Window | undefined
```

Returns the JavaScript 'window' object for the background page running inside the current extension. Returns null if the extension has no background page.

#### Returns

Window | undefined

### getViews()

        Foreground only

```
chrome.extension.getViews(
  fetchProperties?: object,
): Window[]
```

Returns an array of the JavaScript 'window' objects for each of the pages running inside the current extension.

#### Parameters

- fetchProperties
  object optional

- tabId
  number optionalChrome 54+

Find a view according to a tab id. If this field is omitted, returns all views.

- type
  [ViewType](#type-ViewType)optional
  The type of view to get. If omitted, returns all views (including background pages and tabs).
- windowId
  number optional
  The window to restrict the search to. If omitted, returns all views.

#### Returns

Window[]
Array of global objects

### isAllowedFileSchemeAccess()

```
chrome.extension.isAllowedFileSchemeAccess(): Promise<boolean>
```

Retrieves the state of the extension's access to the 'file://' scheme. This corresponds to the user-controlled per-extension 'Allow access to File URLs' setting accessible via the chrome://extensions page.

#### Returns

Promise<boolean>Chrome 99+

### isAllowedIncognitoAccess()

```
chrome.extension.isAllowedIncognitoAccess(): Promise<boolean>
```

Retrieves the state of the extension's access to Incognito-mode. This corresponds to the user-controlled per-extension 'Allowed in Incognito' setting accessible via the chrome://extensions page.

#### Returns

Promise<boolean>Chrome 99+

### setUpdateUrlData()

```
chrome.extension.setUpdateUrlData(
  data: string,
): void
```

Sets the value of the ap CGI parameter used in the extension's update URL. This value is ignored for extensions that are hosted in the Chrome Extension Gallery.

#### Parameters

- data
  string

## Events

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
