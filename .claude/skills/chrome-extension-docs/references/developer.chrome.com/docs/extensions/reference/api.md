Most extensions need access to one or more Chrome Extensions APIs to function. This API reference describes the APIs available
for use in extensions and presents example use cases.
Beginning in Chrome 144, all Chrome Extension APIs are also available under the
`browser` namespace (e.g. `browser.tabs.create({})`). This is an alias for the
`chrome` namespace (e.g. `chrome.tabs.create({})`) provided for compatibility
with other browsers that use the `browser` namespace for their extension APIs.

## Common Extensions API features

An Extensions API consists of a namespace containing methods and properties for doing extensions work, and usually, but not
always, manifest fields for the `manifest.json` file. For example, the `chrome.action` namespace requires an `"action"` object
in the manifest. Many APIs also require [permissions](/docs/extensions/mv3/declare_permissions) in the manifest.
Methods in extension APIs are asynchronous unless stated otherwise. Asynchronous methods return immediately, without waiting
for the operation that calls them to finish. Use [promises](https://developer.mozilla.org/docs/Learn/JavaScript/Asynchronous/Promises) to get the results of these asynchronous methods.Manifest V3 is supported generally in Chrome 88 or later. For extension features added in later Chrome versions, see the API reference documentation for support information. If your extension requires a specific API, you can specify a minimum chrome version in the manifest file.

## Chrome Extension APIs

[accessibilityFeatures](/docs/extensions/reference/api/accessibilityFeatures)
Use the `chrome.accessibilityFeatures` API to manage Chrome's accessibility features. This API relies on the [ChromeSetting prototype of the type API](https://developer.chrome.com/docs/extensions/reference/types/#ChromeSetting) for getting and setting individual accessibility features. In order to get feature states the extension must request `accessibilityFeatures.read` permission. For modifying feature state, the extension needs `accessibilityFeatures.modify` permission. Note that `accessibilityFeatures.modify` does not imply `accessibilityFeatures.read` permission.[action](/docs/extensions/reference/api/action)Chrome 88+
MV3+

Use the `chrome.action` API to control the extension's icon in the Google Chrome toolbar.[alarms](/docs/extensions/reference/api/alarms)
Use the `chrome.alarms` API to schedule code to run periodically or at a specified time in the future.[audio](/docs/extensions/reference/api/audio)Chrome 59+

        ChromeOS only

The `chrome.audio` API is provided to allow users to get information about and control the audio devices attached to the system. This API is currently only available in kiosk mode for ChromeOS.[bookmarks](/docs/extensions/reference/api/bookmarks)
Use the `chrome.bookmarks` API to create, organize, and otherwise manipulate bookmarks. Also see [Override Pages](https://developer.chrome.com/docs/extensions/override), which you can use to create a custom Bookmark Manager page.[browsingData](/docs/extensions/reference/api/browsingData)
Use the `chrome.browsingData` API to remove browsing data from a user's local profile.[certificateProvider](/docs/extensions/reference/api/certificateProvider)Chrome 46+

        ChromeOS only

Use this API to expose certificates to the platform which can use these certificates for TLS authentications.[commands](/docs/extensions/reference/api/commands)
Use the commands API to add keyboard shortcuts that trigger actions in your extension, for example, an action to open the browser action or send a command to the extension.[contentSettings](/docs/extensions/reference/api/contentSettings)
Use the `chrome.contentSettings` API to change settings that control whether websites can use features such as cookies, JavaScript, and plugins. More generally speaking, content settings allow you to customize Chrome's behavior on a per-site basis instead of globally.[contextMenus](/docs/extensions/reference/api/contextMenus)
Use the `chrome.contextMenus` API to add items to Google Chrome's context menu. You can choose what types of objects your context menu additions apply to, such as images, hyperlinks, and pages.[cookies](/docs/extensions/reference/api/cookies)
Use the `chrome.cookies` API to query and modify cookies, and to be notified when they change.[debugger](/docs/extensions/reference/api/debugger)
The `chrome.debugger` API serves as an alternate transport for Chrome's [remote debugging protocol](https://developer.chrome.com/devtools/docs/debugger-protocol). Use `chrome.debugger` to attach to one or more tabs to instrument network interaction, debug JavaScript, mutate the DOM and CSS, and more. Use the ``[Debuggee](#type-Debuggee) property `tabId`to target tabs with`sendCommand`and route events by`tabId`from`onEvent`callbacks.[declarativeContent](/docs/extensions/reference/api/declarativeContent)
Use the`chrome.declarativeContent` API to take actions depending on the content of a page, without requiring permission to read the page's content.[declarativeNetRequest](/docs/extensions/reference/api/declarativeNetRequest)Chrome 84+

The `chrome.declarativeNetRequest` API is used to block or modify network requests by specifying declarative rules. This lets extensions modify network requests without intercepting them and viewing their content, thus providing more privacy.[desktopCapture](/docs/extensions/reference/api/desktopCapture)
The Desktop Capture API captures the content of the screen, individual windows, or individual tabs.[devtools.inspectedWindow](/docs/extensions/reference/api/devtools/inspectedWindow)
Use the `chrome.devtools.inspectedWindow` API to interact with the inspected window: obtain the tab ID for the inspected page, evaluate the code in the context of the inspected window, reload the page, or obtain the list of resources within the page.[devtools.network](/docs/extensions/reference/api/devtools/network)
Use the `chrome.devtools.network` API to retrieve the information about network requests displayed by the Developer Tools in the Network panel.[devtools.panels](/docs/extensions/reference/api/devtools/panels)
Use the `chrome.devtools.panels` API to integrate your extension into Developer Tools window UI: create your own panels, access existing panels, and add sidebars.[devtools.performance](/docs/extensions/reference/api/devtools/performance)Chrome 129+

Use the `chrome.devtools.performance` API to listen to recording status updates in the Performance panel in DevTools.[devtools.recorder](/docs/extensions/reference/api/devtools/recorder)Chrome 105+

Use the `chrome.devtools.recorder` API to customize the Recorder panel in DevTools.[dns](/docs/extensions/reference/api/dns)
Dev channel

Use the `chrome.dns` API for dns resolution.[documentScan](/docs/extensions/reference/api/documentScan)Chrome 44+

        ChromeOS only

Use the `chrome.documentScan` API to discover and retrieve images from attached document scanners.[dom](/docs/extensions/reference/api/dom)Chrome 88+

Use the `chrome.dom` API to access special DOM APIs for Extensions[downloads](/docs/extensions/reference/api/downloads)
Use the `chrome.downloads` API to programmatically initiate, monitor, manipulate, and search for downloads.[enterprise.deviceAttributes](/docs/extensions/reference/api/enterprise/deviceAttributes)Chrome 46+

        ChromeOS only
      [Requires policy](https://support.google.com/chrome/a/answer/9296680)

Use the `chrome.enterprise.deviceAttributes` API to read device attributes. Note: This API is only available to extensions force-installed by enterprise policy.[enterprise.hardwarePlatform](/docs/extensions/reference/api/enterprise/hardwarePlatform)Chrome 71+
[Requires policy](https://support.google.com/chrome/a/answer/9296680)
Use the `chrome.enterprise.hardwarePlatform` API to get the manufacturer and model of the hardware platform where the browser runs. Note: This API is only available to extensions installed by enterprise policy.[enterprise.login](/docs/extensions/reference/api/enterprise/login)Chrome 139+

        ChromeOS only
      [Requires policy](https://support.google.com/chrome/a/answer/9296680)

Use the `chrome.enterprise.login` API to exit Managed Guest sessions. Note: This API is only available to extensions installed by enterprise policy in ChromeOS Managed Guest sessions.[enterprise.networkingAttributes](/docs/extensions/reference/api/enterprise/networkingAttributes)Chrome 85+

        ChromeOS only
      [Requires policy](https://support.google.com/chrome/a/answer/9296680)

Use the `chrome.enterprise.networkingAttributes` API to read information about your current network. Note: This API is only available to extensions force-installed by enterprise policy.[enterprise.platformKeys](/docs/extensions/reference/api/enterprise/platformKeys)
ChromeOS only
[Requires policy](https://support.google.com/chrome/a/answer/9296680)
Use the `chrome.enterprise.platformKeys` API to generate keys and install certificates for these keys. The certificates will be managed by the platform and can be used for TLS authentication, network access or by other extension through chrome.platformKeys.[events](/docs/extensions/reference/api/events)
The `chrome.events` namespace contains common types used by APIs dispatching events to notify you when something interesting happens.[extension](/docs/extensions/reference/api/extension)
The `chrome.extension` API has utilities that can be used by any extension page. It includes support for exchanging messages between an extension and its content scripts or between extensions, as described in detail in [Message Passing](https://developer.chrome.com/docs/extensions/messaging).[extensionTypes](/docs/extensions/reference/api/extensionTypes)
The `chrome.extensionTypes` API contains type declarations for Chrome extensions.[fileBrowserHandler](/docs/extensions/reference/api/fileBrowserHandler)
ChromeOS only

        Foreground only

Use the `chrome.fileBrowserHandler` API to extend the Chrome OS file browser. For example, you can use this API to enable users to upload files to your website.[fileSystemProvider](/docs/extensions/reference/api/fileSystemProvider)
ChromeOS only

Use the `chrome.fileSystemProvider` API to create file systems, that can be accessible from the file manager on Chrome OS.[fontSettings](/docs/extensions/reference/api/fontSettings)
Use the `chrome.fontSettings` API to manage Chrome's font settings.[gcm](/docs/extensions/reference/api/gcm)
Use `chrome.gcm` to enable apps and extensions to send and receive messages through [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/) (FCM).[history](/docs/extensions/reference/api/history)
Use the `chrome.history` API to interact with the browser's record of visited pages. You can add, remove, and query for URLs in the browser's history. To override the history page with your own version, see [Override Pages](https://developer.chrome.com/extensions/develop/ui/override-chrome-pages).[i18n](/docs/extensions/reference/api/i18n)
Use the `chrome.i18n` infrastructure to implement internationalization across your whole app or extension.[identity](/docs/extensions/reference/api/identity)
Use the `chrome.identity` API to get OAuth2 access tokens.[idle](/docs/extensions/reference/api/idle)
Use the `chrome.idle` API to detect when the machine's idle state changes.[input.ime](/docs/extensions/reference/api/input/ime)
ChromeOS only

Use the `chrome.input.ime` API to implement a custom IME for Chrome OS. This allows your extension to handle keystrokes, set the composition, and manage the candidate window.[instanceID](/docs/extensions/reference/api/instanceID)Chrome 44+

Use `chrome.instanceID` to access the Instance ID service.[loginState](/docs/extensions/reference/api/loginState)Chrome 78+

        ChromeOS only

Use the `chrome.loginState` API to read and monitor the login state.[management](/docs/extensions/reference/api/management)
The `chrome.management` API provides ways to manage installed apps and extensions.[notifications](/docs/extensions/reference/api/notifications)
Use the `chrome.notifications` API to create rich notifications using templates and show these notifications to users in the system tray.[offscreen](/docs/extensions/reference/api/offscreen)Chrome 109+
MV3+

Use the `offscreen` API to create and manage offscreen documents.[omnibox](/docs/extensions/reference/api/omnibox)
The omnibox API allows you to register a keyword with Google Chrome's address bar, which is also known as the omnibox.[pageCapture](/docs/extensions/reference/api/pageCapture)
Use the `chrome.pageCapture` API to save a tab as MHTML.[permissions](/docs/extensions/reference/api/permissions)
Use the `chrome.permissions` API to request [declared optional permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) at run time rather than install time, so users understand why the permissions are needed and grant only those that are necessary.[platformKeys](/docs/extensions/reference/api/platformKeys)Chrome 45+

        ChromeOS only

Use the `chrome.platformKeys` API to access client certificates managed by the platform. If the user or policy grants the permission, an extension can use such a certficate in its custom authentication protocol. E.g. this allows usage of platform managed certificates in third party VPNs (see [chrome.vpnProvider](/docs/extensions/reference/api/vpnProvider)).[power](/docs/extensions/reference/api/power)
Use the `chrome.power` API to override the system's power management features.[printerProvider](/docs/extensions/reference/api/printerProvider)Chrome 44+

The `chrome.printerProvider` API exposes events used by print manager to query printers controlled by extensions, to query their capabilities and to submit print jobs to these printers.[printing](/docs/extensions/reference/api/printing)Chrome 81+

        ChromeOS only

Use the `chrome.printing` API to send print jobs to printers installed on Chromebook.[printingMetrics](/docs/extensions/reference/api/printingMetrics)Chrome 79+

        ChromeOS only
      [Requires policy](https://support.google.com/chrome/a/answer/9296680)

Use the `chrome.printingMetrics` API to fetch data about printing usage.[privacy](/docs/extensions/reference/api/privacy)
Use the `chrome.privacy` API to control usage of the features in Chrome that can affect a user's privacy. This API relies on the [ChromeSetting prototype of the type API](https://developer.chrome.com/docs/extensions/reference/types/#ChromeSetting) for getting and setting Chrome's configuration.[processes](/docs/extensions/reference/api/processes)
Dev channel

Use the `chrome.processes` API to interact with the browser's processes.[proxy](/docs/extensions/reference/api/proxy)
Use the `chrome.proxy` API to manage Chrome's proxy settings. This API relies on the [ChromeSetting prototype of the type API](https://developer.chrome.com/docs/extensions/reference/api/types#type-ChromeSetting) for getting and setting the proxy configuration.[readingList](/docs/extensions/reference/api/readingList)Chrome 120+
MV3+

Use the `chrome.readingList` API to read from and modify the items in the [Reading List](https://support.google.com/chrome/answer/7343019).[runtime](/docs/extensions/reference/api/runtime)
Use the `chrome.runtime` API to retrieve the service worker, return details about the manifest, and listen for and respond to events in the extension lifecycle. You can also use this API to convert the relative path of URLs to fully-qualified URLs.[scripting](/docs/extensions/reference/api/scripting)Chrome 88+
MV3+

Use the `chrome.scripting` API to execute script in different contexts.[search](/docs/extensions/reference/api/search)Chrome 87+

Use the `chrome.search` API to search via the default provider.[sessions](/docs/extensions/reference/api/sessions)
Use the `chrome.sessions` API to query and restore tabs and windows from a browsing session.[sidePanel](/docs/extensions/reference/api/sidePanel)Chrome 114+
MV3+

Use the `chrome.sidePanel` API to host content in the browser's side panel alongside the main content of a webpage.[storage](/docs/extensions/reference/api/storage)
Use the `chrome.storage` API to store, retrieve, and track changes to user data.[system.cpu](/docs/extensions/reference/api/system/cpu)
Use the `system.cpu` API to query CPU metadata.[system.display](/docs/extensions/reference/api/system/display)
Use the `system.display` API to query display metadata.[system.memory](/docs/extensions/reference/api/system/memory)
The `chrome.system.memory` API.[system.storage](/docs/extensions/reference/api/system/storage)
Use the `chrome.system.storage` API to query storage device information and be notified when a removable storage device is attached and detached.[systemLog](/docs/extensions/reference/api/systemLog)Chrome 125+

        ChromeOS only
      [Requires policy](https://support.google.com/chrome/a/answer/9296680)

Use the `chrome.systemLog` API to record Chrome system logs from extensions.[tabCapture](/docs/extensions/reference/api/tabCapture)
Use the `chrome.tabCapture` API to interact with tab media streams.[tabGroups](/docs/extensions/reference/api/tabGroups)Chrome 89+
MV3+

Use the `chrome.tabGroups` API to interact with the browser's tab grouping system. You can use this API to modify and rearrange tab groups in the browser. To group and ungroup tabs, or to query what tabs are in groups, use the `chrome.tabs` API.[tabs](/docs/extensions/reference/api/tabs)
Use the `chrome.tabs` API to interact with the browser's tab system. You can use this API to create, modify, and rearrange tabs in the browser.[topSites](/docs/extensions/reference/api/topSites)
Use the `chrome.topSites` API to access the top sites (i.e. most visited sites) that are displayed on the new tab page. These do not include shortcuts customized by the user.[tts](/docs/extensions/reference/api/tts)
Use the `chrome.tts` API to play synthesized text-to-speech (TTS). See also the related ``[ttsEngine](/docs/extensions/reference/api/ttsEngine) API, which allows an extension to implement a speech engine.[ttsEngine](/docs/extensions/reference/api/ttsEngine)
Use the `chrome.ttsEngine` API to implement a text-to-speech(TTS) engine using an extension. If your extension registers using this API, it will receive events containing an utterance to be spoken and other parameters when any extension or Chrome App uses the ``[tts](/docs/extensions/reference/api/tts) API to generate speech. Your extension can then use any available web technology to synthesize and output the speech, and send events back to the calling function to report the status.[types](/docs/extensions/reference/api/types)
The `chrome.types` API contains type declarations for Chrome.[userScripts](/docs/extensions/reference/api/userScripts)Chrome 120+
MV3+

Use the `userScripts` API to execute user scripts in the User Scripts context.[vpnProvider](/docs/extensions/reference/api/vpnProvider)Chrome 43+

        ChromeOS only

Use the `chrome.vpnProvider` API to implement a VPN client.[wallpaper](/docs/extensions/reference/api/wallpaper)Chrome 43+

        ChromeOS only

Use the `chrome.wallpaper` API to change the ChromeOS wallpaper.[webAuthenticationProxy](/docs/extensions/reference/api/webAuthenticationProxy)Chrome 115+
MV3+

The `chrome.webAuthenticationProxy` API lets remote desktop software running on a remote host intercept Web Authentication API (WebAuthn) requests in order to handle them on a local client.[webNavigation](/docs/extensions/reference/api/webNavigation)
Use the `chrome.webNavigation` API to receive notifications about the status of navigation requests in-flight.[webRequest](/docs/extensions/reference/api/webRequest)
Use the `chrome.webRequest` API to observe and analyze traffic and to intercept, block, or modify requests in-flight.[windows](/docs/extensions/reference/api/windows)
Use the `chrome.windows` API to interact with browser windows. You can use this API to create, modify, and rearrange windows in the browser.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-12-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-12-11 UTC."],[],[]]
