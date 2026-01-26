## Description

Use the `chrome.devtools.network` API to retrieve the information about network requests displayed by the Developer Tools in the Network panel.
Network requests information is represented in the HTTP Archive format (HAR). The description of
HAR is outside of scope of this document, refer to [HAR v1.2 Specification](http://www.softwareishard.com/blog/har-12-spec/).
In terms of HAR, the `chrome.devtools.network.getHAR()` method returns entire HAR log, while
`chrome.devtools.network.onRequestFinished` event provides HAR entry as an argument to the event
callback.
Note that request content is not provided as part of HAR for efficiency reasons. You may call
request's `getContent()` method to retrieve content.
If the Developer Tools window is opened after the page is loaded, some requests may be missing in
the array of entries returned by `getHAR()`. Reload the page to get all requests. In general, the
list of requests returned by `getHAR()` should match that displayed in the Network panel.
See [DevTools APIs summary](/docs/extensions/how-to/devtools/extend-devtools) for general introduction to using Developer Tools APIs.

## Manifest

The following keys must be declared [in the manifest](/docs/extensions/mv3/manifest) to use this API.`"devtools_page"`

## Examples

The following code logs URLs of all images larger than 40KB as they are loaded:

```
chrome.devtools.network.onRequestFinished.addListener(
  function(request) {
    if (request.response.bodySize > 40*1024) {
      chrome.devtools.inspectedWindow.eval(
          'console.log("Large image: " + unescape("' +
          escape(request.request.url) + '"))');
    }
  }
);

```

To try this API, install the [devtools API examples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/devtools) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.

## Types

### Request

Represents a network request for a document resource (script, image and so on). See HAR Specification for reference.

#### Properties

- getContent
  void
  Returns content of the response body.

                              The `getContent` function looks like:

```
(callback: function) => {...}
```

- callback
  function

                              The `callback` parameter looks like:

```
(content: string, encoding: string) => void
```

- content
  string
  Content of the response body (potentially encoded).
- encoding
  string
  Empty if content is not encoded, encoding name otherwise. Currently, only base64 is supported.

## Methods

### getHAR()

```
chrome.devtools.network.getHAR(
  callback: function,
): void
```

Returns HAR log that contains all known network requests.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(harLog: object) => void
```

- harLog
  object
  A HAR log. See HAR specification for details.

## Events

### onNavigated

```
chrome.devtools.network.onNavigated.addListener(
  callback: function,
)
```

Fired when the inspected window navigates to a new page.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(url: string) => void
```

- url
  string

### onRequestFinished

```
chrome.devtools.network.onRequestFinished.addListener(
  callback: function,
)
```

Fired when a network request is finished and all request data are available.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(request: [Request](#type-Request)) => void
```

- request
  [Request](#type-Request)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
