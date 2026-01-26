## Description

Use the `chrome.action` API to control the extension's icon in the Google Chrome toolbar.
The action icons are displayed in the browser toolbar next to the [omnibox](https://en.wiktionary.org/wiki/omnibox). After installation, these appear in the extensions menu (the puzzle piece icon).
Users can pin your extension icon to the toolbar.

## Availability

Chrome 88+
MV3+

## Manifest

The following keys must be declared [in the manifest](/docs/extensions/mv3/manifest) to use this API.`"action"`

To use the `chrome.action` API, specify a `"manifest_version"` of `3` and include
the `"action"` key in your [manifest file](/docs/extensions/reference/manifest).Note: Every extension has an icon in the Chrome toolbar, even if the `"action"` key isn't added to the manifest.

```
{
  "name": "Action Extension",
  ...
  "action": {
    "default_icon": {              // optional
      "16": "images/icon16.png",   // optional
      "24": "images/icon24.png",   // optional
      "32": "images/icon32.png"    // optional
    },
    "default_title": "Click Me",   // optional, shown in tooltip
    "default_popup": "popup.html"  // optional
  },
  ...
}

```

The `"action"` key (along with its children) is optional. When it isn't included, your extension is still shown in the toolbar to provide access to the extension's menu. For this reason, we recommend that you always include at least the `"action"` and `"default_icon"` keys.

## Concepts and usage

### Parts of the UI

#### Icon

The icon is the main image on the toolbar for your extension, and is set by the `"default_icon"` key in
your manifest's `"action"` key. Icons must be 16 device-independent pixels (DIPs) wide and tall.
The `"default_icon"` key is a dictionary of sizes to image paths. Chrome uses these icons
to choose which image scale to use. If an exact match is not found, Chrome selects the closest
available and scales it to fit the image, which might affect image quality.
Because devices with less-common scale factors like 1.5x or 1.2x are becoming more
common, we encourage you to provide multiple sizes for your icons. This also
futureproofs your extension against potential icon display size changes. However,
if only providing a single size, the `"default_icon"` key can also be set to a
string with the path to a single icon instead of a dictionary.
You can also call `action.setIcon()` to set your extension's icon programmatically
by specifying a different image path or providing a dynamically-generated icon using the [HTML canvas
element](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement), or, if setting from an extension service worker, the [offscreen
canvas](https://developer.mozilla.org/docs/Web/API/OffscreenCanvas) API.

```
const canvas = new OffscreenCanvas(16, 16);
const context = canvas.getContext('2d');
context.clearRect(0, 0, 16, 16);
context.fillStyle = '#00FF00';  // Green
context.fillRect(0, 0, 16, 16);
const imageData = context.getImageData(0, 0, 16, 16);
chrome.action.setIcon({imageData: imageData}, () => { /* ... */ });

```

Note: The `action.setIcon()` API is intended to set a static image. Don't use animated images for your icons.
For packed extensions (installed from a .crx file), images can be in most formats that the Blink
rendering engine can display, including PNG, JPEG, BMP, ICO, and others. SVG isn't supported.
Unpacked extensions must use PNG images.

#### Tooltip (title)

The tooltip, or title, appears when the user holds their mouse pointer over the extension's icon in the
toolbar. It's also included in the accessible text spoken by screen readers when the button gets
focus.
The default tooltip is set using the `"default_title"` field of the `"action"` key in `manifest.json`.
You can also set it programmatically by calling `action.setTitle()`.

#### Badge

Actions can optionally display a "badge" — a bit of text layered over the icon. This lets you
update the action to display a small amount of information about the state of the extension,
such as a counter. The badge has a text component and a background color. Because space is limited,
we recommend that badge text use four or fewer characters.
To create a badge, set it programmatically by calling `action.setBadgeBackgroundColor()` and
`action.setBadgeText()`. There isn't a default badge setting in the manifest. Badge color values
can be either an array of four integers between 0 and 255 that make up the RGBA color of the
badge or a string with a [CSS color](https://developer.mozilla.org/docs/Web/CSS/color) value.

```
chrome.action.setBadgeBackgroundColor(
  {color: [0, 255, 0, 0]},  // Green
  () => { /* ... */ },
);

chrome.action.setBadgeBackgroundColor(
  {color: '#00FF00'},  // Also green
  () => { /* ... */ },
);

chrome.action.setBadgeBackgroundColor(
  {color: 'green'},  // Also, also green
  () => { /* ... */ },
);

```

#### Popup

An action's popup is shown when the user clicks on the extension's action button in the
toolbar. The popup can contain any HTML contents you like, and will be automatically sized to fit
its contents. The popup's size must be between 25x25 and 800x600 pixels.
The popup is initially set by the `"default_popup"` property in the `"action"` key in the
`manifest.json` file. If present, this property should point to a relative path within the extension
directory. It can also be updated dynamically to point to a different relative path using the
`action.setPopup()` method.Note: The `action.onClicked` event won't be sent if the extension action has specified a popup to
show on click of the current tab.

## Use cases

### Per-tab state

Extension actions can have different states for each tab. To set a value for an individual
tab, use the `tabId` property in the `action` API's setting methods. For example, to
set the badge text for a specific tab, do something like the following:

```
function getTabId() { /* ... */}
function getTabBadge() { /* ... */}

chrome.action.setBadgeText(
  {
    text: getTabBadge(tabId),
    tabId: getTabId(),
  },
  () => { ... }
);

```

If the `tabId` property is left out, the setting is treated as a global setting. Tab-specific
settings take priority over global settings.

### Enabled state

By default, toolbar actions are enabled (clickable) on every tab. You can change this default
by setting the `default_state` property in the `action` key of the manifest. If
`default_state` is set to `"disabled"`, the action is disabled by default and must be enabled
programmatically to be clickable. If `default_state` is set to `"enabled"` (the default),
the action is enabled and clickable by default.
You can control the state programmatically using the `action.enable()` and `action.disable()`
methods. This only affects whether the popup (if any) or `action.onClicked` event is sent
to your extension; it doesn't affect the action's presence in the toolbar.

## Examples

The following examples show some common ways that actions are used in extensions. To try this API,
install the [Action API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/action) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
repository.

### Show a popup

It's common for an extension to display a popup when the user clicks the extension's action. To
implement this in your own extension, declare the popup in your `manifest.json` and specify the
content that Chrome should display in the popup.

```
// manifest.json
{
  "name": "Action popup demo",
  "version": "1.0",
  "manifest_version": 3,
  "action": {
    "default_title": "Click to view a popup",
    "default_popup": "popup.html"
  }
}

```

```
<!-- popup.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    html {
      min-height: 5em;
      min-width: 10em;
      background: salmon;
    }
  </style>
</head>
<body>
  <p>Hello, world!</p>
</body>
</html>

```

### Inject a content script on click

A common pattern for extensions is to expose their primary feature using the extension's
action. The following example demonstrates this pattern. When the user clicks the action, the extension
injects a content script into the current page. The content script then displays an alert to verify
that everything worked as expected.

```
// manifest.json
{
  "name": "Action script injection demo",
  "version": "1.0",
  "manifest_version": 3,
  "action": {
    "default_title": "Click to show an alert"
  },
  "permissions": ["activeTab", "scripting"],
  "background": {
    "service_worker": "background.js"
  }
}

```

```
// background.js
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['content.js']
  });
});

```

```
// content.js
alert('Hello, world!');

```

### Emulate actions with declarativeContent

This example shows how an extension's background logic can (a) disable an action by default and (b)
use [declarativeContent](/docs/extensions/reference/api/declarativeContent) to enable the action on specific sites.

```
// service-worker.js

// Wrap in an onInstalled callback to avoid unnecessary work
// every time the service worker is run
chrome.runtime.onInstalled.addListener(() => {
  // Page actions are disabled by default and enabled on select tabs
  chrome.action.disable();

  // Clear all rules to ensure only our expected rules are set
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Declare a rule to enable the action on example.com pages
    let exampleRule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostSuffix: '.example.com'},
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    };

    // Finally, apply our new array of rules
    let rules = [exampleRule];
    chrome.declarativeContent.onPageChanged.addRules(rules);
  });
});

```

## Types

### OpenPopupOptions

Chrome 99+

#### Properties

- windowId
  number optional
  The ID of the window to open the action popup in. Defaults to the currently-active window if unspecified.

### TabDetails

#### Properties

- tabId
  number optional
  The ID of the tab to query state for. If no tab is specified, the non-tab-specific state is returned.

### UserSettings

Chrome 91+

The collection of user-specified settings relating to an extension's action.

#### Properties

- isOnToolbar
  boolean
  Whether the extension's action icon is visible on browser windows' top-level toolbar (i.e., whether the extension has been 'pinned' by the user).

### UserSettingsChange

Chrome 130+

#### Properties

- isOnToolbar
  boolean optional
  Whether the extension's action icon is visible on browser windows' top-level toolbar (i.e., whether the extension has been 'pinned' by the user).

## Methods

### disable()

```
chrome.action.disable(
  tabId?: number,
): Promise<void>
```

Disables the action for a tab.

#### Parameters

- tabId
  number optional
  The ID of the tab for which you want to modify the action.

#### Returns

Promise<void>

### enable()

```
chrome.action.enable(
  tabId?: number,
): Promise<void>
```

Enables the action for a tab. By default, actions are enabled.

#### Parameters

- tabId
  number optional
  The ID of the tab for which you want to modify the action.

#### Returns

Promise<void>

### getBadgeBackgroundColor()

```
chrome.action.getBadgeBackgroundColor(
  details: [TabDetails](#type-TabDetails),
): Promise<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)>
```

Gets the background color of the action.

#### Parameters

- details
  [TabDetails](#type-TabDetails)

#### Returns

Promise<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)>

### getBadgeText()

```
chrome.action.getBadgeText(
  details: [TabDetails](#type-TabDetails),
): Promise<string>
```

Gets the badge text of the action. If no tab is specified, the non-tab-specific badge text is returned. If [displayActionCountAsBadgeText](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#setExtensionActionOptions) is enabled, a placeholder text will be returned unless the [declarativeNetRequestFeedback](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#declarativeNetRequestFeedback) permission is present or tab-specific badge text was provided.

#### Parameters

- details
  [TabDetails](#type-TabDetails)

#### Returns

Promise<string>

### getBadgeTextColor()

Chrome 110+

```
chrome.action.getBadgeTextColor(
  details: [TabDetails](#type-TabDetails),
): Promise<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)>
```

Gets the text color of the action.

#### Parameters

- details
  [TabDetails](#type-TabDetails)

#### Returns

Promise<[extensionTypes.ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)>

### getPopup()

```
chrome.action.getPopup(
  details: [TabDetails](#type-TabDetails),
): Promise<string>
```

Gets the html document set as the popup for this action.

#### Parameters

- details
  [TabDetails](#type-TabDetails)

#### Returns

Promise<string>

### getTitle()

```
chrome.action.getTitle(
  details: [TabDetails](#type-TabDetails),
): Promise<string>
```

Gets the title of the action.

#### Parameters

- details
  [TabDetails](#type-TabDetails)

#### Returns

Promise<string>

### getUserSettings()

Chrome 91+

```
chrome.action.getUserSettings(): Promise<[UserSettings](#type-UserSettings)>
```

Returns the user-specified settings relating to an extension's action.

#### Returns

Promise<[UserSettings](#type-UserSettings)>

### isEnabled()

Chrome 110+

```
chrome.action.isEnabled(
  tabId?: number,
): Promise<boolean>
```

Indicates whether the extension action is enabled for a tab (or globally if no `tabId` is provided). Actions enabled using only ``[declarativeContent](https://developer.chrome.com/docs/extensions/reference/declarativeContent/) always return false.

#### Parameters

- tabId
  number optional
  The ID of the tab for which you want check enabled status.

#### Returns

Promise<boolean>

### openPopup()

Chrome 127+

```
chrome.action.openPopup(
  options?: [OpenPopupOptions](#type-OpenPopupOptions),
): Promise<void>
```

Opens the extension's popup. Between Chrome 118 and Chrome 126, this is only available to policy installed extensions.

#### Parameters

- options
  [OpenPopupOptions](#type-OpenPopupOptions)optional
  Specifies options for opening the popup.

#### Returns

Promise<void>

### setBadgeBackgroundColor()

```
chrome.action.setBadgeBackgroundColor(
  details: object,
): Promise<void>
```

Sets the background color for the badge.

#### Parameters

- details
  object

- color
  string | [ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)
  An array of four integers in the range [0,255] that make up the RGBA color of the badge. For example, opaque red is `[255, 0, 0, 255]`. Can also be a string with a CSS value, with opaque red being `#FF0000` or `#F00`.
- tabId
  number optional
  Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.

#### Returns

Promise<void>

### setBadgeText()

```
chrome.action.setBadgeText(
  details: object,
): Promise<void>
```

Sets the badge text for the action. The badge is displayed on top of the icon.

#### Parameters

- details
  object

- tabId
  number optional
  Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
- text
  string optional
  Any number of characters can be passed, but only about four can fit in the space. If an empty string (`''`) is passed, the badge text is cleared. If `tabId` is specified and `text` is null, the text for the specified tab is cleared and defaults to the global badge text.

#### Returns

Promise<void>

### setBadgeTextColor()

Chrome 110+

```
chrome.action.setBadgeTextColor(
  details: object,
): Promise<void>
```

Sets the text color for the badge.

#### Parameters

- details
  object

- color
  string | [ColorArray](https://developer.chrome.com/docs/extensions/reference/extensionTypes/#type-ColorArray)
  An array of four integers in the range [0,255] that make up the RGBA color of the badge. For example, opaque red is `[255, 0, 0, 255]`. Can also be a string with a CSS value, with opaque red being `#FF0000` or `#F00`. Not setting this value will cause a color to be automatically chosen that will contrast with the badge's background color so the text will be visible. Colors with alpha values equivalent to 0 will not be set and will return an error.
- tabId
  number optional
  Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.

#### Returns

Promise<void>

### setIcon()

```
chrome.action.setIcon(
  details: object,
): Promise<void>
```

Sets the icon for the action. The icon can be specified either as the path to an image file or as the pixel data from a canvas element, or as dictionary of either one of those. Either the path or the imageData property must be specified.

#### Parameters

- details
  object

- imageData
  ImageData | object optional
  Either an ImageData object or a dictionary {size -> ImageData} representing icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then image with size `scale` \* n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.imageData = foo' is equivalent to 'details.imageData = {'16': foo}'
- path
  string | object optional
  Either a relative image path or a dictionary {size -> relative image path} pointing to icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then image with size `scale` \* n will be selected, where n is the size of the icon in the UI. At least one image must be specified. Note that 'details.path = foo' is equivalent to 'details.path = {'16': foo}'
- tabId
  number optional
  Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.

#### Returns

Promise<void>Chrome 96+

### setPopup()

```
chrome.action.setPopup(
  details: object,
): Promise<void>
```

Sets the HTML document to be opened as a popup when the user clicks on the action's icon.

#### Parameters

- details
  object

- popup
  string
  The relative path to the HTML file to show in a popup. If set to the empty string (`''`), no popup is shown.
- tabId
  number optional
  Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.

#### Returns

Promise<void>

### setTitle()

```
chrome.action.setTitle(
  details: object,
): Promise<void>
```

Sets the title of the action. This shows up in the tooltip.

#### Parameters

- details
  object

- tabId
  number optional
  Limits the change to when a particular tab is selected. Automatically resets when the tab is closed.
- title
  string
  The string the action should display when moused over.

#### Returns

Promise<void>

## Events

### onClicked

```
chrome.action.onClicked.addListener(
  callback: function,
)
```

Fired when an action icon is clicked. This event will not fire if the action has a popup.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(tab: [tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)) => void
```

- tab
  [tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)

### onUserSettingsChanged

Chrome 130+

```
chrome.action.onUserSettingsChanged.addListener(
  callback: function,
)
```

Fired when user-specified settings relating to an extension's action change.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(change: [UserSettingsChange](#type-UserSettingsChange)) => void
```

- change
  [UserSettingsChange](#type-UserSettingsChange)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
