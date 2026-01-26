Chrome are able to install the extension. The value set for this string must be
a substring of an existing Chrome browser version string. Use a full version
number to specify a specific update to Chrome, or use the first number in the
string to specify a particular major version.

```
{
  // ...
  "minimum_chrome_version": "126",
  // ...
}

```

## Enforcement

### New Installs

In versions of Chrome older than the minimum version, the Chrome Web Store will
show a "Not compatible" message in place of the install button. Users on these
versions won't be able to install your extension.

### Existing Installs

Existing users of your extension won't receive updates when the
`minimum_chrome_version` is higher than their current browser version. This
happens silently so you should exercise caution and consider ways of letting
This means that if they are using a Chrome version lower than the `minimum_chrome_version`, your
extension won't be installed.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2024-04-26 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2024-04-26 UTC."],[],[]]
