Chrome extensions enhance the user's browser experience. To do this extensions use [Chrome
APIs](/docs/extensions/reference/api) that require certain permissions. Some permissions are less intrusive and don't
display a warning. Other permissions trigger a warning that users have to allow. This page
provides guidelines for working with permission warnings. Specific warnings are noted in the
[Permissions](/docs/extensions/reference/permissions-list) under the permission to which
they apply.Figure 1: Permission warnings dialog displayed on installation.

When a new permission that [triggers a warning](/docs/extensions/reference/permissions-list) is added, the extension
will be disabled until the user accepts the new permission. See [Updating permissions](#update_permissions) to learn how to test this behavior.Figure 2: An extension that is disabled until the user accepts the new permission.

Some permissions may not display warnings when paired
with other permissions. For example, the `"tabs"` warning won't show if the extension also
requests `"<all_urls>"`.

## Best practices

Permission warnings describe the capabilities an API grants, but some warnings are
harder to understand than others. Users are more likely to install extensions that follow these
guidelines:Request relevant permissionsExtensions are required to fulfill a [single purpose](/docs/webstore/program-policies/quality-guidelines-faq) and
comply with the [Use of permissions](/docs/webstore/program-policies/permissions) policy. Ensure you only
request permissions that support the extension's main functionality.Use optional permissionsImprove the onboarding experience by requesting permissions at runtime. This lets you provide more context
around a particular permission and lets users choose which features they want to enable. See
[Permissions API](/docs/extensions/reference/api/permissions#step-2-declare-optional-permissions-in-the-manifest) for implementation details.Use the "activeTab" permissionThis permission does not display a permission warning. It grants temporary host permission to
the site the user is on. For details, see [Understanding the activeTab
permission](/docs/extensions/develop/concepts/activeTab).

## View warnings

To view an extension's permission warnings, you have the following options:

### Use the Extension Update Testing Tool

Before you begin

- Install [Node.js](https://nodejs.org/) and NPM.
- Install [Chromium](https://download-chromium.appspot.com/).
- Clone the [extension-update-testing-tool](https://github.com/GoogleChromeLabs/extension-update-testing-tool) repository.
- Run `npm install` in the root of the repository.
  Using the tool

- Run `npm start`.
- Open the local server at http://localhost:8080 in Chromium.
- Drag an unpacked extension (folder or .zip file) to the page.
- Follow the instructions under "Install manually" to download and install the extension.

### By manually packing the extension

- Navigate to `chrome://extensions`
- Enable developer mode
- Click Pack Extension.
  Figure 3: Developer mode enabled in the Extension management page

- Specify the path to the extension's folder in the extension root directory field. Ignore the Private key field for a first-time package.
  Click the Pack Extension button.Figure 4: Specifying Extension Path

Chrome will create two files, a `.crx` file and a `.pem` file. The `.pem` file contains the private key used to sign the extension. Make sure you remember which directory these files were saved.Figure 5: Packaged Extension Files

Keep the `.pem` file in a secret and secure place; it will be needed to [update](#update_permissions) the extension.
Install the `.crx` file by dropping it into the Extension's Management page.Figure 6: Drop file to install

After dropping the `.crx` file the browser will ask if the extension can be added and display warnings.Figure 7: Warning for New Tab extension

## Update permissions

When an extension adds a new permission that [triggers a warning](/docs/extensions/reference/permissions-list) it may
temporarily disable it. The extension will be re-enabled only after the user agrees to accept the
new permission.
To check if your extension will be disabled when adding a new permission, you have the following options:

### Update using the Extension Update Testing Tool

These steps assume you followed the [Using the Extension Update Testing Tool](#view-tool) instructions to start the server.
Using the tool

- Add a new [permission with warning](#view_warnings).
- Increase the extension [version number](/docs/extensions/reference/manifest/version).
- Drag the unpacked extension (folder or .zip file) to the page.
- Go to `chrome://extensions`.
- Click the Update button.

### Update your extension manually

- Find the `.crx` file you just created in [View Warnings](#view_warnings).
- Rename it or delete it.
- Open your `manifest.json` and add any [permission that triggers a warning](#permissions_with_warnings).
- Go to `chrome://extensions`. Do not remove the previously installed package.
- Pack the extension again, but this time add the pem file in the second input.
  Figure 8: Packing extension dialog with pem file included.

- Drag the new packaged extension to the Extension Management page.
  You will see a dialog that prompts the user to accept the new permissions.

Figure 9: Disabled extension warning
Figure 10: Requesting new permission dialog

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2024-02-05 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2024-02-05 UTC."],[],[]]
