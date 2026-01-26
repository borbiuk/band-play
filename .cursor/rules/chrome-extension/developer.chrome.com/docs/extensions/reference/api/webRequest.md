Note: As of Manifest V3, the `"webRequestBlocking"` permission is no longer available for most extensions. Consider `"declarativeNetRequest"`, which enables use the [declarativeNetRequest API](/docs/extensions/reference/api/declarativeNetRequest). Aside from `"webRequestBlocking"`, the webRequest API is unchanged and available for normal use. Policy installed extensions can continue to use `"webRequestBlocking"`.

## Description

Use the `chrome.webRequest` API to observe and analyze traffic and to intercept, block, or modify requests in-flight.

## Permissions

`webRequest`

You must declare the `"webRequest"` permission in the [extension manifest](/docs/extensions/reference/manifest) to use the web request
API, along with the necessary [host permissions](/docs/extensions/develop/concepts/declare-permissions). To intercept a sub-resource request, the
extension must have access to both the requested URL and its initiator. For example:

```
{
  "name": "My extension",
  ...
  "permissions": [
    "webRequest"
  ],
  "host_permissions": [
    "*://*.google.com/*"
  ],
  ...
}

```

`webRequestBlocking`
Required to register blocking event handlers. As of Manifest V3, this is only
available to policy installed extensions.
`webRequestAuthProvider`
Required to use the ``[onAuthRequired](#event-onAuthRequired) method. See
[Handling authentication](#handle-auth).

## Concepts and usage

### Life cycle of requests

The web request API defines a set of events that follow the life cycle of a web request. You can use
these events to observe and analyze traffic. Certain synchronous events will allow you to intercept,
block, or modify a request.
The event life cycle for successful requests is illustrated here, followed by event definitions:
`onBeforeRequest` (optionally synchronous)Fires when a request is about to occur. This event is sent before any TCP connection is made and can
be used to cancel or redirect requests.`onBeforeSendHeaders` (optionally synchronous)Fires when a request is about to occur and the initial headers have been prepared. The event is
intended to allow extensions to add, modify, and delete request headers [(\*)](#life_cycle_footnote). The
`onBeforeSendHeaders` event is passed to all subscribers, so different subscribers may attempt to
modify the request; see the [Implementation details](#implementation-details) section for how this is handled. This event
can be used to cancel the request.`onSendHeaders`Fires after all extensions have had a chance to modify the request headers, and presents the final
[(\*)](#life_cycle_footnote) version. The event is triggered before the headers are sent to the network. This event is
informational and handled asynchronously. It does not allow modifying or cancelling the request.`onHeadersReceived` (optionally synchronous)Fires each time that an HTTP(S) response header is received. Due to redirects and authentication
requests this can happen multiple times per request. This event is intended to allow extensions to
add, modify, and delete response headers, such as incoming Content-Type headers. The caching
directives are processed before this event is triggered, so modifying headers such as Cache-Control
has no influence on the browser's cache. It also allows you to cancel or redirect the request.`onAuthRequired` (optionally synchronous)Fires when a request requires authentication of the user. This event can be handled synchronously to
provide authentication credentials. Note that extensions may provide invalid credentials. Take care
not to enter an infinite loop by repeatedly providing invalid credentials. This can also be used to
cancel the request.`onBeforeRedirect`Fires when a redirect is about to be executed. A redirection can be triggered by an HTTP response
code or by an extension. This event is informational and handled asynchronously. It does not allow
you to modify or cancel the request.`onResponseStarted`Fires when the first byte of the response body is received. For HTTP requests, this means that the
status line and response headers are available. This event is informational and handled
asynchronously. It does not allow modifying or canceling the request.`onCompleted`Fires when a request has been processed successfully.`onErrorOccurred`Fires when a request could not be processed successfully.
The web request API guarantees that for each request, either `onCompleted` or `onErrorOccurred` is
fired as the final event with one exception: If a request is redirected to a `data://` URL,
`onBeforeRedirect` is the last reported event.

- Note that the web request API presents an abstraction of the network stack to the extension.
  Internally, one URL request can be split into several HTTP requests (for example, to fetch individual
  byte ranges from a large file) or can be handled by the network stack without communicating with the
  network. For this reason, the API does not provide the final HTTP headers that are sent to the
  network. For example, all headers that are related to caching are invisible to the extension.
  The following headers are currently not provided to the `onBeforeSendHeaders` event. This list
  is not guaranteed to be complete or stable.

* Authorization
* Cache-Control
* Connection
* Content-Length
* Host
* If-Modified-Since
* If-None-Match
* If-Range
* Partial-Data
* Pragma
* Proxy-Authorization
* Proxy-Connection
* Transfer-Encoding
  Starting from Chrome 79, request header modifications affect Cross-Origin Resource Sharing (CORS)
  checks. If modified headers for cross-origin requests do not meet the criteria, it will result in
  sending a CORS preflight to ask the server if such headers can be accepted. If you really need to
  modify headers in a way to violate the CORS protocol, you need to specify `'extraHeaders'` in
  `opt_extraInfoSpec`. On the other hand, response header modifications do not work to deceive CORS
  checks. If you need to deceive the CORS protocol, you also need to specify `'extraHeaders'` for the
  response modifications.
  Starting from Chrome 79, the webRequest API does not intercept CORS preflight requests and
  responses by default. A CORS preflight for a request URL is visible to an extension if there is a
  listener with `'extraHeaders'` specified in `opt_extraInfoSpec` for the request URL.
  `onBeforeRequest` can also take `'extraHeaders'` from Chrome 79.
  Starting from Chrome 79, the following request header is not provided and cannot be modified or
  removed without specifying `'extraHeaders'` in `opt_extraInfoSpec`:

* OriginNote: Modifying the `Origin` request header might not work as intended and may result in
  unexpected errors in the response's [CORS checks](https://fetch.spec.whatwg.org/#cors-check). This is because while extensions can only
  modify the [Origin](https://fetch.spec.whatwg.org/#origin-header) request header, they can't change the `request origin` or initiator, which is
  a concept defined in the Fetch spec to represent who initiates the request. In such a scenario, the
  server may allow the CORS access for the modified request and put the header's `Origin` into the
  `Access-Control-Allow-Origin` header in the response. But it won't match the immutable
  `request origin` and will result in a CORS failure.
  Starting from Chrome 72, if you need to modify responses before [Cross Origin Read Blocking
  (CORB)](https://chromium.googlesource.com/chromium/src/+/master/services/network/cross_origin_read_blocking_explainer.md) can block the response, you need to specify `'extraHeaders'` in `opt_extraInfoSpec`.
  Starting from Chrome 72, the following request headers are not provided and cannot be modified
  or removed without specifying `'extraHeaders'` in `opt_extraInfoSpec`:

* Accept-Language
* Accept-Encoding
* Referer
* Cookie
  Starting from Chrome 72, the `Set-Cookie` response header is not provided and cannot be modified
  or removed without specifying `'extraHeaders'` in `opt_extraInfoSpec`.
  Starting from Chrome 89, the `X-Frame-Options` response header cannot be effectively modified
  or removed without specifying `'extraHeaders'` in `opt_extraInfoSpec`.Note: Specifying `'extraHeaders'` in `opt_extraInfoSpec` may have a negative impact on
  performance, hence it should only be used when really necessary.
  The webRequest API only exposes requests that the extension has permission to see, given its [host
  permissions](/docs/extensions/develop/concepts/declare-permissions). Moreover, only the following schemes are accessible: `http://`, `https://`,
  `ftp://`, `file://`, `ws://` (since Chrome 58), `wss://` (since Chrome 58), `urn:` (since Chrome 91), or
  `chrome-extension://`. In addition, even certain requests with URLs using one of the above schemes
  are hidden. These include `chrome-extension://other_extension_id` where `other_extension_id` is not
  the ID of the extension to handle the request, `https://www.google.com/chrome`, and other sensitive
  requests core to browser functionality. Also synchronous XMLHttpRequests from your extension are
  hidden from blocking event handlers in order to prevent deadlocks. Note that for some of the
  supported schemes the set of available events might be limited due to the nature of the
  corresponding protocol. For example, for the file: scheme, only `onBeforeRequest`,
  `onResponseStarted`, `onCompleted`, and `onErrorOccurred` may be dispatched.
  Starting from Chrome 58, the webRequest API supports intercepting the WebSocket handshake request.
  Since the handshake is done by means of an HTTP upgrade request, its flow fits into HTTP-oriented
  webRequest model. Note that the API does not intercept:

* Individual messages sent over an established WebSocket connection.
* WebSocket closing connection.
  Redirects are not supported for WebSocket requests.
  Starting from Chrome 72, an extension will be able to intercept a request only if it has host
  permissions to both the requested URL and the request initiator.
  Starting from Chrome 96, the webRequest API supports intercepting the WebTransport over HTTP/3
  handshake request. Since the handshake is done by means of an HTTP CONNECT request, its flow fits
  into HTTP-oriented webRequest model. Note that:

* Once the session is established, extensions cannot observe or intervene in the session via the
  webRequest API.
* Modifying HTTP request headers in `onBeforeSendHeaders` is ignored.
* Redirects and authentications are not supported in WebTransport over HTTP/3.

### Request IDs

Each request is identified by a request ID. This ID is unique within a browser session and the
context of an extension. It remains constant during the life cycle of a request and can be used
to match events for the same request. Note that several HTTP requests are mapped to one web request
in case of HTTP redirection or HTTP authentication.

### Registering event listeners

To register an event listener for a web request, you use a variation on the ``[usual addListener()
function](/docs/extensions/reference/api/events). In addition to specifying a callback function, you have to specify a filter argument, and you may specify an optional extra info argument.
The three arguments to the web request API's `addListener()` have the following definitions:

```
var callback = function(details) {...};
var filter = {...};
var opt_extraInfoSpec = [...];

```

Here's an example of listening for the `onBeforeRequest` event:

```
chrome.webRequest.onBeforeRequest.addListener(
    callback, filter, opt_extraInfoSpec);

```

Each `addListener()` call takes a mandatory callback function as the first parameter. This callback
function is passed a dictionary containing information about the current URL request. The
information in this dictionary depends on the specific event type as well as the content of
`opt_extraInfoSpec`.
If the optional `opt_extraInfoSpec` array contains the string `'blocking'` (only allowed for
specific events), the callback function is handled synchronously. That means that the request is
blocked until the callback function returns. In this case, the callback can return a
``[webRequest.BlockingResponse](#type-BlockingResponse) that determines the further life cycle of the request. Depending
on the context, this response allows canceling or redirecting a request (`onBeforeRequest`),
canceling a request or modifying headers (`onBeforeSendHeaders`, `onHeadersReceived`), and
canceling a request or providing authentication credentials (`onAuthRequired`).
If the optional `opt_extraInfoSpec` array contains the string `'asyncBlocking'` instead (only
allowed for `onAuthRequired`), the extension can generate the ``[webRequest.BlockingResponse](#type-BlockingResponse)
asynchronously.
The ``[webRequest.RequestFilter](#type-RequestFilter)`filter` allows limiting the requests for which events are
triggered in various dimensions:URLs[URL patterns](/docs/extensions/develop/concepts/match-patterns) such as `*://www.google.com/foo*bar`.TypesRequest types such as `main_frame` (a document that is loaded for a top-level frame), `sub_frame` (a
document that is loaded for an embedded frame), and `image` (an image on a web site). See
``[webRequest.RequestFilter](#type-RequestFilter).Tab IDThe identifier for one tab.Window IDThe identifier for a window.
Depending on the event type, you can specify strings in `opt_extraInfoSpec` to ask for additional
information about the request. This is used to provide detailed information on request's data only
if explicitly requested.

### Handling authentication

To handle requests for HTTP authentication, add the `"webRequestAuthProvider"`
permission to your manifest file:

```
{
  "permissions": [
    "webRequest",
    "webRequestAuthProvider"
  ]
}

```

Note that this permission is not required for a policy installed extension with
the `"webRequestBlocking"` permission.
To provide credentials synchronously:

```
chrome.webRequest.onAuthRequired.addListener((details) => {
    return {
      authCredentials: {
        username: 'guest',
        password: 'guest'
      }
    };
  },
  { urls: ['https://httpbin.org/basic-auth/guest/guest'] },
  ['blocking']
);

```

To provide credentials asynchronously:

```
chrome.webRequest.onAuthRequired.addListener((details, callback) => {
    callback({
      authCredentials: {
        username: 'guest',
        password: 'guest'
      }
    });
  },
  { urls: ['https://httpbin.org/basic-auth/guest/guest'] },
  ['asyncBlocking']
);

```

### Implementation details

Several implementation details can be important to understand when developing an extension that uses
the web request API:

#### web_accessible_resources

When an extension uses webRequest APIs to redirect a public resource request to a resource that is not web accessible, it is blocked and will result in an error. The above holds true even if the resource that is not web accessible is owned by the redirecting extension. To declare resources for use with declarativeWebRequest APIs, the `"web_accessible_resources"` array must be declared and populated in the manifest as documented [here](/docs/extensions/mv3/manifest/web_accessible_resources).

#### Conflict resolution

In the current implementation of the web request API, a request is considered canceled if at
least one extension instructs to cancel the request. If an extension cancels a request, all
extensions are notified by an `onErrorOccurred` event. Only one extension can redirect a
request or modify a header at a time. If more than one extension attempts to modify the request, the
most recently installed extension wins, and all others are ignored. An extension is not notified if
its instruction to modify or redirect has been ignored.

#### Caching

Chrome employs two caches—an on-disk cache and a very fast in-memory cache. The lifetime of an
in-memory cache is attached to the lifetime of a render process, which roughly corresponds to a tab.
Requests that are answered from the in-memory cache are invisible to the web request API. If a
request handler changes its behavior (for example, the behavior according to which requests are
blocked), a simple page refresh might not respect this changed behavior. To ensure the behavior
change goes through, call `handlerBehaviorChanged()` to flush the in-memory cache. But don't do it
often; flushing the cache is a very expensive operation. You don't need to call
`handlerBehaviorChanged()` after registering or unregistering an event listener.

#### Timestamps

The `timestamp` property of web request events is only guaranteed to be internally consistent.
Comparing one event to another event will give you the correct offset between them, but comparing
them to the current time inside the extension (via `(new Date()).getTime()`, for instance) might
give unexpected results.

#### Error handling

If you try to register an event with invalid arguments, then a JavaScript error will be thrown, and
the event handler will not be registered. If an error is thrown while an event is handled or if an
event handler returns an invalid blocking response, an error message is logged to your extension's
console, and the handler is ignored for that request.

## Examples

The following example illustrates how to block all requests to `www.evil.com`:

```
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    return {cancel: details.url.indexOf("://www.evil.com/") != -1};
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);

```

As this function uses a blocking event handler, it requires the `"webRequest"` as well as the
`"webRequestBlocking"` permission in the manifest file.
The following example achieves the same goal in a more efficient way because requests that are not
targeted to `www.evil.com` do not need to be passed to the extension:

```
chrome.webRequest.onBeforeRequest.addListener(
  function(details) { return {cancel: true}; },
  {urls: ["*://www.evil.com/*"]},
  ["blocking"]
);

```

The following example illustrates how to delete the User-Agent header from all requests:

```
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    for (var i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name === 'User-Agent') {
        details.requestHeaders.splice(i, 1);
        break;
      }
    }
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["<all_urls>"]},
  ["blocking", "requestHeaders"]
);

```

To try the `chrome.webRequest` API,
install the [webRequest sample](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/webRequest/) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples)
repository.

## Types

### BlockingResponse

Returns value for event handlers that have the 'blocking' extraInfoSpec applied. Allows the event handler to modify network requests.

#### Properties

- authCredentials
  object optional
  Only used as a response to the onAuthRequired event. If set, the request is made using the supplied credentials.

- password
  string
- username
  string
- cancel
  boolean optional
  If true, the request is cancelled. This prevents the request from being sent. This can be used as a response to the onBeforeRequest, onBeforeSendHeaders, onHeadersReceived and onAuthRequired events.
- redirectUrl
  string optional
  Only used as a response to the onBeforeRequest and onHeadersReceived events. If set, the original request is prevented from being sent/completed and is instead redirected to the given URL. Redirections to non-HTTP schemes such as `data:` are allowed. Redirects initiated by a redirect action use the original request method for the redirect, with one exception: If the redirect is initiated at the onHeadersReceived stage, then the redirect will be issued using the GET method. Redirects from URLs with `ws://` and `wss://` schemes are ignored.
- requestHeaders
  [HttpHeaders](#type-HttpHeaders)optional
  Only used as a response to the onBeforeSendHeaders event. If set, the request is made with these request headers instead.
- responseHeaders
  [HttpHeaders](#type-HttpHeaders)optional
  Only used as a response to the onHeadersReceived event. If set, the server is assumed to have responded with these response headers instead. Only return `responseHeaders` if you really want to modify the headers in order to limit the number of conflicts (only one extension may modify `responseHeaders` for each request).

### FormDataItem

Chrome 66+

Contains data passed within form data. For urlencoded form it is stored as string if data is utf-8 string and as ArrayBuffer otherwise. For form-data it is ArrayBuffer. If form-data represents uploading file, it is string with filename, if the filename is provided.

#### Enum

ArrayBuffer
string

### HttpHeaders

An array of HTTP headers. Each header is represented as a dictionary containing the keys `name` and either `value` or `binaryValue`.

#### Type

object[]

#### Properties

- binaryValue
  number[] optional
  Value of the HTTP header if it cannot be represented by UTF-8, stored as individual byte values (0..255).
- name
  string
  Name of the HTTP header.
- value
  string optional
  Value of the HTTP header if it can be represented by UTF-8.

### IgnoredActionType

Chrome 70+

#### Enum

"redirect"

"request_headers"

"response_headers"

"auth_credentials"

### OnAuthRequiredOptions

Chrome 44+

#### Enum

"responseHeaders"
Specifies that the response headers should be included in the event.
"blocking"
Specifies the request is blocked until the callback function returns.
"asyncBlocking"
Specifies that the callback function is handled asynchronously.
"extraHeaders"
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

### OnBeforeRedirectOptions

Chrome 44+

#### Enum

"responseHeaders"
Specifies that the response headers should be included in the event.
"extraHeaders"
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

### OnBeforeRequestOptions

Chrome 44+

#### Enum

"blocking"
Specifies the request is blocked until the callback function returns.
"requestBody"
Specifies that the request body should be included in the event.
"extraHeaders"
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

### OnBeforeSendHeadersOptions

Chrome 44+

#### Enum

"requestHeaders"
Specifies that the request header should be included in the event.
"blocking"
Specifies the request is blocked until the callback function returns.
"extraHeaders"
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

### OnCompletedOptions

Chrome 44+

#### Enum

"responseHeaders"
Specifies that the response headers should be included in the event.
"extraHeaders"
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

### OnErrorOccurredOptions

Chrome 79+

#### Value

"extraHeaders"

### OnHeadersReceivedOptions

Chrome 44+

#### Enum

"blocking"
Specifies the request is blocked until the callback function returns.
"responseHeaders"
Specifies that the response headers should be included in the event.
"extraHeaders"
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).
"securityInfo"
Specifies that the SecurityInfo should be included in the event.
"securityInfoRawDer"
Specifies that the SecurityInfo with raw bytes of certificates should be included in the event.

### OnResponseStartedOptions

Chrome 44+

#### Enum

"responseHeaders"
Specifies that the response headers should be included in the event.
"extraHeaders"
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

### OnSendHeadersOptions

Chrome 44+

#### Enum

"requestHeaders"
Specifies that the request header should be included in the event.
"extraHeaders"
Specifies that headers can violate Cross-Origin Resource Sharing (CORS).

### RequestFilter

An object describing filters to apply to webRequest events.

#### Properties

- tabId
  number optional
- types
  [ResourceType](#type-ResourceType)[] optional
  A list of request types. Requests that cannot match any of the types will be filtered out.
- urls
  string[]
  A list of URLs or URL patterns. Requests that cannot match any of the URLs will be filtered out.
- windowId
  number optional

### ResourceType

Chrome 44+

#### Enum

"main_frame"
Specifies the resource as the main frame.
"sub_frame"
Specifies the resource as a sub frame.
"stylesheet"
Specifies the resource as a stylesheet.
"script"
Specifies the resource as a script.
"image"
Specifies the resource as an image.
"font"
Specifies the resource as a font.
"object"
Specifies the resource as an object.
"xmlhttprequest"
Specifies the resource as an XMLHttpRequest.
"ping"
Specifies the resource as a ping.
"csp_report"
Specifies the resource as a Content Security Policy (CSP) report.
"media"
Specifies the resource as a media object.
"websocket"
Specifies the resource as a WebSocket.
"webbundle"
Specifies the resource as a WebBundle.
"other"
Specifies the resource as a type not included in the listed types.

### SecurityInfo

Chrome 144+

#### Properties

- certificates
  object[]
  A list of certificates

- fingerprint
  object
  Fingerprints of the certificate.

- sha256
  string
  sha256 fingerprint of the certificate.
- rawDER
  ArrayBuffer optional
  Raw bytes of DER encoded server certificate
- state
  string
  State of the connection. One of secure, insecure, broken.

### UploadData

Contains data uploaded in a URL request.

#### Properties

- bytes
  any optional
  An ArrayBuffer with a copy of the data.
- file
  string optional
  A string with the file's path and name.

## Properties

### MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES

The maximum number of times that `handlerBehaviorChanged` can be called per 10 minute sustained interval. `handlerBehaviorChanged` is an expensive function call that shouldn't be called often.

#### Value

20

## Methods

### handlerBehaviorChanged()

```
chrome.webRequest.handlerBehaviorChanged(): Promise<void>
```

Needs to be called when the behavior of the webRequest handlers has changed to prevent incorrect handling due to caching. This function call is expensive. Don't call it often.

#### Returns

Promise<void>Chrome 116+

## Events

### onActionIgnored

Chrome 70+

```
chrome.webRequest.onActionIgnored.addListener(
  callback: function,
)
```

Fired when an extension's proposed modification to a network request is ignored. This happens in case of conflicts with other extensions.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- action
  [IgnoredActionType](#type-IgnoredActionType)
  The proposed action which was ignored.
- requestId
  string
  The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.

### onAuthRequired

```
chrome.webRequest.onAuthRequired.addListener(
  callback: function,
  filter: [RequestFilter](#type-RequestFilter),
  extraInfoSpec?: [OnAuthRequiredOptions](#type-OnAuthRequiredOptions)[],
)
```

Fired when an authentication failure is received. The listener has three options: it can provide authentication credentials, it can cancel the request and display the error page, or it can take no action on the challenge. If bad user credentials are provided, this may be called multiple times for the same request. Note, only one of `'blocking'` or `'asyncBlocking'` modes must be specified in the `extraInfoSpec` parameter.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object, asyncCallback?: function) => [BlockingResponse](#type-BlockingResponse) | undefined
```

- details
  object

- challenger
  object
  The server requesting authentication.

- host
  string
- port
  number
- documentId
  string optionalChrome 106+

The UUID of the document making the request.

- documentLifecycle
  [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-DocumentLifecycle)Chrome 106+

The lifecycle the document is in.

- frameId
  number
  The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
- frameType
  [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-FrameType)Chrome 106+

The type of frame the request occurred in.

- initiator
  string optionalChrome 63+

The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.

- isProxy
  boolean
  True for Proxy-Authenticate, false for WWW-Authenticate.
- method
  string
  Standard HTTP method.
- parentDocumentId
  string optionalChrome 106+

The UUID of the parent document owning this frame. This is not set if there is no parent.

- parentFrameId
  number
  ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
- realm
  string optional
  The authentication realm provided by the server, if there is one.
- requestId
  string
  The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
- responseHeaders
  [HttpHeaders](#type-HttpHeaders)optional
  The HTTP response headers that were received along with this response.
- scheme
  string
  The authentication scheme, e.g. Basic or Digest.
- statusCode
  numberChrome 43+

Standard HTTP status code returned by the server.

- statusLine
  string
  HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line) or an empty string if there are no headers.
- tabId
  number
  The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
- timeStamp
  number
  The time when this signal is triggered, in milliseconds since the epoch.
- type
  [ResourceType](#type-ResourceType)
  How the requested resource will be used.
- url
  string
- asyncCallback
  function optionalChrome 58+

                              The `asyncCallback` parameter looks like:

```
(response: [BlockingResponse](#type-BlockingResponse)) => void
```

- response
  [BlockingResponse](#type-BlockingResponse)

- returns
  [BlockingResponse](#type-BlockingResponse) | undefined
  If "blocking" is specified in the "extraInfoSpec" parameter, the event listener should return an object of this type.
- filter
  [RequestFilter](#type-RequestFilter)
- extraInfoSpec
  [OnAuthRequiredOptions](#type-OnAuthRequiredOptions)[] optional

### onBeforeRedirect

```
chrome.webRequest.onBeforeRedirect.addListener(
  callback: function,
  filter: [RequestFilter](#type-RequestFilter),
  extraInfoSpec?: [OnBeforeRedirectOptions](#type-OnBeforeRedirectOptions)[],
)
```

Fired when a server-initiated redirect is about to occur.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- documentId
  string optionalChrome 106+

The UUID of the document making the request.

- documentLifecycle
  [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-DocumentLifecycle)Chrome 106+

The lifecycle the document is in.

- frameId
  number
  The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
- frameType
  [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-FrameType)Chrome 106+

The type of frame the request occurred in.

- fromCache
  boolean
  Indicates if this response was fetched from disk cache.
- initiator
  string optionalChrome 63+

The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.

- ip
  string optional
  The server IP address that the request was actually sent to. Note that it may be a literal IPv6 address.
- method
  string
  Standard HTTP method.
- parentDocumentId
  string optionalChrome 106+

The UUID of the parent document owning this frame. This is not set if there is no parent.

- parentFrameId
  number
  ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
- redirectUrl
  string
  The new URL.
- requestId
  string
  The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
- responseHeaders
  [HttpHeaders](#type-HttpHeaders)optional
  The HTTP response headers that were received along with this redirect.
- statusCode
  number
  Standard HTTP status code returned by the server.
- statusLine
  string
  HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line) or an empty string if there are no headers.
- tabId
  number
  The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
- timeStamp
  number
  The time when this signal is triggered, in milliseconds since the epoch.
- type
  [ResourceType](#type-ResourceType)
  How the requested resource will be used.
- url
  string
- filter
  [RequestFilter](#type-RequestFilter)
- extraInfoSpec
  [OnBeforeRedirectOptions](#type-OnBeforeRedirectOptions)[] optional

### onBeforeRequest

```
chrome.webRequest.onBeforeRequest.addListener(
  callback: function,
  filter: [RequestFilter](#type-RequestFilter),
  extraInfoSpec?: [OnBeforeRequestOptions](#type-OnBeforeRequestOptions)[],
)
```

Fired when a request is about to occur.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object) => [BlockingResponse](#type-BlockingResponse) | undefined
```

- details
  object

- documentId
  string optionalChrome 106+

The UUID of the document making the request.

- documentLifecycle
  [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-DocumentLifecycle)optionalChrome 106+

The lifecycle the document is in.

- frameId
  number
  The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
- frameType
  [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-FrameType)optionalChrome 106+

The type of frame the request occurred in.

- initiator
  string optionalChrome 63+

The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.

- method
  string
  Standard HTTP method.
- parentDocumentId
  string optionalChrome 106+

The UUID of the parent document owning this frame. This is not set if there is no parent.

- parentFrameId
  number
  ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
- requestBody
  object optional
  Contains the HTTP request body data. Only provided if extraInfoSpec contains 'requestBody'.

- error
  string optional
  Errors when obtaining request body data.
- formData
  object optional
  If the request method is POST and the body is a sequence of key-value pairs encoded in UTF8, encoded as either multipart/form-data, or application/x-www-form-urlencoded, this dictionary is present and for each key contains the list of all values for that key. If the data is of another media type, or if it is malformed, the dictionary is not present. An example value of this dictionary is {'key': ['value1', 'value2']}.
- raw
  [UploadData](#type-UploadData)[] optional
  If the request method is PUT or POST, and the body is not already parsed in formData, then the unparsed request body elements are contained in this array.
- requestId
  string
  The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
- tabId
  number
  The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
- timeStamp
  number
  The time when this signal is triggered, in milliseconds since the epoch.
- type
  [ResourceType](#type-ResourceType)
  How the requested resource will be used.
- url
  string

- returns
  [BlockingResponse](#type-BlockingResponse) | undefined
  If "blocking" is specified in the "extraInfoSpec" parameter, the event listener should return an object of this type.
- filter
  [RequestFilter](#type-RequestFilter)
- extraInfoSpec
  [OnBeforeRequestOptions](#type-OnBeforeRequestOptions)[] optional

### onBeforeSendHeaders

```
chrome.webRequest.onBeforeSendHeaders.addListener(
  callback: function,
  filter: [RequestFilter](#type-RequestFilter),
  extraInfoSpec?: [OnBeforeSendHeadersOptions](#type-OnBeforeSendHeadersOptions)[],
)
```

Fired before sending an HTTP request, once the request headers are available. This may occur after a TCP connection is made to the server, but before any HTTP data is sent.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object) => [BlockingResponse](#type-BlockingResponse) | undefined
```

- details
  object

- documentId
  string optionalChrome 106+

The UUID of the document making the request.

- documentLifecycle
  [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-DocumentLifecycle)Chrome 106+

The lifecycle the document is in.

- frameId
  number
  The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
- frameType
  [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-FrameType)Chrome 106+

The type of frame the request occurred in.

- initiator
  string optionalChrome 63+

The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.

- method
  string
  Standard HTTP method.
- parentDocumentId
  string optionalChrome 106+

The UUID of the parent document owning this frame. This is not set if there is no parent.

- parentFrameId
  number
  ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
- requestHeaders
  [HttpHeaders](#type-HttpHeaders)optional
  The HTTP request headers that are going to be sent out with this request.
- requestId
  string
  The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
- tabId
  number
  The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
- timeStamp
  number
  The time when this signal is triggered, in milliseconds since the epoch.
- type
  [ResourceType](#type-ResourceType)
  How the requested resource will be used.
- url
  string

- returns
  [BlockingResponse](#type-BlockingResponse) | undefined
  If "blocking" is specified in the "extraInfoSpec" parameter, the event listener should return an object of this type.
- filter
  [RequestFilter](#type-RequestFilter)
- extraInfoSpec
  [OnBeforeSendHeadersOptions](#type-OnBeforeSendHeadersOptions)[] optional

### onCompleted

```
chrome.webRequest.onCompleted.addListener(
  callback: function,
  filter: [RequestFilter](#type-RequestFilter),
  extraInfoSpec?: [OnCompletedOptions](#type-OnCompletedOptions)[],
)
```

Fired when a request is completed.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- documentId
  string optionalChrome 106+

The UUID of the document making the request.

- documentLifecycle
  [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-DocumentLifecycle)Chrome 106+

The lifecycle the document is in.

- frameId
  number
  The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
- frameType
  [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-FrameType)Chrome 106+

The type of frame the request occurred in.

- fromCache
  boolean
  Indicates if this response was fetched from disk cache.
- initiator
  string optionalChrome 63+

The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.

- ip
  string optional
  The server IP address that the request was actually sent to. Note that it may be a literal IPv6 address.
- method
  string
  Standard HTTP method.
- parentDocumentId
  string optionalChrome 106+

The UUID of the parent document owning this frame. This is not set if there is no parent.

- parentFrameId
  number
  ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
- requestId
  string
  The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
- responseHeaders
  [HttpHeaders](#type-HttpHeaders)optional
  The HTTP response headers that were received along with this response.
- statusCode
  number
  Standard HTTP status code returned by the server.
- statusLine
  string
  HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line) or an empty string if there are no headers.
- tabId
  number
  The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
- timeStamp
  number
  The time when this signal is triggered, in milliseconds since the epoch.
- type
  [ResourceType](#type-ResourceType)
  How the requested resource will be used.
- url
  string
- filter
  [RequestFilter](#type-RequestFilter)
- extraInfoSpec
  [OnCompletedOptions](#type-OnCompletedOptions)[] optional

### onErrorOccurred

```
chrome.webRequest.onErrorOccurred.addListener(
  callback: function,
  filter: [RequestFilter](#type-RequestFilter),
  extraInfoSpec?: [OnErrorOccurredOptions](#type-OnErrorOccurredOptions)[],
)
```

Fired when an error occurs.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- documentId
  string optionalChrome 106+

The UUID of the document making the request. This value is not present if the request is a navigation of a frame.

- documentLifecycle
  [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-DocumentLifecycle)Chrome 106+

The lifecycle the document is in.

- error
  string
  The error description. This string is not guaranteed to remain backwards compatible between releases. You must not parse and act based upon its content.
- frameId
  number
  The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
- frameType
  [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-FrameType)Chrome 106+

The type of frame the request occurred in.

- fromCache
  boolean
  Indicates if this response was fetched from disk cache.
- initiator
  string optionalChrome 63+

The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.

- ip
  string optional
  The server IP address that the request was actually sent to. Note that it may be a literal IPv6 address.
- method
  string
  Standard HTTP method.
- parentDocumentId
  string optionalChrome 106+

The UUID of the parent document owning this frame. This is not set if there is no parent.

- parentFrameId
  number
  ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
- requestId
  string
  The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
- tabId
  number
  The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
- timeStamp
  number
  The time when this signal is triggered, in milliseconds since the epoch.
- type
  [ResourceType](#type-ResourceType)
  How the requested resource will be used.
- url
  string
- filter
  [RequestFilter](#type-RequestFilter)
- extraInfoSpec
  [OnErrorOccurredOptions](#type-OnErrorOccurredOptions)[] optional

### onHeadersReceived

```
chrome.webRequest.onHeadersReceived.addListener(
  callback: function,
  filter: [RequestFilter](#type-RequestFilter),
  extraInfoSpec?: [OnHeadersReceivedOptions](#type-OnHeadersReceivedOptions)[],
)
```

Fired when HTTP response headers of a request have been received.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object) => [BlockingResponse](#type-BlockingResponse) | undefined
```

- details
  object

- documentId
  string optionalChrome 106+

The UUID of the document making the request.

- documentLifecycle
  [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-DocumentLifecycle)Chrome 106+

The lifecycle the document is in.

- frameId
  number
  The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
- frameType
  [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-FrameType)Chrome 106+

The type of frame the request occurred in.

- initiator
  string optionalChrome 63+

The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.

- method
  string
  Standard HTTP method.
- parentDocumentId
  string optionalChrome 106+

The UUID of the parent document owning this frame. This is not set if there is no parent.

- parentFrameId
  number
  ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
- requestId
  string
  The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
- responseHeaders
  [HttpHeaders](#type-HttpHeaders)optional
  The HTTP response headers that have been received with this response.
- securityInfo
  [SecurityInfo](#type-SecurityInfo)optionalChrome 144+

Information about the TLS/QUIC connection used for the underlying connection. Only provided if `securityInfo` is specified in the `extraInfoSpec` parameter.

- statusCode
  numberChrome 43+

Standard HTTP status code returned by the server.

- statusLine
  string
  HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line).
- tabId
  number
  The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
- timeStamp
  number
  The time when this signal is triggered, in milliseconds since the epoch.
- type
  [ResourceType](#type-ResourceType)
  How the requested resource will be used.
- url
  string

- returns
  [BlockingResponse](#type-BlockingResponse) | undefined
  If "blocking" is specified in the "extraInfoSpec" parameter, the event listener should return an object of this type.
- filter
  [RequestFilter](#type-RequestFilter)
- extraInfoSpec
  [OnHeadersReceivedOptions](#type-OnHeadersReceivedOptions)[] optional

### onResponseStarted

```
chrome.webRequest.onResponseStarted.addListener(
  callback: function,
  filter: [RequestFilter](#type-RequestFilter),
  extraInfoSpec?: [OnResponseStartedOptions](#type-OnResponseStartedOptions)[],
)
```

Fired when the first byte of the response body is received. For HTTP requests, this means that the status line and response headers are available.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- documentId
  string optionalChrome 106+

The UUID of the document making the request.

- documentLifecycle
  [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-DocumentLifecycle)Chrome 106+

The lifecycle the document is in.

- frameId
  number
  The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
- frameType
  [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-FrameType)Chrome 106+

The type of frame the request occurred in.

- fromCache
  boolean
  Indicates if this response was fetched from disk cache.
- initiator
  string optionalChrome 63+

The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.

- ip
  string optional
  The server IP address that the request was actually sent to. Note that it may be a literal IPv6 address.
- method
  string
  Standard HTTP method.
- parentDocumentId
  string optionalChrome 106+

The UUID of the parent document owning this frame. This is not set if there is no parent.

- parentFrameId
  number
  ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
- requestId
  string
  The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
- responseHeaders
  [HttpHeaders](#type-HttpHeaders)optional
  The HTTP response headers that were received along with this response.
- statusCode
  number
  Standard HTTP status code returned by the server.
- statusLine
  string
  HTTP status line of the response or the 'HTTP/0.9 200 OK' string for HTTP/0.9 responses (i.e., responses that lack a status line) or an empty string if there are no headers.
- tabId
  number
  The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
- timeStamp
  number
  The time when this signal is triggered, in milliseconds since the epoch.
- type
  [ResourceType](#type-ResourceType)
  How the requested resource will be used.
- url
  string
- filter
  [RequestFilter](#type-RequestFilter)
- extraInfoSpec
  [OnResponseStartedOptions](#type-OnResponseStartedOptions)[] optional

### onSendHeaders

```
chrome.webRequest.onSendHeaders.addListener(
  callback: function,
  filter: [RequestFilter](#type-RequestFilter),
  extraInfoSpec?: [OnSendHeadersOptions](#type-OnSendHeadersOptions)[],
)
```

Fired just before a request is going to be sent to the server (modifications of previous onBeforeSendHeaders callbacks are visible by the time onSendHeaders is fired).

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- documentId
  string optionalChrome 106+

The UUID of the document making the request.

- documentLifecycle
  [extensionTypes.DocumentLifecycle](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-DocumentLifecycle)Chrome 106+

The lifecycle the document is in.

- frameId
  number
  The value 0 indicates that the request happens in the main frame; a positive value indicates the ID of a subframe in which the request happens. If the document of a (sub-)frame is loaded (`type` is `main_frame` or `sub_frame`), `frameId` indicates the ID of this frame, not the ID of the outer frame. Frame IDs are unique within a tab.
- frameType
  [extensionTypes.FrameType](https://developer.chrome.com/docs/extensions/reference/api/extensionTypes/#type-FrameType)Chrome 106+

The type of frame the request occurred in.

- initiator
  string optionalChrome 63+

The origin where the request was initiated. This does not change through redirects. If this is an opaque origin, the string 'null' will be used.

- method
  string
  Standard HTTP method.
- parentDocumentId
  string optionalChrome 106+

The UUID of the parent document owning this frame. This is not set if there is no parent.

- parentFrameId
  number
  ID of frame that wraps the frame which sent the request. Set to -1 if no parent frame exists.
- requestHeaders
  [HttpHeaders](#type-HttpHeaders)optional
  The HTTP request headers that have been sent out with this request.
- requestId
  string
  The ID of the request. Request IDs are unique within a browser session. As a result, they could be used to relate different events of the same request.
- tabId
  number
  The ID of the tab in which the request takes place. Set to -1 if the request isn't related to a tab.
- timeStamp
  number
  The time when this signal is triggered, in milliseconds since the epoch.
- type
  [ResourceType](#type-ResourceType)
  How the requested resource will be used.
- url
  string
- filter
  [RequestFilter](#type-RequestFilter)
- extraInfoSpec
  [OnSendHeadersOptions](#type-OnSendHeadersOptions)[] optional
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-12 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-12 UTC."],[],[]]
