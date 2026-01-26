An optional manifest key enabling the use of an OAuth 2.0 security ID on the extension. This key takes an object with two required sub-properties: `"client_id"` and `"scopes"`. When developing an extension that uses an `"oauth2"` key, consider also setting the extension's ``["key"](/docs/extensions/mv3/manifest/key) to keep a [consistent extension ID](/docs/extensions/mv3/tut_oauth#keep-consistent-id).
For more detailed implementation instructions, visit the full [OAuth 2.0 tutorial](/docs/extensions/mv3/tut_oauth).

```
{
  // ...
     "oauth2": {
      "client_id": "YOUR_EXTENSION_OAUTH_CLIENT_ID.apps.googleusercontent.com",
      "scopes": ["https://www.googleapis.com/auth/contacts.readonly"]
    },
    "key": "EXTENSION_PUBLIC_KEY",
  // ...
}
```

```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2022-11-14 UTC.
      [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2022-11-14 UTC."],[],[]]
```
