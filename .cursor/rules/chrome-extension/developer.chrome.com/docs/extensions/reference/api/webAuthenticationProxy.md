## Description

The `chrome.webAuthenticationProxy` API lets remote desktop software running on a remote host intercept Web Authentication API (WebAuthn) requests in order to handle them on a local client.

## Permissions

`webAuthenticationProxy`

## Availability

Chrome 115+
MV3+

## Types

### CreateRequest

#### Properties

- requestDetailsJson
  string
  The `PublicKeyCredentialCreationOptions` passed to `navigator.credentials.create()`, serialized as a JSON string. The serialization format is compatible with ``[PublicKeyCredential.parseCreationOptionsFromJSON()](https://w3c.github.io/webauthn/#sctn-parseCreationOptionsFromJSON).
- requestId
  number
  An opaque identifier for the request.

### CreateResponseDetails

#### Properties

- error
  [DOMExceptionDetails](#type-DOMExceptionDetails)optional
  The `DOMException` yielded by the remote request, if any.
- requestId
  number
  The `requestId` of the `CreateRequest`.
- responseJson
  string optional
  The `PublicKeyCredential`, yielded by the remote request, if any, serialized as a JSON string by calling href="https://w3c.github.io/webauthn/#dom-publickeycredential-tojson"> `PublicKeyCredential.toJSON()`.

### DOMExceptionDetails

#### Properties

- message
  string
- name
  string

### GetRequest

#### Properties

- requestDetailsJson
  string
  The `PublicKeyCredentialRequestOptions` passed to `navigator.credentials.get()`, serialized as a JSON string. The serialization format is compatible with ``[PublicKeyCredential.parseRequestOptionsFromJSON()](https://w3c.github.io/webauthn/#sctn-parseRequestOptionsFromJSON).
- requestId
  number
  An opaque identifier for the request.

### GetResponseDetails

#### Properties

- error
  [DOMExceptionDetails](#type-DOMExceptionDetails)optional
  The `DOMException` yielded by the remote request, if any.
- requestId
  number
  The `requestId` of the `CreateRequest`.
- responseJson
  string optional
  The `PublicKeyCredential`, yielded by the remote request, if any, serialized as a JSON string by calling href="https://w3c.github.io/webauthn/#dom-publickeycredential-tojson"> `PublicKeyCredential.toJSON()`.

### IsUvpaaRequest

#### Properties

- requestId
  number
  An opaque identifier for the request.

### IsUvpaaResponseDetails

#### Properties

- isUvpaa
  boolean
- requestId
  number

## Methods

### attach()

```
chrome.webAuthenticationProxy.attach(): Promise<string | undefined>
```

Makes this extension the active Web Authentication API request proxy.
Remote desktop extensions typically call this method after detecting attachment of a remote session to this host. Once this method returns without error, regular processing of WebAuthn requests is suspended, and events from this extension API are raised.
This method fails with an error if a different extension is already attached.
The attached extension must call `detach()` once the remote desktop session has ended in order to resume regular WebAuthn request processing. Extensions automatically become detached if they are unloaded.
Refer to the `onRemoteSessionStateChange` event for signaling a change of remote session attachment from a native application to to the (possibly suspended) extension.

#### Returns

Promise<string | undefined>

### completeCreateRequest()

```
chrome.webAuthenticationProxy.completeCreateRequest(
  details: [CreateResponseDetails](#type-CreateResponseDetails),
): Promise<void>
```

Reports the result of a `navigator.credentials.create()` call. The extension must call this for every `onCreateRequest` event it has received, unless the request was canceled (in which case, an `onRequestCanceled` event is fired).

#### Parameters

- details
  [CreateResponseDetails](#type-CreateResponseDetails)

#### Returns

Promise<void>

### completeGetRequest()

```
chrome.webAuthenticationProxy.completeGetRequest(
  details: [GetResponseDetails](#type-GetResponseDetails),
): Promise<void>
```

Reports the result of a `navigator.credentials.get()` call. The extension must call this for every `onGetRequest` event it has received, unless the request was canceled (in which case, an `onRequestCanceled` event is fired).

#### Parameters

- details
  [GetResponseDetails](#type-GetResponseDetails)

#### Returns

Promise<void>

### completeIsUvpaaRequest()

```
chrome.webAuthenticationProxy.completeIsUvpaaRequest(
  details: [IsUvpaaResponseDetails](#type-IsUvpaaResponseDetails),
): Promise<void>
```

Reports the result of a `PublicKeyCredential.isUserVerifyingPlatformAuthenticator()` call. The extension must call this for every `onIsUvpaaRequest` event it has received.

#### Parameters

- details
  [IsUvpaaResponseDetails](#type-IsUvpaaResponseDetails)

#### Returns

Promise<void>

### detach()

```
chrome.webAuthenticationProxy.detach(): Promise<string | undefined>
```

Removes this extension from being the active Web Authentication API request proxy.
This method is typically called when the extension detects that a remote desktop session was terminated. Once this method returns, the extension ceases to be the active Web Authentication API request proxy.
Refer to the `onRemoteSessionStateChange` event for signaling a change of remote session attachment from a native application to to the (possibly suspended) extension.

#### Returns

Promise<string | undefined>

## Events

### onCreateRequest

```
chrome.webAuthenticationProxy.onCreateRequest.addListener(
  callback: function,
)
```

Fires when a WebAuthn `navigator.credentials.create()` call occurs. The extension must supply a response by calling `completeCreateRequest()` with the `requestId` from `requestInfo`.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(requestInfo: [CreateRequest](#type-CreateRequest)) => void
```

- requestInfo
  [CreateRequest](#type-CreateRequest)

### onGetRequest

```
chrome.webAuthenticationProxy.onGetRequest.addListener(
  callback: function,
)
```

Fires when a WebAuthn navigator.credentials.get() call occurs. The extension must supply a response by calling `completeGetRequest()` with the `requestId` from `requestInfo`

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(requestInfo: [GetRequest](#type-GetRequest)) => void
```

- requestInfo
  [GetRequest](#type-GetRequest)

### onIsUvpaaRequest

```
chrome.webAuthenticationProxy.onIsUvpaaRequest.addListener(
  callback: function,
)
```

Fires when a `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` call occurs. The extension must supply a response by calling `completeIsUvpaaRequest()` with the `requestId` from `requestInfo`

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(requestInfo: [IsUvpaaRequest](#type-IsUvpaaRequest)) => void
```

- requestInfo
  [IsUvpaaRequest](#type-IsUvpaaRequest)

### onRemoteSessionStateChange

```
chrome.webAuthenticationProxy.onRemoteSessionStateChange.addListener(
  callback: function,
)
```

A native application associated with this extension can cause this event to be fired by writing to a file with a name equal to the extension's ID in a directory named `WebAuthenticationProxyRemoteSessionStateChange` inside the [default user data directory](https://chromium.googlesource.com/chromium/src/+/main/docs/user_data_dir.md#default-location)
The contents of the file should be empty. I.e., it is not necessary to change the contents of the file in order to trigger this event.
The native host application may use this event mechanism to signal a possible remote session state change (i.e. from detached to attached, or vice versa) while the extension service worker is possibly suspended. In the handler for this event, the extension can call the `attach()` or `detach()` API methods accordingly.
The event listener must be registered synchronously at load time.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
() => void
```

### onRequestCanceled

```
chrome.webAuthenticationProxy.onRequestCanceled.addListener(
  callback: function,
)
```

Fires when a `onCreateRequest` or `onGetRequest` event is canceled (because the WebAuthn request was aborted by the caller, or because it timed out). When receiving this event, the extension should cancel processing of the corresponding request on the client side. Extensions cannot complete a request once it has been canceled.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(requestId: number) => void
```

- requestId
  number
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
