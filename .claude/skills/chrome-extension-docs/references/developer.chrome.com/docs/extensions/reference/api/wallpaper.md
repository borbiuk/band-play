## Description

Use the `chrome.wallpaper` API to change the ChromeOS wallpaper.

## Permissions

`wallpaper`

You must declare the "wallpaper" permission in the app's [manifest](/docs/extensions/reference/manifest) to use
the wallpaper API. For example:

```
{
  "name": "My extension",
  ...
  "permissions": [
    "wallpaper"
  ],
  ...
}

```

## Availability

Chrome 43+

        ChromeOS only

## Examples

For example, to set the wallpaper as the image at
`https://example.com/a_file.png`, you can call `chrome.wallpaper.setWallpaper`
this way:

```
chrome.wallpaper.setWallpaper(
  {
    'url': 'https://example.com/a_file.jpg',
    'layout': 'CENTER_CROPPED',
    'filename': 'test_wallpaper'
  },
  function() {}
);

```

## Types

### WallpaperLayout

Chrome 44+

The supported wallpaper layouts.

#### Enum

"STRETCH"

"CENTER"

"CENTER_CROPPED"

## Methods

### setWallpaper()

```
chrome.wallpaper.setWallpaper(
  details: object,
): Promise<ArrayBuffer | undefined>
```

Sets wallpaper to the image at url or wallpaperData with the specified layout

#### Parameters

- details
  object

- data
  ArrayBuffer optional
  The jpeg or png encoded wallpaper image as an ArrayBuffer.
- filename
  string
  The file name of the saved wallpaper.
- layout
  [WallpaperLayout](#type-WallpaperLayout)
  The supported wallpaper layouts.
- thumbnail
  boolean optional
  True if a 128x60 thumbnail should be generated. Layout and ratio are not supported yet.
- url
  string optional
  The URL of the wallpaper to be set (can be relative).

#### Returns

Promise<ArrayBuffer | undefined>Chrome 96+

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
