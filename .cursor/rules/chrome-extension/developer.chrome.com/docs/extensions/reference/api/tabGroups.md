## Description

Use the `chrome.tabGroups` API to interact with the browser's tab grouping system. You can use this API to modify and rearrange tab groups in the browser. To group and ungroup tabs, or to query what tabs are in groups, use the `chrome.tabs` API.

## Permissions

`tabGroups`

## Availability

Chrome 89+
MV3+

## Types

### Color

The group's color.

#### Enum

"grey"

"blue"

"red"

"yellow"

"green"

"pink"

"purple"

"cyan"

"orange"

### TabGroup

#### Properties

- collapsed
  boolean
  Whether the group is collapsed. A collapsed group is one whose tabs are hidden.
- color
  [Color](#type-Color)
  The group's color.
- id
  number
  The ID of the group. Group IDs are unique within a browser session.
- shared
  booleanChrome 137+

Whether the group is shared.

- title
  string optional
  The title of the group.
- windowId
  number
  The ID of the window that contains the group.

## Properties

### TAB_GROUP_ID_NONE

An ID that represents the absence of a group.

#### Value

-1

## Methods

### get()

```
chrome.tabGroups.get(
  groupId: number,
): Promise<[TabGroup](#type-TabGroup)>
```

Retrieves details about the specified group.

#### Parameters

- groupId
  number

#### Returns

Promise<[TabGroup](#type-TabGroup)>Chrome 90+

### move()

```
chrome.tabGroups.move(
  groupId: number,
  moveProperties: object,
): Promise<[TabGroup](#type-TabGroup) | undefined>
```

Moves the group and all its tabs within its window, or to a new window.

#### Parameters

- groupId
  number
  The ID of the group to move.
- moveProperties
  object

- index
  number
  The position to move the group to. Use `-1` to place the group at the end of the window.
- windowId
  number optional
  The window to move the group to. Defaults to the window the group is currently in. Note that groups can only be moved to and from windows with ``[windows.WindowType](https://developer.chrome.com/docs/extensions/reference/windows/#type-WindowType) type `"normal"`.

#### Returns

Promise<[TabGroup](#type-TabGroup) | undefined>Chrome 90+

### query()

```
chrome.tabGroups.query(
  queryInfo: object,
): Promise<[TabGroup](#type-TabGroup)[]>
```

Gets all groups that have the specified properties, or all groups if no properties are specified.

#### Parameters

- queryInfo
  object

- collapsed
  boolean optional
  Whether the groups are collapsed.
- color
  [Color](#type-Color)optional
  The color of the groups.
- shared
  boolean optionalChrome 137+

Whether the group is shared.

- title
  string optional
  Match group titles against a pattern.
- windowId
  number optional
  The ID of the parent window, or ``[windows.WINDOW_ID_CURRENT](https://developer.chrome.com/docs/extensions/reference/windows/#property-WINDOW_ID_CURRENT) for the [current window](https://developer.chrome.com/docs/extensions/reference/windows/#current-window).

#### Returns

Promise<[TabGroup](#type-TabGroup)[]>Chrome 90+

### update()

```
chrome.tabGroups.update(
  groupId: number,
  updateProperties: object,
): Promise<[TabGroup](#type-TabGroup) | undefined>
```

Modifies the properties of a group. Properties that are not specified in `updateProperties` are not modified.

#### Parameters

- groupId
  number
  The ID of the group to modify.
- updateProperties
  object

- collapsed
  boolean optional
  Whether the group should be collapsed.
- color
  [Color](#type-Color)optional
  The color of the group.
- title
  string optional
  The title of the group.

#### Returns

Promise<[TabGroup](#type-TabGroup) | undefined>Chrome 90+

## Events

### onCreated

```
chrome.tabGroups.onCreated.addListener(
  callback: function,
)
```

Fired when a group is created.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(group: [TabGroup](#type-TabGroup)) => void
```

- group
  [TabGroup](#type-TabGroup)

### onMoved

```
chrome.tabGroups.onMoved.addListener(
  callback: function,
)
```

Fired when a group is moved within a window. Move events are still fired for the individual tabs within the group, as well as for the group itself. This event is not fired when a group is moved between windows; instead, it will be removed from one window and created in another.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(group: [TabGroup](#type-TabGroup)) => void
```

- group
  [TabGroup](#type-TabGroup)

### onRemoved

```
chrome.tabGroups.onRemoved.addListener(
  callback: function,
)
```

Fired when a group is closed, either directly by the user or automatically because it contained zero tabs.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(group: [TabGroup](#type-TabGroup)) => void
```

- group
  [TabGroup](#type-TabGroup)

### onUpdated

```
chrome.tabGroups.onUpdated.addListener(
  callback: function,
)
```

Fired when a group is updated.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(group: [TabGroup](#type-TabGroup)) => void
```

- group
  [TabGroup](#type-TabGroup)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
