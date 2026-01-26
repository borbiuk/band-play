## Description

Use the `chrome.downloads` API to programmatically initiate, monitor, manipulate, and search for downloads.

## Permissions

`downloads`

You must declare the `"downloads"` permission in the [extension manifest](/docs/extensions/reference/manifest) to use this API.

```
{
  "name": "My extension",
  ...
  "permissions": [
    "downloads"
  ],
}

```

## Examples

You can find simple examples of using the `chrome.downloads` API in the [examples/api/downloads](https://github.com/GoogleChrome/chrome-extensions-samples/tree/master/_archive/mv2/api/downloads/)
directory. For other examples and for help in viewing the source code, see [Samples](/docs/extensions/mv2/samples).

## Types

### BooleanDelta

#### Properties

- current
  boolean optional
- previous
  boolean optional

### DangerType

#### Enum

"file"
The download's filename is suspicious.
"url"
The download's URL is known to be malicious.
"content"
The downloaded file is known to be malicious.
"uncommon"
The download's URL is not commonly downloaded and could be dangerous.
"host"
The download came from a host known to distribute malicious binaries and is likely dangerous.
"unwanted"
The download is potentially unwanted or unsafe. E.g. it could make changes to browser or computer settings.
"safe"
The download presents no known danger to the user's computer.
"accepted"
The user has accepted the dangerous download.
"allowlistedByPolicy"
Enterprise-related values.
"asyncScanning"

"asyncLocalPasswordScanning"

"passwordProtected"

"blockedTooLarge"

"sensitiveContentWarning"

"sensitiveContentBlock"

"deepScannedFailed"

"deepScannedSafe"

"deepScannedOpenedDangerous"

"promptForScanning"

"promptForLocalPasswordScanning"

"accountCompromise"

"blockedScanFailed"

"forceSaveToGdrive"
For use by the Secure Enterprise Browser extension. When required, Chrome will block the download to disc and download the file directly to Google Drive.
"forceSaveToOnedrive"
For use by the Secure Enterprise Browser extension. When required, Chrome will block the download to disc and download the file directly to OneDrive.

### DoubleDelta

#### Properties

- current
  number optional
- previous
  number optional

### DownloadDelta

#### Properties

- canResume
  [BooleanDelta](#type-BooleanDelta)optional
  The change in `canResume`, if any.
- danger
  [StringDelta](#type-StringDelta)optional
  The change in `danger`, if any.
- endTime
  [StringDelta](#type-StringDelta)optional
  The change in `endTime`, if any.
- error
  [StringDelta](#type-StringDelta)optional
  The change in `error`, if any.
- exists
  [BooleanDelta](#type-BooleanDelta)optional
  The change in `exists`, if any.
- fileSize
  [DoubleDelta](#type-DoubleDelta)optional
  The change in `fileSize`, if any.
- filename
  [StringDelta](#type-StringDelta)optional
  The change in `filename`, if any.
- finalUrl
  [StringDelta](#type-StringDelta)optionalChrome 54+

The change in `finalUrl`, if any.

- id
  number
  The `id` of the ``[DownloadItem](#type-DownloadItem) that changed.
- mime
  [StringDelta](#type-StringDelta)optional
  The change in `mime`, if any.
- paused
  [BooleanDelta](#type-BooleanDelta)optional
  The change in `paused`, if any.
- startTime
  [StringDelta](#type-StringDelta)optional
  The change in `startTime`, if any.
- state
  [StringDelta](#type-StringDelta)optional
  The change in `state`, if any.
- totalBytes
  [DoubleDelta](#type-DoubleDelta)optional
  The change in `totalBytes`, if any.
- url
  [StringDelta](#type-StringDelta)optional
  The change in `url`, if any.

### DownloadItem

#### Properties

- byExtensionId
  string optional
  The identifier for the extension that initiated this download if this download was initiated by an extension. Does not change once it is set.
- byExtensionName
  string optional
  The localized name of the extension that initiated this download if this download was initiated by an extension. May change if the extension changes its name or if the user changes their locale.
- bytesReceived
  number
  Number of bytes received so far from the host, without considering file compression.
- canResume
  boolean
  True if the download is in progress and paused, or else if it is interrupted and can be resumed starting from where it was interrupted.
- danger
  [DangerType](#type-DangerType)
  Indication of whether this download is thought to be safe or known to be suspicious.
- endTime
  string optional
  The time when the download ended in ISO 8601 format. May be passed directly to the Date constructor: `chrome.downloads.search({}, function(items){items.forEach(function(item){if (item.endTime) console.log(new Date(item.endTime))})})`
- error
  [InterruptReason](#type-InterruptReason)optional
  Why the download was interrupted. Several kinds of HTTP errors may be grouped under one of the errors beginning with `SERVER_`. Errors relating to the network begin with `NETWORK_`, errors relating to the process of writing the file to the file system begin with `FILE_`, and interruptions initiated by the user begin with `USER_`.
- estimatedEndTime
  string optional
  Estimated time when the download will complete in ISO 8601 format. May be passed directly to the Date constructor: `chrome.downloads.search({}, function(items){items.forEach(function(item){if (item.estimatedEndTime) console.log(new Date(item.estimatedEndTime))})})`
- exists
  boolean
  Whether the downloaded file still exists. This information may be out of date because Chrome does not automatically watch for file removal. Call `[search](#method-search)() in order to trigger the check for file existence. When the existence check completes, if the file has been deleted, then an `[onChanged](#event-onChanged) event will fire. Note that `[search](#method-search)() does not wait for the existence check to finish before returning, so results from `[search](#method-search)() may not accurately reflect the file system. Also, ``[search](#method-search)() may be called as often as necessary, but will not check for file existence any more frequently than once every 10 seconds.
- fileSize
  number
  Number of bytes in the whole file post-decompression, or -1 if unknown.
- filename
  string
  Absolute local path.
- finalUrl
  stringChrome 54+

The absolute URL that this download is being made from, after all redirects.

- id
  number
  An identifier that is persistent across browser sessions.
- incognito
  boolean
  False if this download is recorded in the history, true if it is not recorded.
- mime
  string
  The file's MIME type.
- paused
  boolean
  True if the download has stopped reading data from the host, but kept the connection open.
- referrer
  string
  Absolute URL.
- startTime
  string
  The time when the download began in ISO 8601 format. May be passed directly to the Date constructor: `chrome.downloads.search({}, function(items){items.forEach(function(item){console.log(new Date(item.startTime))})})`
- state
  [State](#type-State)
  Indicates whether the download is progressing, interrupted, or complete.
- totalBytes
  number
  Number of bytes in the whole file, without considering file compression, or -1 if unknown.
- url
  string
  The absolute URL that this download initiated from, before any redirects.

### DownloadOptions

#### Properties

- body
  string optional
  Post body.
- conflictAction
  [FilenameConflictAction](#type-FilenameConflictAction)optional
  The action to take if `filename` already exists.
- filename
  string optional
  A file path relative to the Downloads directory to contain the downloaded file, possibly containing subdirectories. Absolute paths, empty paths, and paths containing back-references ".." will cause an error. ``[onDeterminingFilename](#event-onDeterminingFilename) allows suggesting a filename after the file's MIME type and a tentative filename have been determined.
- headers
  [HeaderNameValuePair](#type-HeaderNameValuePair)[] optional
  Extra HTTP headers to send with the request if the URL uses the HTTP[s] protocol. Each header is represented as a dictionary containing the keys `name` and either `value` or `binaryValue`, restricted to those allowed by XMLHttpRequest.
- method
  [HttpMethod](#type-HttpMethod)optional
  The HTTP method to use if the URL uses the HTTP[S] protocol.
- saveAs
  boolean optional
  Use a file-chooser to allow the user to select a filename regardless of whether `filename` is set or already exists.
- url
  string
  The URL to download.

### DownloadQuery

#### Properties

- bytesReceived
  number optional
  Number of bytes received so far from the host, without considering file compression.
- danger
  [DangerType](#type-DangerType)optional
  Indication of whether this download is thought to be safe or known to be suspicious.
- endTime
  string optional
  The time when the download ended in ISO 8601 format.
- endedAfter
  string optional
  Limits results to ``[DownloadItem](#type-DownloadItem) that ended after the given ms in ISO 8601 format
- endedBefore
  string optional
  Limits results to ``[DownloadItem](#type-DownloadItem) that ended before the given ms in ISO 8601 format.
- error
  [InterruptReason](#type-InterruptReason)optional
  Why a download was interrupted.
- exists
  boolean optional
  Whether the downloaded file exists;
- fileSize
  number optional
  Number of bytes in the whole file post-decompression, or -1 if unknown.
- filename
  string optional
  Absolute local path.
- filenameRegex
  string optional
  Limits results to ``[DownloadItem](#type-DownloadItem) whose `filename` matches the given regular expression.
- finalUrl
  string optionalChrome 54+

The absolute URL that this download is being made from, after all redirects.

- finalUrlRegex
  string optionalChrome 54+

Limits results to ``[DownloadItem](#type-DownloadItem) whose `finalUrl` matches the given regular expression.

- id
  number optional
  The `id` of the ``[DownloadItem](#type-DownloadItem) to query.
- limit
  number optional
  The maximum number of matching `[DownloadItem](#type-DownloadItem) returned. Defaults to 1000. Set to 0 in order to return all matching `[DownloadItem](#type-DownloadItem). See ``[search](#method-search) for how to page through results.
- mime
  string optional
  The file's MIME type.
- orderBy
  string[] optional
  Set elements of this array to ``[DownloadItem](#type-DownloadItem) properties in order to sort search results. For example, setting `orderBy=['startTime']` sorts the ``[DownloadItem](#type-DownloadItem) by their start time in ascending order. To specify descending order, prefix with a hyphen: '-startTime'.
- paused
  boolean optional
  True if the download has stopped reading data from the host, but kept the connection open.
- query
  string[] optional
  This array of search terms limits results to ``[DownloadItem](#type-DownloadItem) whose `filename`or`url`or`finalUrl` contain all of the search terms that do not begin with a dash '-' and none of the search terms that do begin with a dash.
- startTime
  string optional
  The time when the download began in ISO 8601 format.
- startedAfter
  string optional
  Limits results to ``[DownloadItem](#type-DownloadItem) that started after the given ms in ISO 8601 format.
- startedBefore
  string optional
  Limits results to ``[DownloadItem](#type-DownloadItem) that started before the given ms in ISO 8601 format.
- state
  [State](#type-State)optional
  Indicates whether the download is progressing, interrupted, or complete.
- totalBytes
  number optional
  Number of bytes in the whole file, without considering file compression, or -1 if unknown.
- totalBytesGreater
  number optional
  Limits results to ``[DownloadItem](#type-DownloadItem) whose `totalBytes` is greater than the given integer.
- totalBytesLess
  number optional
  Limits results to ``[DownloadItem](#type-DownloadItem) whose `totalBytes` is less than the given integer.
- url
  string optional
  The absolute URL that this download initiated from, before any redirects.
- urlRegex
  string optional
  Limits results to ``[DownloadItem](#type-DownloadItem) whose `url` matches the given regular expression.

### FilenameConflictAction

uniquify
To avoid duplication, the `filename` is changed to include a counter before the filename extension.
overwrite
The existing file will be overwritten with the new file.
prompt
The user will be prompted with a file chooser dialog.

#### Enum

"uniquify"

"overwrite"

"prompt"

### FilenameSuggestion

#### Properties

- conflictAction
  [FilenameConflictAction](#type-FilenameConflictAction)optional
  The action to take if `filename` already exists.
- filename
  string
  The `[DownloadItem](#type-DownloadItem)'s new target `[DownloadItem.filename](#property-DownloadItem-filename), as a path relative to the user's default Downloads directory, possibly containing subdirectories. Absolute paths, empty paths, and paths containing back-references ".." will be ignored. `filename` is ignored if there are any ``[onDeterminingFilename](#event-onDeterminingFilename) listeners registered by any extensions.

### GetFileIconOptions

#### Properties

- size
  number optional
  The size of the returned icon. The icon will be square with dimensions size \* size pixels. The default and largest size for the icon is 32x32 pixels. The only supported sizes are 16 and 32. It is an error to specify any other size.

### HeaderNameValuePair

#### Properties

- name
  string
  Name of the HTTP header.
- value
  string
  Value of the HTTP header.

### HttpMethod

#### Enum

"GET"

"POST"

### InterruptReason

#### Enum

"FILE_FAILED"

"FILE_ACCESS_DENIED"

"FILE_NO_SPACE"

"FILE_NAME_TOO_LONG"

"FILE_TOO_LARGE"

"FILE_VIRUS_INFECTED"

"FILE_TRANSIENT_ERROR"

"FILE_BLOCKED"

"FILE_SECURITY_CHECK_FAILED"

"FILE_TOO_SHORT"

"FILE_HASH_MISMATCH"

"FILE_SAME_AS_SOURCE"

"NETWORK_FAILED"

"NETWORK_TIMEOUT"

"NETWORK_DISCONNECTED"

"NETWORK_SERVER_DOWN"

"NETWORK_INVALID_REQUEST"

"SERVER_FAILED"

"SERVER_NO_RANGE"

"SERVER_BAD_CONTENT"

"SERVER_UNAUTHORIZED"

"SERVER_CERT_PROBLEM"

"SERVER_FORBIDDEN"

"SERVER_UNREACHABLE"

"SERVER_CONTENT_LENGTH_MISMATCH"

"SERVER_CROSS_ORIGIN_REDIRECT"

"USER_CANCELED"

"USER_SHUTDOWN"

"CRASH"

### State

in_progress
The download is currently receiving data from the server.
interrupted
An error broke the connection with the file host.
complete
The download completed successfully.

#### Enum

"in_progress"

"interrupted"

"complete"

### StringDelta

#### Properties

- current
  string optional
- previous
  string optional

### UiOptions

Chrome 105+

#### Properties

- enabled
  boolean
  Enable or disable the download UI.

## Methods

### acceptDanger()

```
chrome.downloads.acceptDanger(
  downloadId: number,
): Promise<void>
```

Prompt the user to accept a dangerous download. Can only be called from a visible context (tab, window, or page/browser action popup). Does not automatically accept dangerous downloads. If the download is accepted, then an ``[onChanged](#event-onChanged) event will fire, otherwise nothing will happen. When all the data is fetched into a temporary file and either the download is not dangerous or the danger has been accepted, then the temporary file is renamed to the target filename, the `state` changes to 'complete', and ``[onChanged](#event-onChanged) fires.

#### Parameters

- downloadId
  number
  The identifier for the ``[DownloadItem](#type-DownloadItem).

#### Returns

Promise<void>Chrome 96+

Returns a Promise which resolves when the danger prompt dialog closes.

### cancel()

```
chrome.downloads.cancel(
  downloadId: number,
): Promise<void>
```

Cancel a download. When `callback` is run, the download is cancelled, completed, interrupted or doesn't exist anymore.

#### Parameters

- downloadId
  number
  The id of the download to cancel.

#### Returns

Promise<void>Chrome 96+

Returns a Promise which resolves when the cancel request is completed.

### download()

```
chrome.downloads.download(
  options: [DownloadOptions](#type-DownloadOptions),
): Promise<number>
```

Download a URL. If the URL uses the HTTP[S] protocol, then the request will include all cookies currently set for its hostname. If both `filename` and `saveAs` are specified, then the Save As dialog will be displayed, pre-populated with the specified `filename`. If the download started successfully, `callback` will be called with the new ``[DownloadItem](#type-DownloadItem)'s `downloadId`. If there was an error starting the download, then `callback` will be called with `downloadId=undefined` and ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will contain a descriptive string. The error strings are not guaranteed to remain backwards compatible between releases. Extensions must not parse it.

#### Parameters

- options
  [DownloadOptions](#type-DownloadOptions)
  What to download and how.

#### Returns

Promise<number>Chrome 96+

Returns a Promise which resolves with the id of the new ``[DownloadItem](#type-DownloadItem).

### erase()

```
chrome.downloads.erase(
  query: [DownloadQuery](#type-DownloadQuery),
): Promise<number[]>
```

Erase matching `[DownloadItem](#type-DownloadItem) from history without deleting the downloaded file. An `[onErased](#event-onErased) event will fire for each ``[DownloadItem](#type-DownloadItem) that matches `query`, then `callback` will be called.

#### Parameters

- query
  [DownloadQuery](#type-DownloadQuery)

#### Returns

Promise<number[]>Chrome 96+

### getFileIcon()

```
chrome.downloads.getFileIcon(
  downloadId: number,
  options?: [GetFileIconOptions](#type-GetFileIconOptions),
): Promise<string | undefined>
```

Retrieve an icon for the specified download. For new downloads, file icons are available after the `[onCreated](#event-onCreated) event has been received. The image returned by this function while a download is in progress may be different from the image returned after the download is complete. Icon retrieval is done by querying the underlying operating system or toolkit depending on the platform. The icon that is returned will therefore depend on a number of factors including state of the download, platform, registered file types and visual theme. If a file icon cannot be determined, `[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will contain an error message.

#### Parameters

- downloadId
  number
  The identifier for the download.
- options
  [GetFileIconOptions](#type-GetFileIconOptions)optional

#### Returns

Promise<string | undefined>Chrome 96+

Returns a Promise which resolves with a URL to an image that represents the download.

### open()

```
chrome.downloads.open(
  downloadId: number,
): Promise<void>
```

Opens the downloaded file now if the `[DownloadItem](#type-DownloadItem) is complete; otherwise returns an error through `[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError). This method requires the `"downloads.open"` permission in addition to the `"downloads"` permission. An ``[onChanged](#event-onChanged) event fires when the item is opened for the first time. This method can only be called in response to a user gesture.

#### Parameters

- downloadId
  number
  The identifier for the downloaded file.

#### Returns

Promise<void>Chrome 123+

### pause()

```
chrome.downloads.pause(
  downloadId: number,
): Promise<void>
```

Pause the download. If the request was successful the download is in a paused state. Otherwise ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) contains an error message. The request will fail if the download is not active.

#### Parameters

- downloadId
  number
  The id of the download to pause.

#### Returns

Promise<void>Chrome 96+

Returns a Promise which resolves when the pause request is completed.

### removeFile()

```
chrome.downloads.removeFile(
  downloadId: number,
): Promise<void>
```

Remove the downloaded file if it exists and the `[DownloadItem](#type-DownloadItem) is complete; otherwise return an error through `[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError).

#### Parameters

- downloadId
  number

#### Returns

Promise<void>Chrome 96+

### resume()

```
chrome.downloads.resume(
  downloadId: number,
): Promise<void>
```

Resume a paused download. If the request was successful the download is in progress and unpaused. Otherwise ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) contains an error message. The request will fail if the download is not active.

#### Parameters

- downloadId
  number
  The id of the download to resume.

#### Returns

Promise<void>Chrome 96+

Returns a Promise which resolves when the resume request is completed.

### search()

```
chrome.downloads.search(
  query: [DownloadQuery](#type-DownloadQuery),
): Promise<[DownloadItem](#type-DownloadItem)[]>
```

Find ``[DownloadItem](#type-DownloadItem). Set `query` to the empty object to get all ``[DownloadItem](#type-DownloadItem). To get a specific ``[DownloadItem](#type-DownloadItem), set only the `id`field. To page through a large number of items, set`orderBy: ['-startTime']`, set `limit`to the number of items per page, and set`startedAfter`to the`startTime` of the last item from the last page.

#### Parameters

- query
  [DownloadQuery](#type-DownloadQuery)

#### Returns

Promise<[DownloadItem](#type-DownloadItem)[]>Chrome 96+

### setShelfEnabled()

        Deprecated since Chrome 117

```
chrome.downloads.setShelfEnabled(
  enabled: boolean,
): void
```

Use ``[setUiOptions](#method-setUiOptions) instead.

Enable or disable the gray shelf at the bottom of every window associated with the current browser profile. The shelf will be disabled as long as at least one extension has disabled it. Enabling the shelf while at least one other extension has disabled it will return an error through ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError). Requires the `"downloads.shelf"`permission in addition to the`"downloads"` permission.

#### Parameters

- enabled
  boolean

### setUiOptions()

Chrome 105+

```
chrome.downloads.setUiOptions(
  options: [UiOptions](#type-UiOptions),
): Promise<void>
```

Change the download UI of every window associated with the current browser profile. As long as at least one extension has set `[UiOptions.enabled](#property-UiOptions-enabled) to false, the download UI will be hidden. Setting `[UiOptions.enabled](#property-UiOptions-enabled) to true while at least one other extension has disabled it will return an error through ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError). Requires the `"downloads.ui"`permission in addition to the`"downloads"` permission.

#### Parameters

- options
  [UiOptions](#type-UiOptions)
  Encapsulate a change to the download UI.

#### Returns

Promise<void>
Returns a Promise which resolves when the UI update is completed.

### show()

```
chrome.downloads.show(
  downloadId: number,
): void
```

Show the downloaded file in its folder in a file manager.

#### Parameters

- downloadId
  number
  The identifier for the downloaded file.

### showDefaultFolder()

```
chrome.downloads.showDefaultFolder(): void
```

Show the default Downloads folder in a file manager.

## Events

### onChanged

```
chrome.downloads.onChanged.addListener(
  callback: function,
)
```

When any of a ``[DownloadItem](#type-DownloadItem)'s properties except `bytesReceived`and`estimatedEndTime`changes, this event fires with the`downloadId` and an object containing the properties that changed.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(downloadDelta: [DownloadDelta](#type-DownloadDelta)) => void
```

- downloadDelta
  [DownloadDelta](#type-DownloadDelta)

### onCreated

```
chrome.downloads.onCreated.addListener(
  callback: function,
)
```

This event fires with the ``[DownloadItem](#type-DownloadItem) object when a download begins.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(downloadItem: [DownloadItem](#type-DownloadItem)) => void
```

- downloadItem
  [DownloadItem](#type-DownloadItem)

### onDeterminingFilename

```
chrome.downloads.onDeterminingFilename.addListener(
  callback: function,
)
```

During the filename determination process, extensions will be given the opportunity to override the target ``[DownloadItem.filename](#property-DownloadItem-filename). Each extension may not register more than one listener for this event. Each listener must call `suggest` exactly once, either synchronously or asynchronously. If the listener calls `suggest` asynchronously, then it must return `true`. If the listener neither calls `suggest` synchronously nor returns `true`, then `suggest` will be called automatically. The ``[DownloadItem](#type-DownloadItem) will not complete until all listeners have called `suggest`. Listeners may call `suggest` without any arguments in order to allow the download to use `downloadItem.filename` for its filename, or pass a `suggestion` object to `suggest` in order to override the target filename. If more than one extension overrides the filename, then the last extension installed whose listener passes a `suggestion` object to `suggest` wins. In order to avoid confusion regarding which extension will win, users should not install extensions that may conflict. If the download is initiated by ``[download](#method-download) and the target filename is known before the MIME type and tentative filename have been determined, pass `filename` to ``[download](#method-download) instead.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(downloadItem: [DownloadItem](#type-DownloadItem), suggest: function) => void
```

- downloadItem
  [DownloadItem](#type-DownloadItem)
- suggest
  function

                            The `suggest` parameter looks like:

```
(suggestion?: [FilenameSuggestion](#type-FilenameSuggestion)) => void
```

- suggestion
  [FilenameSuggestion](#type-FilenameSuggestion)optional

### onErased

```
chrome.downloads.onErased.addListener(
  callback: function,
)
```

Fires with the `downloadId` when a download is erased from history.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(downloadId: number) => void
```

- downloadId
  number
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-15 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-15 UTC."],[],[]]
