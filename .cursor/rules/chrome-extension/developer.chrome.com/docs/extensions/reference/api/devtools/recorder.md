## Description

Use the `chrome.devtools.recorder` API to customize the Recorder panel in DevTools.
`devtools.recorder` API is a preview feature that allows you to extend the [Recorder panel](/docs/devtools/recorder) in Chrome DevTools.
See [DevTools APIs summary](/docs/extensions/how-to/devtools/extend-devtools) for general introduction to using Developer Tools APIs.

## Availability

Chrome 105+
Starting from Chrome 105, you can extend the export functionality. Starting from Chrome 112, you can extend the replay button.

## Concepts and usage

### Customizing the export feature

To register an extension plugin, use the `registerRecorderExtensionPlugin` function. This function requires a plugin instance, a `name` and a `mediaType` as parameters. The plugin instance must implement two methods: `stringify` and `stringifyStep`.
The `name` provided by the extension shows up in the Export menu in the Recorder panel.
Depending on the export context, when the user clicks the export option provided by the extension,
the Recorder panel invokes one of the two functions:

- `stringify` that receives an [entire user flow recording](https://github.com/puppeteer/replay/blob/main/src/Schema.ts#L245)
- `stringifyStep` that receives a [single recorded step](https://github.com/puppeteer/replay/blob/main/src/Schema.ts#L243)
  The ``[mediaType](https://www.iana.org/assignments/media-types/media-types.xhtml) parameter allows the extension to specify the kind of output it generates with the
`stringify`and`stringifyStep`functions. For example,`application/javascript` if the result is a JavaScript
  program.

### Customizing the replay button

To customize the replay button in the Recorder, use the `registerRecorderExtensionPlugin` function. The plugin must implement the `replay` method for the customization to take effect.
If the method is detected, a replay button will appear in the Recorder.
Upon clicking the button, the current recording object will be passed as the first argument to the `replay` method.
At this point, the extension can display a `RecorderView` for handling the replay or use other extension APIs to process the replay request. To create a new `RecorderView`, invoke `chrome.devtools.recorder.createView`.

## Examples

### Export plugin

The following code implements an extension plugin that stringifes a recording using `JSON.stringify`:

```
class MyPlugin {
  stringify(recording) {
    return Promise.resolve(JSON.stringify(recording));
  }
  stringifyStep(step) {
    return Promise.resolve(JSON.stringify(step));
  }
}

chrome.devtools.recorder.registerRecorderExtensionPlugin(
  new MyPlugin(),
  /*name=*/'MyPlugin',
  /*mediaType=*/'application/json'
);

```

### Replay plugin

The following code implements an extension plugin that creates a dummy Recorder view and displays it upon a replay request:

```
const view = await chrome.devtools.recorder.createView(
  /* name= */ 'ExtensionName',
  /* pagePath= */ 'Replay.html'
);

let latestRecording;

view.onShown.addListener(() => {
  // Recorder has shown the view. Send additional data to the view if needed.
  chrome.runtime.sendMessage(JSON.stringify(latestRecording));
});

view.onHidden.addListener(() => {
  // Recorder has hidden the view.
});

export class RecorderPlugin {
  replay(recording) {
    // Share the data with the view.
    latestRecording = recording;
    // Request to show the view.
    view.show();
  }
}

chrome.devtools.recorder.registerRecorderExtensionPlugin(
  new RecorderPlugin(),
  /* name=*/ 'CoffeeTest'
);

```

Find [a complete extension example](https://github.com/puppeteer/replay/tree/main/examples/chrome-extension-replay) on GitHub.

## Types

### RecorderExtensionPlugin

A plugin interface that the Recorder panel invokes to customize the Recorder panel.

#### Properties

- replay
  voidChrome 112+

Allows the extension to implement custom replay functionality.

          The `replay` function looks like:

```
(recording: object) => {...}
```

- recording
  object
  A recording of the user interaction with the page. This should match [Puppeteer's recording schema](https://github.com/puppeteer/replay/blob/main/docs/api/interfaces/Schema.UserFlow.md).
- stringify
  void
  Converts a recording from the Recorder panel format into a string.

                            The `stringify` function looks like:

```
(recording: object) => {...}
```

- recording
  object
  A recording of the user interaction with the page. This should match [Puppeteer's recording schema](https://github.com/puppeteer/replay/blob/main/docs/api/interfaces/Schema.UserFlow.md).
- stringifyStep
  void
  Converts a step of the recording from the Recorder panel format into a string.

                            The `stringifyStep` function looks like:

```
(step: object) => {...}
```

- step
  object
  A step of the recording of a user interaction with the page. This should match [Puppeteer's step schema](https://github.com/puppeteer/replay/blob/main/docs/api/modules/Schema.md#step).

### RecorderView

Chrome 112+

Represents a view created by extension to be embedded inside the Recorder panel.

#### Properties

- onHidden
  Event<functionvoidvoid>
  Fired when the view is hidden.

                            The `onHidden.addListener` function looks like:

```
(callback: function) => {...}
```

- callback
  function

                            The `callback` parameter looks like:

```
() => void
```

- onShown
  Event<functionvoidvoid>
  Fired when the view is shown.

                            The `onShown.addListener` function looks like:

```
(callback: function) => {...}
```

- callback
  function

                            The `callback` parameter looks like:

```
() => void
```

- show
  void
  Indicates that the extension wants to show this view in the Recorder panel.

                            The `show` function looks like:

```
() => {...}
```

## Methods

### createView()

Chrome 112+

```
chrome.devtools.recorder.createView(
  title: string,
  pagePath: string,
): [RecorderView](#type-RecorderView)
```

Creates a view that can handle the replay. This view will be embedded inside the Recorder panel.

#### Parameters

- title
  string
  Title that is displayed next to the extension icon in the Developer Tools toolbar.
- pagePath
  string
  Path of the panel's HTML page relative to the extension directory.

#### Returns

[RecorderView](#type-RecorderView)

### registerRecorderExtensionPlugin()

```
chrome.devtools.recorder.registerRecorderExtensionPlugin(
  plugin: [RecorderExtensionPlugin](#type-RecorderExtensionPlugin),
  name: string,
  mediaType: string,
): void
```

Registers a Recorder extension plugin.

#### Parameters

- plugin
  [RecorderExtensionPlugin](#type-RecorderExtensionPlugin)
  An instance implementing the RecorderExtensionPlugin interface.
- name
  string
  The name of the plugin.
- mediaType
  string
  The media type of the string content that the plugin produces.
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
