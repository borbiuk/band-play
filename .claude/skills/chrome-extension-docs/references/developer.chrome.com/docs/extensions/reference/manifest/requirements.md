Technologies required by the extension. Hosting sites such as the Chrome Web Store may use this list
to dissuade users from installing extensions that will not work on their computer. Additional requirements checks may be added in
the future.
The `"3D"` requirement denotes GPU hardware acceleration and takes either `"webgl"` or `"css3d"` as valid values. The `"webgl"` requirement refers to the [WebGL
API](https://www.khronos.org/webgl/). For more information on Chrome 3D graphics support, see the help article on [WebGL and 3D
graphics](https://support.google.com/chrome/answer/1220892). You can list the 3D-related features your extension requires, as demonstrated in the
following example:

```
"requirements": {
  "3D": {
    "features": ["webgl"]
  }
}

```

NPAPI Plugin support for extensions has been [discontinued](https://blog.chromium.org/2013/09/saying-goodbye-to-our-old-friend-npapi.html) as of Chrome version 45. As part of this, the "plugins"
requirement has been deprecated, and can no longer be used in a manifest file.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2013-05-12 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2013-05-12 UTC."],[],[]]
