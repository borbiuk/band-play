## Description

Use the `chrome.history` API to interact with the browser's record of visited pages. You can add, remove, and query for URLs in the browser's history. To override the history page with your own version, see [Override Pages](https://developer.chrome.com/extensions/develop/ui/override-chrome-pages).

## Permissions

`history`

To interact with the user's browser history, use the history API.

To use the history API, declare the `"history"` permission in the [extension manifest](/docs/extensions/mv3/manifest). For
example:

```
{
  "name": "My extension",
  ...
  "permissions": [
    "history"
  ],
  ...
}

```

## Concepts and usage

### Transition types

The history API uses transition types to describe how the browser navigated to a particular URL
on a particular visit. For example, if a user visits a page by clicking a link on another page, the
transition type is "link". See the [reference content](#type-TransitionType) for a list of
transition types.

## Examples

To try this API, install the [history API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/history) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.

## Types

### HistoryItem

An object encapsulating one result of a history query.

#### Properties

- id
  string
  The unique identifier for the item.
- lastVisitTime
  number optional
  When this page was last loaded, represented in milliseconds since the epoch.
- title
  string optional
  The title of the page when it was last loaded.
- typedCount
  number optional
  The number of times the user has navigated to this page by typing in the address.
- url
  string optional
  The URL navigated to by a user.
- visitCount
  number optional
  The number of times the user has navigated to this page.

### TransitionType

Chrome 44+

The [transition type](https://developer.chrome.com/docs/extensions/reference/history/#transition_types) for this visit from its referrer.

#### Enum

"link"
The user arrived at this page by clicking a link on another page.
"typed"
The user arrived at this page by typing the URL in the address bar. This is also used for other explicit navigation actions.
"auto_bookmark"
The user arrived at this page through a suggestion in the UI, for example, through a menu item.
"auto_subframe"
The user arrived at this page through subframe navigation that they didn't request, such as through an ad loading in a frame on the previous page. These don't always generate new navigation entries in the back and forward menus.
"manual_subframe"
The user arrived at this page by selecting something in a subframe.
"generated"
The user arrived at this page by typing in the address bar and selecting an entry that didn't look like a URL, such as a Google Search suggestion. For example, a match might have the URL of a Google Search result page, but it might appear to the user as "Search Google for ...". These are different from typed navigations because the user didn't type or see the destination URL. They're also related to keyword navigations.
"auto_toplevel"
The page was specified in the command line or is the start page.
"form_submit"
The user arrived at this page by filling out values in a form and submitting the form. Not all form submissions use this transition type.
"reload"
The user reloaded the page, either by clicking the reload button or by pressing Enter in the address bar. Session restore and Reopen closed tab also use this transition type.
"keyword"
The URL for this page was generated from a replaceable keyword other than the default search provider.
"keyword_generated"
Corresponds to a visit generated for a keyword.

### UrlDetails

Chrome 88+

#### Properties

- url
  string
  The URL for the operation. It must be in the format as returned from a call to `history.search()`.

### VisitItem

An object encapsulating one visit to a URL.

#### Properties

- id
  string
  The unique identifier for the corresponding ``[history.HistoryItem](#type-HistoryItem).
- isLocal
  booleanChrome 115+

True if the visit originated on this device. False if it was synced from a different device.

- referringVisitId
  string
  The visit ID of the referrer.
- transition
  [TransitionType](#type-TransitionType)
  The [transition type](https://developer.chrome.com/docs/extensions/reference/history/#transition_types) for this visit from its referrer.
- visitId
  string
  The unique identifier for this visit.
- visitTime
  number optional
  When this visit occurred, represented in milliseconds since the epoch.

## Methods

### addUrl()

```
chrome.history.addUrl(
  details: [UrlDetails](#type-UrlDetails),
): Promise<void>
```

Adds a URL to the history at the current time with a [transition type](https://developer.chrome.com/docs/extensions/reference/history/#transition_types) of "link".

#### Parameters

- details
  [UrlDetails](#type-UrlDetails)

#### Returns

Promise<void>Chrome 96+

### deleteAll()

```
chrome.history.deleteAll(): Promise<void>
```

Deletes all items from the history.

#### Returns

Promise<void>Chrome 96+

### deleteRange()

```
chrome.history.deleteRange(
  range: object,
): Promise<void>
```

Removes all items within the specified date range from the history. Pages will not be removed from the history unless all visits fall within the range.

#### Parameters

- range
  object

- endTime
  number
  Items added to history before this date, represented in milliseconds since the epoch.
- startTime
  number
  Items added to history after this date, represented in milliseconds since the epoch.

#### Returns

Promise<void>Chrome 96+

### deleteUrl()

```
chrome.history.deleteUrl(
  details: [UrlDetails](#type-UrlDetails),
): Promise<void>
```

Removes all occurrences of the given URL from the history.

#### Parameters

- details
  [UrlDetails](#type-UrlDetails)

#### Returns

Promise<void>Chrome 96+

### getVisits()

```
chrome.history.getVisits(
  details: [UrlDetails](#type-UrlDetails),
): Promise<[VisitItem](#type-VisitItem)[]>
```

Retrieves information about visits to a URL.

#### Parameters

- details
  [UrlDetails](#type-UrlDetails)

#### Returns

Promise<[VisitItem](#type-VisitItem)[]>Chrome 96+

### search()

```
chrome.history.search(
  query: object,
): Promise<[HistoryItem](#type-HistoryItem)[]>
```

Searches the history for the last visit time of each page matching the query.

#### Parameters

- query
  object

- endTime
  number optional
  Limit results to those visited before this date, represented in milliseconds since the epoch.
- maxResults
  number optional
  The maximum number of results to retrieve. Defaults to 100.
- startTime
  number optional
  Limit results to those visited after this date, represented in milliseconds since the epoch. If property is not specified, it will default to 24 hours.
- text
  string
  A free-text query to the history service. Leave this empty to retrieve all pages.

#### Returns

Promise<[HistoryItem](#type-HistoryItem)[]>Chrome 96+

## Events

### onVisited

```
chrome.history.onVisited.addListener(
  callback: function,
)
```

Fired when a URL is visited, providing the `HistoryItem` data for that URL. This event fires before the page has loaded.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(result: [HistoryItem](#type-HistoryItem)) => void
```

- result
  [HistoryItem](#type-HistoryItem)

### onVisitRemoved

```
chrome.history.onVisitRemoved.addListener(
  callback: function,
)
```

Fired when one or more URLs are removed from history. When all visits have been removed the URL is purged from history.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(removed: object) => void
```

- removed
  object

- allHistory
  boolean
  True if all history was removed. If true, then urls will be empty.
- urls
  string[] optional
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
