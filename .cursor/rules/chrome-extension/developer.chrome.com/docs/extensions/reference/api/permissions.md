## Description

Use the `chrome.permissions` API to request [declared optional permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) at run time rather than install time, so users understand why the permissions are needed and grant only those that are necessary.

## Concepts and usage

Permission warnings exist to describe the capabilities granted by an API, but some of these warnings may not be obvious. The Permissions API allows developers to explain permission warnings and introduce new features gradually which gives users a risk-free introduction to the extension. This way, users can specify how much access they are willing to grant and which features they want to enable.
For example, the [optional permissions extension's](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/sample.optional_permissions) core functionality is overriding the new tab page. One feature is displaying the user's goal of the day. This feature only requires the [storage](/docs/extensions/reference/api/storage) permission, which does not include a warning. The extension has an additional feature, that users can enable by clicking the following button:An extension button that enables additional features.
Displaying the user's top sites requires the [topSites](/docs/extensions/reference/api/topSites) permission, which has the following warning.An extension warning for `topSites` API

### Implement optional permissions

#### Step 1: Decide which permissions are required and which are optional

An extension can declare both required and optional permissions. In general, you should:

- Use required permissions when they are needed for your extension's basic functionality.
- Use optional permissions when they are needed for optional features in your extension.
  Advantages of required permissions:

- Fewer prompts: An extension can prompt the user once to accept all permissions.
- Simpler development: Required permissions are guaranteed to be present.
  Advantages of optional permissions:

- Better security: Extensions run with fewer permissions since users only enable permissions
  that are needed.
- Better information for users: An extension can explain why it needs a particular permission
  when the user enables the relevant feature.
- Easier upgrades: When you upgrade your extension, Chrome won't disable it for your users if
  the upgrade adds optional rather than required permissions.

#### Step 2: Declare optional permissions in the manifest

Declare optional permissions in your [extension manifest](/docs/extensions/reference/manifest) with the `optional_permissions` key,
using the same format as the [permissions](/docs/extensions/develop/concepts/declare-permissions) field:

```
{
  "name": "My extension",
  ...
  "optional_permissions": ["tabs"],
  "optional_host_permissions": ["https://www.google.com/"],
  ...
}

```

If you want to request hosts that you only discover at runtime, include `"https://*/*"` in your extension's `optional_host_permissions` field. This lets you specify any origin in ``["Permissions.origins"](#property-Permissions-origins) as long as it has a matching
scheme.
Permissions that can not be specified as optional
Most Chrome extension permissions can be specified as optional, with the following exceptions.PermissionDescription`"debugger"`The [chrome.debugger](/docs/extensions/reference/api/debugger) API serves as an
        alternate transport for Chrome's [remote debugging
            protocol](https://chromedevtools.github.io/devtools-protocol/).`"declarativeNetRequest"`Grants the extension access to the [chrome.declarativeNetRequest](/docs/extensions/reference/api/declarativeNetRequest) API.`"devtools"`Allows extension to expand [Chrome DevTools](/docs/extensions/how-to/devtools/extend-devtools)
        functionality.`"geolocation"`Allows the extension to use the HTML5 [geolocation](https://w3c.github.io/geolocation-api/) API.`"mdns"`Grants the extension access to the
        [chrome.mdns](/docs/apps/reference/mdns) API.`"proxy"`Grants the extension access to the [chrome.proxy](/docs/extensions/reference/api/proxy) API to manage Chrome's proxy
        settings.`"tts"`The [chrome.tts](/docs/extensions/reference/api/tts) API plays synthesized
        text-to-speech (TTS).`"ttsEngine"`The [chrome.ttsEngine](/docs/extensions/reference/api/ttsEngine) API implements a
        text-to-speech (TTS) engine using an extension.`"wallpaper"`ChromeOS only. Use the [chrome.wallpaper](/docs/extensions/reference/api/wallpaper) API change the ChromeOS
wallpaper.
View [Declare Permissions](/docs/extensions/develop/concepts/declare-permissions) for further information on available permissions and
their warnings.

#### Step 3: Request optional permissions

Request the permissions from within a user gesture using `permissions.request()`:

```
document.querySelector('#my-button').addEventListener('click', (event) => {
  // Permissions must be requested from inside a user gesture, like a button's
  // click handler.
  chrome.permissions.request({
    permissions: ['tabs'],
    origins: ['https://www.google.com/']
  }, (granted) => {
    // The callback argument will be true if the user granted the permissions.
    if (granted) {
      doSomething();
    } else {
      doSomethingElse();
    }
  });
});

```

Chrome prompts the user if adding the permissions results in different [warning messages](/docs/extensions/develop/concepts/declare-permissions) than
the user has already seen and accepted. For example, the previous code might result in a prompt like
this:An example permission confirmation prompt.

#### Step 4: Check the extension's current permissions

To check whether your extension has a specific permission or set of permissions, use
`permission.contains()`:

```
chrome.permissions.contains({
  permissions: ['tabs'],
  origins: ['https://www.google.com/']
}, (result) => {
  if (result) {
    // The extension has the permissions.
  } else {
    // The extension doesn't have the permissions.
  }
});

```

#### Step 5: Remove the permissions

You should remove permissions when you no longer need them. After a permission has been removed,
calling `permissions.request()` usually adds the permission back without prompting the user.

```
chrome.permissions.remove({
  permissions: ['tabs'],
  origins: ['https://www.google.com/']
}, (removed) => {
  if (removed) {
    // The permissions have been removed.
  } else {
    // The permissions have not been removed (e.g., you tried to remove
    // required permissions).
  }
});

```

## Types

### Permissions

#### Properties

- origins
  string[] optional
  The list of host permissions, including those specified in the `optional_permissions` or `permissions` keys in the manifest, and those associated with [Content Scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).
- permissions
  string[] optional
  List of named permissions (does not include hosts or origins).

## Methods

### addHostAccessRequest()

Chrome 133+
MV3+

```
chrome.permissions.addHostAccessRequest(
  request: object,
): Promise<void>
```

Adds a host access request. Request will only be signaled to the user if extension can be granted access to the host in the request. Request will be reset on cross-origin navigation. When accepted, grants persistent access to the site’s top origin

#### Parameters

- request
  object

- documentId
  string optional
  The id of a document where host access requests can be shown. Must be the top-level document within a tab. If provided, the request is shown on the tab of the specified document and is removed when the document navigates to a new origin. Adding a new request will override any existent request for `tabId`. This or `tabId` must be specified.
- pattern
  string optional
  The URL pattern where host access requests can be shown. If provided, host access requests will only be shown on URLs that match this pattern.
- tabId
  number optional
  The id of the tab where host access requests can be shown. If provided, the request is shown on the specified tab and is removed when the tab navigates to a new origin. Adding a new request will override an existent request for `documentId`. This or `documentId` must be specified.

#### Returns

Promise<void>

### contains()

```
chrome.permissions.contains(
  permissions: [Permissions](#type-Permissions),
): Promise<boolean>
```

Checks if the extension has the specified permissions.

#### Parameters

- permissions
  [Permissions](#type-Permissions)

#### Returns

Promise<boolean>Chrome 96+

### getAll()

```
chrome.permissions.getAll(): Promise<[Permissions](#type-Permissions)>
```

Gets the extension's current set of permissions.

#### Returns

Promise<[Permissions](#type-Permissions)>Chrome 96+

### remove()

```
chrome.permissions.remove(
  permissions: [Permissions](#type-Permissions),
): Promise<boolean>
```

Removes access to the specified permissions. If there are any problems removing the permissions, the promise will be rejected.

#### Parameters

- permissions
  [Permissions](#type-Permissions)

#### Returns

Promise<boolean>Chrome 96+

### removeHostAccessRequest()

Chrome 133+
MV3+

```
chrome.permissions.removeHostAccessRequest(
  request: object,
): Promise<void>
```

Removes a host access request, if existent.

#### Parameters

- request
  object

- documentId
  string optional
  The id of a document where host access request will be removed. Must be the top-level document within a tab. This or `tabId` must be specified.
- pattern
  string optional
  The URL pattern where host access request will be removed. If provided, this must exactly match the pattern of an existing host access request.
- tabId
  number optional
  The id of the tab where host access request will be removed. This or `documentId` must be specified.

#### Returns

Promise<void>

### request()

```
chrome.permissions.request(
  permissions: [Permissions](#type-Permissions),
): Promise<boolean>
```

Requests access to the specified permissions, displaying a prompt to the user if necessary. These permissions must either be defined in the `optional_permissions` field of the manifest or be required permissions that were withheld by the user. Paths on origin patterns will be ignored. You can request subsets of optional origin permissions; for example, if you specify `*://*\/*` in the `optional_permissions` section of the manifest, you can request `http://example.com/`. If there are any problems requesting the permissions, the promise will be rejected.

#### Parameters

- permissions
  [Permissions](#type-Permissions)

#### Returns

Promise<boolean>Chrome 96+

## Events

### onAdded

```
chrome.permissions.onAdded.addListener(
  callback: function,
)
```

Fired when the extension acquires new permissions.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(permissions: [Permissions](#type-Permissions)) => void
```

- permissions
  [Permissions](#type-Permissions)

### onRemoved

```
chrome.permissions.onRemoved.addListener(
  callback: function,
)
```

Fired when access to permissions has been removed from the extension.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(permissions: [Permissions](#type-Permissions)) => void
```

- permissions
  [Permissions](#type-Permissions)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-07 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
