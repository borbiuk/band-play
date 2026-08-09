[Cross-Origin-Embedder-Policy](https://developer.mozilla.org/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy) (COEP) response header for requests to the extension's
origin. This includes the extension's service worker, popup, options page, tabs that are open to an extension resource, etc.
Together with [cross_origin_opener_policy](/docs/extensions/mv3/manifest/cross_origin_opener_policy), this key allows the extension to opt
into [cross-origin isolation](/docs/extensions/mv3/cross-origin-isolation).

## Manifest declaration

Note: This key was introduced in Chrome 93.
The `cross_origin_embedder_policy` manifest key contains an object with one
property named `value` that takes a string. Chrome uses this string as the value of the
`Cross-Origin-Embedder-Policy` header when serving resources from the extension's origin. For
example:

```
{
    ...
    "cross_origin_embedder_policy": {
      "value": "require-corp"
    },
    ...
}

```

See the [Cross-origin isolation overview](/docs/extensions/mv3/cross-origin-isolation) for more information about this feature.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2021-08-03 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2021-08-03 UTC."],[],[]]
