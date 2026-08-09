Note: The [Chrome Privacy Whitepaper](https://www.google.com/intl/en/landing/chrome/google-chrome-privacy-whitepaper.pdf) gives background detail regarding the features which this API can
control.

## Description

Use the `chrome.privacy` API to control usage of the features in Chrome that can affect a user's privacy. This API relies on the [ChromeSetting prototype of the type API](https://developer.chrome.com/docs/extensions/reference/types/#ChromeSetting) for getting and setting Chrome's configuration.

## Permissions

`privacy`

You must declare the "privacy" permission in your extension's [manifest](/docs/extensions/mv3/manifest) to use the API. For
example:

```
{
  "name": "My extension",
  ...
  "permissions": [
    "privacy"
  ],
  ...
}

```

## Concepts and usage

Reading the current value of a Chrome setting is straightforward. You'll first need to find the
property you're interested in, then you'll call `get()` on that object in order to retrieve its
current value and your extension's level of control. For example, to determine if Chrome's credit card autofill
feature is enabled, you'd write:

```
chrome.privacy.services.autofillCreditCardEnabled.get({}, function(details) {
  if (details.value) {
    console.log('Autofill is on!');
  } else {
    console.log('Autofill is off!');
  }
});

```

Changing the value of a setting is a little bit more complex, because you first must verify
that your extension can control the setting. The user won't see any change to their settings if your
extension toggles a setting that is either locked to a specific value by enterprise policies
(`levelOfControl` will be set to "not_controllable"), or if another extension is controlling the
value (`levelOfControl` will be set to "controlled_by_other_extensions"). The `set()` call will
succeed, but the setting will be immediately overridden. As this might be confusing, it is advisable
to warn the user when the settings they've chosen aren't practically applied.Note: Full details about extensions' ability to control `ChromeSetting`s can be found under
``[chrome.types.ChromeSetting](/docs/extensions/reference/api/types#type-ChromeSetting).
This means that you ought to use the `get()`method to determine your level of access, and then only
call`set()` if your extension can grab control over the setting (in fact if your extension can't
control the setting it's probably a good idea to visually disable the feature to reduce user
confusion):

```
chrome.privacy.services.autofillCreditCardEnabled.get({}, function(details) {
  if (details.levelOfControl === 'controllable_by_this_extension') {
    chrome.privacy.services.autofillCreditCardEnabled.set({ value: true }, function() {
      if (chrome.runtime.lastError === undefined) {
        console.log("Hooray, it worked!");
      } else {
        console.log("Sadness!", chrome.runtime.lastError);
      }
    });
  }
});

```

If you're interested in changes to a setting's value, add a listener to its `onChange` event. Among
other uses, this will allow you to warn the user if a more recently installed extension grabs
control of a setting, or if enterprise policy overrides your control. To listen for changes to
credit card autofill status, for example, the following code would suffice:

```
chrome.privacy.services.autofillCreditCardEnabled.onChange.addListener(
  function (details) {
    // The new value is stored in `details.value`, the new level of control
    // in `details.levelOfControl`, and `details.incognitoSpecific` will be
    // `true` if the value is specific to Incognito mode.
  }
);

```

## Examples

To try this API, install the [privacy API example](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/privacy) from the [chrome-extension-samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)
repository.

## Types

### IPHandlingPolicy

Chrome 48+

The IP handling policy of WebRTC.

#### Enum

"default"

"default_public_and_private_interfaces"

"default_public_interface_only"

"disable_non_proxied_udp"

## Properties

### network

Settings that influence Chrome's handling of network connections in general.

#### Type

object

#### Properties

- networkPredictionEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If enabled, Chrome attempts to speed up your web browsing experience by pre-resolving DNS entries and preemptively opening TCP and SSL connections to servers. This preference only affects actions taken by Chrome's internal prediction service. It does not affect webpage-initiated prefectches or preconnects. This preference's value is a boolean, defaulting to `true`.
- webRTCIPHandlingPolicy
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<[IPHandlingPolicy](#type-IPHandlingPolicy)>Chrome 48+

Allow users to specify the media performance/privacy tradeoffs which impacts how WebRTC traffic will be routed and how much local address information is exposed. This preference's value is of type IPHandlingPolicy, defaulting to `default`.

### services

Settings that enable or disable features that require third-party network services provided by Google and your default search provider.

#### Type

object

#### Properties

- alternateErrorPagesEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If enabled, Chrome uses a web service to help resolve navigation errors. This preference's value is a boolean, defaulting to `true`.
- autofillAddressEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>Chrome 70+

If enabled, Chrome offers to automatically fill in addresses and other form data. This preference's value is a boolean, defaulting to `true`.

- autofillCreditCardEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>Chrome 70+

If enabled, Chrome offers to automatically fill in credit card forms. This preference's value is a boolean, defaulting to `true`.

- autofillEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  Deprecated since Chrome 70
  Please use privacy.services.autofillAddressEnabled and privacy.services.autofillCreditCardEnabled. This remains for backward compatibility in this release and will be removed in the future.

If enabled, Chrome offers to automatically fill in forms. This preference's value is a boolean, defaulting to `true`.

- passwordSavingEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If enabled, the password manager will ask if you want to save passwords. This preference's value is a boolean, defaulting to `true`.
- safeBrowsingEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If enabled, Chrome does its best to protect you from phishing and malware. This preference's value is a boolean, defaulting to `true`.
- safeBrowsingExtendedReportingEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If enabled, Chrome will send additional information to Google when SafeBrowsing blocks a page, such as the content of the blocked page. This preference's value is a boolean, defaulting to `false`.
- searchSuggestEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If enabled, Chrome sends the text you type into the Omnibox to your default search engine, which provides predictions of websites and searches that are likely completions of what you've typed so far. This preference's value is a boolean, defaulting to `true`.
- spellingServiceEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If enabled, Chrome uses a web service to help correct spelling errors. This preference's value is a boolean, defaulting to `false`.
- translationServiceEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If enabled, Chrome offers to translate pages that aren't in a language you read. This preference's value is a boolean, defaulting to `true`.

### websites

Settings that determine what information Chrome makes available to websites.

#### Type

object

#### Properties

- adMeasurementEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>Chrome 111+

If disabled, the [Attribution Reporting API](https://developer.chrome.com/en/docs/privacy-sandbox/attribution-reporting/) and [Private Aggregation API](https://developer.chrome.com/docs/privacy-sandbox/private-aggregation/) are deactivated. The value of this preference is of type boolean, and the default value is `true`. Extensions may only disable these APIs by setting the value to `false`. If you try setting these APIs to `true`, it will throw an error.

- doNotTrackEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>Chrome 65+

If enabled, Chrome sends 'Do Not Track' (`DNT: 1`) header with your requests. The value of this preference is of type boolean, and the default value is `false`.

- fledgeEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>Chrome 111+

If disabled, the [Fledge API](https://developer.chrome.com/docs/privacy-sandbox/fledge/) is deactivated. The value of this preference is of type boolean, and the default value is `true`. Extensions may only disable this API by setting the value to `false`. If you try setting this API to `true`, it will throw an error.

- hyperlinkAuditingEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If enabled, Chrome sends auditing pings when requested by a website (`<a ping>`). The value of this preference is of type boolean, and the default value is `true`.
- protectedContentEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  Available on Windows and ChromeOS only: If enabled, Chrome provides a unique ID to plugins in order to run protected content. The value of this preference is of type boolean, and the default value is `true`.
- referrersEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If enabled, Chrome sends `referer` headers with your requests. Yes, the name of this preference doesn't match the misspelled header. No, we're not going to change it. The value of this preference is of type boolean, and the default value is `true`.
- relatedWebsiteSetsEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>Chrome 121+

If disabled, [Related Website Sets](https://developer.chrome.com/docs/privacy-sandbox/related-website-sets/) is deactivated. The value of this preference is of type boolean, and the default value is `true`. Extensions may only disable this API by setting the value to `false`. If you try setting this API to `true`, it will throw an error.

- thirdPartyCookiesAllowed
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>
  If disabled, Chrome blocks third-party sites from setting cookies. The value of this preference is of type boolean, and the default value is `true`. Extensions may not enable this API in Incognito mode, where third-party cookies are blocked and can only be allowed at the site level. If you try setting this API to true in Incognito, it will throw an error.
  Note: Individual sites may still be able to access third-party cookies when this API returns `false`, if they have a valid [exemption](https://developers.google.com/privacy-sandbox/cookies/temporary-exceptions/preserving-critical-user-experiences) or they use the [Storage Access API](https://developers.google.com/privacy-sandbox/cookies/storage-access-api) instead.
- topicsEnabled
  [types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<boolean>Chrome 111+

If disabled, the [Topics API](https://developer.chrome.com/en/docs/privacy-sandbox/topics/) is deactivated. The value of this preference is of type boolean, and the default value is `true`. Extensions may only disable this API by setting the value to `false`. If you try setting this API to `true`, it will throw an error.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
