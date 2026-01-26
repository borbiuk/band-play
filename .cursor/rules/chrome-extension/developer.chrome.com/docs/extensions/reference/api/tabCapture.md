## Description

Use the `chrome.tabCapture` API to interact with tab media streams.

## Permissions

`tabCapture`

## Concepts and usage

The chrome.tabCapture API lets you access a `[MediaStream](https://developer.mozilla.org/docs/Web/API/MediaStream) containing video and
audio of the current tab. It can only be called after the user invokes an extension, such as by
clicking the extension's [action button](/docs/extensions/develop#actions). This is similar to the behavior of the
`["activeTab"](/docs/extensions/develop/concepts/activeTab) permission.

### Preserve system audio

When a `[MediaStream](https://developer.mozilla.org/docs/Web/API/MediaStream) is obtained for a tab, audio in that tab will no longer be played
to the user. This is similar to the behavior of the `[getDisplayMedia()](https://developer.mozilla.org/docs/Web/API/MediaDevices/getDisplayMedia) function when
the ``[suppressLocalAudioPlayback](https://developer.mozilla.org/docs/Web/API/MediaTrackSupportedConstraints/suppressLocalAudioPlayback) flag is set to true.
To continue playing audio to the user, use the following:

```
const output = new AudioContext();
const source = output.createMediaStreamSource(stream);
source.connect(output.destination);

```

This creates a new `AudioContext` and connects the audio of the tab's `MediaStream` to the default
destination.

### Stream IDs

Calling `[chrome.tabCapture.getMediaStreamId()](#method-getMediaStreamId) will return a stream ID. To later
access a `[MediaStream](https://developer.mozilla.org/docs/Web/API/MediaStream) from the ID, use the following:

```
navigator.mediaDevices.getUserMedia({
  audio: {
    mandatory: {
      chromeMediaSource: "tab",
      chromeMediaSourceId: id,
    },
  },
  video: {
    mandatory: {
      chromeMediaSource: "tab",
      chromeMediaSourceId: id,
    },
  },
});

```

### Usage restrictions

After calling ``[getMediaStreamId()](#method-getMediaStreamId), there are restrictions on where the
returned stream ID can be used:

- If `consumerTabId` is specified, the ID can be used by a `getUserMedia()` call in any frame in the
  given tab which has the same security origin.
- When this is not specified, beginning in Chrome 116, the ID can be used in any frame with the
  same security origin in the same render process as the caller. This means that a stream ID obtained
  in a service worker can be used in an [offscreen document](/docs/extensions/reference/api/offscreen).
  Prior to Chrome 116, when a `consumerTabId` was not specified, the stream ID was restricted to both
  the security origin, render process and render frame of the caller.

### Learn more

To learn more about how to use the `chrome.tabCapture` API, see
[Audio recording and screen capture](/docs/extensions/how-to/web-platform/screen-capture). This demonstrates how to use
`tabCapture` and related APIs to solve a number of common use cases.

## Types

### CaptureInfo

#### Properties

- fullscreen
  boolean
  Whether an element in the tab being captured is in fullscreen mode.
- status
  [TabCaptureState](#type-TabCaptureState)
  The new capture status of the tab.
- tabId
  number
  The id of the tab whose status changed.

### CaptureOptions

#### Properties

- audio
  boolean optional
- audioConstraints
  [MediaStreamConstraint](#type-MediaStreamConstraint)optional
- video
  boolean optional
- videoConstraints
  [MediaStreamConstraint](#type-MediaStreamConstraint)optional

### GetMediaStreamOptions

Chrome 71+

#### Properties

- consumerTabId
  number optional
  Optional tab id of the tab which will later invoke `getUserMedia()` to consume the stream. If not specified then the resulting stream can be used only by the calling extension. The stream can only be used by frames in the given tab whose security origin matches the consumber tab's origin. The tab's origin must be a secure origin, e.g. HTTPS.
- targetTabId
  number optional
  Optional tab id of the tab which will be captured. If not specified then the current active tab will be selected. Only tabs for which the extension has been granted the `activeTab` permission can be used as the target tab.

### MediaStreamConstraint

#### Properties

- mandatory
  object
- optional
  object optional

### TabCaptureState

#### Enum

"pending"

"active"

"stopped"

"error"

## Methods

### capture()

        Foreground only

```
chrome.tabCapture.capture(
  options: [CaptureOptions](#type-CaptureOptions),
  callback: function,
): void
```

Captures the visible area of the currently active tab. Capture can only be started on the currently active tab after the extension has been invoked, similar to the way that [activeTab](https://developer.chrome.com/docs/extensions/activeTab#invoking-activeTab) works. Capture is maintained across page navigations within the tab, and stops when the tab is closed, or the media stream is closed by the extension.

#### Parameters

- options
  [CaptureOptions](#type-CaptureOptions)
  Configures the returned media stream.
- callback
  function

                              The `callback` parameter looks like:

```
(stream: LocalMediaStream) => void
```

- stream
  LocalMediaStream

### getCapturedTabs()

```
chrome.tabCapture.getCapturedTabs(): Promise<[CaptureInfo](#type-CaptureInfo)[]>
```

Returns a list of tabs that have requested capture or are being captured, i.e. status != stopped and status != error. This allows extensions to inform the user that there is an existing tab capture that would prevent a new tab capture from succeeding (or to prevent redundant requests for the same tab).

#### Returns

Promise<[CaptureInfo](#type-CaptureInfo)[]>Chrome 116+

Returns a Promise which resolves with CaptureInfo[] for captured tabs.

### getMediaStreamId()

Chrome 71+

```
chrome.tabCapture.getMediaStreamId(
  options?: [GetMediaStreamOptions](#type-GetMediaStreamOptions),
): Promise<string>
```

Creates a stream ID to capture the target tab. Similar to chrome.tabCapture.capture() method, but returns a media stream ID, instead of a media stream, to the consumer tab.

#### Parameters

- options
  [GetMediaStreamOptions](#type-GetMediaStreamOptions)optional

#### Returns

Promise<string>Chrome 116+

Returns a Promise which resolves with the result. If successful, the result is an opaque string that can be passed to the `getUserMedia()` API to generate a media stream that corresponds to the target tab. The created `streamId` can only be used once and expires after a few seconds if it is not used.

## Events

### onStatusChanged

```
chrome.tabCapture.onStatusChanged.addListener(
  callback: function,
)
```

Event fired when the capture status of a tab changes. This allows extension authors to keep track of the capture status of tabs to keep UI elements like page actions in sync.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(info: [CaptureInfo](#type-CaptureInfo)) => void
```

- info
  [CaptureInfo](#type-CaptureInfo)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-07 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
