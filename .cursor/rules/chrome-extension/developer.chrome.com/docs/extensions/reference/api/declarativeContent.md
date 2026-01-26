## Description

Use the `chrome.declarativeContent` API to take actions depending on the content of a page, without requiring permission to read the page's content.

## Permissions

`declarativeContent`

## Concepts and usage

Key term: An [extension's action](/docs/extensions/reference/api/action) controls the extension's toolbar icon.
The Declarative Content API lets you enable your extension's action depending on the URL of a
web page, or if a CSS selector matches an element on the page, without needing to
add [host permissions](/docs/extensions/develop/concepts/declare-permissions#host-permissions) or inject a [content script](/docs/extensions/develop/concepts/content-scripts).
Use the [activeTab](/docs/extensions/develop/concepts/activeTab) permission to interact with a page after the user clicks on the
extension's action.

### Rules

Rules consists of conditions and actions. If any of the conditions is fulfilled, all actions are
executed. The actions are `[setIcon()](#type-SetIcon) and `[showAction()](#type-ShowAction).
The ``[PageStateMatcher](#type-PageStateMatcher) matches web pages if and only if all listed
criteria are met. It can match a [page url](#page-url), a [css compound selector](#css)
or the [bookmarked state](#bookmarked) of a page. The following rule enables
the extension's action on Google pages when a password field is present:

```
let rule1 = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { hostSuffix: '.google.com', schemes: ['https'] },
      css: ["input[type='password']"]
    })
  ],
  actions: [ new chrome.declarativeContent.ShowAction() ]
};


```

Success: All conditions and actions are created using a constructor as shown in the previous example.
To also enable the extension's action for Google sites with a video, you can add a second
condition, as each condition is sufficient to trigger all specified actions:

```
let rule2 = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { hostSuffix: '.google.com', schemes: ['https'] },
      css: ["input[type='password']"]
    }),
    new chrome.declarativeContent.PageStateMatcher({
      css: ["video"]
    })
  ],
  actions: [ new chrome.declarativeContent.ShowAction() ]
};

```

The `[onPageChanged](#event-onPageChanged) event tests whether any rule has at least one fulfilled
condition and executes the actions. Rules persist across browsing sessions; therefore, during
extension installation time you should first use `[removeRules](/docs/extensions/reference/api/events#remove_rules) to clear
previously installed rules and then use ``[addRules](/docs/extensions/reference/api/events#add_rules) to register new ones.

```
chrome.runtime.onInstalled.addListener(function(details) {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([rule2]);
  });
});

```

Note: You should always register or unregister rules in bulk because each of these operations recreates
internal data structures. This re-creation is computationally expensive but facilitates a faster
matching algorithm.
With the [activeTab](/docs/extensions/develop/concepts/activeTab) permission, your extension won't display any permission
warnings and when the user clicks the extension action, it will only run on relevant pages.

### Page URL matching

The ``[PageStateMatcher.pageurl](#property-PageStateMatcher-pageUrl) matches when the URL criteria are fulfilled. The
most common criteria are a concatenation of either host, path, or URL, followed by Contains, Equals, Prefix, or
Suffix. The following table contains a few examples:CriteriaMatches`{ hostSuffix: 'google.com' }`All Google URLs`{ pathPrefix: '/docs/extensions'` }Extension docs URLs`{ urlContains: 'developer.chrome.com'` }All chrome developers docs URLs
All criteria are case sensitive. For a complete list of criteria, see [UrlFilter](/docs/extensions/reference/api/events#type-UrlFilter).

### CSS Matching

``[PageStateMatcher.css](#property-PageStateMatcher-css) conditions must be [compound selectors](https://www.w3.org/TR/selectors4/#compound),
meaning that you can't include [combinators](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors#combinators) like whitespace or "`>`" in your
selectors. This helps Chrome match the selectors more efficiently.Compound Selectors (OK)Complex Selectors (Not OK)`a``div p`iframe.special[src^='http']`p>span.highlight`ns|*`p + ol`#abcd:checked`p::first-line`CSS conditions only match displayed elements: if an element that matches your selector is`display:none`or one of its parent elements is`display:none`, it doesn't cause the condition to
match. Elements styled with `visibility:hidden`, positioned off-screen, or hidden by other elements
can still make your condition match.

### Bookmarked state matching

The ``[PageStateMatcher.isBookmarked](#property-PageStateMatcher-isBookmarked) condition allows matching of the
bookmarked state of the current URL in the user's profile. To make use of this condition the
"bookmarks" permission must be declared in the extension [manifest](/docs/extensions/reference/manifest).

## Types

### ImageDataType

See [https://developer.mozilla.org/en-US/docs/Web/API/ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData).

#### Type

ImageData

### PageStateMatcher

Matches the state of a web page based on various criteria.

#### Properties

- constructor
  void

                            The `constructor` function looks like:

```
(arg: [PageStateMatcher](#type-PageStateMatcher)) => {...}
```

- arg
  [PageStateMatcher](#type-PageStateMatcher)

- returns
  [PageStateMatcher](#type-PageStateMatcher)
- css
  string[] optional
  Matches if all of the CSS selectors in the array match displayed elements in a frame with the same origin as the page's main frame. All selectors in this array must be [compound selectors](https://www.w3.org/TR/selectors4/#compound) to speed up matching. Note: Listing hundreds of CSS selectors or listing CSS selectors that match hundreds of times per page can slow down web sites.
- isBookmarked
  boolean optionalChrome 45+

Matches if the bookmarked state of the page is equal to the specified value. Requres the [bookmarks permission](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions).

- pageUrl
  [UrlFilter](https://developer.chrome.com/docs/extensions/reference/events/#type-UrlFilter)optional
  Matches if the conditions of the `UrlFilter` are fulfilled for the top-level URL of the page.

### RequestContentScript

Declarative event action that injects a content script.
WARNING: This action is still experimental and is not supported on stable builds of Chrome.

#### Properties

- constructor
  void

                            The `constructor` function looks like:

```
(arg: [RequestContentScript](#type-RequestContentScript)) => {...}
```

- arg
  [RequestContentScript](#type-RequestContentScript)

- returns
  [RequestContentScript](#type-RequestContentScript)
- allFrames
  boolean optional
  Whether the content script runs in all frames of the matching page, or in only the top frame. Default is `false`.
- css
  string[] optional
  Names of CSS files to be injected as a part of the content script.
- js
  string[] optional
  Names of JavaScript files to be injected as a part of the content script.
- matchAboutBlank
  boolean optional
  Whether to insert the content script on `about:blank` and `about:srcdoc`. Default is `false`.

### SetIcon

Declarative event action that sets the n-dip square icon for the extension's [page action](https://developer.chrome.com/docs/extensions/reference/pageAction/) or [browser action](https://developer.chrome.com/docs/extensions/reference/browserAction/) while the corresponding conditions are met. This action can be used without [host permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#host-permissions), but the extension must have a page or browser action.
Exactly one of `imageData` or `path` must be specified. Both are dictionaries mapping a number of pixels to an image representation. The image representation in `imageData` is an [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object; for example, from a `canvas` element, while the image representation in `path` is the path to an image file relative to the extension's manifest. If `scale` screen pixels fit into a device-independent pixel, the `scale * n` icon is used. If that scale is missing, another image is resized to the required size.

#### Properties

- constructor
  void

                            The `constructor` function looks like:

```
(arg: [SetIcon](#type-SetIcon)) => {...}
```

- arg
  [SetIcon](#type-SetIcon)

- returns
  [SetIcon](#type-SetIcon)
- imageData
  ImageData | object optional
  Either an `ImageData` object or a dictionary {size -> ImageData} representing an icon to be set. If the icon is specified as a dictionary, the image used is chosen depending on the screen's pixel density. If the number of image pixels that fit into one screen space unit equals `scale`, then an image with size `scale * n` is selected, where n is the size of the icon in the UI. At least one image must be specified. Note that `details.imageData = foo` is equivalent to `details.imageData = {'16': foo}`.

### ShowAction

Chrome 97+

A declarative event action that sets the extension's toolbar [action](https://developer.chrome.com/docs/extensions/reference/action/) to an enabled state while the corresponding conditions are met. This action can be used without [host permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#host-permissions). If the extension has the [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) permission, clicking the page action grants access to the active tab.
On pages where the conditions are not met the extension's toolbar action will be grey-scale, and clicking it will open the context menu, instead of triggering the action.

#### Properties

- constructor
  void

                            The `constructor` function looks like:

```
(arg: [ShowAction](#type-ShowAction)) => {...}
```

- arg
  [ShowAction](#type-ShowAction)

- returns
  [ShowAction](#type-ShowAction)

### ShowPageAction

        Deprecated since Chrome 97

Please use ``[declarativeContent.ShowAction](#type-ShowAction).

A declarative event action that sets the extension's [page action](https://developer.chrome.com/docs/extensions/reference/pageAction/) to an enabled state while the corresponding conditions are met. This action can be used without [host permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#host-permissions), but the extension must have a page action. If the extension has the [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) permission, clicking the page action grants access to the active tab.
On pages where the conditions are not met the extension's toolbar action will be grey-scale, and clicking it will open the context menu, instead of triggering the action.

#### Properties

- constructor
  void

                            The `constructor` function looks like:

```
(arg: [ShowPageAction](#type-ShowPageAction)) => {...}
```

- arg
  [ShowPageAction](#type-ShowPageAction)

- returns
  [ShowPageAction](#type-ShowPageAction)

## Events

### onPageChanged

        Provides the [Declarative Event API](/docs/extensions/reference/api/events#declarative_event_handlers) consisting of `addRules`, `removeRules`, and `getRules`.

#### Conditions

[PageStateMatcher](#type-PageStateMatcher)

#### Actions

[RequestContentScript](#type-RequestContentScript)
[SetIcon](#type-SetIcon)
[ShowPageAction](#type-ShowPageAction)
[ShowAction](#type-ShowAction)
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
