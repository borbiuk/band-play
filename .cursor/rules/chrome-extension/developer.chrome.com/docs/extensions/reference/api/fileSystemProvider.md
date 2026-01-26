## Description

Use the `chrome.fileSystemProvider` API to create file systems, that can be accessible from the file manager on Chrome OS.

## Permissions

`fileSystemProvider`

## Availability

        ChromeOS only

You must declare the "fileSystemProvider" permission and section in the [extension manifest](/extensions/manifest) to use the File System Provider API. For example:

```
{
  "name": "My extension",
  ...
  "permissions": [
    "fileSystemProvider"
  ],
  ...
  "file_system_provider_capabilities": {
    "configurable": true,
    "watchable": false,
    "multiple_mounts": true,
    "source": "network"
  },
  ...
}

```

The file_system_provider section must be declared as follows:`configurable` (boolean) - optionalWhether configuring via onConfigureRequested is supported. By default: false.`multiple_mounts` (boolean) - optionalWhether multiple (more than one) mounted file systems are supported. By default: false.`watchable` (boolean) - optionalWhether setting watchers and notifying about changes is supported. By default: false.`source` (enum of "file", "device", or "network") - requiredSource of data for mounted file systems.
Files app uses above information in order to render related UI elements appropriately. For example, if `configurable` is set to true, then a menu item for configuring volumes will be rendered. Similarly, if `multiple_mounts` is set to `true`, then Files app will allow to add more than one mount points from the UI. If `watchable` is `false`, then a refresh button will be rendered. Note, that if possible you should add support for watchers, so changes on the file system can be reflected immediately and automatically.

## Overview

File System Provider API allows extensions to support virtual file systems, which are available in the file manager on ChromeOS. Use cases include decompressing archives and accessing files in a cloud service other than Drive.

## Mounting file systems

Providing extensions can either provide file system contents from an external source (such as a remote server or a USB device), or using a local file (such as an archive) as its input.
In order to write file systems which are file handlers (source is `"file"`) the provider must be a packaged app, as the `onLaunched` event is not available to extensions.
If the source is network or a device, then the file system should be mounted when [onMountRequested](#event-onMountRequested) event is called.[Source](#manifest-source) of the file system dataEntry point`"file"`Available to packaged apps only.`"device"` or `"network"`[onMountRequested](#event-onMountRequested)

## Configuring file systems

Provided file systems once mounted can be configured via the [onConfigureRequested](#event-onConfigureRequested) event. It's especially useful for file systems which provide contents via network in order to set proper credentials. Handling this event is optional.

## Life cycle

Provided file systems once mounted are remembered by Chrome and remounted automatically after reboot or restart. Hence, once a file system is [mounted](#method-mount) by a providing extension, it will stay until either the extension is unloaded, or the extension calls the [unmount](#method-unmount) method.

## Types

### AbortRequestedOptions

#### Properties

- fileSystemId
  string
  The identifier of the file system related to this operation.
- operationRequestId
  number
  An ID of the request to be aborted.
- requestId
  number
  The unique identifier of this request.

### Action

Chrome 45+

#### Properties

- id
  string
  The identifier of the action. Any string or ``[CommonActionId](#type-CommonActionId) for common actions.
- title
  string optional
  The title of the action. It may be ignored for common actions.

### AddWatcherRequestedOptions

#### Properties

- entryPath
  string
  The path of the entry to be observed.
- fileSystemId
  string
  The identifier of the file system related to this operation.
- recursive
  boolean
  Whether observing should include all child entries recursively. It can be true for directories only.
- requestId
  number
  The unique identifier of this request.

### Change

#### Properties

- changeType
  [ChangeType](#type-ChangeType)
  The type of the change which happened to the entry.
- cloudFileInfo
  [CloudFileInfo](#type-CloudFileInfo)optionalChrome 125+

Information relating to the file if backed by a cloud file system.

- entryPath
  string
  The path of the changed entry.

### ChangeType

Type of a change detected on the observed directory.

#### Enum

"CHANGED"

"DELETED"

### CloseFileRequestedOptions

#### Properties

- fileSystemId
  string
  The identifier of the file system related to this operation.
- openRequestId
  number
  A request ID used to open the file.
- requestId
  number
  The unique identifier of this request.

### CloudFileInfo

Chrome 125+

#### Properties

- versionTag
  string optional
  A tag that represents the version of the file.

### CloudIdentifier

Chrome 117+

#### Properties

- id
  string
  The provider's identifier for the given file/directory.
- providerName
  string
  Identifier for the cloud storage provider (e.g. 'drive.google.com').

### CommonActionId

Chrome 45+

List of common actions. `"SHARE"` is for sharing files with others. `"SAVE_FOR_OFFLINE"` for pinning (saving for offline access). `"OFFLINE_NOT_NECESSARY"` for notifying that the file doesn't need to be stored for offline access anymore. Used by `[onGetActionsRequested](#event-onGetActionsRequested) and `[onExecuteActionRequested](#event-onExecuteActionRequested).

#### Enum

"SAVE_FOR_OFFLINE"

"OFFLINE_NOT_NECESSARY"

"SHARE"

### ConfigureRequestedOptions

Chrome 44+

#### Properties

- fileSystemId
  string
  The identifier of the file system to be configured.
- requestId
  number
  The unique identifier of this request.

### CopyEntryRequestedOptions

#### Properties

- fileSystemId
  string
  The identifier of the file system related to this operation.
- requestId
  number
  The unique identifier of this request.
- sourcePath
  string
  The source path of the entry to be copied.
- targetPath
  string
  The destination path for the copy operation.

### CreateDirectoryRequestedOptions

#### Properties

- directoryPath
  string
  The path of the directory to be created.
- fileSystemId
  string
  The identifier of the file system related to this operation.
- recursive
  boolean
  Whether the operation is recursive (for directories only).
- requestId
  number
  The unique identifier of this request.

### CreateFileRequestedOptions

#### Properties

- filePath
  string
  The path of the file to be created.
- fileSystemId
  string
  The identifier of the file system related to this operation.
- requestId
  number
  The unique identifier of this request.

### DeleteEntryRequestedOptions

#### Properties

- entryPath
  string
  The path of the entry to be deleted.
- fileSystemId
  string
  The identifier of the file system related to this operation.
- recursive
  boolean
  Whether the operation is recursive (for directories only).
- requestId
  number
  The unique identifier of this request.

### EntryMetadata

#### Properties

- cloudFileInfo
  [CloudFileInfo](#type-CloudFileInfo)optionalChrome 125+

Information that identifies a specific file in the underlying cloud file system. Must be provided if requested in `options` and the file is backed by cloud storage.

- cloudIdentifier
  [CloudIdentifier](#type-CloudIdentifier)optionalChrome 117+

Cloud storage representation of this entry. Must be provided if requested in `options` and the file is backed by cloud storage. For local files not backed by cloud storage, it should be undefined when requested.

- isDirectory
  boolean optional
  True if it is a directory. Must be provided if requested in `options`.
- mimeType
  string optional
  Mime type for the entry. Always optional, but should be provided if requested in `options`.
- modificationTime
  Date optional
  The last modified time of this entry. Must be provided if requested in `options`.
- name
  string optional
  Name of this entry (not full path name). Must not contain '/'. For root it must be empty. Must be provided if requested in `options`.
- size
  number optional
  File size in bytes. Must be provided if requested in `options`.
- thumbnail
  string optional
  Thumbnail image as a data URI in either PNG, JPEG or WEBP format, at most 32 KB in size. Optional, but can be provided only when explicitly requested by the ``[onGetMetadataRequested](#event-onGetMetadataRequested) event.

### ExecuteActionRequestedOptions

Chrome 45+

#### Properties

- actionId
  string
  The identifier of the action to be executed.
- entryPaths
  string[]Chrome 47+

The set of paths of the entries to be used for the action.

- fileSystemId
  string
  The identifier of the file system related to this operation.
- requestId
  number
  The unique identifier of this request.

### FileSystemInfo

#### Properties

- displayName
  string
  A human-readable name for the file system.
- fileSystemId
  string
  The identifier of the file system.
- openedFiles
  [OpenedFile](#type-OpenedFile)[]
  List of currently opened files.
- openedFilesLimit
  number
  The maximum number of files that can be opened at once. If 0, then not limited.
- supportsNotifyTag
  boolean optionalChrome 45+

Whether the file system supports the `tag` field for observing directories.

- watchers
  [Watcher](#type-Watcher)[]Chrome 45+

List of watchers.

- writable
  boolean
  Whether the file system supports operations which may change contents of the file system (such as creating, deleting or writing to files).

### GetActionsRequestedOptions

Chrome 45+

#### Properties

- entryPaths
  string[]Chrome 47+

List of paths of entries for the list of actions.

- fileSystemId
  string
  The identifier of the file system related to this operation.
- requestId
  number
  The unique identifier of this request.

### GetMetadataRequestedOptions

#### Properties

- cloudFileInfo
  booleanChrome 125+

Set to `true` if `cloudFileInfo` value is requested.

- cloudIdentifier
  booleanChrome 117+

Set to `true` if `cloudIdentifier` value is requested.

- entryPath
  string
  The path of the entry to fetch metadata about.
- fileSystemId
  string
  The identifier of the file system related to this operation.
- isDirectory
  booleanChrome 49+

Set to `true` if `is_directory` value is requested.

- mimeType
  booleanChrome 49+

Set to `true` if `mimeType` value is requested.

- modificationTime
  booleanChrome 49+

Set to `true` if `modificationTime` value is requested.

- name
  booleanChrome 49+

Set to `true` if `name` value is requested.

- requestId
  number
  The unique identifier of this request.
- size
  booleanChrome 49+

Set to `true` if `size` value is requested.

- thumbnail
  boolean
  Set to `true` if `thumbnail` value is requested.

### MountOptions

#### Properties

- displayName
  string
  A human-readable name for the file system.
- fileSystemId
  string
  The string indentifier of the file system. Must be unique per each extension.
- openedFilesLimit
  number optional
  The maximum number of files that can be opened at once. If not specified, or 0, then not limited.
- persistent
  boolean optionalChrome 64+

Whether the framework should resume the file system at the next sign-in session. True by default.

- supportsNotifyTag
  boolean optionalChrome 45+

Whether the file system supports the `tag` field for observed directories.

- writable
  boolean optional
  Whether the file system supports operations which may change contents of the file system (such as creating, deleting or writing to files).

### MoveEntryRequestedOptions

#### Properties

- fileSystemId
  string
  The identifier of the file system related to this operation.
- requestId
  number
  The unique identifier of this request.
- sourcePath
  string
  The source path of the entry to be moved into a new place.
- targetPath
  string
  The destination path for the copy operation.

### NotifyOptions

#### Properties

- changeType
  [ChangeType](#type-ChangeType)
  The type of the change which happened to the observed entry. If it is DELETED, then the observed entry will be automatically removed from the list of observed entries.
- changes
  [Change](#type-Change)[] optional
  List of changes to entries within the observed directory (including the entry itself)
- fileSystemId
  string
  The identifier of the file system related to this change.
- observedPath
  string
  The path of the observed entry.
- recursive
  boolean
  Mode of the observed entry.
- tag
  string optional
  Tag for the notification. Required if the file system was mounted with the `supportsNotifyTag` option. Note, that this flag is necessary to provide notifications about changes which changed even when the system was shutdown.

### OpenedFile

#### Properties

- filePath
  string
  The path of the opened file.
- mode
  [OpenFileMode](#type-OpenFileMode)
  Whether the file was opened for reading or writing.
- openRequestId
  number
  A request ID to be be used by consecutive read/write and close requests.

### OpenFileMode

Mode of opening a file. Used by ``[onOpenFileRequested](#event-onOpenFileRequested).

#### Enum

"READ"

"WRITE"

### OpenFileRequestedOptions

#### Properties

- filePath
  string
  The path of the file to be opened.
- fileSystemId
  string
  The identifier of the file system related to this operation.
- mode
  [OpenFileMode](#type-OpenFileMode)
  Whether the file will be used for reading or writing.
- requestId
  number
  A request ID which will be used by consecutive read/write and close requests.

### ProviderError

Error codes used by providing extensions in response to requests as well as in case of errors when calling methods of the API. For success, `"OK"` must be used.

#### Enum

"OK"

"FAILED"

"IN_USE"

"EXISTS"

"NOT_FOUND"

"ACCESS_DENIED"

"TOO_MANY_OPENED"

"NO_MEMORY"

"NO_SPACE"

"NOT_A_DIRECTORY"

"INVALID_OPERATION"

"SECURITY"

"ABORT"

"NOT_A_FILE"

"NOT_EMPTY"

"INVALID_URL"

"IO"

### ReadDirectoryRequestedOptions

#### Properties

- directoryPath
  string
  The path of the directory which contents are requested.
- fileSystemId
  string
  The identifier of the file system related to this operation.
- isDirectory
  booleanChrome 49+

Set to `true` if `is_directory` value is requested.

- mimeType
  booleanChrome 49+

Set to `true` if `mimeType` value is requested.

- modificationTime
  booleanChrome 49+

Set to `true` if `modificationTime` value is requested.

- name
  booleanChrome 49+

Set to `true` if `name` value is requested.

- requestId
  number
  The unique identifier of this request.
- size
  booleanChrome 49+

Set to `true` if `size` value is requested.

- thumbnail
  booleanChrome 49+

Set to `true` if `thumbnail` value is requested.

### ReadFileRequestedOptions

#### Properties

- fileSystemId
  string
  The identifier of the file system related to this operation.
- length
  number
  Number of bytes to be returned.
- offset
  number
  Position in the file (in bytes) to start reading from.
- openRequestId
  number
  A request ID used to open the file.
- requestId
  number
  The unique identifier of this request.

### RemoveWatcherRequestedOptions

#### Properties

- entryPath
  string
  The path of the watched entry.
- fileSystemId
  string
  The identifier of the file system related to this operation.
- recursive
  boolean
  Mode of the watcher.
- requestId
  number
  The unique identifier of this request.

### TruncateRequestedOptions

#### Properties

- filePath
  string
  The path of the file to be truncated.
- fileSystemId
  string
  The identifier of the file system related to this operation.
- length
  number
  Number of bytes to be retained after the operation completes.
- requestId
  number
  The unique identifier of this request.

### UnmountOptions

#### Properties

- fileSystemId
  string
  The identifier of the file system to be unmounted.

### UnmountRequestedOptions

#### Properties

- fileSystemId
  string
  The identifier of the file system to be unmounted.
- requestId
  number
  The unique identifier of this request.

### Watcher

#### Properties

- entryPath
  string
  The path of the entry being observed.
- lastTag
  string optional
  Tag used by the last notification for the watcher.
- recursive
  boolean
  Whether watching should include all child entries recursively. It can be true for directories only.

### WriteFileRequestedOptions

#### Properties

- data
  ArrayBuffer
  Buffer of bytes to be written to the file.
- fileSystemId
  string
  The identifier of the file system related to this operation.
- offset
  number
  Position in the file (in bytes) to start writing the bytes from.
- openRequestId
  number
  A request ID used to open the file.
- requestId
  number
  The unique identifier of this request.

## Methods

### get()

```
chrome.fileSystemProvider.get(
  fileSystemId: string,
): Promise<[FileSystemInfo](#type-FileSystemInfo)>
```

Returns information about a file system with the passed `fileSystemId`.

#### Parameters

- fileSystemId
  string

#### Returns

Promise<[FileSystemInfo](#type-FileSystemInfo)>Chrome 96+

Callback to receive the result of ``[get](#method-get) function.

### getAll()

```
chrome.fileSystemProvider.getAll(): Promise<[FileSystemInfo](#type-FileSystemInfo)[]>
```

Returns all file systems mounted by the extension.

#### Returns

Promise<[FileSystemInfo](#type-FileSystemInfo)[]>Chrome 96+

Callback to receive the result of ``[getAll](#method-getAll) function.

### mount()

```
chrome.fileSystemProvider.mount(
  options: [MountOptions](#type-MountOptions),
): Promise<void>
```

Mounts a file system with the given `fileSystemId` and `displayName`. `displayName` will be shown in the left panel of the Files app. `displayName` can contain any characters including '/', but cannot be an empty string. `displayName` must be descriptive but doesn't have to be unique. The `fileSystemId` must not be an empty string.
Depending on the type of the file system being mounted, the `source` option must be set appropriately.
In case of an error, ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set with a corresponding error code.

#### Parameters

- options
  [MountOptions](#type-MountOptions)

#### Returns

Promise<void>Chrome 96+

A generic result callback to indicate success or failure.

### notify()

Chrome 45+

```
chrome.fileSystemProvider.notify(
  options: [NotifyOptions](#type-NotifyOptions),
): Promise<void>
```

Notifies about changes in the watched directory at `observedPath` in `recursive` mode. If the file system is mounted with `supportsNotifyTag`, then `tag` must be provided, and all changes since the last notification always reported, even if the system was shutdown. The last tag can be obtained with ``[getAll](#method-getAll).
To use, the `file_system_provider.notify` manifest option must be set to true.
Value of `tag` can be any string which is unique per call, so it's possible to identify the last registered notification. Eg. if the providing extension starts after a reboot, and the last registered notification's tag is equal to "123", then it should call ``[notify](#method-notify) for all changes which happened since the change tagged as "123". It cannot be an empty string.
Not all providers are able to provide a tag, but if the file system has a changelog, then the tag can be eg. a change number, or a revision number.
Note that if a parent directory is removed, then all descendant entries are also removed, and if they are watched, then the API must be notified about the fact. Also, if a directory is renamed, then all descendant entries are in fact removed, as there is no entry under their original paths anymore.
In case of an error, ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set will a corresponding error code.

#### Parameters

- options
  [NotifyOptions](#type-NotifyOptions)

#### Returns

Promise<void>Chrome 96+

A generic result callback to indicate success or failure.

### unmount()

```
chrome.fileSystemProvider.unmount(
  options: [UnmountOptions](#type-UnmountOptions),
): Promise<void>
```

Unmounts a file system with the given `fileSystemId`. It must be called after `[onUnmountRequested](#event-onUnmountRequested) is invoked. Also, the providing extension can decide to perform unmounting if not requested (eg. in case of lost connection, or a file error).
In case of an error, `[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/runtime/#property-lastError) will be set with a corresponding error code.

#### Parameters

- options
  [UnmountOptions](#type-UnmountOptions)

#### Returns

Promise<void>Chrome 96+

A generic result callback to indicate success or failure.

## Events

### onAbortRequested

```
chrome.fileSystemProvider.onAbortRequested.addListener(
  callback: function,
)
```

Raised when aborting an operation with `operationRequestId` is requested. The operation executed with `operationRequestId` must be immediately stopped and `successCallback` of this abort request executed. If aborting fails, then `errorCallback` must be called. Note, that callbacks of the aborted operation must not be called, as they will be ignored. Despite calling `errorCallback`, the request may be forcibly aborted.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [AbortRequestedOptions](#type-AbortRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [AbortRequestedOptions](#type-AbortRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onAddWatcherRequested

Chrome 45+

```
chrome.fileSystemProvider.onAddWatcherRequested.addListener(
  callback: function,
)
```

Raised when setting a new directory watcher is requested. If an error occurs, then `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [AddWatcherRequestedOptions](#type-AddWatcherRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [AddWatcherRequestedOptions](#type-AddWatcherRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onCloseFileRequested

```
chrome.fileSystemProvider.onCloseFileRequested.addListener(
  callback: function,
)
```

Raised when opening a file previously opened with `openRequestId` is requested to be closed.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [CloseFileRequestedOptions](#type-CloseFileRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [CloseFileRequestedOptions](#type-CloseFileRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onConfigureRequested

Chrome 44+

```
chrome.fileSystemProvider.onConfigureRequested.addListener(
  callback: function,
)
```

Raised when showing a configuration dialog for `fileSystemId` is requested. If it's handled, the `file_system_provider.configurable` manfiest option must be set to true.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [ConfigureRequestedOptions](#type-ConfigureRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [ConfigureRequestedOptions](#type-ConfigureRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onCopyEntryRequested

```
chrome.fileSystemProvider.onCopyEntryRequested.addListener(
  callback: function,
)
```

Raised when copying an entry (recursively if a directory) is requested. If an error occurs, then `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [CopyEntryRequestedOptions](#type-CopyEntryRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [CopyEntryRequestedOptions](#type-CopyEntryRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onCreateDirectoryRequested

```
chrome.fileSystemProvider.onCreateDirectoryRequested.addListener(
  callback: function,
)
```

Raised when creating a directory is requested. The operation must fail with the EXISTS error if the target directory already exists. If `recursive` is true, then all of the missing directories on the directory path must be created.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [CreateDirectoryRequestedOptions](#type-CreateDirectoryRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [CreateDirectoryRequestedOptions](#type-CreateDirectoryRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onCreateFileRequested

```
chrome.fileSystemProvider.onCreateFileRequested.addListener(
  callback: function,
)
```

Raised when creating a file is requested. If the file already exists, then `errorCallback` must be called with the `"EXISTS"` error code.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [CreateFileRequestedOptions](#type-CreateFileRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [CreateFileRequestedOptions](#type-CreateFileRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onDeleteEntryRequested

```
chrome.fileSystemProvider.onDeleteEntryRequested.addListener(
  callback: function,
)
```

Raised when deleting an entry is requested. If `recursive` is true, and the entry is a directory, then all of the entries inside must be recursively deleted as well.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [DeleteEntryRequestedOptions](#type-DeleteEntryRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [DeleteEntryRequestedOptions](#type-DeleteEntryRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onExecuteActionRequested

Chrome 48+

```
chrome.fileSystemProvider.onExecuteActionRequested.addListener(
  callback: function,
)
```

Raised when executing an action for a set of files or directories is\ requested. After the action is completed, `successCallback` must be called. On error, `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [ExecuteActionRequestedOptions](#type-ExecuteActionRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [ExecuteActionRequestedOptions](#type-ExecuteActionRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onGetActionsRequested

Chrome 48+

```
chrome.fileSystemProvider.onGetActionsRequested.addListener(
  callback: function,
)
```

Raised when a list of actions for a set of files or directories at `entryPaths` is requested. All of the returned actions must be applicable to each entry. If there are no such actions, an empty array should be returned. The actions must be returned with the `successCallback` call. In case of an error, `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [GetActionsRequestedOptions](#type-GetActionsRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [GetActionsRequestedOptions](#type-GetActionsRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
(actions: [Action](#type-Action)[]) => void
```

- actions
  [Action](#type-Action)[]
- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onGetMetadataRequested

```
chrome.fileSystemProvider.onGetMetadataRequested.addListener(
  callback: function,
)
```

Raised when metadata of a file or a directory at `entryPath` is requested. The metadata must be returned with the `successCallback` call. In case of an error, `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [GetMetadataRequestedOptions](#type-GetMetadataRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [GetMetadataRequestedOptions](#type-GetMetadataRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
(metadata: [EntryMetadata](#type-EntryMetadata)) => void
```

- metadata
  [EntryMetadata](#type-EntryMetadata)
- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onMountRequested

Chrome 44+

```
chrome.fileSystemProvider.onMountRequested.addListener(
  callback: function,
)
```

Raised when showing a dialog for mounting a new file system is requested. If the extension/app is a file handler, then this event shouldn't be handled. Instead `app.runtime.onLaunched` should be handled in order to mount new file systems when a file is opened. For multiple mounts, the `file_system_provider.multiple_mounts` manifest option must be set to true.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(successCallback: function, errorCallback: function) => void
```

- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onMoveEntryRequested

```
chrome.fileSystemProvider.onMoveEntryRequested.addListener(
  callback: function,
)
```

Raised when moving an entry (recursively if a directory) is requested. If an error occurs, then `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [MoveEntryRequestedOptions](#type-MoveEntryRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [MoveEntryRequestedOptions](#type-MoveEntryRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onOpenFileRequested

```
chrome.fileSystemProvider.onOpenFileRequested.addListener(
  callback: function,
)
```

Raised when opening a file at `filePath` is requested. If the file does not exist, then the operation must fail. Maximum number of files opened at once can be specified with `MountOptions`.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [OpenFileRequestedOptions](#type-OpenFileRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [OpenFileRequestedOptions](#type-OpenFileRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
(metadata?: [EntryMetadata](#type-EntryMetadata)) => void
```

- metadata
  [EntryMetadata](#type-EntryMetadata)optional
- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onReadDirectoryRequested

```
chrome.fileSystemProvider.onReadDirectoryRequested.addListener(
  callback: function,
)
```

Raised when contents of a directory at `directoryPath` are requested. The results must be returned in chunks by calling the `successCallback` several times. In case of an error, `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [ReadDirectoryRequestedOptions](#type-ReadDirectoryRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [ReadDirectoryRequestedOptions](#type-ReadDirectoryRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
(entries: [EntryMetadata](#type-EntryMetadata)[], hasMore: boolean) => void
```

- entries
  [EntryMetadata](#type-EntryMetadata)[]
- hasMore
  boolean
- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onReadFileRequested

```
chrome.fileSystemProvider.onReadFileRequested.addListener(
  callback: function,
)
```

Raised when reading contents of a file opened previously with `openRequestId` is requested. The results must be returned in chunks by calling `successCallback` several times. In case of an error, `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [ReadFileRequestedOptions](#type-ReadFileRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [ReadFileRequestedOptions](#type-ReadFileRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
(data: ArrayBuffer, hasMore: boolean) => void
```

- data
  ArrayBuffer
- hasMore
  boolean
- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onRemoveWatcherRequested

Chrome 45+

```
chrome.fileSystemProvider.onRemoveWatcherRequested.addListener(
  callback: function,
)
```

Raised when the watcher should be removed. If an error occurs, then `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [RemoveWatcherRequestedOptions](#type-RemoveWatcherRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [RemoveWatcherRequestedOptions](#type-RemoveWatcherRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onTruncateRequested

```
chrome.fileSystemProvider.onTruncateRequested.addListener(
  callback: function,
)
```

Raised when truncating a file to a desired length is requested. If an error occurs, then `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [TruncateRequestedOptions](#type-TruncateRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [TruncateRequestedOptions](#type-TruncateRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onUnmountRequested

```
chrome.fileSystemProvider.onUnmountRequested.addListener(
  callback: function,
)
```

Raised when unmounting for the file system with the `fileSystemId` identifier is requested. In the response, the ``[unmount](#method-unmount) API method must be called together with `successCallback`. If unmounting is not possible (eg. due to a pending operation), then `errorCallback` must be called.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [UnmountRequestedOptions](#type-UnmountRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [UnmountRequestedOptions](#type-UnmountRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)

### onWriteFileRequested

```
chrome.fileSystemProvider.onWriteFileRequested.addListener(
  callback: function,
)
```

Raised when writing contents to a file opened previously with `openRequestId` is requested.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(options: [WriteFileRequestedOptions](#type-WriteFileRequestedOptions), successCallback: function, errorCallback: function) => void
```

- options
  [WriteFileRequestedOptions](#type-WriteFileRequestedOptions)
- successCallback
  function

                            The `successCallback` parameter looks like:

```
() => void
```

- errorCallback
  function

                            The `errorCallback` parameter looks like:

```
(error: [ProviderError](#type-ProviderError)) => void
```

- error
  [ProviderError](#type-ProviderError)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-07 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
