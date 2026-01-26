## Description

Use the `chrome.fontSettings` API to manage Chrome's font settings.

## Permissions

`fontSettings`

To use the Font Settings API, you must declare the `"fontSettings"` permission in the [extension
manifest](/docs/extensions/mv3/manifest). For example:

```
{
  "name": "My Font Settings Extension",
  "description": "Customize your fonts",
  "version": "0.2",
  "permissions": [
    "fontSettings"
  ],
  ...
}

```

## Concepts and usage

Chrome allows for some font settings to depend on certain generic font families and language
scripts. For example, the font used for sans-serif Simplified Chinese may be different than the font
used for serif Japanese.
The generic font families supported by Chrome are based on [CSS generic font families](https://www.w3.org/TR/CSS21/fonts.html#generic-font-families) and are
listed under `[GenericReference](#type-GenericFamily). When a web page specifies a generic font family, Chrome selects
the font based on the corresponding setting. If no generic font family is specified, Chrome uses the
setting for the "standard" generic font family.
When a web page specifies a language, Chrome selects the font based on the setting for the
corresponding language script. If no language is specified, Chrome uses the setting for the default,
or global, script.
The supported language scripts are specified by ISO 15924 script code and listed under
`[ScriptCode](#type-ScriptCode). Technically, Chrome settings are not strictly per-script but also depend on
language. For example, Chrome chooses the font for Cyrillic (ISO 15924 script code "Cyrl") when a
web page specifies the Russian language, and uses this font not just for Cyrillic script but for
everything the font covers, such as Latin.

## Examples

The following code gets the standard font for Arabic.

```
chrome.fontSettings.getFont(
  { genericFamily: 'standard', script: 'Arab' },
  function(details) { console.log(details.fontId); }
);

```

The next snippet sets the sans-serif font for Japanese.

```
chrome.fontSettings.setFont(
  { genericFamily: 'sansserif', script: 'Jpan', fontId: 'MS PGothic' }
);

```

To try this API, install the [fontSettings API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/fontSettings) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.

## Types

### FontName

Represents a font name.

#### Properties

- displayName
  string
  The display name of the font.
- fontId
  string
  The font ID.

### GenericFamily

A CSS generic font family.

#### Enum

"standard"

"sansserif"

"serif"

"fixed"

"cursive"

"fantasy"

"math"

### LevelOfControl

One of
`not\_controllable`: cannot be controlled by any extension
`controlled\_by\_other\_extensions`: controlled by extensions with higher precedence
`controllable\_by\_this\_extension`: can be controlled by this extension
`controlled\_by\_this\_extension`: controlled by this extension

#### Enum

"not_controllable"

"controlled_by_other_extensions"

"controllable_by_this_extension"

"controlled_by_this_extension"

### ScriptCode

An ISO 15924 script code. The default, or global, script is represented by script code "Zyyy".

#### Enum

"Afak"

"Arab"

"Armi"

"Armn"

"Avst"

"Bali"

"Bamu"

"Bass"

"Batk"

"Beng"

"Blis"

"Bopo"

"Brah"

"Brai"

"Bugi"

"Buhd"

"Cakm"

"Cans"

"Cari"

"Cham"

"Cher"

"Cirt"

"Copt"

"Cprt"

"Cyrl"

"Cyrs"

"Deva"

"Dsrt"

"Dupl"

"Egyd"

"Egyh"

"Egyp"

"Elba"

"Ethi"

"Geor"

"Geok"

"Glag"

"Goth"

"Gran"

"Grek"

"Gujr"

"Guru"

"Hang"

"Hani"

"Hano"

"Hans"

"Hant"

"Hebr"

"Hluw"

"Hmng"

"Hung"

"Inds"

"Ital"

"Java"

"Jpan"

"Jurc"

"Kali"

"Khar"

"Khmr"

"Khoj"

"Knda"

"Kpel"

"Kthi"

"Lana"

"Laoo"

"Latf"

"Latg"

"Latn"

"Lepc"

"Limb"

"Lina"

"Linb"

"Lisu"

"Loma"

"Lyci"

"Lydi"

"Mand"

"Mani"

"Maya"

"Mend"

"Merc"

"Mero"

"Mlym"

"Moon"

"Mong"

"Mroo"

"Mtei"

"Mymr"

"Narb"

"Nbat"

"Nkgb"

"Nkoo"

"Nshu"

"Ogam"

"Olck"

"Orkh"

"Orya"

"Osma"

"Palm"

"Perm"

"Phag"

"Phli"

"Phlp"

"Phlv"

"Phnx"

"Plrd"

"Prti"

"Rjng"

"Roro"

"Runr"

"Samr"

"Sara"

"Sarb"

"Saur"

"Sgnw"

"Shaw"

"Shrd"

"Sind"

"Sinh"

"Sora"

"Sund"

"Sylo"

"Syrc"

"Syre"

"Syrj"

"Syrn"

"Tagb"

"Takr"

"Tale"

"Talu"

"Taml"

"Tang"

"Tavt"

"Telu"

"Teng"

"Tfng"

"Tglg"

"Thaa"

"Thai"

"Tibt"

"Tirh"

"Ugar"

"Vaii"

"Visp"

"Wara"

"Wole"

"Xpeo"

"Xsux"

"Yiii"

"Zmth"

"Zsym"

"Zyyy"

## Methods

### clearDefaultFixedFontSize()

```
chrome.fontSettings.clearDefaultFixedFontSize(
  details?: object,
): Promise<void>
```

Clears the default fixed font size set by this extension, if any.

#### Parameters

- details
  object optional
  This parameter is currently unused.

#### Returns

Promise<void>Chrome 96+

### clearDefaultFontSize()

```
chrome.fontSettings.clearDefaultFontSize(
  details?: object,
): Promise<void>
```

Clears the default font size set by this extension, if any.

#### Parameters

- details
  object optional
  This parameter is currently unused.

#### Returns

Promise<void>Chrome 96+

### clearFont()

```
chrome.fontSettings.clearFont(
  details: object,
): Promise<void>
```

Clears the font set by this extension, if any.

#### Parameters

- details
  object

- genericFamily
  [GenericFamily](#type-GenericFamily)
  The generic font family for which the font should be cleared.
- script
  [ScriptCode](#type-ScriptCode)optional
  The script for which the font should be cleared. If omitted, the global script font setting is cleared.

#### Returns

Promise<void>Chrome 96+

### clearMinimumFontSize()

```
chrome.fontSettings.clearMinimumFontSize(
  details?: object,
): Promise<void>
```

Clears the minimum font size set by this extension, if any.

#### Parameters

- details
  object optional
  This parameter is currently unused.

#### Returns

Promise<void>Chrome 96+

### getDefaultFixedFontSize()

```
chrome.fontSettings.getDefaultFixedFontSize(
  details?: object,
): Promise<object>
```

Gets the default size for fixed width fonts.

#### Parameters

- details
  object optional
  This parameter is currently unused.

#### Returns

Promise<object>Chrome 96+

### getDefaultFontSize()

```
chrome.fontSettings.getDefaultFontSize(
  details?: object,
): Promise<object>
```

Gets the default font size.

#### Parameters

- details
  object optional
  This parameter is currently unused.

#### Returns

Promise<object>Chrome 96+

### getFont()

```
chrome.fontSettings.getFont(
  details: object,
): Promise<object>
```

Gets the font for a given script and generic font family.

#### Parameters

- details
  object

- genericFamily
  [GenericFamily](#type-GenericFamily)
  The generic font family for which the font should be retrieved.
- script
  [ScriptCode](#type-ScriptCode)optional
  The script for which the font should be retrieved. If omitted, the font setting for the global script (script code "Zyyy") is retrieved.

#### Returns

Promise<object>Chrome 96+

### getFontList()

```
chrome.fontSettings.getFontList(): Promise<[FontName](#type-FontName)[]>
```

Gets a list of fonts on the system.

#### Returns

Promise<[FontName](#type-FontName)[]>Chrome 96+

### getMinimumFontSize()

```
chrome.fontSettings.getMinimumFontSize(
  details?: object,
): Promise<object>
```

Gets the minimum font size.

#### Parameters

- details
  object optional
  This parameter is currently unused.

#### Returns

Promise<object>Chrome 96+

### setDefaultFixedFontSize()

```
chrome.fontSettings.setDefaultFixedFontSize(
  details: object,
): Promise<void>
```

Sets the default size for fixed width fonts.

#### Parameters

- details
  object

- pixelSize
  number
  The font size in pixels.

#### Returns

Promise<void>Chrome 96+

### setDefaultFontSize()

```
chrome.fontSettings.setDefaultFontSize(
  details: object,
): Promise<void>
```

Sets the default font size.

#### Parameters

- details
  object

- pixelSize
  number
  The font size in pixels.

#### Returns

Promise<void>Chrome 96+

### setFont()

```
chrome.fontSettings.setFont(
  details: object,
): Promise<void>
```

Sets the font for a given script and generic font family.

#### Parameters

- details
  object

- fontId
  string
  The font ID. The empty string means to fallback to the global script font setting.
- genericFamily
  [GenericFamily](#type-GenericFamily)
  The generic font family for which the font should be set.
- script
  [ScriptCode](#type-ScriptCode)optional
  The script code which the font should be set. If omitted, the font setting for the global script (script code "Zyyy") is set.

#### Returns

Promise<void>Chrome 96+

### setMinimumFontSize()

```
chrome.fontSettings.setMinimumFontSize(
  details: object,
): Promise<void>
```

Sets the minimum font size.

#### Parameters

- details
  object

- pixelSize
  number
  The font size in pixels.

#### Returns

Promise<void>Chrome 96+

## Events

### onDefaultFixedFontSizeChanged

```
chrome.fontSettings.onDefaultFixedFontSizeChanged.addListener(
  callback: function,
)
```

Fired when the default fixed font size setting changes.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- levelOfControl
  [LevelOfControl](#type-LevelOfControl)
  The level of control this extension has over the setting.
- pixelSize
  number
  The font size in pixels.

### onDefaultFontSizeChanged

```
chrome.fontSettings.onDefaultFontSizeChanged.addListener(
  callback: function,
)
```

Fired when the default font size setting changes.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- levelOfControl
  [LevelOfControl](#type-LevelOfControl)
  The level of control this extension has over the setting.
- pixelSize
  number
  The font size in pixels.

### onFontChanged

```
chrome.fontSettings.onFontChanged.addListener(
  callback: function,
)
```

Fired when a font setting changes.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- fontId
  string
  The font ID. See the description in `getFont`.
- genericFamily
  [GenericFamily](#type-GenericFamily)
  The generic font family for which the font setting has changed.
- levelOfControl
  [LevelOfControl](#type-LevelOfControl)
  The level of control this extension has over the setting.
- script
  [ScriptCode](#type-ScriptCode)optional
  The script code for which the font setting has changed.

### onMinimumFontSizeChanged

```
chrome.fontSettings.onMinimumFontSizeChanged.addListener(
  callback: function,
)
```

Fired when the minimum font size setting changes.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- levelOfControl
  [LevelOfControl](#type-LevelOfControl)
  The level of control this extension has over the setting.
- pixelSize
  number
  The font size in pixels.
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
