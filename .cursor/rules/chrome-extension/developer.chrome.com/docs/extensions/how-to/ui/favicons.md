A [favicon](https://developer.mozilla.org/docs/Glossary/Favicon) (short for "favorite icon") is a small icon that is displayed in the browser's address bar. Favicons are typically used to identify and differentiate websites.
This article describes how to retrieve a website’s favicon in a Manifest V3 extension.

## Accessing a website's favicon

To retrieve the favicon of a website, you need to construct the following URL:

```
chrome-extension://EXTENSION_ID/_favicon/?pageUrl=EXAMPLE_URL&size=FAV_SIZE

```

`EXTENSION_ID`The ID of your extension.`EXAMPLE_URL`The URL of the favicon's website.`FAV_SIZE`The size of the favicon. The most common size is 16 x 16 pixels.
The following steps describe how to construct this URL in a Chrome extension:

### Step 1: update the manifest

First, you must request the `"favicon"` permission in the [manifest](/docs/extensions/mv3/manifest).

```
{
  "name": "Favicon API in a popup",
  "manifest_version": 3,
  ...
  "permissions": ["favicon"],
  ...
}

```

Caution: The `"favicon"` permission only [triggers a warning](/docs/extensions/develop/concepts/permission-warnings#permissions_with_warnings) if the `"tabs"` permission or [host permissions](/docs/extensions/develop/concepts/match-patterns) have not already been requested.
In addition, when fetching favicons in [content scripts](/docs/extensions/mv3/content_scripts), the `"_favicon/*"` folder must be declared as a [web accessible resource](/docs/extensions/mv3/manifest/web_accessible_resources). For example:

```
{
  "name": "Favicon API in content scripts",
  "manifest_version": 3,
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "permissions": ["favicon"],
  "web_accessible_resources": [
    {
      "resources": ["_favicon/*"],
      "matches": ["<all_urls>"],
      "extension_ids": ["*"]
    }
  ]
  ...
}

```

### Step 2: construct the URL

The following function uses ``[runtime.getURL()](/docs/extensions/reference/runtime#method-getURL) to create a fully-qualified URL pointing to the `"\_favicon/"` folder. Then it returns a new string representing the URL with several query parameters. Finally, the extension appends the image to the body.

```
function faviconURL(u) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "32");
  return url.toString();
}

const img = document.createElement('img');
img.src = faviconURL("https://www.google.com")
document.body.appendChild(img);

```

This example is a `www.google.com` 32px favicon URL that includes a random extension ID:

```
chrome-extension://eghkbfdcoeikaepkldhfgphlaiojonpc/_favicon/?pageUrl=https%3A%2F%2Fwww.google.com&size=32

```

## Extension examples

There are two favicon examples in the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/) repository:

- [Favicon popup](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/favicon) example.
- [Favicon content script](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/sample.favicon-cs) example.
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2023-01-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2023-01-11 UTC."],[],[]]
