## Description

Use the `chrome.loginState` API to read and monitor the login state.

## Permissions

`loginState`

## Availability

Chrome 78+

        ChromeOS only

## Types

### ProfileType

#### Enum

"SIGNIN_PROFILE"
Specifies that the extension is in the signin profile.
"USER_PROFILE"
Specifies that the extension is in the user profile.
"LOCK_PROFILE"
Specifies that the extension is in the lock screen profile.

### SessionState

#### Enum

"UNKNOWN"
Specifies that the session state is unknown.
"IN_OOBE_SCREEN"
Specifies that the user is in the out-of-box-experience screen.
"IN_LOGIN_SCREEN"
Specifies that the user is in the login screen.
"IN_SESSION"
Specifies that the user is in the session.
"IN_LOCK_SCREEN"
Specifies that the user is in the lock screen.
"IN_RMA_SCREEN"
Specifies that the device is in RMA mode, finalizing repairs.

## Methods

### getProfileType()

```
chrome.loginState.getProfileType(): Promise<[ProfileType](#type-ProfileType)>
```

Gets the type of the profile the extension is in.

#### Returns

Promise<[ProfileType](#type-ProfileType)>Chrome 96+

### getSessionState()

```
chrome.loginState.getSessionState(): Promise<[SessionState](#type-SessionState)>
```

Gets the current session state.

#### Returns

Promise<[SessionState](#type-SessionState)>Chrome 96+

## Events

### onSessionStateChanged

```
chrome.loginState.onSessionStateChanged.addListener(
  callback: function,
)
```

Dispatched when the session state changes. `sessionState` is the new session state.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(sessionState: [SessionState](#type-SessionState)) => void
```

- sessionState
  [SessionState](#type-SessionState)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-10-20 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-10-20 UTC."],[],[]]
