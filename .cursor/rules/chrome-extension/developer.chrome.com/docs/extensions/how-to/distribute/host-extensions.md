[Chrome Web Store](http://chrome.google.com/webstore). This article describes how to package, host, and update `crx`
files from a general purpose web server. If you are distributing an extension or theme solely
through the [Chrome Web Store](http://chrome.google.com/webstore), consult [Webstore hosting and
updating](/docs/extensions/mv3/hosting).

## Package

Extensions and themes are served as `.crx` files. When uploading through the [Chrome Developer
Dashboard](https://chrome.google.com/webstore/developer/dashboard), the dashboard creates the `crx` file automatically. If published
on a personal server, the `crx` file will need to be created locally or downloaded from the Chrome
Web Store.

### Download .crx from the Chrome Web Store

If an extension is hosted on the Chrome Web Store, the `.crx` file can be downloaded from the
Developer Dashboard. Locate the extension under "Your Listings" and click "More info". In the
popup window, click the blue `main.crx` link to download it.

The downloaded file can be hosted on a personal server. This is the most secure way to host an
extension locally as the contents of the extension will be signed by the Chrome Web Store. This
helps detect potential attacks and tampering.

### Create .crx locally

Extension directories are converted to `.crx` files at the Extensions Management Page. Navigate to
`chrome://extensions/` in the omnibox, or click the Chrome menu, hold the pointer over "More Tools" then
select "Extensions".
On the Extensions Management Page, enable Developer Mode by clicking the toggle switch next to
Developer mode. Then select the PACK EXTENSION button.

Specify the path to the extension's folder in the Extension root directory field then click the
PACK EXTENSION button. Ignore the Private key field for a first-time package.

Chrome will create two files, a `.crx` file and a `.pem` file, which contains the extension's
private key.

Do not lose the private key! Keep the `.pem` file in a secret and secure place; it will be
needed to [update](#update) the extension.

### Update a .crx package

Update an extension's `.crx` file by increasing the version number in `manifest.json`.

```
{
  ...
  "version": "1.5",
  ...
  }
}

```

```
{
  ...
  "version": "1.6",
  ...
  }
}

```

Return to the [Extensions Management Page](#create) and click the PACK EXTENSION button. Specify the
path to the extensions directory and the location of private key.

The page will provide the path for the updated packaged extension.

### Package through command line

Package extensions in the command line by invoking ``[chrome.exe](https://www.chromium.org/developers/how-tos/run-chromium-with-flags). Use the `--pack-extension`flag to specify the location of the extension's folder and the`--pack-extension-key` flag to
specify the location of the extension's private key file.

```
chrome.exe --pack-extension=C:\myext --pack-extension-key=C:\myext.pem

```

## Host

A server that hosts `.crx` files must use appropriate HTTP headers to allow users to install the
extension by clicking a link.
Google Chrome considers a file to be installable if either of the following is true:

- The file has the content type `application/x-chrome-extension`
- The file suffix is `.crx` and both of the following are true:

- The file is not served with the HTTP header `X-Content-Type-Options: nosniff`
- The file is served with one of the following content types:
- empty string
- `"text/plain"`
- `"application/octet-stream"`
- `"unknown/unknown"`
- `"application/unknown"`
- `"\*/\*"`
  The most common reason for failing to recognize an installable file is that the server sends the
  header `X-Content-Type-Options: nosniff`. The second most common reason is that the server sends an
  unknown content type—one that isn't in the previous list. To fix an HTTP header issue, either change
  the configuration of the server or try hosting the `.crx` file at another server.

## Update

Every few hours, the browser checks installed extensions for an update URL. For each one, it makes a
request to that URL looking for an update manifest XML file.

- The content returned by an update check is an update manifest XML document listing the latest
  version of an extension.
  If the update manifest mentions a version that is more recent than what is installed, the browser
  downloads and installs the new version. As with manual updates, the new `.crx` file must be signed
  with the same private key as the currently installed version.Note: In order to maintain user privacy, Google Chrome does not send any Cookie headers with auto update manifest requests, and ignores any Set-Cookie headers in the responses to those requests.

### Update URL

Extensions hosted on servers outside of the Chrome Webstore must include the `update_url` field in
their ``[manifest.json](/docs/extensions/mv3/manifest) file.

```
{
  "name": "My extension",
  ...
  "update_url": "https://myhost.com/mytestextension/updates.xml",
  ...
}

```

### Update manifest

The update manifest returned by the server should be an XML document.

```
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'>
    <updatecheck codebase='https://myhost.com/mytestextension/mte_v2.crx' version='2.0' />
  </app>
</gupdate>

```

This XML format is borrowed from that used by [Omaha](https://github.com/google/omaha), Google's update infrastructure. The
extensions system uses the following attributes for the `<app>` and `<updatecheck>` elements of the
update manifest:appidThe extension ID is generated based on a hash of the public key, as described in [packaging](#packaging). An extension's ID is displayed on the Extensions Management Page.codebaseAn HTTPS URL to the `.crx` file.versionUsed by the client to determine whether it should download the `.crx` file specified by `codebase`. It should match the value of "version" in the `.crx` file's `manifest.json` file.
The update manifest XML file may contain information about multiple extensions by including multiple
`<app>` elements.

### Testing

The default update check frequency is several hours, but an update can be forced using the Update
extensions now button on the Extensions Management Page.

This will start checks for all installed extensions.

### Advanced usage: request parameters

The basic auto update mechanism is designed to make the server-side work as easy as just dropping a
static XML file onto any plain web server, such as Apache, and updating that XML file as new
extension versions are released.
Developers hosting multiple extensions may check request parameters, which indicate the extension ID
and version in the update request. Including these paramaters allow extensions to update from the
same URL running dynamic server-side code instead of a static XML file.
The format of the request parameters is:
`?x=EXTENSION_DATA`
Where `EXTENSION_DATA` is a URL-encoded string of the format:
`id=EXTENSION_ID&v=EXTENSION_VERSION`
For example, two extensions point to the same update URL (`https://test.com/extension_updates.php`):

- Extension 1

- ID: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
- Version: "1.1"
- Extension 2

- ID: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
- Version: "0.4"
  The request to update each individual extension would be,

```
https://test.com/extension_updates.php?x=id%3Daaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa%26v%3D1.1

```

and

```
https://test.com/extension_updates.php?x=id%3Dbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb%26v%3D0.4

```

Multiple extensions can be listed in a single request for each unique update URL. For the previous
example, if a user has both of the extensions installed, then the two requests are merged into a
single request:

```
https://test.com/extension_updates.php?x=id%3Daaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa%26v%3D1.1&x=id%3Dbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb%26v%3D0.4

```

If the number of installed extensions using the same update URL is large enough that a GET request
URL is too long (over 2000 characters or so), the update check issues additional GET requests as
necessary.

### Advanced usage: minimum browser version

As more APIs are added to the extensions system, an updated version of an extension that will work
only with newer versions of the browser may be released. While Google Chrome itself is autoupdated,
it can take a few days before the majority of the user base has updated to any given new release. To
ensure that a given update will apply only to Google Chrome versions at or higher than a specific
version, add the "prodversionmin" attribute to the `<app>` element in the update response.

```
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'>
    <updatecheck codebase='http://myhost.com/mytestextension/mte_v2.crx' version='2.0' prodversionmin='3.0.193.0'/>
  </app>
</gupdate>

```

This would ensure that users would auto update to version 2 only if they are running Google Chrome
3.0.193.0 or greater.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2017-12-14 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2017-12-14 UTC."],[],[]]
