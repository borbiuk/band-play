## Description

Use the `chrome.platformKeys` API to access client certificates managed by the platform. If the user or policy grants the permission, an extension can use such a certficate in its custom authentication protocol. E.g. this allows usage of platform managed certificates in third party VPNs (see [chrome.vpnProvider](https://developer.chrome.com/docs/extensions/reference/vpnProvider/)).

## Permissions

`platformKeys`

## Availability

Chrome 45+

        ChromeOS only

## Types

### ClientCertificateRequest

#### Properties

- certificateAuthorities
  ArrayBuffer[]
  List of distinguished names of certificate authorities allowed by the server. Each entry must be a DER-encoded X.509 DistinguishedName.
- certificateTypes
  [ClientCertificateType](#type-ClientCertificateType)[]
  This field is a list of the types of certificates requested, sorted in order of the server's preference. Only certificates of a type contained in this list will be retrieved. If `certificateTypes` is the empty list, however, certificates of any type will be returned.

### ClientCertificateType

#### Enum

"rsaSign"

"ecdsaSign"

### Match

#### Properties

- certificate
  ArrayBuffer
  The DER encoding of a X.509 certificate.
- keyAlgorithm
  object
  The [KeyAlgorithm](https://www.w3.org/TR/WebCryptoAPI/#key-algorithm-dictionary) of the certified key. This contains algorithm parameters that are inherent to the key of the certificate (e.g. the key length). Other parameters like the hash function used by the sign function are not included.

### SelectDetails

#### Properties

- clientCerts
  ArrayBuffer[] optional
  If given, the `selectClientCertificates` operates on this list. Otherwise, obtains the list of all certificates from the platform's certificate stores that are available to this extensions. Entries that the extension doesn't have permission for or which doesn't match the request, are removed.
- interactive
  boolean
  If true, the filtered list is presented to the user to manually select a certificate and thereby granting the extension access to the certificate(s) and key(s). Only the selected certificate(s) will be returned. If is false, the list is reduced to all certificates that the extension has been granted access to (automatically or manually).
- request
  [ClientCertificateRequest](#type-ClientCertificateRequest)
  Only certificates that match this request will be returned.

### VerificationDetails

#### Properties

- hostname
  string
  The hostname of the server to verify the certificate for, e.g. the server that presented the `serverCertificateChain`.
- serverCertificateChain
  ArrayBuffer[]
  Each chain entry must be the DER encoding of a X.509 certificate, the first entry must be the server certificate and each entry must certify the entry preceding it.

### VerificationResult

#### Properties

- debug_errors
  string[]
  If the trust verification failed, this array contains the errors reported by the underlying network layer. Otherwise, this array is empty.
  Note: This list is meant for debugging only and may not contain all relevant errors. The errors returned may change in future revisions of this API, and are not guaranteed to be forwards or backwards compatible.
- trusted
  boolean
  The result of the trust verification: true if trust for the given verification details could be established and false if trust is rejected for any reason.

## Methods

### getKeyPair()

```
chrome.platformKeys.getKeyPair(
  certificate: ArrayBuffer,
  parameters: object,
  callback: function,
): void
```

Passes the key pair of `certificate` for usage with ``[platformKeys.subtleCrypto](#method-subtleCrypto) to `callback`.

#### Parameters

- certificate
  ArrayBuffer
  The certificate of a `[Match](#type-Match) returned by `[selectClientCertificates](#method-selectClientCertificates).
- parameters
  object
  Determines signature/hash algorithm parameters additionally to the parameters fixed by the key itself. The same parameters are accepted as by WebCrypto's [importKey](https://www.w3.org/TR/WebCryptoAPI/#SubtleCrypto-method-importKey) function, e.g. `RsaHashedImportParams` for a RSASSA-PKCS1-v1_5 key and `EcKeyImportParams` for EC key. Additionally for RSASSA-PKCS1-v1_5 keys, hashing algorithm name parameter can be specified with one of the following values: "none", "SHA-1", "SHA-256", "SHA-384", or "SHA-512", e.g. `{"hash": { "name": "none" } }`. The sign function will then apply PKCS#1 v1.5 padding but not hash the given data.
  Currently, this method only supports the "RSASSA-PKCS1-v1_5" and "ECDSA" algorithms.
- callback
  function

                            The `callback` parameter looks like:

```
(publicKey: object, privateKey?: object) => void
```

- publicKey
  object
- privateKey
  object optional
  Might be `null` if this extension does not have access to it.

### getKeyPairBySpki()

Chrome 85+

```
chrome.platformKeys.getKeyPairBySpki(
  publicKeySpkiDer: ArrayBuffer,
  parameters: object,
  callback: function,
): void
```

Passes the key pair identified by `publicKeySpkiDer` for usage with ``[platformKeys.subtleCrypto](#method-subtleCrypto) to `callback`.

#### Parameters

- publicKeySpkiDer
  ArrayBuffer
  A DER-encoded X.509 SubjectPublicKeyInfo, obtained e.g. by calling WebCrypto's exportKey function with format="spki".
- parameters
  object
  Provides signature and hash algorithm parameters, in addition to those fixed by the key itself. The same parameters are accepted as by WebCrypto's [importKey](https://www.w3.org/TR/WebCryptoAPI/#SubtleCrypto-method-importKey) function, e.g. `RsaHashedImportParams` for a RSASSA-PKCS1-v1_5 key. For RSASSA-PKCS1-v1_5 keys, we need to also pass a "hash" parameter `{ "hash": { "name": string } }`. The "hash" parameter represents the name of the hashing algorithm to be used in the digest operation before a sign. It is possible to pass "none" as the hash name, in which case the sign function will apply PKCS#1 v1.5 padding and but not hash the given data.
  Currently, this method supports the "ECDSA" algorithm with named-curve P-256 and "RSASSA-PKCS1-v1_5" algorithm with one of the hashing algorithms "none", "SHA-1", "SHA-256", "SHA-384", and "SHA-512".
- callback
  function

                            The `callback` parameter looks like:

```
(publicKey: object, privateKey?: object) => void
```

- publicKey
  object
- privateKey
  object optional
  Might be `null` if this extension does not have access to it.

### selectClientCertificates()

```
chrome.platformKeys.selectClientCertificates(
  details: [SelectDetails](#type-SelectDetails),
): Promise<[Match](#type-Match)[]>
```

This method filters from a list of client certificates the ones that are known to the platform, match `request` and for which the extension has permission to access the certificate and its private key. If `interactive` is true, the user is presented a dialog where they can select from matching certificates and grant the extension access to the certificate. The selected/filtered client certificates will be passed to `callback`.

#### Parameters

- details
  [SelectDetails](#type-SelectDetails)

#### Returns

Promise<[Match](#type-Match)[]>Chrome 121+

### subtleCrypto()

```
chrome.platformKeys.subtleCrypto(): object | undefined
```

An implementation of WebCrypto's [SubtleCrypto](https://www.w3.org/TR/WebCryptoAPI/#subtlecrypto-interface) that allows crypto operations on keys of client certificates that are available to this extension.

#### Returns

object | undefined

### verifyTLSServerCertificate()

```
chrome.platformKeys.verifyTLSServerCertificate(
  details: [VerificationDetails](#type-VerificationDetails),
): Promise<[VerificationResult](#type-VerificationResult)>
```

Checks whether `details.serverCertificateChain` can be trusted for `details.hostname` according to the trust settings of the platform. Note: The actual behavior of the trust verification is not fully specified and might change in the future. The API implementation verifies certificate expiration, validates the certification path and checks trust by a known CA. The implementation is supposed to respect the EKU serverAuth and to support subject alternative names.

#### Parameters

- details
  [VerificationDetails](#type-VerificationDetails)

#### Returns

Promise<[VerificationResult](#type-VerificationResult)>Chrome 121+

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
