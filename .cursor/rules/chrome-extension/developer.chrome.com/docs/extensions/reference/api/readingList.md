## Description

Use the `chrome.readingList` API to read from and modify the items in the [Reading List](https://support.google.com/chrome/answer/7343019).

## Permissions

`readingList`

To use the Reading List API, add the `"readingList"` permission in the extension [manifest](/docs/extensions/reference/manifest) file:
manifest.json:

```
{
  "name": "My reading list extension",
  ...
  "permissions": [
    "readingList"
  ]
}

```

## Availability

Chrome 120+
MV3+

Chrome features a reading list located on the side panel. It lets users save web pages to read later or when offline.
Use the Reading List API to retrieve existing items and add or remove items from the list.
Reading list showing a number of articles

## Concepts and usage

### Item ordering

Items in the reading list are not in any guaranteed order.

### Item uniqueness

Items are keyed by URL. This includes the hash and query string.

## Use cases

The following sections demonstrate some common use cases for the Reading List API. See [Extension samples](#examples) for complete extension examples.

### Add an item

To add an item to the reading list, use ``[chrome.readingList.addEntry()](#method-addEntry):

```
chrome.readingList.addEntry({
  title: "New to the web platform in September | web.dev",
  url: "https://developer.chrome.com/",
  hasBeenRead: false
});

```

### Display items

To display items from the reading list, use the ``[chrome.readingList.query()](#method-query) method to retrieve them.
method.

```
const items = await chrome.readingList.query({});

for (const item of items) {
  // Do something do display the item
}

```

### Mark an item as read

You can use ``[chrome.readingList.updateEntry()](#method-updateEntry) to update the title, URL, and read status. The following code marks an item as read:

```
chrome.readingList.updateEntry({
  url: "https://developer.chrome.com/",
  hasBeenRead: true
});

```

### Remove an item

To remove an item, use ``[chrome.readingList.removeEntry()](#method-removeEntry):

```
chrome.readingList.removeEntry({
  url: "https://developer.chrome.com/"
});

```

## Extension samples

For more Reading List API extensions demos, see the [Reading List API sample](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/readingList).

## Types

### AddEntryOptions

#### Properties

- hasBeenRead
  boolean
  Will be `true` if the entry has been read.
- title
  string
  The title of the entry.
- url
  string
  The url of the entry.

### QueryInfo

#### Properties

- hasBeenRead
  boolean optional
  Indicates whether to search for read (`true`) or unread (`false`) items.
- title
  string optional
  A title to search for.
- url
  string optional
  A url to search for.

### ReadingListEntry

#### Properties

- creationTime
  number
  The time the entry was created. Recorded in milliseconds since Jan 1, 1970.
- hasBeenRead
  boolean
  Will be `true` if the entry has been read.
- lastUpdateTime
  number
  The last time the entry was updated. This value is in milliseconds since Jan 1, 1970.
- title
  string
  The title of the entry.
- url
  string
  The url of the entry.

### RemoveOptions

#### Properties

- url
  string
  The url to remove.

### UpdateEntryOptions

#### Properties

- hasBeenRead
  boolean optional
  The updated read status. The existing status remains if a value isn't provided.
- title
  string optional
  The new title. The existing tile remains if a value isn't provided.
- url
  string
  The url that will be updated.

## Methods

### addEntry()

```
chrome.readingList.addEntry(
  entry: [AddEntryOptions](#type-AddEntryOptions),
): Promise<void>
```

Adds an entry to the reading list if it does not exist.

#### Parameters

- entry
  [AddEntryOptions](#type-AddEntryOptions)
  The entry to add to the reading list.

#### Returns

Promise<void>
Resolves once the entry has been added.

### query()

```
chrome.readingList.query(
  info: [QueryInfo](#type-QueryInfo),
): Promise<[ReadingListEntry](#type-ReadingListEntry)[]>
```

Retrieves all entries that match the `QueryInfo` properties. Properties that are not provided will not be matched.

#### Parameters

- info
  [QueryInfo](#type-QueryInfo)
  The properties to search for.

#### Returns

Promise<[ReadingListEntry](#type-ReadingListEntry)[]>
Resolves once the entries have been matched.

### removeEntry()

```
chrome.readingList.removeEntry(
  info: [RemoveOptions](#type-RemoveOptions),
): Promise<void>
```

Removes an entry from the reading list if it exists.

#### Parameters

- info
  [RemoveOptions](#type-RemoveOptions)
  The entry to remove from the reading list.

#### Returns

Promise<void>
Resolves once the entry has been removed.

### updateEntry()

```
chrome.readingList.updateEntry(
  info: [UpdateEntryOptions](#type-UpdateEntryOptions),
): Promise<void>
```

Updates a reading list entry if it exists.

#### Parameters

- info
  [UpdateEntryOptions](#type-UpdateEntryOptions)
  The entry to update.

#### Returns

Promise<void>
Resolves once the matched entries have been updated.

## Events

### onEntryAdded

```
chrome.readingList.onEntryAdded.addListener(
  callback: function,
)
```

Triggered when a `ReadingListEntry` is added to the reading list.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(entry: [ReadingListEntry](#type-ReadingListEntry)) => void
```

- entry
  [ReadingListEntry](#type-ReadingListEntry)

### onEntryRemoved

```
chrome.readingList.onEntryRemoved.addListener(
  callback: function,
)
```

Triggered when a `ReadingListEntry` is removed from the reading list.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(entry: [ReadingListEntry](#type-ReadingListEntry)) => void
```

- entry
  [ReadingListEntry](#type-ReadingListEntry)

### onEntryUpdated

```
chrome.readingList.onEntryUpdated.addListener(
  callback: function,
)
```

Triggered when a `ReadingListEntry` is updated in the reading list.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(entry: [ReadingListEntry](#type-ReadingListEntry)) => void
```

- entry
  [ReadingListEntry](#type-ReadingListEntry)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-07 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
