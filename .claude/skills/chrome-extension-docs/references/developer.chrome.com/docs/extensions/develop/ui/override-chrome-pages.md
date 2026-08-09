Extensions can use HTML override pages to replace a page Google Chrome normally provides. An extension can contain an override for any of the following pages, but each extension can only override one page:Bookmark ManagerThe page that appears when the user chooses the Bookmark Manager menu item
from the Chrome menu or, on Mac, the Bookmark Manager item from the Bookmarks menu. You can also
get to this page by entering the URL chrome://bookmarks.HistoryThe page that appears when the user chooses the History menu item from the Chrome
menu or, on Mac, the Show Full History item from the History menu. You can also get to this page
by entering the URL chrome://history.New TabThe page that appears when the user creates a new tab or window. You can also get to
this page by entering the URL chrome://newtab.
The following screenshots show the default New Tab page and then a custom New Tab page.The default new tab page.A custom new tab page.
To try this out, see our [override samples](/docs/extensions/samples?text=override).

## Incognito window behavior

In incognito windows, extensions can't override New Tab pages. Other pages still work if the [incognito](/docs/extensions/reference/manifest/incognito) manifest property is
set to "split" (the default value). For details on how to handle incognito windows, see [Saving data and incognito mode](/docs/extensions/develop/security-privacy/user-privacy#data-incognito).

## Manifest

Use the following code to register an override page in the [extension manifest](/docs/extensions/samples?text=override):

```
{
  "manifest_version": 3,
  "name": "My extension",
  ...

  "chrome_url_overrides" : {
    "PAGE_TO_OVERRIDE": "myPage.html"
  },
  ...
}

```

For `PAGE_TO_OVERRIDE`, substitute one of the following:

- `"bookmarks"`
- `"history"`
- `"newtab"`

## Best practices

Make your page quick and small.
Users expect built-in browser pages to open instantly. Avoid doing things that might take a long
time. Specifically, avoid accessing database resources synchronously. When making network requests, prefer ``[fetch()](https://developer.mozilla.org/docs/Web/API/fetch) over `XMLHttpRequest()`.
To avoid user confusion, give your page a title.
 Without a title, the page title defaults to the URL. Specify the title using the `<title>` tag in your HTML file.
Remember that new tabs give keyboard focus to the address bar first.
Don't rely on keyboard focus defaulting to other parts of the page.
Make the new tab page your own.
Avoid creating a new tab page which users may confuse with Chrome's default new tab page.

## Examples

See the [override samples](/docs/extensions/samples?text=override).
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2012-09-18 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2012-09-18 UTC."],[],[]]
