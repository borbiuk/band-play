extension will behave if allowed to run in incognito mode. Using `"not_allowed"` to prevent this
extension from being enabled in incognito mode.

## Spanning mode

The default mode is `"spanning"`, which means that the extension will run in a single
shared process. Any events or messages from an incognito tab will be sent to the shared process,
with an incognito flag indicating where it came from. Because incognito tabs cannot use this
shared process, an extension using the `"spanning"` incognito mode will not be able to load pages
from its extension package into the main frame of an incognito tab.

## Split mode

The `"split"` mode means that all pages in an incognito window will run in their own incognito
process. If the extension contains a background page, that will also run in the incognito process.
This incognito process runs along side the regular process, but has a separate memory-only cookie
store. Each process sees events and messages only from its own context (for example, the incognito
process will see only incognito tab updates). The processes are unable to communicate with each
other.

## Not allowed

The extension cannot be enabled in incognito mode. Available from Chrome 47.

## How to choose

As a rule of thumb, if your extension needs to load a tab in an incognito browser, use
split incognito behavior. If your extension needs to be logged into a remote server use
spanning incognito behavior.
[chrome.storage.sync](/docs/extensions/reference/storage#property-sync) and [chrome.storage.local](/docs/extensions/reference/storage#property-local) are always shared between regular and
incognito processes. It is recommended to use them for persisting your extension's settings.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2013-05-12 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2013-05-12 UTC."],[],[]]
