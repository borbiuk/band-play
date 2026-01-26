## Description

The Desktop Capture API captures the content of the screen, individual windows, or individual tabs.

## Permissions

`desktopCapture`

## Types

### DesktopCaptureSourceType

Enum used to define set of desktop media sources used in chooseDesktopMedia().

#### Enum

"screen"

"window"

"tab"

"audio"

### SelfCapturePreferenceEnum

Chrome 107+

Mirrors [SelfCapturePreferenceEnum](https://w3c.github.io/mediacapture-screen-share/#dom-selfcapturepreferenceenum).

#### Enum

"include"

"exclude"

### SystemAudioPreferenceEnum

Chrome 105+

Mirrors [SystemAudioPreferenceEnum](https://w3c.github.io/mediacapture-screen-share/#dom-systemaudiopreferenceenum).

#### Enum

"include"

"exclude"

### WindowAudioPreferenceEnum

Chrome 140+

Mirrors [WindowAudioPreferenceEnum](https://w3c.github.io/mediacapture-screen-share/#dom-windowaudiopreferenceenum).

#### Enum

"system"

"window"

"exclude"

## Methods

### cancelChooseDesktopMedia()

```
chrome.desktopCapture.cancelChooseDesktopMedia(
  desktopMediaRequestId: number,
): void
```

Hides desktop media picker dialog shown by chooseDesktopMedia().

#### Parameters

- desktopMediaRequestId
  number
  Id returned by chooseDesktopMedia()

### chooseDesktopMedia()

```
chrome.desktopCapture.chooseDesktopMedia(
  sources: [DesktopCaptureSourceType](#type-DesktopCaptureSourceType)[],
  targetTab?: [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab),
  callback: function,
): number
```

Shows desktop media picker UI with the specified set of sources.

#### Parameters

- sources
  [DesktopCaptureSourceType](#type-DesktopCaptureSourceType)[]
  Set of sources that should be shown to the user. The sources order in the set decides the tab order in the picker.
- targetTab
  [Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)optional
  Optional tab for which the stream is created. If not specified then the resulting stream can be used only by the calling extension. The stream can only be used by frames in the given tab whose security origin matches `tab.url`. The tab's origin must be a secure origin, e.g. HTTPS.
- callback
  function

                              The `callback` parameter looks like:

```
(streamId: string, options: object) => void
```

- streamId
  string
  An opaque string that can be passed to `getUserMedia()` API to generate media stream that corresponds to the source selected by the user. If user didn't select any source (i.e. canceled the prompt) then the callback is called with an empty `streamId`. The created `streamId` can be used only once and expires after a few seconds when it is not used.
- options
  objectChrome 57+

Contains properties that describe the stream.

- canRequestAudioTrack
  boolean
  True if "audio" is included in parameter sources, and the end user does not uncheck the "Share audio" checkbox. Otherwise false, and in this case, one should not ask for audio stream through getUserMedia call.

#### Returns

number
An id that can be passed to cancelChooseDesktopMedia() in case the prompt need to be canceled.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-09-15 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-09-15 UTC."],[],[]]
