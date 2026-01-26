The `StorageArea` interface is used by the ``[chrome.storage](/docs/extensions/reference/api/storage) API.

## Methods

### clear()

```
chrome.storage.StorageArea.clear(): Promise<void>
```

Removes all items from storage.

#### Returns

Promise<void>Chrome 95+

Promise that resolves on success, or rejects on failure.

### get()

```
chrome.storage.StorageArea.get(
  keys?: string | string[] | object,
): Promise<object>
```

Gets one or more items from storage.

#### Parameters

- keys
  string | string[] | object optional
  A single key to get, list of keys to get, or a dictionary specifying default values (see description of the object). An empty list or object will return an empty result object. Pass in `null` to get the entire contents of storage.

#### Returns

Promise<object>Chrome 95+

Promise that resolves with an object containing a key-value map for the requested items, or rejects on failure.

### getBytesInUse()

```
chrome.storage.StorageArea.getBytesInUse(
  keys?: string | string[],
): Promise<number>
```

Gets the amount of space (in bytes) being used by one or more items.

#### Parameters

- keys
  string | string[] optional
  A single key or list of keys to get the total usage for. An empty list will return 0. Pass in `null` to get the total usage of all of storage.

#### Returns

Promise<number>Chrome 95+

Promise that resolves with the amount of space being used by storage, or rejects on failure.

### getKeys()

Chrome 130+

```
chrome.storage.StorageArea.getKeys(): Promise<string[]>
```

Gets all keys from storage.

#### Returns

Promise<string[]>
Promise that resolves with storage keys, or rejects on failure.

### remove()

```
chrome.storage.StorageArea.remove(
  keys: string | string[],
): Promise<void>
```

Removes one or more items from storage.

#### Parameters

- keys
  string | string[]
  A single key or a list of keys for items to remove.

#### Returns

Promise<void>Chrome 95+

Promise that resolves on success, or rejects on failure.

### set()

```
chrome.storage.StorageArea.set(
  items: object,
): Promise<void>
```

Sets multiple items.

#### Parameters

- items
  object
  An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
  Primitive values such as numbers will serialize as expected. Values with a `typeof``"object"` and `"function"` will typically serialize to `{}`, with the exception of `Array` (serializes as expected), `Date`, and `Regex` (serialize using their `String` representation).

#### Returns

Promise<void>Chrome 95+

Promise that resolves on success, or rejects on failure.

### setAccessLevel()

Chrome 102+

```
chrome.storage.StorageArea.setAccessLevel(
  accessOptions: object,
): Promise<void>
```

Sets the desired access level for the storage area. By default, `session` storage is restricted to trusted contexts (extension pages and service workers), while `managed`, `local`, and `sync` storage allow access from both trusted and untrusted contexts.

#### Parameters

- accessOptions
  object

- accessLevel
  [AccessLevel](https://developer.chrome.com/docs/extensions/reference/api/storage/#type-AccessLevel)
  The access level of the storage area.

#### Returns

Promise<void>
Promise that resolves on success, or rejects on failure.

## Events

### onChanged

Chrome 73+

```
chrome.storage.StorageArea.onChanged.addListener(
  callback: function,
)
```

Fired when one or more items change.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(changes: object) => void
```

- changes
  object
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-12 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-12 UTC."],[],[]]
