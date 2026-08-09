## Description

The `chrome.extensionTypes` API contains type declarations for Chrome extensions.

## Types

### ColorArray

Chrome 139+

#### Type

[number, number, number, number]

### CSSOrigin

Chrome 66+

The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of injected CSS.

#### Enum

"author"

"user"

### DeleteInjectionDetails

Chrome 87+

Details of the CSS to remove. Either the code or the file property must be set, but both may not be set at the same time.

#### Properties

- allFrames
  boolean optional
  If allFrames is `true`, implies that the CSS should be removed from all frames of current page. By default, it's `false` and is only removed from the top frame. If `true` and `frameId` is set, then the code is removed from the selected frame and all of its child frames.
- code
  string optional
  CSS code to remove.
- cssOrigin
  [CSSOrigin](#type-CSSOrigin)optional
  The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of the CSS to remove. Defaults to `"author"`.
- file
  string optional
  CSS file to remove.
- frameId
  number optional
  The [frame](https://developer.chrome.com/docs/extensions/reference/webNavigation/#frame_ids) from where the CSS should be removed. Defaults to 0 (the top-level frame).
- matchAboutBlank
  boolean optional
  If matchAboutBlank is true, then the code is also removed from about:blank and about:srcdoc frames if your extension has access to its parent document. By default it is `false`.

### DocumentLifecycle

Chrome 106+

The document lifecycle of the frame.

#### Enum

"prerender"

"active"

"cached"

"pending_deletion"

### ExecutionWorld

Chrome 111+

The JavaScript world for a script to execute within. Can either be an isolated world unique to this extension, the main world of the DOM which is shared with the page's JavaScript, or a user scripts world that is only available for scripts registered with the User Scripts API.

#### Enum

"ISOLATED"

"MAIN"

"USER_SCRIPT"

### FrameType

Chrome 106+

The type of frame.

#### Enum

"outermost_frame"

"fenced_frame"

"sub_frame"

### ImageDataType

Chrome 139+

Pixel data for an image. Must be an ImageData object; for example, from a `canvas` element.

#### Type

ImageData

### ImageDetails

Details about the format, quality, and area of an image.

#### Properties

- format
  [ImageFormat](#type-ImageFormat)optional
  The format of the resulting image. Default is `"jpeg"`.
- quality
  number optional
  When format is `"jpeg"`, controls the quality of the resulting image. This value is ignored for PNG images. As quality is decreased, the resulting image will have more visual artifacts, and the number of bytes needed to store it will decrease.

### ImageFormat

Chrome 44+

The format of an image.

#### Enum

"jpeg"

"png"

### InjectDetails

Details of the script or CSS to inject. Either the code or the file property must be set, but both may not be set at the same time.

#### Properties

- allFrames
  boolean optional
  If allFrames is `true`, implies that the JavaScript or CSS should be injected into all frames of current page. By default, it's `false` and is only injected into the top frame. If `true` and `frameId` is set, then the code is inserted in the selected frame and all of its child frames.
- code
  string optional
  JavaScript or CSS code to inject.
  Warning: Be careful using the `code` parameter. Incorrect use of it may open your extension to [cross site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) attacks
- cssOrigin
  [CSSOrigin](#type-CSSOrigin)optionalChrome 66+

The [origin](https://www.w3.org/TR/css3-cascade/#cascading-origins) of the CSS to inject. This may only be specified for CSS, not JavaScript. Defaults to `"author"`.

- file
  string optional
  JavaScript or CSS file to inject.
- frameId
  number optionalChrome 50+

The [frame](https://developer.chrome.com/docs/extensions/reference/webNavigation/#frame_ids) where the script or CSS should be injected. Defaults to 0 (the top-level frame).

- matchAboutBlank
  boolean optional
  If matchAboutBlank is true, then the code is also injected in about:blank and about:srcdoc frames if your extension has access to its parent document. Code cannot be inserted in top-level about:-frames. By default it is `false`.
- runAt
  [RunAt](#type-RunAt)optional
  The soonest that the JavaScript or CSS will be injected into the tab. Defaults to "document_idle".

### RunAt

Chrome 44+

The soonest that the JavaScript or CSS will be injected into the tab.

#### Enum

"document_start"
Script is injected after any files from css, but before any other DOM is constructed or any other script is run.
"document_end"
Script is injected immediately after the DOM is complete, but before subresources like images and frames have loaded.
"document_idle"
The browser chooses a time to inject the script between "document_end" and immediately after the `window.onload` event fires. The exact moment of injection depends on how complex the document is and how long it is taking to load, and is optimized for page load speed. Content scripts running at "document_idle" don't need to listen for the `window.onload` event; they are guaranteed to run after the DOM completes. If a script definitely needs to run after `window.onload`, the extension can check if `onload` has already fired by using the `document.readyState` property.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
