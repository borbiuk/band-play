## Description

Use `chrome.instanceID` to access the Instance ID service.

## Permissions

`gcm`

## Availability

Chrome 44+

## Methods

### deleteID()

```
chrome.instanceID.deleteID(): Promise<void>
```

Resets the app instance identifier and revokes all tokens associated with it.

#### Returns

Promise<void>Chrome 96+

Resolves when the deletion completes. The instance identifier was revoked successfully if the promise does not reject.

### deleteToken()

```
chrome.instanceID.deleteToken(
  deleteTokenParams: object,
): Promise<void>
```

Revokes a granted token.

#### Parameters

- deleteTokenParams
  object
  Parameters for deleteToken.

- authorizedEntity
  stringChrome 46+

The authorized entity that is used to obtain the token.

- scope
  stringChrome 46+

The scope that is used to obtain the token.

#### Returns

Promise<void>Chrome 96+

Resolves when the token deletion completes. The token was revoked successfully if the promise does not reject.

### getCreationTime()

```
chrome.instanceID.getCreationTime(): Promise<number>
```

Retrieves the time when the InstanceID has been generated. The creation time will be returned by the `callback`.

#### Returns

Promise<number>Chrome 96+

Resolves when the retrieval completes.

### getID()

```
chrome.instanceID.getID(): Promise<string>
```

Retrieves an identifier for the app instance. The instance ID will be returned by the `callback`. The same ID will be returned as long as the application identity has not been revoked or expired.

#### Returns

Promise<string>Chrome 96+

Resolves when the retrieval completes.

### getToken()

```
chrome.instanceID.getToken(
  getTokenParams: object,
): Promise<string>
```

Return a token that allows the authorized entity to access the service defined by scope.

#### Parameters

- getTokenParams
  object
  Parameters for getToken.

- authorizedEntity
  stringChrome 46+

Identifies the entity that is authorized to access resources associated with this Instance ID. It can be a project ID from [Google developer console](https://code.google.com/apis/console).

- options
  object optionalChrome 46+

                            Deprecated since Chrome 89

    options are deprecated and will be ignored.

Allows including a small number of string key/value pairs that will be associated with the token and may be used in processing the request.

- scope
  stringChrome 46+

Identifies authorized actions that the authorized entity can take. E.g. for sending GCM messages, `GCM` scope should be used.

#### Returns

Promise<string>Chrome 96+

Resolves when the retrieval completes.

## Events

### onTokenRefresh

```
chrome.instanceID.onTokenRefresh.addListener(
  callback: function,
)
```

Fired when all the granted tokens need to be refreshed.

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
