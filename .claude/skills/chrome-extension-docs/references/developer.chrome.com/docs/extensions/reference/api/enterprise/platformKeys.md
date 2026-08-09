This API is only for [extensions installed by a policy](https://support.google.com/chrome/a/answer/1375694).
Important:
This API works only on ChromeOS.

## Description

Use the `chrome.enterprise.platformKeys` API to generate keys and install certificates for these keys. The certificates will be managed by the platform and can be used for TLS authentication, network access or by other extension through chrome.platformKeys.

## Permissions

`enterprise.platformKeys`

## Availability

        ChromeOS only
      [Requires policy](https://support.google.com/chrome/a/answer/9296680)

## Concepts and usage

Typical usage of this API to enroll a client certificate follows these steps:

Get all available tokens using ``[enterprise.platformKeys.getTokens()](#method-getTokens).
Find the Token with `id` equal to `"user"`. Use this Token subsequently.
Generate a key pair using the `generateKey()` Token method (defined in SubtleCrypto). This will return handle to the key.
Export the public key using the `exportKey()` Token method (defined in SubtleCrypto).
Create the signature of the certification request's data using the `sign()` Token method (defined in SubtleCrypto).
Complete the certification request and send it to the certification authority.
If a certificate is received, import it using [`enterprise.platformKeys.importCertificate()``[3]
Here's an example that shows the major API interaction except the building and sending of the certification request:

```
function getUserToken(callback) {
  chrome.enterprise.platformKeys.getTokens(function(tokens) {
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].id == "user") {
        callback(tokens[i]);
        return;
      }
    }
    callback(undefined);
  });
}

function generateAndSign(userToken) {
  var data = new Uint8Array([0, 5, 1, 2, 3, 4, 5, 6]);
  var algorithm = {
    name: "RSASSA-PKCS1-v1_5",
    // RsaHashedKeyGenParams
    modulusLength: 2048,
    publicExponent:
        new Uint8Array([0x01, 0x00, 0x01]),  // Equivalent to 65537
    hash: {
      name: "SHA-256",
    }
  };
  var cachedKeyPair;
  userToken.subtleCrypto.generateKey(algorithm, false, ["sign"])
    .then(function(keyPair) {
            cachedKeyPair = keyPair;
            return userToken.subtleCrypto.exportKey("spki", keyPair.publicKey);
          },
          console.log.bind(console))
    .then(function(publicKeySpki) {
            // Build the Certification Request using the public key.
            return userToken.subtleCrypto.sign(
                {name : "RSASSA-PKCS1-v1_5"}, cachedKeyPair.privateKey, data);
          },
          console.log.bind(console))
    .then(function(signature) {
              // Complete the Certification Request with |signature|.
              // Send out the request to the CA, calling back
              // onClientCertificateReceived.
          },
          console.log.bind(console));
}

function onClientCertificateReceived(userToken, certificate) {
  chrome.enterprise.platformKeys.importCertificate(userToken.id, certificate);
}

getUserToken(generateAndSign);

```

## Types

### Algorithm

Chrome 110+

Type of key to generate.

#### Enum

"RSA"

"ECDSA"

### ChallengeKeyOptions

Chrome 110+

#### Properties

- challenge
  ArrayBuffer
  A challenge as emitted by the Verified Access Web API.
- registerKey
  [RegisterKeyOptions](#type-RegisterKeyOptions)optional
  If present, registers the challenged key with the specified `scope`'s token. The key can then be associated with a certificate and used like any other signing key. Subsequent calls to this function will then generate a new Enterprise Key in the specified `scope`.
- scope
  [Scope](#type-Scope)
  Which Enterprise Key to challenge.

### RegisterKeyOptions

Chrome 110+

#### Properties

- algorithm
  [Algorithm](#type-Algorithm)
  Which algorithm the registered key should use.

### Scope

Chrome 110+

Whether to use the Enterprise User Key or the Enterprise Machine Key.

#### Enum

"USER"

"MACHINE"

### Token

#### Properties

- id
  string
  Uniquely identifies this `Token`.
  Static IDs are `"user"` and `"system"`, referring to the platform's user-specific and the system-wide hardware token, respectively. Any other tokens (with other identifiers) might be returned by ``[enterprise.platformKeys.getTokens](#method-getTokens).
- softwareBackedSubtleCrypto
  SubtleCryptoChrome 97+

Implements the WebCrypto's [SubtleCrypto](https://www.w3.org/TR/WebCryptoAPI/#subtlecrypto-interface) interface. The cryptographic operations, including key generation, are software-backed. Protection of the keys, and thus implementation of the non-extractable property, is done in software, so the keys are less protected than hardware-backed keys.
Only non-extractable keys can be generated. The supported key types are RSASSA-PKCS1-V1_5 and RSA-OAEP (on Chrome versions 135+) with `modulusLength` up to 2048. Each RSASSA-PKCS1-V1_5 key can be used for signing data at most once, unless the extension is allowlisted through the [KeyPermissions policy](https://chromeenterprise.google/policies/#KeyPermissions), in which case the key can be used indefinitely. RSA-OAEP keys are supported since Chrome version 135 and can be used by extensions allowlisted through that same policy to unwrap other keys.
Keys generated on a specific `Token` cannot be used with any other Tokens, nor can they be used with `window.crypto.subtle`. Equally, `Key` objects created with `window.crypto.subtle` cannot be used with this interface.

- subtleCrypto
  SubtleCrypto
  Implements the WebCrypto's [SubtleCrypto](https://www.w3.org/TR/WebCryptoAPI/#subtlecrypto-interface) interface. The cryptographic operations, including key generation, are hardware-backed.
  Only non-extractable keys can be generated. The supported key types are RSASSA-PKCS1-V1_5 and RSA-OAEP (on Chrome versions 135+) with `modulusLength` up to 2048 and ECDSA with `namedCurve` P-256. Each RSASSA-PKCS1-V1_5 and ECDSA key can be used for signing data at most once, unless the extension is allowlisted through the [KeyPermissions policy](https://chromeenterprise.google/policies/#KeyPermissions), in which case the key can be used indefinitely. RSA-OAEP keys are supported since Chrome version 135 and can be used by extensions allowlisted through that same policy to unwrap other keys.
  Keys generated on a specific `Token` cannot be used with any other Tokens, nor can they be used with `window.crypto.subtle`. Equally, `Key` objects created with `window.crypto.subtle` cannot be used with this interface.

## Methods

### challengeKey()

Chrome 110+

```
chrome.enterprise.platformKeys.challengeKey(
  options: [ChallengeKeyOptions](#type-ChallengeKeyOptions),
): Promise<ArrayBuffer>
```

Similar to `challengeMachineKey` and `challengeUserKey`, but allows specifying the algorithm of a registered key. Challenges a hardware-backed Enterprise Machine Key and emits the response as part of a remote attestation protocol. Only useful on ChromeOS and in conjunction with the Verified Access Web API which both issues challenges and verifies responses.
A successful verification by the Verified Access Web API is a strong signal that the current device is a legitimate ChromeOS device, the current device is managed by the domain specified during verification, the current signed-in user is managed by the domain specified during verification, and the current device state complies with enterprise device policy. For example, a policy may specify that the device must not be in developer mode. Any device identity emitted by the verification is tightly bound to the hardware of the current device. If `"user"` Scope is specified, the identity is also tightly bound to the current signed-in user.
This function is highly restricted and will fail if the current device is not managed, the current user is not managed, or if this operation has not explicitly been enabled for the caller by enterprise device policy. The challenged key does not reside in the `"system"` or `"user"` token and is not accessible by any other API.

#### Parameters

- options
  [ChallengeKeyOptions](#type-ChallengeKeyOptions)
  Object containing the fields defined in ``[ChallengeKeyOptions](#type-ChallengeKeyOptions).

#### Returns

Promise<ArrayBuffer>Chrome 131+

Returns a Promise which resolves with the challenge response.

### challengeMachineKey()

Chrome 50+

        Deprecated since Chrome 110

```
chrome.enterprise.platformKeys.challengeMachineKey(
  challenge: ArrayBuffer,
  registerKey?: boolean,
): Promise<ArrayBuffer>
```

Use ``[challengeKey](#method-challengeKey) instead.

Challenges a hardware-backed Enterprise Machine Key and emits the response as part of a remote attestation protocol. Only useful on ChromeOS and in conjunction with the Verified Access Web API which both issues challenges and verifies responses. A successful verification by the Verified Access Web API is a strong signal of all of the following: _ The current device is a legitimate ChromeOS device. _ The current device is managed by the domain specified during verification. _ The current signed-in user is managed by the domain specified during verification. _ The current device state complies with enterprise device policy. For example, a policy may specify that the device must not be in developer mode. \* Any device identity emitted by the verification is tightly bound to the hardware of the current device. This function is highly restricted and will fail if the current device is not managed, the current user is not managed, or if this operation has not explicitly been enabled for the caller by enterprise device policy. The Enterprise Machine Key does not reside in the `"system"` token and is not accessible by any other API.

#### Parameters

- challenge
  ArrayBuffer
  A challenge as emitted by the Verified Access Web API.
- registerKey
  boolean optionalChrome 59+

If set, the current Enterprise Machine Key is registered with the `"system"` token and relinquishes the Enterprise Machine Key role. The key can then be associated with a certificate and used like any other signing key. This key is 2048-bit RSA. Subsequent calls to this function will then generate a new Enterprise Machine Key.

#### Returns

Promise<ArrayBuffer>Chrome 131+

Returns a Promise which resolves with the challenge response.

### challengeUserKey()

Chrome 50+

        Deprecated since Chrome 110

```
chrome.enterprise.platformKeys.challengeUserKey(
  challenge: ArrayBuffer,
  registerKey: boolean,
): Promise<ArrayBuffer>
```

Use ``[challengeKey](#method-challengeKey) instead.

Challenges a hardware-backed Enterprise User Key and emits the response as part of a remote attestation protocol. Only useful on ChromeOS and in conjunction with the Verified Access Web API which both issues challenges and verifies responses. A successful verification by the Verified Access Web API is a strong signal of all of the following: _ The current device is a legitimate ChromeOS device. _ The current device is managed by the domain specified during verification. _ The current signed-in user is managed by the domain specified during verification. _ The current device state complies with enterprise user policy. For example, a policy may specify that the device must not be in developer mode. \* The public key emitted by the verification is tightly bound to the hardware of the current device and to the current signed-in user. This function is highly restricted and will fail if the current device is not managed, the current user is not managed, or if this operation has not explicitly been enabled for the caller by enterprise user policy. The Enterprise User Key does not reside in the `"user"` token and is not accessible by any other API.

#### Parameters

- challenge
  ArrayBuffer
  A challenge as emitted by the Verified Access Web API.
- registerKey
  boolean
  If set, the current Enterprise User Key is registered with the `"user"` token and relinquishes the Enterprise User Key role. The key can then be associated with a certificate and used like any other signing key. This key is 2048-bit RSA. Subsequent calls to this function will then generate a new Enterprise User Key.

#### Returns

Promise<ArrayBuffer>Chrome 131+

Returns a Promise which resolves with the challenge response.

### getCertificates()

```
chrome.enterprise.platformKeys.getCertificates(
  tokenId: string,
): Promise<ArrayBuffer[]>
```

Returns the list of all client certificates available from the given token. Can be used to check for the existence and expiration of client certificates that are usable for a certain authentication.

#### Parameters

- tokenId
  string
  The id of a Token returned by `getTokens`.

#### Returns

Promise<ArrayBuffer[]>Chrome 131+

Returns a Promise which resolves with the list of the available certificates.

### getTokens()

```
chrome.enterprise.platformKeys.getTokens(): Promise<[Token](#type-Token)[]>
```

Returns the available Tokens. In a regular user's session the list will always contain the user's token with `id``"user"`. If a system-wide TPM token is available, the returned list will also contain the system-wide token with `id``"system"`. The system-wide token will be the same for all sessions on this device (device in the sense of e.g. a Chromebook).

#### Returns

Promise<[Token](#type-Token)[]>Chrome 131+

Invoked by `getTokens` with the list of available Tokens.

### importCertificate()

```
chrome.enterprise.platformKeys.importCertificate(
  tokenId: string,
  certificate: ArrayBuffer,
): Promise<void>
```

Imports `certificate` to the given token if the certified key is already stored in this token. After a successful certification request, this function should be used to store the obtained certificate and to make it available to the operating system and browser for authentication.

#### Parameters

- tokenId
  string
  The id of a Token returned by `getTokens`.
- certificate
  ArrayBuffer
  The DER encoding of a X.509 certificate.

#### Returns

Promise<void>Chrome 131+

Returns a Promise which resolves when this operation is finished.

### removeCertificate()

```
chrome.enterprise.platformKeys.removeCertificate(
  tokenId: string,
  certificate: ArrayBuffer,
): Promise<void>
```

Removes `certificate` from the given token if present. Should be used to remove obsolete certificates so that they are not considered during authentication and do not clutter the certificate choice. Should be used to free storage in the certificate store.

#### Parameters

- tokenId
  string
  The id of a Token returned by `getTokens`.
- certificate
  ArrayBuffer
  The DER encoding of a X.509 certificate.

#### Returns

Promise<void>Chrome 131+

Returns a Promise which resolves when this operation is finished.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-01-07 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
