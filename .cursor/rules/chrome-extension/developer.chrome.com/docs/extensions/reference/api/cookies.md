## Description

Use the `chrome.cookies` API to query and modify cookies, and to be notified when they change.

## Permissions

`cookies`

To use the cookies API, declare the `"cookies"` permission in your
manifest along with [host permissions](/docs/extensions/develop/concepts/declare-permissions) for any hosts whose cookies you want
to access. For example:

```
{
  "name": "My extension",
  ...
  "host_permissions": [
    "*://*.google.com/"
  ],
  &quot;permissions": [
    "cookies"
  ],
  ...
}

```

## Partitioning

[Partitioned cookies](/docs/privacy-sandbox/chips) allow a site to mark that certain cookies should be keyed against the
origin of the top-level frame. This means that, for example, if site A is embedded using an iframe in site B
and site C, the embedded versions of a partitioned cookie from A can have different values on B and C.
By default, all API methods operate on unpartitioned cookies. The
``[partitionKey](#type-CookiePartitionKey) property can be used to override this behavior.
For details on the general impact of partitioning for extensions, see
[Storage and Cookies](/docs/extensions/develop/concepts/storage-and-cookies#cookies-partitioning).

## Examples

You can find a simple example of using the cookies API in the
[examples/api/cookies](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/cookies/cookie-clearer) directory. For other examples and for help in viewing
the source code, see [Samples](/docs/extensions/samples).

## Types

### Cookie

Represents information about an HTTP cookie.

#### Properties

- domain
  string
  The domain of the cookie (e.g. "www.google.com", "example.com").
- expirationDate
  number optional
  The expiration date of the cookie as the number of seconds since the UNIX epoch. Not provided for session cookies.
- hostOnly
  boolean
  True if the cookie is a host-only cookie (i.e. a request's host must exactly match the domain of the cookie).
- httpOnly
  boolean
  True if the cookie is marked as HttpOnly (i.e. the cookie is inaccessible to client-side scripts).
- name
  string
  The name of the cookie.
- partitionKey
  [CookiePartitionKey](#type-CookiePartitionKey)optionalChrome 119+

The partition key for reading or modifying cookies with the Partitioned attribute.

- path
  string
  The path of the cookie.
- sameSite
  [SameSiteStatus](#type-SameSiteStatus)Chrome 51+

The cookie's same-site status (i.e. whether the cookie is sent with cross-site requests).

- secure
  boolean
  True if the cookie is marked as Secure (i.e. its scope is limited to secure channels, typically HTTPS).
- session
  boolean
  True if the cookie is a session cookie, as opposed to a persistent cookie with an expiration date.
- storeId
  string
  The ID of the cookie store containing this cookie, as provided in getAllCookieStores().
- value
  string
  The value of the cookie.

### CookieDetails

Chrome 88+

Details to identify the cookie.

#### Properties

- name
  string
  The name of the cookie to access.
- partitionKey
  [CookiePartitionKey](#type-CookiePartitionKey)optionalChrome 119+

The partition key for reading or modifying cookies with the Partitioned attribute.

- storeId
  string optional
  The ID of the cookie store in which to look for the cookie. By default, the current execution context's cookie store will be used.
- url
  string
  The URL with which the cookie to access is associated. This argument may be a full URL, in which case any data following the URL path (e.g. the query string) is simply ignored. If host permissions for this URL are not specified in the manifest file, the API call will fail.

### CookiePartitionKey

Chrome 119+

Represents a partitioned cookie's partition key.

#### Properties

- hasCrossSiteAncestor
  boolean optionalChrome 130+

Indicates if the cookie was set in a cross-cross site context. This prevents a top-level site embedded in a cross-site context from accessing cookies set by the top-level site in a same-site context.

- topLevelSite
  string optional
  The top-level site the partitioned cookie is available in.

### CookieStore

Represents a cookie store in the browser. An incognito mode window, for instance, uses a separate cookie store from a non-incognito window.

#### Properties

- id
  string
  The unique identifier for the cookie store.
- tabIds
  number[]
  Identifiers of all the browser tabs that share this cookie store.

### FrameDetails

Chrome 132+

Details to identify the frame.

#### Properties

- documentId
  string optional
  The unique identifier for the document. If the frameId and/or tabId are provided they will be validated to match the document found by provided document ID.
- frameId
  number optional
  The unique identifier for the frame within the tab.
- tabId
  number optional
  The unique identifier for the tab containing the frame.

### OnChangedCause

Chrome 44+

The underlying reason behind the cookie's change. If a cookie was inserted, or removed via an explicit call to "chrome.cookies.remove", "cause" will be "explicit". If a cookie was automatically removed due to expiry, "cause" will be "expired". If a cookie was removed due to being overwritten with an already-expired expiration date, "cause" will be set to "expired_overwrite". If a cookie was automatically removed due to garbage collection, "cause" will be "evicted". If a cookie was automatically removed due to a "set" call that overwrote it, "cause" will be "overwrite". Plan your response accordingly.

#### Enum

"evicted"

"expired"

"explicit"

"expired_overwrite"

"overwrite"

### SameSiteStatus

Chrome 51+

A cookie's 'SameSite' state (https://tools.ietf.org/html/draft-west-first-party-cookies). 'no_restriction' corresponds to a cookie set with 'SameSite=None', 'lax' to 'SameSite=Lax', and 'strict' to 'SameSite=Strict'. 'unspecified' corresponds to a cookie set without the SameSite attribute.

#### Enum

"no_restriction"

"lax"

"strict"

"unspecified"

## Methods

### get()

```
chrome.cookies.get(
  details: [CookieDetails](#type-CookieDetails),
): Promise<[Cookie](#type-Cookie) | undefined>
```

Retrieves information about a single cookie. If more than one cookie of the same name exists for the given URL, the one with the longest path will be returned. For cookies with the same path length, the cookie with the earliest creation time will be returned.

#### Parameters

- details
  [CookieDetails](#type-CookieDetails)

#### Returns

Promise<[Cookie](#type-Cookie) | undefined>Chrome 88+

### getAll()

```
chrome.cookies.getAll(
  details: object,
): Promise<[Cookie](#type-Cookie)[]>
```

Retrieves all cookies from a single cookie store that match the given information. The cookies returned will be sorted, with those with the longest path first. If multiple cookies have the same path length, those with the earliest creation time will be first. This method only retrieves cookies for domains that the extension has host permissions to.

#### Parameters

- details
  object
  Information to filter the cookies being retrieved.

- domain
  string optional
  Restricts the retrieved cookies to those whose domains match or are subdomains of this one.
- name
  string optional
  Filters the cookies by name.
- partitionKey
  [CookiePartitionKey](#type-CookiePartitionKey)optionalChrome 119+

The partition key for reading or modifying cookies with the Partitioned attribute.

- path
  string optional
  Restricts the retrieved cookies to those whose path exactly matches this string.
- secure
  boolean optional
  Filters the cookies by their Secure property.
- session
  boolean optional
  Filters out session vs. persistent cookies.
- storeId
  string optional
  The cookie store to retrieve cookies from. If omitted, the current execution context's cookie store will be used.
- url
  string optional
  Restricts the retrieved cookies to those that would match the given URL.

#### Returns

Promise<[Cookie](#type-Cookie)[]>Chrome 88+

### getAllCookieStores()

```
chrome.cookies.getAllCookieStores(): Promise<[CookieStore](#type-CookieStore)[]>
```

Lists all existing cookie stores.

#### Returns

Promise<[CookieStore](#type-CookieStore)[]>Chrome 88+

### getPartitionKey()

Chrome 132+

```
chrome.cookies.getPartitionKey(
  details: [FrameDetails](#type-FrameDetails),
): Promise<object>
```

The partition key for the frame indicated.

#### Parameters

- details
  [FrameDetails](#type-FrameDetails)

#### Returns

Promise<object>

### remove()

```
chrome.cookies.remove(
  details: [CookieDetails](#type-CookieDetails),
): Promise<object | undefined>
```

Deletes a cookie by name.

#### Parameters

- details
  [CookieDetails](#type-CookieDetails)

#### Returns

Promise<object | undefined>Chrome 88+

### set()

```
chrome.cookies.set(
  details: object,
): Promise<[Cookie](#type-Cookie) | undefined>
```

Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.

#### Parameters

- details
  object
  Details about the cookie being set.

- domain
  string optional
  The domain of the cookie. If omitted, the cookie becomes a host-only cookie.
- expirationDate
  number optional
  The expiration date of the cookie as the number of seconds since the UNIX epoch. If omitted, the cookie becomes a session cookie.
- httpOnly
  boolean optional
  Whether the cookie should be marked as HttpOnly. Defaults to false.
- name
  string optional
  The name of the cookie. Empty by default if omitted.
- partitionKey
  [CookiePartitionKey](#type-CookiePartitionKey)optionalChrome 119+

The partition key for reading or modifying cookies with the Partitioned attribute.

- path
  string optional
  The path of the cookie. Defaults to the path portion of the url parameter.
- sameSite
  [SameSiteStatus](#type-SameSiteStatus)optionalChrome 51+

The cookie's same-site status. Defaults to "unspecified", i.e., if omitted, the cookie is set without specifying a SameSite attribute.

- secure
  boolean optional
  Whether the cookie should be marked as Secure. Defaults to false.
- storeId
  string optional
  The ID of the cookie store in which to set the cookie. By default, the cookie is set in the current execution context's cookie store.
- url
  string
  The request-URI to associate with the setting of the cookie. This value can affect the default domain and path values of the created cookie. If host permissions for this URL are not specified in the manifest file, the API call will fail.
- value
  string optional
  The value of the cookie. Empty by default if omitted.

#### Returns

Promise<[Cookie](#type-Cookie) | undefined>Chrome 88+

## Events

### onChanged

```
chrome.cookies.onChanged.addListener(
  callback: function,
)
```

Fired when a cookie is set or removed. As a special case, note that updating a cookie's properties is implemented as a two step process: the cookie to be updated is first removed entirely, generating a notification with "cause" of "overwrite" . Afterwards, a new cookie is written with the updated values, generating a second notification with "cause" "explicit".

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(changeInfo: object) =& gt;void
```

- changeInfo
  object

- cause
  [OnChangedCause](#type-OnChangedCause)
  The underlying reason behind the cookie's change.
- cookie
  [Cookie](#type-Cookie)
  Information about the cookie that was set or removed.
- removed
  boolean
  True if a cookie was removed.
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
