declared as [JSON Schema](https://tools.ietf.org/html/draft-zyp-json-schema-03) and is strictly validated by Chrome. This schema must be stored in a
file indicated by the `"managed_schema"` property of the `"storage"` manifest key and declares the
enterprise policies supported by the extension.
Policies are analogous to options but are
[configured by a system administrator](https://www.chromium.org/administrators/)
for policy installed extensions, allowing the extension to be preconfigured for
all users of an organization. See [how Chrome handles policies](https://www.chromium.org/administrators/) for examples
from Chrome itself.
After declaring the policies they can be read from the [storage.managed](/docs/extensions/reference/storage#property-managed) API. It's up to the
extension to enforce the policies configured by the administrator.

## Sample manifest.json

The `storage.managed_schema` property indicates a file within the extension that contains the policy
schema.

```
{
  "name": "My enterprise extension",
  "storage": {
    "managed_schema": "schema.json"
  },
  ...
}

```

Chrome will then load these policies from the underlying operating system and from Google Apps for
signed-in users. The ``[storage.onChanged](/docs/extensions/reference/storage#event-onChanged) event is fired whenever a policy change is detected.
You can verify the policies that Chrome loaded at chrome://policy.

## Schema format

The JSON Schema format has some additional requirements from Chrome:

- The top-level schema must have type `object`.
- The top-level `object` can't have `additionalProperties`. The `properties` declared are the
  policies for this extension.
- Each schema must have either a `$ref` value or exactly one `type`.
  If the schema is invalid then Chrome won't load the extension and will indicate the reason why the
  schema wasn't validated. If a policy value does not conform to the schema then it won't be
  published by the `storage.managed` API.

## Sample schema

```
{
  "type": "object",

  // "properties" maps an optional key of this object to its schema. At the
  // top-level object, these keys are the policy names supported.
  "properties": {

    // The policy name "AutoSave" is mapped to its schema, which in this case
    // declares it as a simple boolean value.
    // "title" and "description" are optional and are used to show a
    // user-friendly name and documentation to the administrator.
    "AutoSave": {
      "title": "Automatically save changes.",
      "description": "If set to true then changes will be automatically saved.",
      "type": "boolean"
    },

    // Other simple types supported include "integer", "string" and "number".
    "PollRefreshRate": {
      "type": "integer"
    },

    "DefaultServiceUrl": {
      "type": "string"
    },

    // "array" is a list of items that conform to another schema, described
    // in "items". An example to this schema is [ "one", "two" ].
    "ServiceUrls": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },

    // A more complex example that describes a list of bookmarks. Each bookmark
    // has a "title", and can have a "url" or a list of "children" bookmarks.
    // The "id" attribute is used to name a schema, and other schemas can reuse
    // it using the "$ref" attribute.
    "Bookmarks": {
      "type": "array",
      "id": "ListOfBookmarks",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "url": { "type": "string" },
          "children": { "$ref": "ListOfBookmarks" }
        }
      }
    },

    // An "object" can have known properties listed as "properties", and can
    // optionally have "additionalProperties" indicating a schema to apply to
    // keys that aren't found in "properties".
    // This example policy could map a URL to its settings. An example value:
    // {
    //   "youtube.com": {
    //     "blocklisted": true
    //   },
    //   "google.com": {
    //     "bypass_proxy": true
    //   }
    // }
    "SettingsForUrls": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "blocklisted": { "type": "boolean" },
          "bypass_proxy": { "type": "boolean" }
        }
      }
    }
  }
}

```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2013-12-06 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2013-12-06 UTC."],[],[]]
