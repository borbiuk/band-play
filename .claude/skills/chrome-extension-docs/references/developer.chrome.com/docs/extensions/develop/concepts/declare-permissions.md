To use most [extension APIs](/docs/extensions/reference/api) and features, you must declare your extension's intent in the [manifest's](#manifest) permissions fields. Extensions can request the following categories of permissions, specified using the respective manifest keys:`["permissions"](/docs/extensions/reference/permissions-list)Contains items from a list of [known strings](/docs/extensions/reference/permissions-list). Changes may trigger a [warning](#warnings).`["optional_permissions"](/docs/extensions/reference/api/permissions)Granted by the user at runtime, instead of at install time.`["content_scripts.matches"](/docs/extensions/develop/concepts/content-scripts#static-declarative)Contains one or more [match patterns](/docs/extensions/develop/concepts/match-patterns) that allows content scripts to inject into one or more hosts. Changes may trigger a [warning](#warnings).`["host_permissions"](#host-permissions)Contains one or more [match patterns](/docs/extensions/develop/concepts/match-patterns) that give access to one or more hosts. Changes may trigger a [warning](#warnings).`"optional_host_permissions"`Granted by the user at runtime, instead of at install time.
Permissions help to limit damage if your extension is compromised by malware. Some permission warning are displayed to users for their consent before
installation or at runtime, as detailed in [Permission with warnings](#warnings).
Consider using [optional permissions](/docs/extensions/reference/api/permissions) wherever the functionality of your extension
permits, to provide users with informed control over access to resources and data.
If an API requires a permission, its documentation explains how to declare it. For an
example, see [Storage API](/docs/extensions/reference/api/storage).

## Manifest

The following is an example of the permissions section of a [manifest](/docs/extensions/reference/manifest) file:
manifest.json:

```
{
  "name": "Permissions Extension",
  ...
  "permissions": [
    "activeTab",
    "contextMenus",
    "storage"
  ],
  "optional_permissions": [
    "topSites",
  ],
  "host_permissions": [
    "https://www.developer.chrome.com/*"
  ],
  "optional_host_permissions":[
    "https://*/*",
    "http://*/*"
  ],
  ...
  "manifest_version": 3
}

```

## Host permissions

Host permissions allow extensions to interact with the URL's [matching patterns](/docs/extensions/develop/concepts/match-patterns). Some [Chrome APIs](/docs/extensions/reference/api) require host permissions in addition to their own API permissions, which are documented on each reference page. Here are some examples:

- Make ``[fetch()](https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch) requests from the extension service worker and extension pages.
- Read and query the sensitive [tab properties](/docs/extensions/reference/api/tabs#type-Tab) (url, title, and favIconUrl) using the ``[chrome.tabs](/docs/extensions/reference/api/tabs) API.
- Inject a [content script programmatically](/docs/extensions/develop/concepts/content-scripts#programmatic).
- Monitor and control the network requests with the ``[chrome.webRequest](/docs/extensions/reference/api/webRequest) API.
- Access cookies with the ``[chrome.cookies](/docs/extensions/reference/api/cookies) API.
- Redirect and modify requests and response headers using ``[chrome.declarativeNetRequest](/docs/extensions/reference/api/declarativeNetRequest) API.

## Permissions with warnings

When an extension requests multiple permissions, and many of them display
warnings on installation, the user will see a list of warnings, like in the following example:

Users are more likely to trust an extension with limited warnings or when permissions are explained
to them. Consider implementing [optional permissions](/docs/extensions/reference/api/permissions) or a less powerful API to avoid alarming
warnings. For best practices for warnings, see [Permission warnings guidelines](/docs/extensions/develop/concepts/permission-warnings). Specific
warnings are listed with the permissions to which they apply in the
[Permissions](/docs/extensions/reference/permissions-list) reference list.
Adding or changing match patterns in the `"host_permissions"` and `"content_scripts.matches"`
fields of the manifest filewill also trigger a [warning](#warnings). To learn more, see
[Updating permissions](/docs/extensions/develop/concepts/permission-warnings#update_permissions).

## Allow access

If your extension needs to run on `file://` URLs or operate in incognito mode, users must give the extension access on its details page. You can find instructions for opening the details page under [Manage your extensions](https://support.google.com/chrome_webstore/answer/2664769#:%7E:text=Manage%20your%20extensions).

### Allow access to file URLs and incognito pages

- Right-click the extension icon in Chrome.
  Choose Manage Extension.
  Extension menu

Scroll down to enable access to file URLs or incognito mode.
Access enabled to file URLs and incognito mode.

To detect whether the user has allowed access, you can call `[extension.isAllowedIncognitoAccess()](/docs/extensions/reference/api/extension#method-isAllowedIncognitoAccess) or
`[extension.isAllowedFileSchemeAccess()](/docs/extensions/reference/api/extension#method-isAllowedFileSchemeAccess).
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2024-02-05 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2024-02-05 UTC."],[],[]]
