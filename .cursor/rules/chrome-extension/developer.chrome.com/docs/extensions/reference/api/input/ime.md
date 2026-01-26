## Description

Use the `chrome.input.ime` API to implement a custom IME for Chrome OS. This allows your extension to handle keystrokes, set the composition, and manage the candidate window.

## Permissions

`input`

You must declare the "input" permission in the [extension manifest](/docs/extensions/reference/manifest) to use the input.ime API. For
example:

```
{
  "name": "My extension",
  ...
  "permissions": [
    "input"
  ],
  ...
}

```

## Availability

        ChromeOS only

## Examples

The following code creates an IME that converts typed letters to upper case.

```
var context_id = -1;

chrome.input.ime.onFocus.addListener(function(context) {
  context_id = context.contextID;
});

chrome.input.ime.onKeyEvent.addListener(
  function(engineID, keyData) {
    if (keyData.type == "keydown" && keyData.key.match(/^[a-z]$/)) {
      chrome.input.ime.commitText({"contextID": context_id,
                                    "text": keyData.key.toUpperCase()});
      return true;
    } else {
      return false;
    }
  }
);

```

## Types

### AssistiveWindowButton

Chrome 85+

ID of buttons in assistive window.

#### Enum

"undo"

"addToDictionary"

### AssistiveWindowProperties

Chrome 85+

Properties of the assistive window.

#### Properties

- announceString
  string optional
  Strings for ChromeVox to announce.
- type
  "undo"

- visible
  boolean
  Sets true to show AssistiveWindow, sets false to hide.

### AssistiveWindowType

Chrome 85+

Type of assistive window.

#### Value

"undo"

### AutoCapitalizeType

Chrome 69+

The auto-capitalize type of the text field.

#### Enum

"characters"

"words"

"sentences"

### InputContext

Describes an input Context

#### Properties

- autoCapitalize
  [AutoCapitalizeType](#type-AutoCapitalizeType)Chrome 69+

The auto-capitalize type of the text field.

- autoComplete
  boolean
  Whether the text field wants auto-complete.
- autoCorrect
  boolean
  Whether the text field wants auto-correct.
- contextID
  number
  This is used to specify targets of text field operations. This ID becomes invalid as soon as onBlur is called.
- shouldDoLearning
  booleanChrome 68+

Whether text entered into the text field should be used to improve typing suggestions for the user.

- spellCheck
  boolean
  Whether the text field wants spell-check.
- type
  [InputContextType](#type-InputContextType)
  Type of value this text field edits, (Text, Number, URL, etc)

### InputContextType

Chrome 44+

Type of value this text field edits, (Text, Number, URL, etc)

#### Enum

"text"

"search"

"tel"

"url"

"email"

"number"

"password"

"null"

### KeyboardEvent

See http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent

#### Properties

- altKey
  boolean optional
  Whether or not the ALT key is pressed.
- altgrKey
  boolean optionalChrome 79+

Whether or not the ALTGR key is pressed.

- capsLock
  boolean optional
  Whether or not the CAPS_LOCK is enabled.
- code
  string
  Value of the physical key being pressed. The value is not affected by current keyboard layout or modifier state.
- ctrlKey
  boolean optional
  Whether or not the CTRL key is pressed.
- extensionId
  string optional
  The extension ID of the sender of this keyevent.
- key
  string
  Value of the key being pressed
- keyCode
  number optional
  The deprecated HTML keyCode, which is system- and implementation-dependent numerical code signifying the unmodified identifier associated with the key pressed.
- requestId
  string optional
  (Deprecated) The ID of the request. Use the `requestId` param from the `onKeyEvent` event instead.
- shiftKey
  boolean optional
  Whether or not the SHIFT key is pressed.
- type
  [KeyboardEventType](#type-KeyboardEventType)
  One of keyup or keydown.

### KeyboardEventType

Chrome 44+

#### Enum

"keyup"

"keydown"

### MenuItem

A menu item used by an input method to interact with the user from the language menu.

#### Properties

- checked
  boolean optional
  Indicates this item should be drawn with a check.
- enabled
  boolean optional
  Indicates this item is enabled.
- id
  string
  String that will be passed to callbacks referencing this MenuItem.
- label
  string optional
  Text displayed in the menu for this item.
- style
  [MenuItemStyle](#type-MenuItemStyle)optional
  The type of menu item.
- visible
  boolean optional
  Indicates this item is visible.

### MenuItemStyle

Chrome 44+

The type of menu item. Radio buttons between separators are considered grouped.

#### Enum

"check"

"radio"

"separator"

### MenuParameters

Chrome 88+

#### Properties

- engineID
  string
  ID of the engine to use.
- items
  [MenuItem](#type-MenuItem)[]
  MenuItems to add or update. They will be added in the order they exist in the array.

### MouseButton

Chrome 44+

Which mouse buttons was clicked.

#### Enum

"left"

"middle"

"right"

### ScreenType

Chrome 44+

The screen type under which the IME is activated.

#### Enum

"normal"

"login"

"lock"

"secondary-login"

### UnderlineStyle

Chrome 44+

The type of the underline to modify this segment.

#### Enum

"underline"

"doubleUnderline"

"noUnderline"

### WindowPosition

Chrome 44+

Where to display the candidate window. If set to 'cursor', the window follows the cursor. If set to 'composition', the window is locked to the beginning of the composition.

#### Enum

"cursor"

"composition"

## Methods

### clearComposition()

```
chrome.input.ime.clearComposition(
  parameters: object,
): Promise<boolean>
```

Clear the current composition. If this extension does not own the active IME, this fails.

#### Parameters

- parameters
  object

- contextID
  number
  ID of the context where the composition will be cleared

#### Returns

Promise<boolean>Chrome 111+

Resolves when the operation completes with a boolean indicating if the text was accepted or not. On failure, the promise will be rejected.

### commitText()

```
chrome.input.ime.commitText(
  parameters: object,
): Promise<boolean>
```

Commits the provided text to the current input.

#### Parameters

- parameters
  object

- contextID
  number
  ID of the context where the text will be committed
- text
  string
  The text to commit

#### Returns

Promise<boolean>Chrome 111+

Resolves when the operation completes with a boolean indicating if the text was accepted or not. On failure, the promise will be rejected.

### deleteSurroundingText()

```
chrome.input.ime.deleteSurroundingText(
  parameters: object,
): Promise<void>
```

Deletes the text around the caret.

#### Parameters

- parameters
  object

- contextID
  number
  ID of the context where the surrounding text will be deleted.
- engineID
  string
  ID of the engine receiving the event.
- length
  number
  The number of characters to be deleted
- offset
  number
  The offset from the caret position where deletion will start. This value can be negative.

#### Returns

Promise<void>Chrome 111+

Resolves when the operation completes.

### hideInputView()

```
chrome.input.ime.hideInputView(): void
```

Hides the input view window, which is popped up automatically by system. If the input view window is already hidden, this function will do nothing.

### keyEventHandled()

```
chrome.input.ime.keyEventHandled(
  requestId: string,
  response: boolean,
): void
```

Indicates that the key event received by onKeyEvent is handled. This should only be called if the onKeyEvent listener is asynchronous.

#### Parameters

- requestId
  string
  Request id of the event that was handled. This should come from keyEvent.requestId
- response
  boolean
  True if the keystroke was handled, false if not

### sendKeyEvents()

```
chrome.input.ime.sendKeyEvents(
  parameters: object,
): Promise<void>
```

Sends the key events. This function is expected to be used by virtual keyboards. When key(s) on a virtual keyboard is pressed by a user, this function is used to propagate that event to the system.

#### Parameters

- parameters
  object

- contextID
  number
  ID of the context where the key events will be sent, or zero to send key events to non-input field.
- keyData
  [KeyboardEvent](#type-KeyboardEvent)[]
  Data on the key event.

#### Returns

Promise<void>Chrome 111+

Resolves when the operation completes.

### setAssistiveWindowButtonHighlighted()

Chrome 86+

```
chrome.input.ime.setAssistiveWindowButtonHighlighted(
  parameters: object,
): Promise<void>
```

Highlights/Unhighlights a button in an assistive window.

#### Parameters

- parameters
  object

- announceString
  string optional
  The text for the screenreader to announce.
- buttonID
  [AssistiveWindowButton](#type-AssistiveWindowButton)
  The ID of the button
- contextID
  number
  ID of the context owning the assistive window.
- highlighted
  boolean
  Whether the button should be highlighted.
- windowType
  "undo"

The window type the button belongs to.

#### Returns

Promise<void>Chrome 111+

Resolves when the operation completes. On failure, the promise will be rejected.

### setAssistiveWindowProperties()

Chrome 85+

```
chrome.input.ime.setAssistiveWindowProperties(
  parameters: object,
): Promise<boolean>
```

Shows/Hides an assistive window with the given properties.

#### Parameters

- parameters
  object

- contextID
  number
  ID of the context owning the assistive window.
- properties
  [AssistiveWindowProperties](#type-AssistiveWindowProperties)
  Properties of the assistive window.

#### Returns

Promise<boolean>Chrome 111+

Resolves when the operation completes.

### setCandidates()

```
chrome.input.ime.setCandidates(
  parameters: object,
): Promise<boolean>
```

Sets the current candidate list. This fails if this extension doesn't own the active IME

#### Parameters

- parameters
  object

- candidates
  object[]
  List of candidates to show in the candidate window

- annotation
  string optional
  Additional text describing the candidate
- candidate
  string
  The candidate
- id
  number
  The candidate's id
- label
  string optional
  Short string displayed to next to the candidate, often the shortcut key or index
- parentId
  number optional
  The id to add these candidates under
- usage
  object optional
  The usage or detail description of word.

- body
  string
  The body string of detail description.
- title
  string
  The title string of details description.
- contextID
  number
  ID of the context that owns the candidate window.

#### Returns

Promise<boolean>Chrome 111+

Resolves when the operation completes.

### setCandidateWindowProperties()

```
chrome.input.ime.setCandidateWindowProperties(
  parameters: object,
): Promise<boolean>
```

Sets the properties of the candidate window. This fails if the extension doesn't own the active IME

#### Parameters

- parameters
  object

- engineID
  string
  ID of the engine to set properties on.
- properties
  object

- auxiliaryText
  string optional
  Text that is shown at the bottom of the candidate window.
- auxiliaryTextVisible
  boolean optional
  True to display the auxiliary text, false to hide it.
- currentCandidateIndex
  number optionalChrome 84+

The index of the current chosen candidate out of total candidates.

- cursorVisible
  boolean optional
  True to show the cursor, false to hide it.
- pageSize
  number optional
  The number of candidates to display per page.
- totalCandidates
  number optionalChrome 84+

The total number of candidates for the candidate window.

- vertical
  boolean optional
  True if the candidate window should be rendered vertical, false to make it horizontal.
- visible
  boolean optional
  True to show the Candidate window, false to hide it.
- windowPosition
  [WindowPosition](#type-WindowPosition)optional
  Where to display the candidate window.

#### Returns

Promise<boolean>Chrome 111+

Resolves when the operation completes.

### setComposition()

```
chrome.input.ime.setComposition(
  parameters: object,
): Promise<boolean>
```

Set the current composition. If this extension does not own the active IME, this fails.

#### Parameters

- parameters
  object

- contextID
  number
  ID of the context where the composition text will be set
- cursor
  number
  Position in the text of the cursor.
- segments
  object[] optional
  List of segments and their associated types.

- end
  number
  Index of the character to end this segment after.
- start
  number
  Index of the character to start this segment at
- style
  [UnderlineStyle](#type-UnderlineStyle)
  The type of the underline to modify this segment.
- selectionEnd
  number optional
  Position in the text that the selection ends at.
- selectionStart
  number optional
  Position in the text that the selection starts at.
- text
  string
  Text to set

#### Returns

Promise<boolean>Chrome 111+

Resolves when the operation completes with a boolean indicating if the text was accepted or not. On failure, the promise will be rejected.

### setCursorPosition()

```
chrome.input.ime.setCursorPosition(
  parameters: object,
): Promise<boolean>
```

Set the position of the cursor in the candidate window. This is a no-op if this extension does not own the active IME.

#### Parameters

- parameters
  object

- candidateID
  number
  ID of the candidate to select.
- contextID
  number
  ID of the context that owns the candidate window.

#### Returns

Promise<boolean>Chrome 111+

Resolves when the operation completes

### setMenuItems()

```
chrome.input.ime.setMenuItems(
  parameters: [MenuParameters](#type-MenuParameters),
): Promise<void>
```

Adds the provided menu items to the language menu when this IME is active.

#### Parameters

- parameters
  [MenuParameters](#type-MenuParameters)

#### Returns

Promise<void>Chrome 111+

### updateMenuItems()

```
chrome.input.ime.updateMenuItems(
  parameters: [MenuParameters](#type-MenuParameters),
): Promise<void>
```

Updates the state of the MenuItems specified

#### Parameters

- parameters
  [MenuParameters](#type-MenuParameters)

#### Returns

Promise<void>Chrome 111+

Resolves when the operation completes

## Events

### onActivate

```
chrome.input.ime.onActivate.addListener(
  callback: function,
)
```

This event is sent when an IME is activated. It signals that the IME will be receiving onKeyPress events.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(engineID: string, screen: [ScreenType](#type-ScreenType)) => void
```

- engineID
  string
- screen
  [ScreenType](#type-ScreenType)

### onAssistiveWindowButtonClicked

Chrome 85+

```
chrome.input.ime.onAssistiveWindowButtonClicked.addListener(
  callback: function,
)
```

This event is sent when a button in an assistive window is clicked.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- buttonID
  [AssistiveWindowButton](#type-AssistiveWindowButton)
  The ID of the button clicked.
- windowType
  [AssistiveWindowType](#type-AssistiveWindowType)
  The type of the assistive window.

### onBlur

```
chrome.input.ime.onBlur.addListener(
  callback: function,
)
```

This event is sent when focus leaves a text box. It is sent to all extensions that are listening to this event, and enabled by the user.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(contextID: number) => void
```

- contextID
  number

### onCandidateClicked

```
chrome.input.ime.onCandidateClicked.addListener(
  callback: function,
)
```

This event is sent if this extension owns the active IME.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(engineID: string, candidateID: number, button: [MouseButton](#type-MouseButton)) => void
```

- engineID
  string
- candidateID
  number
- button
  [MouseButton](#type-MouseButton)

### onDeactivated

```
chrome.input.ime.onDeactivated.addListener(
  callback: function,
)
```

This event is sent when an IME is deactivated. It signals that the IME will no longer be receiving onKeyPress events.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(engineID: string) => void
```

- engineID
  string

### onFocus

```
chrome.input.ime.onFocus.addListener(
  callback: function,
)
```

This event is sent when focus enters a text box. It is sent to all extensions that are listening to this event, and enabled by the user.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(context: [InputContext](#type-InputContext)) => void
```

- context
  [InputContext](#type-InputContext)

### onInputContextUpdate

```
chrome.input.ime.onInputContextUpdate.addListener(
  callback: function,
)
```

This event is sent when the properties of the current InputContext change, such as the the type. It is sent to all extensions that are listening to this event, and enabled by the user.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(context: [InputContext](#type-InputContext)) => void
```

- context
  [InputContext](#type-InputContext)

### onKeyEvent

```
chrome.input.ime.onKeyEvent.addListener(
  callback: function,
)
```

Fired when a key event is sent from the operating system. The event will be sent to the extension if this extension owns the active IME. The listener function should return true if the event was handled false if it was not. If the event will be evaluated asynchronously, this function must return undefined and the IME must later call keyEventHandled() with the result.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(engineID: string, keyData: [KeyboardEvent](#type-KeyboardEvent), requestId: string) => boolean | undefined
```

- engineID
  string
- keyData
  [KeyboardEvent](#type-KeyboardEvent)
- requestId
  string

- returns
  boolean | undefined

### onMenuItemActivated

```
chrome.input.ime.onMenuItemActivated.addListener(
  callback: function,
)
```

Called when the user selects a menu item

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(engineID: string, name: string) => void
```

- engineID
  string
- name
  string

### onReset

```
chrome.input.ime.onReset.addListener(
  callback: function,
)
```

This event is sent when chrome terminates ongoing text input session.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(engineID: string) => void
```

- engineID
  string

### onSurroundingTextChanged

```
chrome.input.ime.onSurroundingTextChanged.addListener(
  callback: function,
)
```

Called when the editable string around caret is changed or when the caret position is moved. The text length is limited to 100 characters for each back and forth direction.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(engineID: string, surroundingInfo: object) => void
```

- engineID
  string
- surroundingInfo
  object

- anchor
  number
  The beginning position of the selection. This value indicates caret position if there is no selection.
- focus
  number
  The ending position of the selection. This value indicates caret position if there is no selection.
- offset
  numberChrome 46+

The offset position of `text`. Since `text` only includes a subset of text around the cursor, offset indicates the absolute position of the first character of `text`.

- text
  string
  The text around the cursor. This is only a subset of all text in the input field.
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2026-01-07 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
