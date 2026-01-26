extension APIs through a DevTools page added to the extension.DevTools extension architecture.
The DevTools-specific extension APIs include the following:

- ``[devtools.inspectedWindow](/docs/extensions/reference/devtools_inspectedWindow)
- ``[devtools.network](/docs/extensions/reference/devtools_network)
- ``[devtools.panels](/docs/extensions/reference/devtools_panels)
- ``[devtools.recorder](/docs/extensions/reference/devtools_recorder)
- ``[devtools.performance](/docs/extensions/reference/devtools_performance)

## The DevTools page

When a DevTools window opens, a DevTools extension creates an instance of its DevTools page that
exists as long as the window is open. This page has access to the DevTools APIs and extension APIs, and can do the following:

- Create and interact with panels using the ``[devtools.panels](/docs/extensions/reference/devtools_panels) APIs, including adding other extension pages as panels or sidebars to the DevTools window.
- Get information about the inspected window and evaluate code in the inspected window using the
  ``[devtools.inspectedWindow](/docs/extensions/reference/devtools_inspectedWindow) APIs.
- Get information about network requests using the ``[devtools.network](/docs/extensions/reference/devtools_network) APIs.
- Extend the [Recorder panel](/docs/devtools/recorder) using the ``[devtools.recorder](/docs/extensions/reference/devtools_recorder) APIs.
- Get information about the recording status of the [Performance panel](/docs/devtools/performance) using the ``[devtools.performance](/docs/extensions/reference/devtools_performance) APIs.
  The DevTools page can directly access extensions APIs. This includes being able
  to communicate with the service worker using
  [message passing](/docs/extensions/mv3/messaging).

## Create a DevTools extension

To create a DevTools page for your extension, add the `devtools_page` field in the extension
manifest:

```
{
  "name": ...
  "version": "1.0",
  "devtools_page": "devtools.html",
  ...
}

```

The `devtools_page` field must point to an HTML page. Because the DevTools
page must be local to your extension, we recommend specifying it using a relative URL.
The members of the `chrome.devtools` API are available only to the pages loaded within the DevTools
window while that window is open. Content scripts and other extension pages don't have access
to these APIs.

## DevTools UI elements: panels and sidebar panes

In addition to the usual extension UI elements, such as browser actions, context menus and popups, a
DevTools extension can add UI elements to the DevTools window:

- A panel is a top-level tab, like the Elements, Sources, and Network panels.
- A sidebar pane presents supplementary UI related to a panel. The Styles, Computed Styles, and
  Event Listeners panes on the Elements panel are examples of sidebar panes. Depending on the
  version of Chrome you're using and where the DevTools window is docked, your sidebar panes might
  look like the following example image:DevTools window showing Elements panel and Styles sidebar pane.
  Each panel is its own HTML file, which can include other resources (JavaScript, CSS, images, and so
  on). To create a basic panel, use the following code:

```
chrome.devtools.panels.create("My Panel",
    "MyPanelIcon.png",
    "Panel.html",
    function(panel) {
      // code invoked on panel creation
    }
);

```

JavaScript executed in a panel or sidebar pane has access to the same APIs as the DevTools page.
To create a basic sidebar pane, use the following code:

```
chrome.devtools.panels.elements.createSidebarPane("My Sidebar",
    function(sidebar) {
        // sidebar initialization code here
        sidebar.setObject({ some_data: "Some data to show" });
});

```

There are several ways to display content in a sidebar pane:

- HTML content: Call ``[setPage()](/docs/extensions/reference/devtools_panels#method-ExtensionSidebarPane-setPage) to specify an HTML page to display in the pane.
- JSON data: Pass a JSON object to ``[setObject()](/docs/extensions/reference/devtools_panels#method-ExtensionSidebarPane-setObject).
- JavaScript expression: Pass an expression to ``[setExpression()](/docs/extensions/reference/devtools_panels#method-ExtensionSidebarPane-setExpression). DevTools
evaluates the expression in the context of the inspected page, then displays the return value.
For both `setObject()`and`setExpression()`, the pane displays the value as it would appear in the
DevTools console. However, `setExpression()`lets you display DOM elements and arbitrary JavaScript
objects, while`setObject()` only supports JSON objects.

## Communicate between extension components

The following sections describe some helpful ways to allow DevTools extension components to
communicate with each other.

### Inject a content script

To inject a content script, use ``[scripting.executeScript()](/docs/extensions/reference/scripting#method-executeScript):

```
// DevTools page -- devtools.js
chrome.scripting.executeScript({
  target: {
    tabId: chrome.devtools.inspectedWindow.tabId
  },
  files: ["content_script.js"]
});

```

You can retrieve the tab ID of the inspected window using the
``[inspectedWindow.tabId](/docs/extensions/reference/devtools_inspectedWindow#property-tabId) property.
If a content script has already been injected, you can use messaging APIs to
communicate with it.

### Evaluate JavaScript in the inspected window

You can use the ``[inspectedWindow.eval()](/docs/extensions/reference/devtools_inspectedWindow#method-eval) method to execute JavaScript
code in the context of the inspected page. You can invoke the `eval()` method from a DevTools page,
panel, or sidebar pane.Caution: Use `eval()` only if you need access to the JavaScript content of an inspected page. Otherwise,
we recommend using the ``[scripting.executeScript()](/docs/extensions/reference/api/scripting#method-executeScript) method to run scripts.
For more information, see ``[inspectedWindow](/docs/extensions/reference/api/devtools/inspectedWindow).
By default, the expression is evaluated in the context of the main frame of the page.
`inspectedWindow.eval()`uses the same script execution context and options as code
entered in the DevTools console, which allows access to DevTools [Console Utilities
API](/docs/devtools/console/utilities) features when using`eval()`. For example, use it to inspect
the first script element within the `<head>` section of the HTML document:

```
chrome.devtools.inspectedWindow.eval(
  "inspect($$('head script')[0])",
  function(result, isException) { }
);

```

You can also set the `useContentScriptContext` to `true` when calling `inspectedWindow.eval()` to
evaluate the expression in the same context as the content scripts. To use this option, use a [static content script declaration](/docs/extensions/develop/concepts/content-scripts#static-declarative) before calling `eval()`, either by calling `executeScript()` or by specifying a content
script in the `manifest.json` file. After the context script context loads, you can also use this option to
inject additional content scripts.

### Pass the selected element to a content script

The content script doesn't have direct access to the current selected element. However, any code you
execute using ``[inspectedWindow.eval()](/docs/extensions/reference/devtools_inspectedWindow#method-eval) has access to the DevTools
console and Console Utilities APIs. For example, in evaluated code you can use `$0` to access the
selected element.
To pass the selected element to a content script:

Create a method in the content script that takes the selected element as an argument.

```
function setSelectedElement(el) {
    // do something with the selected element
}

```

Call the method from the DevTools page using ``[inspectedWindow.eval()](/docs/extensions/reference/devtools_inspectedWindow#method-eval)
with the `useContentScriptContext: true` option.

```
chrome.devtools.inspectedWindow.eval("setSelectedElement($0)",
    { useContentScriptContext: true });

```

The `useContentScriptContext: true` option specifies that the expression must be evaluated in the
same context as the content scripts, so it can access the `setSelectedElement` method.

### Get a reference panel's `window`

To call `postMessage()` from a devtools panel, you'll need a reference to its `window` object. Get a
panel's iframe window from the ``[panel.onShown](/docs/extensions/reference/devtools_panels#event-ExtensionPanel-onShown) event handler:

```
extensionPanel.onShown.addListener(function (extPanelWindow) {
    extPanelWindow instanceof Window; // true
    extPanelWindow.postMessage( // …
});

```

### Send messages from injected scripts to the DevTools page

Code injected directly into the page without a content script, including by appending a `<script>`
tag or calling `[inspectedWindow.eval()](/docs/extensions/reference/devtools_inspectedWindow#method-eval), can't send messages to the
DevTools page using `[runtime.sendMessage()](/docs/extensions/reference/runtime#method-sendMessage). Instead, we recommend
combining your injected script with a content script that can act as an intermediary, and using
the ``[window.postMessage()](https://developer.mozilla.org/docs/Web/API/Window.postMessage) method. The following example uses the background script
from the previous section:

```
// injected-script.js

window.postMessage({
  greeting: 'hello there!',
  source: 'my-devtools-extension'
}, '*');

```

```
// content-script.js

window.addEventListener('message', function(event) {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  var message = event.data;

  // Only accept messages that we know are ours. Note that this is not foolproof
  // and the page can easily spoof messages if it wants to.
  if (typeof message !== 'object' || message === null ||
      message.source !== 'my-devtools-extension') {
    return;
  }

  chrome.runtime.sendMessage(message);
});

```

Other alternative message-passing techniques can be found [on GitHub](https://github.com/GoogleChrome/devtools-docs/issues/143).

### Detect when DevTools opens and closes

To track whether the DevTools window is open, add an [onConnect](/docs/extensions/reference/runtime#event-onConnect) listener
to the service worker and call [connect()](/docs/extensions/reference/runtime#method-connect) from the DevTools page. Because
each tab can have its own DevTools window open, you might receive multiple connect events.
To track whether any DevTools window is open, count the connect and disconnect events as shown
in the following example:

```
// background.js
var openCount = 0;
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == "devtools-page") {
      if (openCount == 0) {
        alert("DevTools window opening.");
      }
      openCount++;

      port.onDisconnect.addListener(function(port) {
          openCount--;
          if (openCount == 0) {
            alert("Last DevTools window closing.");
          }
      });
    }
});

```

The DevTools page creates a connection like this:

```
// devtools.js

// Create a connection to the service worker
const serviceWorkerConnection = chrome.runtime.connect({
    name: "devtools-page"
});

// Send a periodic heartbeat to keep the port open.
setInterval(() => {
  port.postMessage("heartbeat");
}, 15000);

```

## DevTools extension examples

The examples on this page come from the following pages:

- [Polymer Devtools Extension](https://github.com/PolymerLabs/polymer-devtools-extension) - Uses many helpers running in the host page to query
  DOM/JS state to send back to the custom panel.
- [React DevTools Extension](https://github.com/facebook/react/tree/main/scripts/devtools) - Uses a submodule of the renderer to reuse DevTools UI
  components.
- [Ember Inspector](https://github.com/emberjs/ember-inspector) - Shared extension core with adapters for both Chrome and Firefox.
- [Coquette-inspect](https://github.com/thomasboyt/coquette-inspect) - A clean React-based extension with a debugging agent injected
  into the host page.
- [Sample Extensions](/docs/extensions/samples) have more worthwhile extensions to install, try out, and learn
  from.

## More information

For information on the standard APIs that extensions can use, see [chrome.\* APIs](/docs/extensions/reference) and [web
APIs](https://developer.mozilla.org/docs/Web/API).
[Give us feedback!](https://groups.google.com/g/google-chrome-developer-tools) Your comments and suggestions help us improve the APIs.

## Examples

You can find examples that use DevTools APIs in [Samples](/docs/extensions/samples).
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2012-09-17 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2012-09-17 UTC."],[],[]]
