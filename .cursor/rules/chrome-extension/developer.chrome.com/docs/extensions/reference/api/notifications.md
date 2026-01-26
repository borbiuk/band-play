## Description

Use the `chrome.notifications` API to create rich notifications using templates and show these notifications to users in the system tray.

## Permissions

`notifications`

## Types

### NotificationBitmap

### NotificationButton

#### Properties

- iconUrl
  string optional
  Deprecated since Chrome 59
  Button icons not visible for Mac OS X users.

- title
  string

### NotificationItem

#### Properties

- message
  string
  Additional details about this item.
- title
  string
  Title of one item of a list notification.

### NotificationOptions

#### Properties

- appIconMaskUrl
  string optional
  Deprecated since Chrome 59
  The app icon mask is not visible for Mac OS X users.

A URL to the app icon mask. URLs have the same restrictions as [iconUrl](#property-NotificationOptions-iconUrl).
The app icon mask should be in alpha channel, as only the alpha channel of the image will be considered.

- buttons
  [NotificationButton](#type-NotificationButton)[] optional
  Text and icons for up to two notification action buttons.
- contextMessage
  string optional
  Alternate notification content with a lower-weight font.
- eventTime
  number optional
  A timestamp associated with the notification, in milliseconds past the epoch (e.g. `Date.now() + n`).
- iconUrl
  string optional
  A URL to the sender's avatar, app icon, or a thumbnail for image notifications.
  URLs can be a data URL, a blob URL, or a URL relative to a resource within this extension's .crx file
  **Note:**This value is required for the ``[notifications.create](#method-create)`()` method.
- imageUrl
  string optional
  Deprecated since Chrome 59
  The image is not visible for Mac OS X users.

A URL to the image thumbnail for image-type notifications. URLs have the same restrictions as [iconUrl](#property-NotificationOptions-iconUrl).

- isClickable
  boolean optional
  Deprecated since Chrome 67
  This UI hint is ignored as of Chrome 67

- items
  [NotificationItem](#type-NotificationItem)[] optional
  Items for multi-item notifications. Users on Mac OS X only see the first item.
- message
  string optional
  Main notification content.
  **Note:**This value is required for the ``[notifications.create](#method-create)`()` method.
- priority
  number optional
  Priority ranges from -2 to 2. -2 is lowest priority. 2 is highest. Zero is default. On platforms that don't support a notification center (Windows, Linux & Mac), -2 and -1 result in an error as notifications with those priorities will not be shown at all.
- progress
  number optional
  Current progress ranges from 0 to 100.
- requireInteraction
  boolean optionalChrome 50+

Indicates that the notification should remain visible on screen until the user activates or dismisses the notification. This defaults to false.

- silent
  boolean optionalChrome 70+

Indicates that no sounds or vibrations should be made when the notification is being shown. This defaults to false.

- title
  string optional
  Title of the notification (e.g. sender name for email).
  **Note:**This value is required for the ``[notifications.create](#method-create)`()` method.
- type
  [TemplateType](#type-TemplateType)optional
  Which type of notification to display. Required for ``[notifications.create](#method-create) method.

### PermissionLevel

#### Enum

"granted"
Specifies that the user has elected to show notifications from the app or extension. This is the default at install time.
"denied"
Specifies that the user has elected not to show notifications from the app or extension.

### TemplateType

#### Enum

"basic"
Contains an icon, title, message, expandedMessage, and up to two buttons.
"image"
Contains an icon, title, message, expandedMessage, image, and up to two buttons.
"list"
Contains an icon, title, message, items, and up to two buttons. Users on Mac OS X only see the first item.
"progress"
Contains an icon, title, message, progress, and up to two buttons.

## Methods

### clear()

```
chrome.notifications.clear(
  notificationId: string,
): Promise<boolean>
```

Clears the specified notification.

#### Parameters

- notificationId
  string
  The id of the notification to be cleared. This is returned by ``[notifications.create](#method-create) method.

#### Returns

Promise<boolean>Chrome 116+

Returns a Promise which resolves to indicate whether a matching notification existed.

### create()

```
chrome.notifications.create(
  notificationId?: string,
  options: [NotificationOptions](#type-NotificationOptions),
): Promise<string>
```

Creates and displays a notification.

#### Parameters

- notificationId
  string optional
  Identifier of the notification. If not set or empty, an ID will automatically be generated. If it matches an existing notification, this method first clears that notification before proceeding with the create operation. The identifier may not be longer than 500 characters.
  The `notificationId` parameter is required before Chrome 42.
- options
  [NotificationOptions](#type-NotificationOptions)
  Contents of the notification.

#### Returns

Promise<string>Chrome 116+

Returns a Promise which resolves with the notification id (either supplied or generated) that represents the created notification.

### getAll()

```
chrome.notifications.getAll(): Promise<object>
```

Retrieves all the notifications of this app or extension.

#### Returns

Promise<object>Chrome 116+

Returns a Promise which resolves with the set of notification_ids currently in the system.

### getPermissionLevel()

```
chrome.notifications.getPermissionLevel(): Promise<[PermissionLevel](#type-PermissionLevel)>
```

Retrieves whether the user has enabled notifications from this app or extension.

#### Returns

Promise<[PermissionLevel](#type-PermissionLevel)>Chrome 116+

Returns a Promise which resolves with the current permission level.

### update()

```
chrome.notifications.update(
  notificationId: string,
  options: [NotificationOptions](#type-NotificationOptions),
): Promise<boolean>
```

Updates an existing notification.

#### Parameters

- notificationId
  string
  The id of the notification to be updated. This is returned by ``[notifications.create](#method-create) method.
- options
  [NotificationOptions](#type-NotificationOptions)
  Contents of the notification to update to.

#### Returns

Promise<boolean>Chrome 116+

Returns a Promise which resolves to indicate whether a matching notification existed.

## Events

### onButtonClicked

```
chrome.notifications.onButtonClicked.addListener(
  callback: function,
)
```

The user pressed a button in the notification.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(notificationId: string, buttonIndex: number) => void
```

- notificationId
  string
- buttonIndex
  number

### onClicked

```
chrome.notifications.onClicked.addListener(
  callback: function,
)
```

The user clicked in a non-button area of the notification.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(notificationId: string) => void
```

- notificationId
  string

### onClosed

```
chrome.notifications.onClosed.addListener(
  callback: function,
)
```

The notification closed, either by the system or by user action.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(notificationId: string, byUser: boolean) => void
```

- notificationId
  string
- byUser
  boolean

### onPermissionLevelChanged

```
chrome.notifications.onPermissionLevelChanged.addListener(
  callback: function,
)
```

The user changes the permission level. As of Chrome 47, only ChromeOS has UI that dispatches this event.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(level: [PermissionLevel](#type-PermissionLevel)) => void
```

- level
  [PermissionLevel](#type-PermissionLevel)

### onShowSettings

        Deprecated since Chrome 65

```
chrome.notifications.onShowSettings.addListener(
  callback: function,
)
```

Custom notification settings button is no longer supported.

The user clicked on a link for the app's notification settings. As of Chrome 47, only ChromeOS has UI that dispatches this event. As of Chrome 65, that UI has been removed from ChromeOS, too.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
() => void
```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-01-07 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
