An optional Manifest key enabling the use of the ``[input.ime API](/docs/extensions/reference/api/input/ime) (Input Method Editor) for use with ChromeOS. This allows your extension to handle keystrokes, set the composition, and open assistive windows. Developers must also declare the `"input"`permission in the extension's`"permissions"`array.
The key accepts an array of objects:`name`, `id`, `language`, `layouts`, `input_view`, and `options_page` (Refer to the table below).PropertyTypeDescription`name`stringRequired name of the input component object.`id`stringOptional component object id.`language`string (or array of strings)Optional specified language or list of applicable languages. Examples: "en", ["en", "pt"]`layouts`string (or array of strings)Optional list of input methods. Note that ChromeOS only supports one layout per input method. If multiple layouts are specified, selection order is undefined. Extensions are therefore strongly encouraged to only specify one layout per input method. For keyboard layouts, a `xkb:` prefix indicates that this is a keyboard layout extension.Example: ["us::eng"]`input_view`stringOptional string specifying an extension resource.`options_page`stringOptional string specifying an extension resource. If not provided, the default extension's options page will be used.

```
{
  // ...
   "input_components": [{
     "name": "ToUpperIME",
    "id": "ToUpperIME",
    "language": "en",
    "layouts": ["us::eng"]
  }]
  // ...
}

```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2022-10-28 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2022-10-28 UTC."],[],[]]
