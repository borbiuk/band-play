## Description

Use the `system.display` API to query display metadata.

## Permissions

`system.display`

## Types

### ActiveState

Chrome 117+

An enum to tell if the display is detected and used by the system. The display is considered 'inactive', if it is not detected by the system (maybe disconnected, or considered disconnected due to sleep mode, etc). This state is used to keep existing display when the all displays are disconnected, for example.

#### Enum

"active"

"inactive"

### Bounds

#### Properties

- height
  number
  The height of the display in pixels.
- left
  number
  The x-coordinate of the upper-left corner.
- top
  number
  The y-coordinate of the upper-left corner.
- width
  number
  The width of the display in pixels.

### DisplayLayout

Chrome 53+

#### Properties

- id
  string
  The unique identifier of the display.
- offset
  number
  The offset of the display along the connected edge. 0 indicates that the topmost or leftmost corners are aligned.
- parentId
  string
  The unique identifier of the parent display. Empty if this is the root.
- position
  [LayoutPosition](#type-LayoutPosition)
  The layout position of this display relative to the parent. This will be ignored for the root.

### DisplayMode

Chrome 52+

#### Properties

- deviceScaleFactor
  number
  The display mode device scale factor.
- height
  number
  The display mode height in device independent (user visible) pixels.
- heightInNativePixels
  number
  The display mode height in native pixels.
- isInterlaced
  boolean optionalChrome 74+

True if this mode is interlaced, false if not provided.

- isNative
  boolean
  True if the mode is the display's native mode.
- isSelected
  boolean
  True if the display mode is currently selected.
- refreshRate
  numberChrome 67+

The display mode refresh rate in hertz.

- uiScale
  number optional
  Deprecated since Chrome 70
  Use `displayZoomFactor`

The display mode UI scale factor.

- width
  number
  The display mode width in device independent (user visible) pixels.
- widthInNativePixels
  number
  The display mode width in native pixels.

### DisplayProperties

#### Properties

- boundsOriginX
  number optional
  If set, updates the display's logical bounds origin along the x-axis. Applied together with `[boundsOriginY](#property-DisplayProperties-boundsOriginY). Defaults to the current value if not set and `[boundsOriginY](#property-DisplayProperties-boundsOriginY) is set. Note that when updating the display origin, some constraints will be applied, so the final bounds origin may be different than the one set. The final bounds can be retrieved using ``[getInfo](#method-getInfo). The bounds origin cannot be changed on the primary display.
- boundsOriginY
  number optional
  If set, updates the display's logical bounds origin along the y-axis. See documentation for ``[boundsOriginX](#property-DisplayProperties-boundsOriginX) parameter.
- displayMode
  [DisplayMode](#type-DisplayMode)optionalChrome 52+

If set, updates the display mode to the mode matching this value. If other parameters are invalid, this will not be applied. If the display mode is invalid, it will not be applied and an error will be set, but other properties will still be applied.

- displayZoomFactor
  number optionalChrome 65+

If set, updates the zoom associated with the display. This zoom performs re-layout and repaint thus resulting in a better quality zoom than just performing a pixel by pixel stretch enlargement.

- isPrimary
  boolean optional
  If set to true, makes the display primary. No-op if set to false. Note: If set, the display is considered primary for all other properties (i.e. ``[isUnified](#property-DisplayProperties-isUnified) may be set and bounds origin may not).
- isUnified
  boolean optionalChrome 59+

ChromeOS only. If set to true, changes the display mode to unified desktop (see ``[enableUnifiedDesktop](#method-enableUnifiedDesktop) for details). If set to false, unified desktop mode will be disabled. This is only valid for the primary display. If provided, mirroringSourceId must not be provided and other properties will be ignored. This is has no effect if not provided.

- mirroringSourceId
  string optional
  Deprecated since Chrome 68
  Use ``[setMirrorMode](#method-setMirrorMode).

ChromeOS only. If set and not empty, enables mirroring for this display only. Otherwise disables mirroring for all displays. This value should indicate the id of the source display to mirror, which must not be the same as the id passed to setDisplayProperties. If set, no other property may be set.

- overscan
  [Insets](#type-Insets)optional
  If set, sets the display's overscan insets to the provided values. Note that overscan values may not be negative or larger than a half of the screen's size. Overscan cannot be changed on the internal monitor.
- rotation
  number optional
  If set, updates the display's rotation. Legal values are [0, 90, 180, 270]. The rotation is set clockwise, relative to the display's vertical position.

### DisplayUnitInfo

#### Properties

- activeState
  [ActiveState](#type-ActiveState)Chrome 117+

Active if the display is detected and used by the system.

- availableDisplayZoomFactors
  number[]Chrome 67+

A list of zoom factor values that can be set for the display.

- bounds
  [Bounds](#type-Bounds)
  The display's logical bounds.
- displayZoomFactor
  numberChrome 65+

The ratio between the display's current and default zoom. For example, value 1 is equivalent to 100% zoom, and value 1.5 is equivalent to 150% zoom.

- dpiX
  number
  The number of pixels per inch along the x-axis.
- dpiY
  number
  The number of pixels per inch along the y-axis.
- edid
  [Edid](#type-Edid)optionalChrome 67+

NOTE: This is only available to ChromeOS Kiosk apps and Web UI.

- hasTouchSupport
  booleanChrome 57+

True if this display has a touch input device associated with it.

- id
  string
  The unique identifier of the display.
- isEnabled
  boolean
  True if this display is enabled.
- isPrimary
  boolean
  True if this is the primary display.
- isUnified
  booleanChrome 59+

True for all displays when in unified desktop mode. See documentation for ``[enableUnifiedDesktop](#method-enableUnifiedDesktop).

- mirroringDestinationIds
  string[]Chrome 64+

ChromeOS only. Identifiers of the displays to which the source display is being mirrored. Empty if no displays are being mirrored. This will be set to the same value for all displays. This must not include `mirroringSourceId`.

- mirroringSourceId
  string
  ChromeOS only. Identifier of the display that is being mirrored if mirroring is enabled, otherwise empty. This will be set for all displays (including the display being mirrored).
- modes
  [DisplayMode](#type-DisplayMode)[]Chrome 52+

The list of available display modes. The current mode will have isSelected=true. Only available on ChromeOS. Will be set to an empty array on other platforms.

- name
  string
  The user-friendly name (e.g. "HP LCD monitor").
- overscan
  [Insets](#type-Insets)
  The display's insets within its screen's bounds. Currently exposed only on ChromeOS. Will be set to empty insets on other platforms.
- rotation
  number
  The display's clockwise rotation in degrees relative to the vertical position. Currently exposed only on ChromeOS. Will be set to 0 on other platforms. A value of -1 will be interpreted as auto-rotate when the device is in a physical tablet state.
- workArea
  [Bounds](#type-Bounds)
  The usable work area of the display within the display bounds. The work area excludes areas of the display reserved for OS, for example taskbar and launcher.

### Edid

Chrome 67+

#### Properties

- manufacturerId
  string
  3 character manufacturer code. See Sec. 3.4.1 page 21. Required in v1.4.
- productId
  string
  2 byte manufacturer-assigned code, Sec. 3.4.2 page 21. Required in v1.4.
- yearOfManufacture
  number
  Year of manufacturer, Sec. 3.4.4 page 22. Required in v1.4.

### GetInfoFlags

Chrome 59+

#### Properties

- singleUnified
  boolean optional
  If set to true, only a single `[DisplayUnitInfo](#type-DisplayUnitInfo) will be returned by `[getInfo](#method-getInfo) when in unified desktop mode (see ``[enableUnifiedDesktop](#method-enableUnifiedDesktop)). Defaults to false.

### Insets

#### Properties

- bottom
  number
  The y-axis distance from the bottom bound.
- left
  number
  The x-axis distance from the left bound.
- right
  number
  The x-axis distance from the right bound.
- top
  number
  The y-axis distance from the top bound.

### LayoutPosition

Chrome 53+

Layout position, i.e. edge of parent that the display is attached to.

#### Enum

"top"

"right"

"bottom"

"left"

### MirrorMode

Chrome 65+

Mirror mode, i.e. different ways of how a display is mirrored to other displays.

#### Enum

"off"
Specifies the default mode (extended or unified desktop).
"normal"
Specifies that the default source display will be mirrored to all other displays.
"mixed"
Specifies that the specified source display will be mirrored to the provided destination displays. All other connected displays will be extended.

### MirrorModeInfo

Chrome 65+

#### Properties

- mirroringDestinationIds
  string[] optional
  The ids of the mirroring destination displays. This is only valid for 'mixed'.
- mirroringSourceId
  string optional
  The id of the mirroring source display. This is only valid for 'mixed'.
- mode
  [MirrorMode](#type-MirrorMode)
  The mirror mode that should be set.

### Point

Chrome 57+

#### Properties

- x
  number
  The x-coordinate of the point.
- y
  number
  The y-coordinate of the point.

### TouchCalibrationPair

Chrome 57+

#### Properties

- displayPoint
  [Point](#type-Point)
  The coordinates of the display point.
- touchPoint
  [Point](#type-Point)
  The coordinates of the touch point corresponding to the display point.

### TouchCalibrationPairQuad

Chrome 57+

#### Properties

- pair1
  [TouchCalibrationPair](#type-TouchCalibrationPair)
  First pair of touch and display point required for touch calibration.
- pair2
  [TouchCalibrationPair](#type-TouchCalibrationPair)
  Second pair of touch and display point required for touch calibration.
- pair3
  [TouchCalibrationPair](#type-TouchCalibrationPair)
  Third pair of touch and display point required for touch calibration.
- pair4
  [TouchCalibrationPair](#type-TouchCalibrationPair)
  Fourth pair of touch and display point required for touch calibration.

## Methods

### clearTouchCalibration()

Chrome 57+

```
chrome.system.display.clearTouchCalibration(
  id: string,
): void
```

Resets the touch calibration for the display and brings it back to its default state by clearing any touch calibration data associated with the display.

#### Parameters

- id
  string
  The display's unique identifier.

### completeCustomTouchCalibration()

Chrome 57+

```
chrome.system.display.completeCustomTouchCalibration(
  pairs: [TouchCalibrationPairQuad](#type-TouchCalibrationPairQuad),
  bounds: [Bounds](#type-Bounds),
): void
```

Sets the touch calibration pairs for a display. These `pairs` would be used to calibrate the touch screen for display with `id` called in startCustomTouchCalibration(). Always call `startCustomTouchCalibration` before calling this method. If another touch calibration is already in progress this will throw an error.

#### Parameters

- pairs
  [TouchCalibrationPairQuad](#type-TouchCalibrationPairQuad)
  The pairs of point used to calibrate the display.
- bounds
  [Bounds](#type-Bounds)
  Bounds of the display when the touch calibration was performed. `bounds.left` and `bounds.top` values are ignored.

### enableUnifiedDesktop()

Chrome 46+

```
chrome.system.display.enableUnifiedDesktop(
  enabled: boolean,
): void
```

Enables/disables the unified desktop feature. If enabled while mirroring is active, the desktop mode will not change until mirroring is turned off. Otherwise, the desktop mode will switch to unified immediately. NOTE: This is only available to ChromeOS Kiosk apps and Web UI.

#### Parameters

- enabled
  boolean
  True if unified desktop should be enabled.

### getDisplayLayout()

Chrome 53+

```
chrome.system.display.getDisplayLayout(): Promise<[DisplayLayout](#type-DisplayLayout)[]>
```

Requests the layout info for all displays. NOTE: This is only available to ChromeOS Kiosk apps and Web UI.

#### Returns

Promise<[DisplayLayout](#type-DisplayLayout)[]>Chrome 91+

Promise that resolves with the results.

### getInfo()

```
chrome.system.display.getInfo(
  flags?: [GetInfoFlags](#type-GetInfoFlags),
): Promise<[DisplayUnitInfo](#type-DisplayUnitInfo)[]>
```

Requests the information for all attached display devices.

#### Parameters

- flags
  [GetInfoFlags](#type-GetInfoFlags)optionalChrome 59+

Options affecting how the information is returned.

#### Returns

Promise<[DisplayUnitInfo](#type-DisplayUnitInfo)[]>Chrome 91+

Promise that resolves with the results.

### overscanCalibrationAdjust()

Chrome 53+

```
chrome.system.display.overscanCalibrationAdjust(
  id: string,
  delta: [Insets](#type-Insets),
): void
```

Adjusts the current overscan insets for a display. Typically this should either move the display along an axis (e.g. left+right have the same value) or scale it along an axis (e.g. top+bottom have opposite values). Each Adjust call is cumulative with previous calls since Start.

#### Parameters

- id
  string
  The display's unique identifier.
- delta
  [Insets](#type-Insets)
  The amount to change the overscan insets.

### overscanCalibrationComplete()

Chrome 53+

```
chrome.system.display.overscanCalibrationComplete(
  id: string,
): void
```

Complete overscan adjustments for a display by saving the current values and hiding the overlay.

#### Parameters

- id
  string
  The display's unique identifier.

### overscanCalibrationReset()

Chrome 53+

```
chrome.system.display.overscanCalibrationReset(
  id: string,
): void
```

Resets the overscan insets for a display to the last saved value (i.e before Start was called).

#### Parameters

- id
  string
  The display's unique identifier.

### overscanCalibrationStart()

Chrome 53+

```
chrome.system.display.overscanCalibrationStart(
  id: string,
): void
```

Starts overscan calibration for a display. This will show an overlay on the screen indicating the current overscan insets. If overscan calibration for display `id` is in progress this will reset calibration.

#### Parameters

- id
  string
  The display's unique identifier.

### setDisplayLayout()

Chrome 53+

```
chrome.system.display.setDisplayLayout(
  layouts: [DisplayLayout](#type-DisplayLayout)[],
): Promise<void>
```

Set the layout for all displays. Any display not included will use the default layout. If a layout would overlap or be otherwise invalid it will be adjusted to a valid layout. After layout is resolved, an onDisplayChanged event will be triggered. NOTE: This is only available to ChromeOS Kiosk apps and Web UI.

#### Parameters

- layouts
  [DisplayLayout](#type-DisplayLayout)[]
  The layout information, required for all displays except the primary display.

#### Returns

Promise<void>Chrome 91+

Promise that resolves when the function finishes.

### setDisplayProperties()

```
chrome.system.display.setDisplayProperties(
  id: string,
  info: [DisplayProperties](#type-DisplayProperties),
): Promise<void>
```

Updates the properties for the display specified by `id`, according to the information provided in `info`. On failure, ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime/#property-lastError) will be set. NOTE: This is only available to ChromeOS Kiosk apps and Web UI.

#### Parameters

- id
  string
  The display's unique identifier.
- info
  [DisplayProperties](#type-DisplayProperties)
  The information about display properties that should be changed. A property will be changed only if a new value for it is specified in `info`.

#### Returns

Promise<void>Chrome 91+

Promise that resolves when the function finishes.

### setMirrorMode()

Chrome 65+

```
chrome.system.display.setMirrorMode(
  info: [MirrorModeInfo](#type-MirrorModeInfo),
): Promise<void>
```

Sets the display mode to the specified mirror mode. Each call resets the state from previous calls. Calling setDisplayProperties() will fail for the mirroring destination displays. NOTE: This is only available to ChromeOS Kiosk apps and Web UI.

#### Parameters

- info
  [MirrorModeInfo](#type-MirrorModeInfo)
  The information of the mirror mode that should be applied to the display mode.

#### Returns

Promise<void>Chrome 91+

Promise that resolves when the function finishes.

### showNativeTouchCalibration()

Chrome 57+

```
chrome.system.display.showNativeTouchCalibration(
  id: string,
): Promise<boolean>
```

Displays the native touch calibration UX for the display with `id` as display id. This will show an overlay on the screen with required instructions on how to proceed. The callback will be invoked in case of successful calibration only. If the calibration fails, this will throw an error.

#### Parameters

- id
  string
  The display's unique identifier.

#### Returns

Promise<boolean>Chrome 91+

Promise that resolves to inform the caller that the touch calibration has ended. The boolean value informs if the calibration was a success or not.

### startCustomTouchCalibration()

Chrome 57+

```
chrome.system.display.startCustomTouchCalibration(
  id: string,
): void
```

Starts custom touch calibration for a display. This should be called when using a custom UX for collecting calibration data. If another touch calibration is already in progress this will throw an error.

#### Parameters

- id
  string
  The display's unique identifier.

## Events

### onDisplayChanged

```
chrome.system.display.onDisplayChanged.addListener(
  callback: function,
)
```

Fired when anything changes to the display configuration.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
() => void
```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-01-07 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
