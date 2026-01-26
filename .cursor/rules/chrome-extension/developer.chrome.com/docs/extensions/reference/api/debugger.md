## Description

The `chrome.debugger` API serves as an alternate transport for Chrome's [remote debugging protocol](https://developer.chrome.com/devtools/docs/debugger-protocol). Use `chrome.debugger` to attach to one or more tabs to instrument network interaction, debug JavaScript, mutate the DOM and CSS, and more. Use the ``[Debuggee](#type-Debuggee) property `tabId`to target tabs with`sendCommand`and route events by`tabId`from`onEvent` callbacks.

## Permissions

`debugger`

You must declare the `"debugger"` permission in your extension's manifest to use this API.

```
{
  "name": "My extension",
  ...
  "permissions": [
    "debugger",
  ],
  ...
}

```

## Concepts and usage

Once attached, the `chrome.debugger` API lets you send [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
(CDP) commands to a given target. Explaining the CDP in depth is out of scope
for this documentation—to learn more about CDP check out the
[official CDP documentation](https://chromedevtools.github.io/devtools-protocol/).

### Targets

Targets represent something which is being debugged—this could include a tab,
an iframe or a worker. Each target is identified by a UUID and has an associated
type (such as `iframe`, `shared_worker`, and more).
Within a target, there may be multiple execution contexts—for example same
process iframes don't get a unique target but are instead represented as
different contexts that can be accessed from a single target.

### Restricted domains

For security reasons, the `chrome.debugger` API does not provide access to all Chrome DevTools
Protocol Domains. The available domains are: [Accessibility](https://chromedevtools.github.io/devtools-protocol/tot/Accessibility),
[Audits](https://chromedevtools.github.io/devtools-protocol/tot/Audits), [CacheStorage](https://chromedevtools.github.io/devtools-protocol/tot/CacheStorage), [Console](https://chromedevtools.github.io/devtools-protocol/tot/Console),
[CSS](https://chromedevtools.github.io/devtools-protocol/tot/CSS/), [Database](https://chromedevtools.github.io/devtools-protocol/tot/Database), [Debugger](https://chromedevtools.github.io/devtools-protocol/tot/Debugger), [DOM](https://chromedevtools.github.io/devtools-protocol/tot/DOM),
[DOMDebugger](https://chromedevtools.github.io/devtools-protocol/tot/DOMDebugger), [DOMSnapshot](https://chromedevtools.github.io/devtools-protocol/tot/DOMSnapshot),
[Emulation](https://chromedevtools.github.io/devtools-protocol/tot/Emulation), [Fetch](https://chromedevtools.github.io/devtools-protocol/tot/Fetch), [IO](https://chromedevtools.github.io/devtools-protocol/tot/IO), [Input](https://chromedevtools.github.io/devtools-protocol/tot/Input),
[Inspector](https://chromedevtools.github.io/devtools-protocol/tot/Inspector), [Log](https://chromedevtools.github.io/devtools-protocol/tot/Log), [Network](https://chromedevtools.github.io/devtools-protocol/tot/Network), [Overlay](https://chromedevtools.github.io/devtools-protocol/tot/Overlay),
[Page](https://chromedevtools.github.io/devtools-protocol/tot/Page), [Performance](https://chromedevtools.github.io/devtools-protocol/tot/Performance), [Profiler](https://chromedevtools.github.io/devtools-protocol/tot/Profiler),
[Runtime](https://chromedevtools.github.io/devtools-protocol/tot/Runtime), [Storage](https://chromedevtools.github.io/devtools-protocol/tot/Storage), [Target](https://chromedevtools.github.io/devtools-protocol/tot/Target), [Tracing](https://chromedevtools.github.io/devtools-protocol/tot/Tracing),
[WebAudio](https://chromedevtools.github.io/devtools-protocol/tot/WebAudio), and [WebAuthn](https://chromedevtools.github.io/devtools-protocol/tot/WebAuthn).

### Work with frames

There is not a one to one mapping of frames to targets. Within a single tab,
multiple same process frames may share the same target but use a different
[execution context](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#type-ExecutionContextId). On the other hand, a new target may be
created for an out-of-process iframe.
To attach to all frames, you need to handle each type of frame separately:

Listen for the `Runtime.executionContextCreated` event to identify new
execution contexts associated with same process frames.
Follow the steps to [attach to related targets](#attach_to_related_targets) to
identify out-of-process frames.

### Attach to related targets

After connecting to a target, you may want to connect to further related targets
including out-of-process child frames or associated workers.
Starting in Chrome 125, the `chrome.debugger` API supports flat sessions. This
lets you add additional targets as children to your main debugger session and
message them without needing another call to `chrome.debugger.attach`. Instead,
you can add a `sessionId` property when calling `chrome.debugger.sendCommand` to
identify the child target you would like to send a command to.
To automatically attach to out of process child frames, first add a listener for
the `Target.attachedToTarget` event:

```
chrome.debugger.onEvent.addListener((source, method, params) => {
  if (method === "Target.attachedToTarget") {
    // `source` identifies the parent session, but we need to construct a new
    // identifier for the child session
    const session = { ...source, sessionId: params.sessionId };

    // Call any needed CDP commands for the child session
    await chrome.debugger.sendCommand(session, "Runtime.enable");
  }
});

```

Then, enable [auto attach](https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-setAutoAttach) by sending the `Target.setAutoAttach` command with
the `flatten` option set to `true`:

```
await chrome.debugger.sendCommand({ tabId }, "Target.setAutoAttach", {
  autoAttach: true,
  waitForDebuggerOnStart: false,
  flatten: true,
  filter: [{ type: "iframe", exclude: false }]
});

```

Auto-attach only attaches to frames the target is aware of, which is limited to
frames which are immediate children of a frame associated with it. For example,
with the frame hierarchy A -> B -> C (where all are cross-origin), calling
`Target.setAutoAttach` for the target associated with A would result in the
session also being attached to B. However, this is not recursive, so
`Target.setAutoAttach` also needs to be called for B to attach the session to C.

## Examples

To try this API, install the [debugger API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/debugger) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.

## Types

### Debuggee

Debuggee identifier. Either tabId, extensionId or targetId must be specified

#### Properties

- extensionId
  string optional
  The id of the extension which you intend to debug. Attaching to an extension background page is only possible when the `--silent-debugger-extension-api` command-line switch is used.
- tabId
  number optional
  The id of the tab which you intend to debug.
- targetId
  string optional
  The opaque id of the debug target.

### DebuggerSession

Chrome 125+

Debugger session identifier. One of tabId, extensionId or targetId must be specified. Additionally, an optional sessionId can be provided. If sessionId is specified for arguments sent from `[onEvent](#event-onEvent), it means the event is coming from a child protocol session within the root debuggee session. If sessionId is specified when passed to `[sendCommand](#method-sendCommand), it targets a child protocol session within the root debuggee session.

#### Properties

- extensionId
  string optional
  The id of the extension which you intend to debug. Attaching to an extension background page is only possible when the `--silent-debugger-extension-api` command-line switch is used.
- sessionId
  string optional
  The opaque id of the Chrome DevTools Protocol session. Identifies a child session within the root session identified by tabId, extensionId or targetId.
- tabId
  number optional
  The id of the tab which you intend to debug.
- targetId
  string optional
  The opaque id of the debug target.

### DetachReason

Chrome 44+

Connection termination reason.

#### Enum

"target_closed"

"canceled_by_user"

### TargetInfo

Debug target information

#### Properties

- attached
  boolean
  True if debugger is already attached.
- extensionId
  string optional
  The extension id, defined if type = 'background_page'.
- faviconUrl
  string optional
  Target favicon URL.
- id
  string
  Target id.
- tabId
  number optional
  The tab id, defined if type == 'page'.
- title
  string
  Target page title.
- type
  [TargetInfoType](#type-TargetInfoType)
  Target type.
- url
  string
  Target URL.

### TargetInfoType

Chrome 44+

Target type.

#### Enum

"page"

"background_page"

"worker"

"other"

## Methods

### attach()

```
chrome.debugger.attach(
  target: [Debuggee](#type-Debuggee),
  requiredVersion: string,
): Promise<void>
```

Attaches debugger to the given target.

#### Parameters

- target
  [Debuggee](#type-Debuggee)
  Debugging target to which you want to attach.
- requiredVersion
  string
  Required debugging protocol version ("0.1"). One can only attach to the debuggee with matching major version and greater or equal minor version. List of the protocol versions can be obtained [here](https://developer.chrome.com/devtools/docs/debugger-protocol).

#### Returns

Promise<void>Chrome 96+

Resolves once the attach operation succeeds or fails. The promise resolves with no value. If the attach fails, the promise will be rejected.

### detach()

```
chrome.debugger.detach(
  target: [Debuggee](#type-Debuggee),
): Promise<void>
```

Detaches debugger from the given target.

#### Parameters

- target
  [Debuggee](#type-Debuggee)
  Debugging target from which you want to detach.

#### Returns

Promise<void>Chrome 96+

Resolves once the detach operation succeeds or fails. The promise resolves with no value. If the detach fails, the promise will be rejected.

### getTargets()

```
chrome.debugger.getTargets(): Promise<[TargetInfo](#type-TargetInfo)[]>
```

Returns the list of available debug targets.

#### Returns

Promise<[TargetInfo](#type-TargetInfo)[]>Chrome 96+

### sendCommand()

```
chrome.debugger.sendCommand(
  target: [DebuggerSession](#type-DebuggerSession),
  method: string,
  commandParams?: object,
): Promise<object | undefined>
```

Sends given command to the debugging target.

#### Parameters

- target
  [DebuggerSession](#type-DebuggerSession)
  Debugging target to which you want to send the command.
- method
  string
  Method name. Should be one of the methods defined by the [remote debugging protocol](https://developer.chrome.com/devtools/docs/debugger-protocol).
- commandParams
  object optional
  JSON object with request parameters. This object must conform to the remote debugging params scheme for given method.

#### Returns

Promise<object | undefined>Chrome 96+

Response body. If an error occurs while posting the message, the promise will be rejected.

## Events

### onDetach

```
chrome.debugger.onDetach.addListener(
  callback: function,
)
```

Fired when browser terminates debugging session for the tab. This happens when either the tab is being closed or Chrome DevTools is being invoked for the attached tab.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(source: [Debuggee](#type-Debuggee), reason: [DetachReason](#type-DetachReason)) => void
```

- source
  [Debuggee](#type-Debuggee)
- reason
  [DetachReason](#type-DetachReason)

### onEvent

```
chrome.debugger.onEvent.addListener(
  callback: function,
)
```

Fired whenever debugging target issues instrumentation event.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(source: [DebuggerSession](#type-DebuggerSession), method: string, params?: object) => void
```

- source
  [DebuggerSession](#type-DebuggerSession)
- method
  string
- params
  object optional
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-07 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
