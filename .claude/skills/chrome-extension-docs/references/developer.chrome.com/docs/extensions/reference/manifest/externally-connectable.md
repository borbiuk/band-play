connect to your extension using `[runtime.connect()](/docs/extensions/reference/runtime#method-connect) and `[runtime.sendMessage()](/docs/extensions/reference/runtime#method-sendMessage).
For a tutorial on message passing, see [cross-extension messaging](/docs/extensions/develop/concepts/messaging#external) and [sending messages
from web pages](/docs/extensions/develop/concepts/messaging#external-webpage).

## Connect without externally_connectable

If the `externally_connectable` key is not declared in your extension's manifest, all extensions can connect, but no web pages can connect. As a consequence, when updating your manifest to use
`externally_connectable`, if `"ids": ["*"]` is not specified, then other extensions will
lose the ability to connect to your extension. This may be an unintended consequence, so keep it in
mind.

## Manifest

```
{
  "name": "My externally connectable extension",
  "externally_connectable": {
    "ids": [
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      ...
    ],
    // If this field is not specified, no web pages can connect.
    "matches": [
      "https://*.google.com/*",
      "*://*.chromium.org/*",
      ...
    ],
    "accepts_tls_channel_id": false
  },
  ...
}

```

## Reference

The `"externally_connectable"` manifest key includes the following optional properties:`"ids"`The IDs of extensions that are allowed to connect. If left empty or unspecified, no extensions or apps can connect. The wildcard `"*"` will allow all extensions and apps to connect.`"matches"`The URL patterns for web pages that are allowed to connect. If left empty or unspecified, no web pages can connect. Patterns cannot include wildcard domains nor subdomains of [(effective) top-level domains](http://publicsuffix.org/list/), for example:✅ Valid URLs❌ Invalid URLs`*://example.com/``*://example.com/one/``http://*.example.org/*``<all_urls>``https://example.com/*``http://*/*``"accepts_tls_channel_id"`Enables the extension to use the TLS channel ID of the web page connecting to it. The web page must also opt to send the [TLS channel ID](/docs/extensions/runtime#property-MessageSender-tlsChannelId) to the extension by setting
`includeTlsChannelId` to `true` in runtime.connect's [connectInfo](/docs/extensions/reference/runtime#type-connect-connectInfo) or runtime.sendMessage's [options](/docs/extensions/reference/runtime#property-sendMessage-options-includeTlsChannelId). If set to `false`,
[runtime.MessageSender.tlsChannelId](/docs/extensions/runtime#property-MessageSender-tlsChannelId) will never be set under any circumstance.
This does not affect content scripts.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2013-08-21 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2013-08-21 UTC."],[],[]]
