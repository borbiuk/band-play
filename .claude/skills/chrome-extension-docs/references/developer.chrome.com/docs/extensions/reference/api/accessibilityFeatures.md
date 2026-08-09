## Description

Use the `chrome.accessibilityFeatures` API to manage Chrome's accessibility features. This API relies on the [ChromeSetting prototype of the type API](https://developer.chrome.com/docs/extensions/reference/types/#ChromeSetting) for getting and setting individual accessibility features. In order to get feature states the extension must request `accessibilityFeatures.read` permission. For modifying feature state, the extension needs `accessibilityFeatures.modify` permission. Note that `accessibilityFeatures.modify` does not imply `accessibilityFeatures.read` permission.

## Permissions

`accessibilityFeatures.modify`
`accessibilityFeatures.read`

## Properties

### animationPolicy

`get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<"allowed"
 | "once"
 | "none"

>

### autoclick

ChromeOS only.
Auto mouse click after mouse stops moving. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### caretHighlight

Chrome 51+

ChromeOS only.
Caret highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### cursorColor

Chrome 85+

ChromeOS only.
Cursor color. The value indicates whether the feature is enabled or not, doesn't indicate the color of it. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### cursorHighlight

Chrome 51+

ChromeOS only.
Cursor highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### dictation

Chrome 90+

ChromeOS only.
Dictation. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### dockedMagnifier

Chrome 87+

ChromeOS only.
Docked magnifier. The value indicates whether docked magnifier feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### focusHighlight

Chrome 51+

ChromeOS only.
Focus highlighting. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### highContrast

ChromeOS only.
High contrast rendering mode. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### largeCursor

ChromeOS only.
Enlarged cursor. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### screenMagnifier

ChromeOS only.
Full screen magnification. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### selectToSpeak

Chrome 51+

ChromeOS only.
Select-to-speak. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### spokenFeedback

ChromeOS only.
Spoken feedback (text-to-speech). The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### stickyKeys

ChromeOS only.
Sticky modifier keys (like shift or alt). The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### switchAccess

Chrome 51+

ChromeOS only.
Switch Access. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>

### virtualKeyboard

ChromeOS only.
Virtual on-screen keyboard. The value indicates whether the feature is enabled or not. `get()` requires `accessibilityFeatures.read` permission. `set()` and `clear()` require `accessibilityFeatures.modify` permission.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
