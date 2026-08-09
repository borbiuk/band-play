[declarativeContent](/docs/extensions/reference/api/declarativeContent).

## Translating rules from javascript to manifest

The following defines a rule to display a page action if the current page has a video css tag in
javascript:

```
chrome.declarativeContent.onPageChanged.addRules([{
  actions: [
    new chrome.declarativeContent.ShowPageAction()
  ],
  conditions: [
    new chrome.declarativeContent.PageStateMatcher(
        {css: ["video"]}
    )
  ]
}]);

```

This is the same definition in the manifest:

```
{
  "name": "Sample extension",
  "event_rules": [{
    "event": "declarativeContent.onPageChanged",
    "actions": [{
      "type": "declarativeContent.ShowPageAction"
    }],
    "conditions": [{
      "type": "declarativeContent.PageStateMatcher",
      "css": ["video"]
    }]
  }],
  ...
}

```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2015-06-12 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2015-06-12 UTC."],[],[]]
