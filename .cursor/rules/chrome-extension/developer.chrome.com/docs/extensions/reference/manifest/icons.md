One or more icons that represent the extension or theme. You should always provide a 128x128 icon;
it's used during installation and by the Chrome Web Store. Extensions should also provide a 48x48
icon, which is used in the extensions management page (chrome://extensions). You can also specify a
16x16 icon to be used as the favicon for an extension's pages.
Icons should generally be in PNG format, because PNG has the best support for transparency. They
can, however, be in any raster format supported by Blink, including BMP, GIF, ICO, and JPEG. Caution: WebP and SVG files are not supported.
Here's an example of how to declare the icons in the manifest:

```
 "icons": {
    "16": "icon16.png",
    "32": "icon32.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },

```

Note: You may provide icons of any other size you wish, and Chrome will attempt to use the best size where
appropriate.
See [Extension icons](/docs/webstore/images#icons) details on Chrome Web Store requirements and best practices.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2013-05-12 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2013-05-12 UTC."],[],[]]
