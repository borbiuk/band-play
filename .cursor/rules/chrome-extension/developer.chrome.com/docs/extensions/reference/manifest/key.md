during development. The following are some common use cases:

- To configure a server to only accept requests from your Chrome Extension origin.
- So that other extensions or websites can [send messages](/docs/extensions/mv3/messaging#external-webpage) to your extension.
- So that a website can access the ``[web_accessible_resources](/docs/extensions/mv3/manifest/web_accessible_resources) of your extension.

## Keep a consistent extension ID

Preserving a single ID is essential during development. To keep a consistent ID, follow these steps:

### Upload extension to the developer dashboard

Package the extension directory into a `.zip` file and upload it to the [Chrome Developer
Dashboard](https://chrome.google.com/webstore/developer/dashboard) without publishing it:

- On the Developer Dashboard, click Add new item.
- Click Browse files, select the extension's zip file, and upload it.
- Go to the Package tab and click View public key.View public key button in Package tab
  When the dialog is open, follow these steps:

- Copy the code in between `-----BEGIN PUBLIC KEY-----` and `-----END PUBLIC KEY-----`.
- Remove the newlines in order to make it a single line of text.Public key dialog window
  Add the code to the `manifest.json` under the ``["key"](/docs/extensions/reference/manifest/key) field.
  This way the extension will use the same ID.

```
{ // manifest.json
  "manifest_version": 3,
...
  "key": "ThisKeyIsGoingToBeVeryLong/go8GGC2u3UD9WI3MkmBgyiDPP2OreImEQhPvwpliioUMJmERZK3zPAx72z8MDvGp7Fx7ZlzuZpL4yyp4zXBI+MUhFGoqEh32oYnm4qkS4JpjWva5Ktn4YpAWxd4pSCVs8I4MZms20+yx5OlnlmWQEwQiiIwPPwG1e1jRw0Ak5duPpE3uysVGZXkGhC5FyOFM+oVXwc1kMqrrKnQiMJ3lgh59LjkX4z1cDNX3MomyUMJ+I+DaWC2VdHggB74BNANSd+zkPQeNKg3o7FetlDJya1bk8ofdNBARxHFMBtMXu/ONfCT3Q2kCY9gZDRktmNRiHG/1cXhkIcN1RWrbsCkwIDAQAB",
}

```

### Compare IDs

Open the Extensions Management page at `chrome://extensions`, ensure Developer mode is enabled,
and upload the unpackaged extension directory. Compare the extension ID on the extensions management
page to the Item ID in the Developer Dashboard. They should match.

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2013-05-12 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2013-05-12 UTC."],[],[]]
