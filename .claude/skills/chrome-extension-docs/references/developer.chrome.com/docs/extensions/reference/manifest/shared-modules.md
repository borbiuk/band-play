Caution: The Chrome Web Store does not allow the submission of shared modules.
Shared Modules are permissionless collections of resources that can be shared between
extensions. Common uses of Shared Modules are:

- As an API. You can distribute a Shared Module that can provide HTML, JS, and other resources to
  provide an API that can be updated independently of the extensions that depend on it.
- As a download optimization. The Shared Module contains common resources used by many extensions.
  It's downloaded once, the first time a dependent extension is installed.

## Manifest

Shared Modules are used through two [manifest](/docs/extensions/mv3/manifest) fields: `"export"` and `"import"`.

### Export

The export field indicates an extension is a Shared Module that exports its resources:

```
{
  "version": "1.0",
  "name": "My Shared Module",
  "export": {
    // Optional list of extension IDs explicitly allowed to
    // import this Shared Module's resources.  If no allowlist
    // is given, all extensions are allowed to import it.
    "allowlist": [
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    ]
  }
  // Note: no permissions are allowed in Shared Modules
}

```

### Import

The import field is used by extensions and apps to declare that they depend on the resources from
particular Shared Modules:

```
{
  "version": "1.0",
  "name": "My Importing Extension",
  ...
  "import": [
    {"id": "cccccccccccccccccccccccccccccccc"},
    {"id": "dddddddddddddddddddddddddddddddd"
     "minimum_version": "0.5" // optional
    },
  ]
}

```

## Accessing resources

Shared Module resources are accessed by a reserved path \_modules/SHARED_MODULE_ID in the root
of your importing extension. For example, to include the script `foo.js` from a Shared Module with
ID "cccccccccccccccccccccccccccccccc", use this path from the root of your extension:

```
<script src="_modules/cccccccccccccccccccccccccccccccc/foo.js">

```

If the importing extension has ID "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", then the full URL to resources
in the Shared Module is:

```
chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/_modules/cccccccccccccccccccccccccccccccc/

```

Note that since resources from Shared Modules are overlaid into the origin of the importing
extension, all privileges granted to the importing extension are available to code in Shared
Modules. Also, the Shared Module can access resources in the importing extension by using
absolute paths.

## Install / uninstall

A Shared Module is automatically installed from the Chrome Web Store when needed by a dependent extension and automatically uninstalled when the last extension which references it is uninstalled.
To upload an extension that uses a Shared Module, the Shared Module must be published in
the Chrome Web Store and the extension must not be restricted from using the Shared Module by its
allowlist.
During development, you will need to manually install any Shared Modules your extension uses.
Automatic installs do not happen for extensions that are side-loaded or loaded as unpacked
extensions. For locally installed, unpacked Shared Modules, you must use the [key](/docs/extensions/mv3/manifest/key) field to
ensure the Shared Modules use the correct IDs.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2015-01-05 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2015-01-05 UTC."],[],[]]
