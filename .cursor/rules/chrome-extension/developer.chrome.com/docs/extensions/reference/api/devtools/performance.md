## Description

Use the `chrome.devtools.performance` API to listen to recording status updates in the Performance panel in DevTools.
See [DevTools APIs summary](/docs/extensions/how-to/devtools/extend-devtools) for general introduction to using Developer Tools APIs.

## Availability

Chrome 129+
Starting from Chrome 128, you can listen to notifications of the recording status of the Performance panel.

## Concepts and usage

The chrome.devtools.performance API allows developers to interact with the recording features of the [Performance panel](/docs/devtools/performance) panel in Chrome DevTools. You can use this API to get notifications when recording starts or stops.
Two events are available:

- [onProfilingStarted](#event-onProfilingStarted): This event is fired when the Performance panel begins recording performance data.
- [onProfilingStopped](#event-onProfilingStopped): This event is fired when the Performance panel stops recording performance data.
  stance that associates the current stack trace with the cre
  Both events don't have any associated parameters.
  By listening to these events, developers can create extensions that react to the recording status in the Performance panel, providing additional automation during performance profiling.

## Examples

This is how you can use the API to listen to recording status updates

```

chrome.devtools.performance.onProfilingStarted.addListener(() => {
  // Profiling started listener implementation
});

chrome.devtools.performance.onProfilingStopped.addListener(() => {
  // Profiling stopped listener implementation
})

```

## Events

### onProfilingStarted

```
chrome.devtools.performance.onProfilingStarted.addListener(
  callback: function,
)
```

Fired when the Performance panel starts recording.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
() => void
```

### onProfilingStopped

```
chrome.devtools.performance.onProfilingStopped.addListener(
  callback: function,
)
```

Fired when the Performance panel stops recording.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
() => void
```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
