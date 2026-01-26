## Description

Use the `chrome.storage` API to store, retrieve, and track changes to user data.

## Permissions

`storage`

To use the storage API, declare the `"storage"` permission in the extension
[manifest](/docs/extensions/reference/manifest). For example:

```
{
  "name": "My extension",
  ...
  "permissions": [
    "storage"
  ],
  ...
}

```

## Examples

The following samples demonstrate the `local`, `sync`, and
`session` storage areas:

### Example (Local)

```
chrome.storage.local.set({ key: value }).then(() => {
  console.log("Value is set");
});

chrome.storage.local.get(["key"]).then((result) => {
  console.log("Value is " + result.key);
});

```

### Example (Sync)

```
chrome.storage.sync.set({ key: value }).then(() => {
  console.log("Value is set");
});

chrome.storage.sync.get(["key"]).then((result) => {
  console.log("Value is " + result.key);
});

```

### Example (Session)

```
chrome.storage.session.set({ key: value }).then(() => {
  console.log("Value is set");
});

chrome.storage.session.get(["key"]).then((result) => {
  console.log("Value is " + result.key);
});

```

To see other demos of the Storage API, explore any of the following samples:

- [Global search extension](https://github.com/GoogleChrome/chrome-extensions-samples/tree/17956f44b6f04d28407a4b7eee428611affd4fab/api/contextMenus/global_context_search).
- [Water alarm extension](https://github.com/GoogleChrome/chrome-extensions-samples/tree/17956f44b6f04d28407a4b7eee428611affd4fab/examples/water_alarm_notification).

## Concepts and usage

The Storage API provides an extension-specific way to persist user data and state. It's similar to the web platform's storage APIs ([IndexedDB](https://developer.mozilla.org/docs/Web/API/Window/indexeddb), and [Storage](https://developer.mozilla.org/docs/Web/API/Storage)), but was designed to meet the storage needs of extensions. The following are a few key features:

- All extension contexts, including the extension service worker and content scripts have access to the Storage API.
- The JSON serializable values are stored as object properties.
- The Storage API is asynchronous with bulk read and write operations.
- Even if the user clears the cache and browsing history, the data persists.
- Stored settings persist even when using [split incognito](/docs/extensions/reference/manifest/incognito).
- Includes an exclusive read-only [managed storage area](#property-managed) for enterprise policies.

### Can extensions use web storage APIs?

While extensions can use the ``[Storage](https://developer.mozilla.org/docs/Web/API/Storage) interface (accessible from `window.localStorage`) in some contexts (popup and other HTML pages), we don't recommend it for the following reasons:

- Extension service workers can't use the Web Storage API.
- Content scripts share storage with the host page.
- Data saved using the Web Storage API is lost when the user clears their browsing history.
  To move data from web storage APIs to extension storage APIs from a service worker:

- Prepare an offscreen document html page and script file. The script file should contain a conversion routine and an ``[onMessage](/docs/extensions/reference/api/runtime#event-onMessage) handler.
- In the extension service worker, check `chrome.storage` for your data.
- If your data isn't found, call ``[createDocument()](/docs/extensions/reference/api/offscreen#method-createDocument).
- After the returned Promise resolves, call ``[sendMessage()](/docs/extensions/reference/api/runtime#method-sendMessage) to start the conversion routine.
- Inside the offscreen document's `onMessage` handler, call the conversion routine.
  There are also some nuances to how web storage APIs work in extensions. Learn more in the
  [Storage and Cookies](/docs/extensions/develop/concepts/storage-and-cookies) article.

### Storage and throttling limits

The Storage API has usage limitations:

- Storing data has performance costs, and the API includes storage quotas. Plan the data you intend to store, so you maintain storage space.
- Storage can take time to complete. Structure your code to account for that time.
  For details on storage area limitations and what happens when they're exceeded, see the quota information for `[sync](#property-sync), `[local](#property-local), and ``[session](#property-session).

## Storage areas

The Storage API is divided into the following storage areas:

### Local

Data is stored locally and cleared when the extension is removed. The storage limit is 10 MB (5 MB in Chrome 113 and earlier), but can be increased by requesting the `"unlimitedStorage"` permission. We recommend using `storage.local` to store larger amounts of data. By default, it's exposed to content scripts, but this behavior can be changed by calling ``[chrome.storage.local.setAccessLevel()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-setAccessLevel).

### Managed

Managed storage is read-only for policy-installed extensions. It's managed by system administrators, using a developer-defined schema and enterprise policies. Policies are similar to options but are configured by a system administrator, instead of the user. This allows the extension to be preconfigured for all users of an organization.
By default, `storage.managed` is exposed to content scripts, but this behavior can be changed by calling ``[chrome.storage.managed.setAccessLevel()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-setAccessLevel). For information on policies, see [Documentation for Administrators](https://www.chromium.org/administrators/). To learn more about the `managed` storage area, see [Manifest for storage areas](/docs/extensions/reference/api/storage).

### Session

Session storage holds data in memory while an extension is loaded. The storage is cleared if the extension is disabled, reloaded, updated, and when the browser restarts. By default, it's not exposed to content scripts, but this behavior can be changed by calling ``[chrome.storage.session.setAccessLevel()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-setAccessLevel). The storage limit is 10 MB (1 MB in Chrome 111 and earlier).
The`storage.session` interface is one of several [we recommend for service workers](/docs/extensions/mv3/service_workers/service-worker-lifecycle#persist-data).

### Sync

If the user enables syncing, the data syncs with every Chrome browser that the user is logged into. If disabled, it behaves like `storage.local`. Chrome stores the data locally when the browser is offline and resumes syncing when it's back online. The quota limitation is approximately 100 KB, 8 KB per item.
We recommend using `storage.sync` to preserve user settings across synced browsers. If you're working with sensitive user data, instead use `storage.session`. By default, `storage.sync` is exposed to content scripts, but this behavior can be changed by calling ``[chrome.storage.sync.setAccessLevel()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-setAccessLevel).

## Methods and events

All storage areas implement the ``[StorageArea](/docs/extensions/reference/api/storage/StorageArea) interface.

### get()

The ``[get()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-get) method lets you read one or more keys from a `StorageArea`.

### getBytesInUse()

The ``[getBytesInUse()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-getBytesInUse) method lets you see the quota used by a `StorageArea`.

### getKeys()

The ``[getKeys()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-getKeys) method lets you get all keys stored in a `StorageArea`.

### remove()

The ``[remove()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-remove) method lets you remove an item from a `StorageArea`.

### set()

The ``[set()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-set) method lets you set an item in a `StorageArea`.

### setAccessLevel()

The ``[setAccessLevel()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-setAccessLevel) method lets you control access to a `StorageArea`.

### clear()

The ``[clear()](/docs/extensions/reference/api/storage/StorageArea#method-StorageArea-clear) method lets you clear all data from a `StorageArea`.

### onChanged

The ``[onChanged](/docs/extensions/reference/api/storage/StorageArea#event-StorageArea-onChanged) event lets you monitor changes to a `StorageArea`.

## Use cases

The following sections demonstrate common use cases for the Storage API.

### Respond to storage updates

To track changes made to storage, add a listener to its `onChanged` event. When anything changes in storage, that event fires. The sample code listens for these changes:
background.js:

```
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});

```

We can take this idea even further. In this example, we have an [options page](/docs/extensions/develop/ui/options-page) that
allows the user to toggle a "debug mode" (implementation not shown here). The options page immediately saves the new settings to `storage.sync`, and the service worker uses `storage.onChanged` to apply the setting as soon as possible.
options.html:

```
<!-- type="module" allows you to use top level await -->
<script defer src="options.js" type="module"></script>
<form id="optionsForm">
  <label for="debug">
    <input type="checkbox" name="debug" id="debug">
    Enable debug mode
  </label>
</form>

```

options.js:

```
// In-page cache of the user's options
const options = {};
const optionsForm = document.getElementById("optionsForm");

// Immediately persist options changes
optionsForm.debug.addEventListener("change", (event) => {
  options.debug = event.target.checked;
  chrome.storage.sync.set({ options });
});

// Initialize the form with the user's option settings
const data = await chrome.storage.sync.get("options");
Object.assign(options, data.options);
optionsForm.debug.checked = Boolean(options.debug);

```

background.js:

```
function setDebugMode() { /* ... */ }

// Watch for changes to the user's options & apply them
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.options?.newValue) {
    const debugMode = Boolean(changes.options.newValue.debug);
    console.log('enable debug mode?', debugMode);
    setDebugMode(debugMode);
  }
});

```

### Asynchronous preload from storage

Because service workers don't run all the time, Manifest V3 extensions sometimes need to
asynchronously load data from storage before they execute their event handlers. To do this, the
following snippet uses an async `action.onClicked` event handler that waits for the `storageCache`
global to be populated before executing its logic.
background.js:

```
// Where we will expose all the data we retrieve from storage.sync.
const storageCache = { count: 0 };
// Asynchronously retrieve data from storage.sync, then cache it.
const initStorageCache = chrome.storage.sync.get().then((items) => {
  // Copy the data retrieved from storage into storageCache.
  Object.assign(storageCache, items);
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await initStorageCache;
  } catch (e) {
    // Handle error that occurred during storage initialization.
  }

  // Normal action handler logic.
  storageCache.count++;
  storageCache.lastTabId = tab.id;
  chrome.storage.sync.set(storageCache);
});

```

## DevTools

You can view and edit data stored using the API in DevTools. To learn more, see
the [View and edit extension storage](/docs/devtools/storage/extensionstorage)
page in the DevTools documentation.

## Types

### AccessLevel

Chrome 102+

The storage area's access level.

#### Enum

"TRUSTED_CONTEXTS"
Specifies contexts originating from the extension itself.
"TRUSTED_AND_UNTRUSTED_CONTEXTS"
Specifies contexts originating from outside the extension.

### StorageChange

#### Properties

- newValue
  any optional
  The new value of the item, if there is a new value.
- oldValue
  any optional
  The old value of the item, if there was an old value.

## Properties

### local

Items in the `local` storage area are local to each machine.

#### Type

[StorageArea](https://developer.chrome.com/docs/extensions/reference/api/storage/StorageArea/#type-StorageArea) & object

#### Properties

- QUOTA_BYTES
  10485760

The maximum amount (in bytes) of data that can be stored in local storage, as measured by the JSON stringification of every value plus every key's length. This value will be ignored if the extension has the `unlimitedStorage` permission. Updates that would cause this limit to be exceeded fail immediately and set ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime/#property-lastError) when using a callback, or a rejected Promise if using async/await.

### managed

Items in the `managed` storage area are set by an enterprise policy configured by the domain administrator, and are read-only for the extension; trying to modify this namespace results in an error. For information on configuring a policy, see [Manifest for storage areas](https://developer.chrome.com/docs/extensions/reference/manifest/storage).

#### Type

[StorageArea](https://developer.chrome.com/docs/extensions/reference/api/storage/StorageArea/#type-StorageArea)

### session

Chrome 102+
MV3+

Items in the `session` storage area are stored in-memory and will not be persisted to disk.

#### Type

[StorageArea](https://developer.chrome.com/docs/extensions/reference/api/storage/StorageArea/#type-StorageArea) & object

#### Properties

- QUOTA_BYTES
  10485760

The maximum amount (in bytes) of data that can be stored in memory, as measured by estimating the dynamically allocated memory usage of every value and key. Updates that would cause this limit to be exceeded fail immediately and set ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime/#property-lastError) when using a callback, or when a Promise is rejected.

### sync

Items in the `sync` storage area are synced using Chrome Sync.

#### Type

[StorageArea](https://developer.chrome.com/docs/extensions/reference/api/storage/StorageArea/#type-StorageArea) & object

#### Properties

- MAX_ITEMS
  512

The maximum number of items that can be stored in sync storage. Updates that would cause this limit to be exceeded will fail immediately and set ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime/#property-lastError) when using a callback, or when a Promise is rejected.

- MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE
  1000000

                            Deprecated

    The storage.sync API no longer has a sustained write operation quota.

- MAX_WRITE_OPERATIONS_PER_HOUR
  1800

The maximum number of `set`, `remove`, or `clear` operations that can be performed each hour. This is 1 every 2 seconds, a lower ceiling than the short term higher writes-per-minute limit.
Updates that would cause this limit to be exceeded fail immediately and set ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime/#property-lastError) when using a callback, or when a Promise is rejected.

- MAX_WRITE_OPERATIONS_PER_MINUTE
  120

The maximum number of `set`, `remove`, or `clear` operations that can be performed each minute. This is 2 per second, providing higher throughput than writes-per-hour over a shorter period of time.
Updates that would cause this limit to be exceeded fail immediately and set ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime/#property-lastError) when using a callback, or when a Promise is rejected.

- QUOTA_BYTES
  102400

The maximum total amount (in bytes) of data that can be stored in sync storage, as measured by the JSON stringification of every value plus every key's length. Updates that would cause this limit to be exceeded fail immediately and set ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime/#property-lastError) when using a callback, or when a Promise is rejected.

- QUOTA_BYTES_PER_ITEM
  8192

The maximum size (in bytes) of each individual item in sync storage, as measured by the JSON stringification of its value plus its key length. Updates containing items larger than this limit will fail immediately and set ``[runtime.lastError](https://developer.chrome.com/docs/extensions/reference/api/runtime/#property-lastError) when using a callback, or when a Promise is rejected.

## Events

### onChanged

```
chrome.storage.onChanged.addListener(
  callback: function,
)
```

Fired when one or more items change.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(changes: object, areaName: string) => void
```

- changes
  object
- areaName
  string
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-12-19 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-12-19 UTC."],[],[]]
