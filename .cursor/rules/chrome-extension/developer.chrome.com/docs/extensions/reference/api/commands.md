## Description

Use the commands API to add keyboard shortcuts that trigger actions in your extension, for example, an action to open the browser action or send a command to the extension.

## Manifest

The following keys must be declared [in the manifest](/docs/extensions/mv3/manifest) to use this API.`"commands"`

## Concepts and usage

The Commands API allows extension developers to define specific commands, and
bind them to a default key combination. Each command an extension accepts must
be declared as properties of the `"commands"` object in the [extension's
manifest](/docs/extensions/reference/manifest).
The property key is used as the command's name. Command objects can take two
properties.`suggested_key`
An optional property that declares default keyboard shortcuts for the
command. If omitted, the command will be unbound. This property can either take
a string or an object value.

A string value specifies the default keyboard shortcut that should be
used across all platforms.

- An object value allows the extension developer to customize the
  keyboard shortcut for each platform. When providing platform-specific
  shortcuts, valid object properties are `default`, `chromeos`, `linux`,
  `mac`, and `windows`.
  See [Key combination requirements](#key-combinations) for additional
  details.`description`A string used to provide the user with a short description of the command's
  purpose. This string appears in extension keyboard shortcut management UI.
  Descriptions are required for standard commands, but are ignored for [Action
  commands](#action_commands).
  An extension can have many commands, but may specify at most four suggested
  keyboard shortcuts. The user can manually add more shortcuts from the
  `chrome://extensions/shortcuts` dialog.

### Supported Keys

The following keys are usable command shortcuts. Key definitions are case
sensitive. Attempting to load an extension with an incorrectly cased key will
result in a manifest parse error at installation time.Alpha keys`A` … `Z`Numeric keys`0` … `9`Standard key strings
General–`Comma`, `Period`, `Home`, `End`, `PageUp`, `PageDown`, `Space`,
`Insert`, `Delete`
Arrow keys–`Up`, `Down`, `Left`, `Right`
Media Keys–`MediaNextTrack`, `MediaPlayPause`, `MediaPrevTrack`, `MediaStop`Modifier key strings
`Ctrl`, `Alt`, `Shift`, `MacCtrl` (macOS only), `Option` (macOS only),
`Command` (macOS only), `Search` (ChromeOS only)

### Key combination requirements

Extension command shortcuts must include either `Ctrl` or `Alt`.

Modifiers cannot be used in combination with Media Keys.
On many macOS keyboards, `Alt` refers to the Option key.
On macOS, `Command` or `MacCtrl` can also be used in place of `Ctrl`,
and the `Option` key can be used in place of `Alt` (see next bullet
point).
On macOS `Ctrl` is automatically converted into `Command`.

`Command` can also be used in the `"mac"` shortcut to explicitly refer
to the Command key.
To use the Control key on macOS, replace `Ctrl` with `MacCtrl` when
defining the `"mac"` shortcut.
Using `MacCtrl` in the combination for another platform will cause a
validation error and prevent the extension from being installed.
`Shift` is an optional modifier on all platforms.
`Search` is an optional modifier exclusive to ChromeOS.
Certain operating system and Chrome shortcuts (e.g. window management)
always take priority over Extension command shortcuts and cannot be
overridden.Note: Key combinations that involve `Ctrl+Alt` are not permitted in order to avoid conflicts with the
`AltGr` key.

### Handle command events

manifest.json:

```
{
  "name": "My extension",
  ...
  "commands": {
    "run-foo": {
      "suggested_key": {
        "default": "Ctrl+Shift+Y",
        "mac": "Command+Shift+Y"
      },
      "description": "Run \"foo\" on the current page."
    },
    "_execute_action": {
      "suggested_key": {
        "windows": "Ctrl+Shift+Y",
        "mac": "Command+Shift+Y",
        "chromeos": "Ctrl+Shift+U",
        "linux": "Ctrl+Shift+J"
      }
    }
  },
  ...
}

```

In your service worker, you can bind a handler to each of the commands defined
in the manifest using `onCommand.addListener`. For example:
service-worker.js:

```
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`);
});

```

### Action commands

The `_execute_action` (Manifest V3), `_execute_browser_action` (Manifest V2),
and `_execute_page_action` (Manifest V2) commands are reserved for the action of
trigger your action, browser action, or page action respectively. These commands
don't dispatch [command.onCommand](#event-onCommand) events like standard
commands.
If you need to take action based on your popup opening, consider listening for a
[DOMContentLoaded](https://developer.mozilla.org/docs/Web/API/Window/DOMContentLoaded_event) event inside your popup's JavaScript.

### Scope

By default, commands are scoped to the Chrome browser. This means that when the
browser does not have focus, command shortcuts are inactive. Beginning in Chrome
35, extension developers can optionally mark a command as "global". Global
commands also work while Chrome does not have focus.Note: ChromeOS does not support global commands.
Keyboard shortcut suggestions for global commands are limited to
`Ctrl+Shift+[0..9]`. This is a protective measure to minimize the risk of
overriding shortcuts in other applications since if, for example, `Alt+P` were
to be allowed as global, the keyboard shortcut for opening a print dialog might
not work in other applications.
End users are free to remap global commands to their preferred key combination
using the UI exposed at `chrome://extensions/shortcuts`.
Example:
manifest.json:

```
{
  "name": "My extension",
  ...
  "commands": {
    "toggle-feature-foo": {
      "suggested_key": {
        "default": "Ctrl+Shift+5"
      },
      "description": "Toggle feature foo",
      "global": true
    }
  },
  ...
}

```

## Examples

The following examples flex the core functionality of the Commands API.

### Basic command

Commands allow extensions to map logic to keyboard shortcuts that can be invoked
by the user. At its most basic, a command only requires a command declaration in
the extension's manifest and a listener registration as shown in the following
example.
manifest.json:

```
{
  "name": "Command demo - basic",
  "version": "1.0",
  "manifest_version": 3,
  "background": {
    "service_worker": "service-worker.js"
  },
  "commands": {
    "inject-script": {
      "suggested_key": "Ctrl+Shift+Y",
      "description": "Inject a script on the page"
    }
  }
}

```

service-worker.js:

```
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" triggered`);
});

```

### Action command

As described in the [Concepts and usage](#concepts_and_usage) section, you can
also map a command to an extension's action. The following example injects a
content script that shows an alert on the current page when the user either
clicks the extension's action or triggers the keyboard shortcut.
manifest.json:

```
{
  "name": "Commands demo - action invocation",
  "version": "1.0",
  "manifest_version": 3,
  "background": {
    "service_worker": "service-worker.js"
  },
  "permissions": ["activeTab", "scripting"],
  "action": {},
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+U",
        "mac": "Command+U"
      }
    }
  }
}

```

service-worker.js:

```
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: contentScriptFunc,
    args: ['action'],
  });
});

function contentScriptFunc(name) {
  alert(`"${name}" executed`);
}

// This callback WILL NOT be called for "_execute_action"
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" called`);
});

```

### Verify commands registered

If an extension attempts to register a shortcut that is already used by another
extension, the second extension's shortcut won't register as expected. You can
provide a more robust end user experience by anticipating this possibility and
checking for collisions at install time.
service-worker.js:

```
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    checkCommandShortcuts();
  }
});

// Only use this function during the initial install phase. After
// installation the user may have intentionally unassigned commands.
function checkCommandShortcuts() {
  chrome.commands.getAll((commands) => {
    let missingShortcuts = [];

    for (let {name, shortcut} of commands) {
      if (shortcut === '') {
        missingShortcuts.push(name);
      }
    }

    if (missingShortcuts.length > 0) {
      // Update the extension UI to inform the user that one or more
      // commands are currently unassigned.
    }
  });
}

```

## Types

### Command

#### Properties

- description
  string optional
  The Extension Command description
- name
  string optional
  The name of the Extension Command
- shortcut
  string optional
  The shortcut active for this command, or blank if not active.

## Methods

### getAll()

```
chrome.commands.getAll(): Promise<[Command](#type-Command)[]>
```

Returns all the registered extension commands for this extension and their shortcut (if active). Before Chrome 110, this command did not return `_execute_action`.

#### Returns

Promise<[Command](#type-Command)[]>Chrome 96+

Resolves with a list of the registered commands.

## Events

### onCommand

```
chrome.commands.onCommand.addListener(
  callback: function,
)
```

Fired when a registered command is activated using a keyboard shortcut.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(command: string, tab?: [tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)) => void
```

- command
  string
- tab
  [tabs.Tab](https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab)optional
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-07 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
