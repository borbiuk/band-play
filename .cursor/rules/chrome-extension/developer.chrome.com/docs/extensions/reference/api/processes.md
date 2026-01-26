## Description

Use the `chrome.processes` API to interact with the browser's processes.

## Permissions

`processes`

## Availability

        Dev channel

## Types

### Cache

#### Properties

- liveSize
  number
  The part of the cache that is utilized, in bytes.
- size
  number
  The size of the cache, in bytes.

### Process

#### Properties

- cpu
  number optional
  The most recent measurement of the process's CPU usage, expressed as the percentage of a single CPU core used in total, by all of the process's threads. This gives a value from zero to CpuInfo.numOfProcessors\*100, which can exceed 100% in multi-threaded processes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
- cssCache
  [Cache](#type-Cache)optional
  The most recent information about the CSS cache for the process. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
- id
  number
  Unique ID of the process provided by the browser.
- imageCache
  [Cache](#type-Cache)optional
  The most recent information about the image cache for the process. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
- jsMemoryAllocated
  number optional
  The most recent measurement of the process JavaScript allocated memory, in bytes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
- jsMemoryUsed
  number optional
  The most recent measurement of the process JavaScript memory used, in bytes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
- naclDebugPort
  number
  The debugging port for Native Client processes. Zero for other process types and for NaCl processes that do not have debugging enabled.
- network
  number optional
  The most recent measurement of the process network usage, in bytes per second. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
- osProcessId
  number
  The ID of the process, as provided by the OS.
- privateMemory
  number optional
  The most recent measurement of the process private memory usage, in bytes. Only available when receiving the object as part of a callback from onUpdatedWithMemory or getProcessInfo with the includeMemory flag.
- profile
  string
  The profile which the process is associated with.
- scriptCache
  [Cache](#type-Cache)optional
  The most recent information about the script cache for the process. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
- sqliteMemory
  number optional
  The most recent measurement of the process's SQLite memory usage, in bytes. Only available when receiving the object as part of a callback from onUpdated or onUpdatedWithMemory.
- tasks
  [TaskInfo](#type-TaskInfo)[]
  Array of TaskInfos representing the tasks running on this process.
- type
  [ProcessType](#type-ProcessType)
  The type of process.

### ProcessType

The types of the browser processes.

#### Enum

"browser"

"renderer"

"extension"

"notification"

"plugin"

"worker"
Obsolete, will never be returned.
"nacl"

"service_worker"
Obsolete, will never be returned.
"utility"

"gpu"

"other"

### TaskInfo

#### Properties

- tabId
  number optional
  Optional tab ID, if this task represents a tab running on a renderer process.
- title
  string
  The title of the task.

## Methods

### getProcessIdForTab()

```
chrome.processes.getProcessIdForTab(
  tabId: number,
): Promise<number>
```

Returns the ID of the renderer process for the specified tab.

#### Parameters

- tabId
  number
  The ID of the tab for which the renderer process ID is to be returned.

#### Returns

Promise<number>
A callback to return the ID of the renderer process of a tab.

### getProcessInfo()

```
chrome.processes.getProcessInfo(
  processIds: number | number[],
  includeMemory: boolean,
): Promise<object>
```

Retrieves the process information for each process ID specified.

#### Parameters

- processIds
  number | number[]
  The list of process IDs or single process ID for which to return the process information. An empty list indicates all processes are requested.
- includeMemory
  boolean
  True if detailed memory usage is required. Note, collecting memory usage information incurs extra CPU usage and should only be queried for when needed.

#### Returns

Promise<object>
A callback called when the processes information is collected.

### terminate()

```
chrome.processes.terminate(
  processId: number,
): Promise<boolean>
```

Terminates the specified renderer process. Equivalent to visiting about:crash, but without changing the tab's URL.

#### Parameters

- processId
  number
  The ID of the process to be terminated.

#### Returns

Promise<boolean>
A callback to report the status of the termination.

## Events

### onCreated

```
chrome.processes.onCreated.addListener(
  callback: function,
)
```

Fired each time a process is created, providing the corrseponding Process object.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(process: [Process](#type-Process)) => void
```

- process
  [Process](#type-Process)

### onExited

```
chrome.processes.onExited.addListener(
  callback: function,
)
```

Fired each time a process is terminated, providing the type of exit.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(processId: number, exitType: number, exitCode: number) => void
```

- processId
  number
- exitType
  number
- exitCode
  number

### onUnresponsive

```
chrome.processes.onUnresponsive.addListener(
  callback: function,
)
```

Fired each time a process becomes unresponsive, providing the corrseponding Process object.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(process: [Process](#type-Process)) => void
```

- process
  [Process](#type-Process)

### onUpdated

```
chrome.processes.onUpdated.addListener(
  callback: function,
)
```

Fired each time the Task Manager updates its process statistics, providing the dictionary of updated Process objects, indexed by process ID.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(processes: object) => void
```

- processes
  object

### onUpdatedWithMemory

```
chrome.processes.onUpdatedWithMemory.addListener(
  callback: function,
)
```

Fired each time the Task Manager updates its process statistics, providing the dictionary of updated Process objects, indexed by process ID. Identical to onUpdate, with the addition of memory usage details included in each Process object. Note, collecting memory usage information incurs extra CPU usage and should only be listened for when needed.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(processes: object) => void
```

- processes
  object
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-07 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
