The `"content_scripts"` key specifies a statically loaded JavaScript or CSS file to be used every time a page is opened that matches a certain [URL pattern](/docs/extensions/mv3/match_patterns). Extensions can also inject content scripts programmatically, see [Injecting Scripts](/docs/extensions/mv3/content_scripts) for details.

## Manifest

These are the supported keys for `"content_scripts"`. Only the `"matches"` key and either `"js"` or `"css"` are required.
manifest.json

```
{
 "name": "My extension",
 ...
 "content_scripts": [
   {
     "matches": ["https://*.example.com/*"],
     "css": ["my-styles.css"],
     "js": ["content-script.js"],
     "exclude_matches": ["*://*/*foo*"],
     "include_globs": ["*example.com/???s/*"],
     "exclude_globs": ["*bar*"],
     "all_frames": false,
     "match_origin_as_fallback": false,
     "match_about_blank": false,
     "run_at": "document_idle",
     "world": "ISOLATED",
   }
 ],
 ...
}

```

## Files

Each file must contain a relative path to a resource in the extension's root directory. Leading slashes (`/`) are automatically trimmed. The ``["run_at"](#world-timings) key specifies when each file will be injected.`"css"` - ArrayOptional. An array of CSS file paths, injected in the order of this array, and before any DOM construction or page rendering occurs.`"js"` - Array,Optional. An array of JavaScript file paths, injected in the order they appear in this array, after css files are injected. Each string in the array must be a relative path to a resource in the extension's root directory. Leading slashes ('/') are automatically trimmed.

## Match URLs

Only the `"matches"` property is required. Then you can use `"exclude_matches"`, `"include_globs"`, and `"exclude_globs"` to customize which URLs to inject code into. The `"matches"` key will [trigger a warning](/docs/extensions/mv3/permission_warnings).`"matches"` - ArrayRequired. Specifies which URL patterns to inject the content scripts into. See [Match Patterns](/docs/extensions/mv3/match_patterns) for syntax.`"exclude_matches"` - ArrayOptional. Excludes the URL patterns to inject the content scripts into. See [Match Patterns](/docs/extensions/mv3/match_patterns) for syntax.`"include_globs"` - ArrayOptional. Applied after matches to include only those URLs that also match this glob. Intended to emulate the [@include](https://wiki.greasespot.net/Metadata_Block#.40include) Greasemonkey keyword.`"exclude_globs"` - ArrayOptional. Applied after matches to exclude URLs that match this glob. Intended to emulate the [@exclude](https://wiki.greasespot.net/Metadata_Block#.40exclude) Greasemonkey keyword.
Glob URLs are those that contain "wildcards" _ and question marks. The wildcard _ matches any string of any length, including an empty string, while the question mark ? matches any single character.
The content script is injected into a page if:

- Its URL matches any `"matches"` and `"include_globs"` patterns.
- And the URL doesn't match `"exclude_matches"` or `"exclude_globs"` patterns.

### Globs and URL matching examples

#### `"include_globs"`

manifest.json

```
{
  ...
  "content_scripts": [
    {
      "matches": ["https://*.example.com/*"],
      "include_globs": ["https://???.example.com/foo/*"],
      "js": ["content-script.js"]
    }
  ],
  ...
}

```

Matches

```
https://www.example.com/foo/bar
https://the.example.com/foo/
```

Does not match

```
https://my.example.com/foo/bar
https://example.com/foo/*
https://www.example.com/foo
```

manifest.json

```
{
  ...
  "content_scripts": [
    {
      "matches": ["https://*.example.com/*"],
      "include_globs": ["*example.com/???s/*"],
      "js": ["content-script.js"]
    }
  ],
  ...
}

```

Matches

```
https://www.example.com/arts/index.html
https://www.example.com/jobs/index.html
```

Does not match

```
https://www.example.com/sports/index.html
https://www.example.com/music/index.html
```

#### `"exclude_globs"`

manifest.json

```
{
  ...
  "content_scripts": [
    {
      "matches": ["https://*.example.com/*"],
      "exclude_globs": ["*science*"],
      "js": ["content-script.js"]
    }
  ],
  ...
}

```

Matches

```
https://history.example.com
https://.example.com/music
```

Does not match

```
https://science.example.com
https://www.example.com/science
```

#### Advanced customization example

manifest.json

```
{
  ...
  "content_scripts": [
    {
      "matches": ["https://*.example.com/*"],
      "exclude_matches": ["*://*/*business*"],
      "include_globs": ["*example.com/???s/*"],
      "exclude_globs": ["*science*"],
      "js": ["content-script.js"]
    }
  ],
  ...
}

```

Matches

```
https://www.example.com/arts/index.html
https://.example.com/jobs/index.html
```

Does not match

```
https://science.example.com
https://www.example.com/jobs/business
https://www.example.com/science
```

## Frames

The `"all_frames"` key specifies if the content script should be injected into all frames matching the specified URL requirements. If set to `false` it will only inject into the topmost frame. It can be used along with `"match_about_blank"` to inject into an `about:blank` frame.
To inject into other frames like `data:`, `blob:`, and `filesystem:`, set the `"match_origin_as_fallback"` to `true`. For details, see [Inject in related frames](/docs/extensions/develop/concepts/content-scripts#injecting-in-related-frames)`"all_frames"` BooleanOptional. Defaults to `false`, meaning that only the top frame is matched. If set to true, it will inject into all frames, even if the frame is not the topmost frame in the tab. Each frame is checked independently for URL requirements, it won't inject into child frames if the URL requirements are not met.`"match_about_blank"`- BooleanOptional. Defaults to `false`. Whether the script should inject into an `about:blank` frame where the parent URL matches one of the patterns declared in `"matches"`.`"match_origin_as_fallback"` - BooleanOptional. Defaults to `false`. Whether the script should inject in frames that were created by a matching origin, but whose URL or origin may not directly match the pattern. These include frames with different schemes, such as `about:`, `data:`, `blob:`, and `filesystem:`.

## Run time and execution environment

By default, content scripts are injected when the document and all resources are finished loading, and live in a private isolated execution environment that isn't accessible to the page or other extensions. You can change these defaults in the following keys:``["run_at"](/docs/extensions/reference/extensionTypes#type-RunAt) - `document_start`|`document_end`|`document_idle`Optional. Specifies when the script should be injected into the page. It corresponds with the loading states of [Document.readyState](https://developer.mozilla.org/docs/Web/API/Document/readyState):

- `"document_start"`: the DOM is still loading.
- `"document_end"`: the page's resources are still loading
- `"document_idle"`: the DOM and resources have finished loading. This is the default.``["world"](/docs/extensions/reference/scripting#type-ExecutionWorld) - `ISOLATED`|`MAIN`Optional. The JavaScript world for a script to execute within. Defaults to `"ISOLATED"`, which is the execution environment unique to the content script. Choosing the `"MAIN"`world means the script will share the execution environment with the host page's JavaScript. See [Work in isolated worlds](/docs/extensions/mv3/content_scripts#isolated_world) to learn more.Warning: There are risks involved when using the`"MAIN"` world. The host page can access and interfere with the injected script. See [Work in isolated worlds](/docs/extensions/develop/concepts/content-scripts#isolated_world) to learn more.

## Example

See the [Run on every page](/docs/extensions/mv3/getstarted/tut-reading-time) tutorial to build an extension that injects a content script in the manifest.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2023-08-10 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2023-08-10 UTC."],[],[]]
