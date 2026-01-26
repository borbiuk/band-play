## Description

The omnibox API allows you to register a keyword with Google Chrome's address bar, which is also known as the omnibox.

When the user enters your extension's keyword, the user starts interacting solely with your
extension. Each keystroke is sent to your extension, and you can provide suggestions in response.
The suggestions can be richly formatted in a variety of ways. When the user accepts a suggestion,
your extension is notified and can take action.

## Manifest

The following keys must be declared [in the manifest](/docs/extensions/mv3/manifest) to use this API.`"omnibox"`

You must include an `"omnibox.keyword"` field in the [manifest](/docs/extensions/reference/manifest) to use the omnibox API. You
should also specify a 16 by 16-pixel icon, which will be displayed in the address bar when suggesting
that users enter keyword mode.
For example:

```
{
  "name": "Aaron's omnibox extension",
  "version": "1.0",
  "omnibox": { "keyword" : "aaron" },
  "icons": {
    "16": "16-full-color.png"
  },
  "background": {
    "persistent": false,
    "scripts": ["background.js"]
  }
}

```

Note: Chrome automatically creates a grayscale version of your 16x16-pixel icon. You should
provide a full-color version so that it can also be used in other situations that require color. For
example, the [context menus API](/docs/extensions/reference/api/contextMenus) also uses a 16x16-pixel icon, but it is displayed in color.

## Examples

To try this API, install the [omnibox API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/omnibox) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.

## Types

### DefaultSuggestResult

A suggest result.

#### Properties

- description
  string
  The text that is displayed in the URL dropdown. Can contain XML-style markup for styling. The supported tags are 'url' (for a literal URL), 'match' (for highlighting text that matched what the user's query), and 'dim' (for dim helper text). The styles can be nested, eg. dimmed match.

### DescriptionStyleType

Chrome 44+

The style type.

#### Enum

"url"

"match"

"dim"

### OnInputEnteredDisposition

Chrome 44+

The window disposition for the omnibox query. This is the recommended context to display results. For example, if the omnibox command is to navigate to a certain URL, a disposition of 'newForegroundTab' means the navigation should take place in a new selected tab.

#### Enum

"currentTab"

"newForegroundTab"

"newBackgroundTab"

### SuggestResult

A suggest result.

#### Properties

- content
  string
  The text that is put into the URL bar, and that is sent to the extension when the user chooses this entry.
- deletable
  boolean optionalChrome 63+

Whether the suggest result can be deleted by the user.

- description
  string
  The text that is displayed in the URL dropdown. Can contain XML-style markup for styling. The supported tags are 'url' (for a literal URL), 'match' (for highlighting text that matched what the user's query), and 'dim' (for dim helper text). The styles can be nested, eg. dimmed match. You must escape the five predefined entities to display them as text: stackoverflow.com/a/1091953/89484

## Methods

### setDefaultSuggestion()

```
chrome.omnibox.setDefaultSuggestion(
  suggestion: [DefaultSuggestResult](#type-DefaultSuggestResult),
): Promise<void>
```

Sets the description and styling for the default suggestion. The default suggestion is the text that is displayed in the first suggestion row underneath the URL bar.

#### Parameters

- suggestion
  [DefaultSuggestResult](#type-DefaultSuggestResult)
  A partial SuggestResult object, without the 'content' parameter.

#### Returns

Promise<void>Chrome 100+

## Events

### onDeleteSuggestion

Chrome 63+

```
chrome.omnibox.onDeleteSuggestion.addListener(
  callback: function,
)
```

User has deleted a suggested result.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(text: string) => void
```

- text
  string

### onInputCancelled

```
chrome.omnibox.onInputCancelled.addListener(
  callback: function,
)
```

User has ended the keyword input session without accepting the input.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
() => void
```

### onInputChanged

```
chrome.omnibox.onInputChanged.addListener(
  callback: function,
)
```

User has changed what is typed into the omnibox.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(text: string, suggest: function) => void
```

- text
  string
- suggest
  function

                              The `suggest` parameter looks like:

```
(suggestResults: [SuggestResult](#type-SuggestResult)[]) => void
```

- suggestResults
  [SuggestResult](#type-SuggestResult)[]
  Array of suggest results

### onInputEntered

```
chrome.omnibox.onInputEntered.addListener(
  callback: function,
)
```

User has accepted what is typed into the omnibox.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(text: string, disposition: [OnInputEnteredDisposition](#type-OnInputEnteredDisposition)) => void
```

- text
  string
- disposition
  [OnInputEnteredDisposition](#type-OnInputEnteredDisposition)

### onInputStarted

```
chrome.omnibox.onInputStarted.addListener(
  callback: function,
)
```

User has started a keyword input session by typing the extension's keyword. This is guaranteed to be sent exactly once per input session, and before any onInputChanged events.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
() => void
```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
