extension's [manifest](/docs/extensions/reference/manifest). Some permissions
trigger warnings that users must allow to continue using the extension.
For more information on how permissions work, see [Declare permissions](/docs/extensions/develop/concepts/declare-permissions). For best
practices for using permissions with warnings, see [Permission warning guidelines](/docs/extensions/develop/concepts/permission-warnings).
The following is a list of all available permissions and any warnings triggered
by specific permissions.`"accessibilityFeatures.modify"`Lets extensions modify accessibility feature states when using the
`chrome.accessibilityFeatures` API.

Warning displayed: Change your accessibility settings.`"accessibilityFeatures.read"`Lets extensions read accessibility states when using the
`chrome.accessibilityFeatures` API.

Warning displayed: Read your accessibility settings.`"activeTab"`Gives temporary access to the active tab through a user gesture. For details,
see ``[activeTab](/docs/extensions/develop/concepts/activeTab).`"alarms"`Gives access to the
``[chrome.alarms](/docs/extensions/reference/api/alarms) API.`"audio"`Gives access to the
``[chrome.audio](/docs/extensions/reference/api/audio) API.`"background"`Makes Chrome start up early (as soon as the user logs into their computer,
before they launch Chrome), and shut down late (even after its last window is
closed, until the user explicitly quits Chrome).`"bookmarks"`Gives access to the
``[chrome.bookmarks](/docs/extensions/reference/api/bookmarks) API.

Warning displayed: Read and change your bookmarks.`"browsingData"`Gives access to the
``[chrome.browsingData](/docs/extensions/reference/api/browsingData) API.`"certificateProvider"`Gives access to the ``[chrome.certificateProvider](/docs/extensions/reference/api/certificateProvider)
API.`"clipboardRead"`Lets the extension paste items from the clipboard using the web platform [Clipboard API](https://developer.mozilla.org/docs/Web/API/Clipboard_API).

Warning displayed: Read data you copy and paste.`"clipboardWrite"`Lets the extension cut and copy items to the clipboard using the web platform [Clipboard API](https://developer.mozilla.org/docs/Web/API/Clipboard_API).

Warning displayed: Modify data you copy and paste.`"contentSettings"`Gives access to the
``[chrome.contentSettings](/docs/extensions/reference/api/contentSettings)
API.

Warning displayed: Change your settings that control websites' access to
features such as cookies, JavaScript, plugins, geolocation, microphone, camera
etc.`"contextMenus"`Gives access to the
``[chrome.contextMenus](/docs/extensions/reference/api/contextMenus) API.`"cookies"`Gives access to the
``[chrome.cookies](/docs/extensions/reference/api/cookies) API.`"debugger"`Gives access to the
``[chrome.debugger](/docs/extensions/reference/api/debugger) API.

Warnings displayed:

- Access the page debugger backend.
- Read and change all your data on all websites.`"declarativeContent"`Gives access to the
  ``[chrome.declarativeContent](/docs/extensions/reference/api/declarativeContent)
API.`"declarativeNetRequest"`Gives access to the
``[chrome.declarativeNetRequest](/docs/extensions/reference/api/declarativeNetRequest)
  API.

Warning displayed: Block content on any page.`"declarativeNetRequestWithHostAccess"`Gives access to the ``[chrome.declarativeNetRequest](/docs/extensions/reference/api/declarativeNetRequest)
API but requires host permissions for all actions.`"declarativeNetRequestFeedback"`Gives permission to write errors and warnings to the DevTools console when
using the ``[chrome.declarativeNetRequest](/docs/extensions/reference/api/declarativeNetRequest)
API. This permission is for use with unpacked extensions and is ignored for
extensions installed from the Chrome Web Store.

Warning displayed: Read your browsing history.`"dns"`Gives access to the `chrome.dns` API. `"desktopCapture"`Gives access to the
``[chrome.desktopCapture](/docs/extensions/reference/api/desktopCapture)
API.

Warning displayed: Capture content of your screen.`"documentScan"`Gives access to the
``[chrome.documentScan](/docs/extensions/reference/api/documentScan) API.`"downloads"`Gives access to the
``[chrome.downloads](/docs/extensions/reference/api/downloads) API.

Warning displayed: Manage your downloads.`"downloads.open"`Allows the use of ``[chrome.downloads.open()](/docs/extensions/reference/api/downloads#method-open).

Warning displayed: Manage your downloads.`"downloads.ui"`Allows the use of ``[chrome.downloads.setUiOptions()](/docs/extensions/reference/api/downloads#method-setUiOptions).

Warning displayed: Manage your downloads.`"enterprise.deviceAttributes"`Gives access to the ``[chrome.enterprise.deviceAttributes](/docs/extensions/reference/api/enterprise/deviceAttributes)
API.`"enterprise.hardwarePlatform"`Gives access to the ``[chrome.enterprise.hardwarePlatform](/docs/extensions/reference/api/enterprise/hardwarePlatform)
API.`"enterprise.networkingAttributes"`Gives access to the ``[chrome.enterprise.networkingAttributes](/docs/extensions/reference/api/enterprise/networkingAttributes)
API.`"enterprise.platformKeys"`Gives access to the ``[chrome.enterprise.platformKeys](/docs/extensions/reference/api/enterprise/platformKeys)
API.`"favicon"`Grants access to the [Favicon](/docs/extensions/how-to/ui/favicons) API.

Warning displayed: Read the icons of the
websites you visit.`"fileBrowserHandler"`Gives access to the ``[chrome.fileBrowserHandler](/docs/extensions/reference/api/fileBrowserHandler)
API.`"fileSystemProvider"`Gives access to the ``[chrome.fileSystemProvider](/docs/extensions/reference/api/fileSystemProvider)
API.`"fontSettings"`Gives access to the
``[chrome.fontSettings](/docs/extensions/reference/api/fontSettings) API.`"gcm"`Gives access to the ``[chrome.gcm](/docs/extensions/reference/api/gcm) and
``[chrome.instanceID](/docs/extensions/reference/api/instanceID) APIs.`"geolocation"`Allows the extension to use the geolocation API without prompting the user for
permission.

Warning displayed: Detect your physical location.`"history"`Gives access to the
``[chrome.history](/docs/extensions/reference/api/history) API.

Warning displayed: Read and change your browsing history on all signed-in
devices.`"identity"`Gives access to the
``[chrome.identity](/docs/extensions/reference/api/identity) API.`"identity.email"`Gives access to the user's email address through the
``[chrome.identity](/docs/extensions/reference/api/identity) API.

Warning displayed: Know your email address.`"idle"`Gives access to the ``[chrome.idle](/docs/extensions/reference/api/idle) API.`"loginState"`Gives access to the
``[chrome.loginState](/docs/extensions/reference/api/loginState) API.`"management"`Gives access to the
``[chrome.management](/docs/extensions/reference/api/management) API.

Warning displayed: Manage your apps, extensions, and themes.`"nativeMessaging"`Gives access to the [native messaging](/docs/extensions/develop/concepts/native-messaging) API.

Warning displayed: Communicate with cooperating native applications.`"notifications"`Gives access to the
``[chrome.notifications](/docs/extensions/reference/api/notifications) API.

Warning displayed: Display notifications.`"offscreen"`Gives access to the
``[chrome.offscreen](/docs/extensions/reference/api/offscreen) API.`"pageCapture"`Gives access to the
``[chrome.pageCapture](/docs/extensions/reference/api/pageCapture) API.

Warning displayed: Read and change all your data on all websites.`"platformKeys"`Gives access to the
``[chrome.platformKeys](/docs/extensions/reference/api/platformKeys) API.`"power"`Gives access to the
``[chrome.power](/docs/extensions/reference/api/power) API.`"printerProvider"`Gives access to the
``[chrome.printerProvider](/docs/extensions/reference/api/printerProvider)
API.`"printing"`Gives access to the
``[chrome.printing](/docs/extensions/reference/api/printing) API.`"printingMetrics"`Gives access to the
``[chrome.printingMetrics](/docs/extensions/reference/api/printingMetrics)
API.`"privacy"`Gives access to the
``[chrome.privacy](/docs/extensions/reference/api/privacy) API.

Warning displayed: Change your privacy-related settings.`"processes"`Gives access to the ``[chrome.processes](/?) API. `"proxy"`Gives access to the ``[chrome.proxy](/docs/extensions/reference/api/proxy)
API.

Warning displayed: Read and change all your data on all websites.`"readingList"`Gives access to the
``[chrome.readingList](/docs/extensions/reference/api/readingList) API.

Warning displayed: Read and change entries in the reading list.`"runtime"`Gives access to `[runtime.connectNative()](/docs/extensions/reference/api/runtime#method-connectNative)
and `[runtime.sendNativeMessage()](/docs/extensions/reference/api/runtime#method-sendNativeMessage).
For all other features of the `runtime` namespace, no permission is required.`"scripting"`Gives access to the
``[chrome.scripting](/docs/extensions/reference/api/scripting) API.`"search"`Gives access to the
``[chrome.search](/docs/extensions/reference/api/search) API.`"sessions"`Gives access to the
``[chrome.sessions](/docs/extensions/reference/api/sessions) API.

Warnings displayed:

- When used with the `"history"` permission: Read and change your browsing
  history on all your
  signed-in devices.
- When used with the `"tabs"` permission: Read your browsing history on all
  your signed-in devices.`"sidePanel"`Gives access to the
  ``[chrome.sidePanel](/docs/extensions/reference/api/sidePanel) API.`"storage"`Gives access to the
``[chrome.storage](/docs/extensions/reference/api/storage) API.`"system.cpu"`Gives access to the
  ``[chrome.system.cpu](/docs/extensions/reference/api/system/cpu) API.`"system.display"`Gives access to the
``[chrome.system.display](/docs/extensions/reference/api/system/display)
  API.`"system.memory"`Gives access to the
  ``[chrome.system.memory](/docs/extensions/reference/api/system/memory)
API.`"system.storage"`Gives access to the
``[chrome.system.storage](/docs/extensions/reference/api/system/storage)
  API.

Warning displayed: Identify and eject storage devices.`"tabCapture"`Gives access to the
``[chrome.tabCapture](/docs/extensions/reference/api/tabCapture) API.

Warning displayed: Read and change all your data on all websites.`"tabGroups"`Gives access to the
``[chrome.tabGroups](/docs/extensions/reference/api/tabGroups) API.

Warning displayed: View and manage your tab groups.`"tabs"`Gives access to privileged fields of the Tab objects used by several APIs,
including `[chrome.tabs](/docs/extensions/reference/api/tabs) and
`[chrome.windows](/docs/extensions/reference/api/windows). You usually
don't need to declare this permission to use those APIs.

Warning displayed: Read your browsing history.`"topSites"`Gives access to the
``[chrome.topSites](/docs/extensions/reference/api/topSites) API.

Warning displayed: Read a list of your most frequently visited websites.`"tts"`Gives access to the ``[chrome.tts](/docs/extensions/reference/api/tts) API.`"ttsEngine"`Gives access to the
``[chrome.ttsEngine](/docs/extensions/reference/api/ttsEngine) API.

Warning displayed: Read all text spoken using synthesized speech.`"unlimitedStorage"`Provides an unlimited quota for `[chrome.storage.local](/docs/extensions/reference/api/storage#property-local),
`[IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API),
`[Cache Storage](https://developer.mozilla.org/docs/Web/API/Cache),
and `[Origin Private File System](https://web.dev/origin-private-file-system/).
For more information, see [Storage and cookies](/docs/extensions/develop/concepts/storage-and-cookies).`"userScripts"`Gives access to the
``[chrome.userScripts](/docs/extensions/reference/api/userScripts) API. NOTE:
the user must also
[explicitly enable](/docs/extensions/reference/api/userScripts#enable-user-scripts-api)
the usage of user scripts.`"vpnProvider"`Gives access to the
``[chrome.vpnProvider](/docs/extensions/reference/api/vpnProvider) API.`"wallpaper"`Gives access to the
``[chrome.wallpaper](/docs/extensions/reference/api/wallpaper) API.`"webAuthenticationProxy"`Gives access to the ``[chrome.webAuthenticationProxy](/docs/extensions/reference/api/webAuthenticationProxy)
API.

Warning displayed: Read and change all your data on all websites.`"webNavigation"`Gives access to the
``[chrome.webNavigation](/docs/extensions/reference/api/webNavigation)
API.

Warning displayed: Read your browsing history.`"webRequest"`Gives access to the
``[chrome.webRequest](/docs/extensions/reference/api/webRequest) API.`"webRequestBlocking"`Allows the use of the
``[chrome.webRequest](/docs/extensions/reference/api/webRequest#permissions) API for
blocking.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-04-29 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-04-29 UTC."],[],[]]
