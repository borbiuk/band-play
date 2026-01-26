The `"file_handlers"` manifest key specifies file types to be handled by a ChromeOS extension. To process a file, use the web platform's [Launch Handler API](https://developer.mozilla.org/docs/Web/API/Launch_Handler_API). For extension specific information, see [File Handling](/docs/extensions/how-to/web-platform/file-handling-chromeos).Note: This feature is currently available in Chrome 120 [beta](https://www.google.com/chrome/beta/).

```
"file_handlers": [
  {
    "action": "/open_text.html",
    "name": "Plain text",
    "accept": {
      "text/plain": [".txt"]
    }
    "launch_type": "single-client"
  }
]

```

`"file_handlers"` (dictionary, optional)Specifies the file types the extension can open.`"action"` (string, required)Specifies an HTML file to show when a file is opened. The file must be within your extension. Processing the file, whether it's displayed or used in some other way, is done with JavaScript using appropriate web platform APIs. This code must be in a separate JavaScript file included via a `<script>` tag.`"name"` (string, required)A user friendly description of the action.`"accept"` (dictionary, required)The file types that can be processed by the page specified in `"action"`. The items in the dictionary are a key/value pair where the key is a MIME type and the value is an array of file extensions. Only known MIME types are allowed for the key. Custom file types are allowed but the key for a custom type must be a known MIME type, and the mapping between the MIME type and the custom file type must be supported by the underlying operating system.`"launch_type"` (object, optional)Specifies whether multiple files should be opened in a single client or multiple clients. Valid values are `"single-client"` and `"multiple-clients"`. The default value is `"single-client"`.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2023-11-01 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2023-11-01 UTC."],[],[]]
