## Description

The `chrome.printerProvider` API exposes events used by print manager to query printers controlled by extensions, to query their capabilities and to submit print jobs to these printers.

## Permissions

`printerProvider`

## Availability

Chrome 44+

## Types

### PrinterInfo

#### Properties

- description
  string optional
  Printer's human readable description.
- id
  string
  Unique printer ID.
- name
  string
  Printer's human readable name.

### PrintError

Error codes returned in response to ``[onPrintRequested](#event-onPrintRequested) event.

#### Enum

"OK"
Specifies that the operation was completed successfully.
"FAILED"
Specifies that a general failure occured.
"INVALID_TICKET"
Specifies that the print ticket is invalid. For example, the ticket is inconsistent with some capabilities, or the extension is not able to handle all settings from the ticket.
"INVALID_DATA"
Specifies that the document is invalid. For example, data may be corrupted or the format is incompatible with the extension.

### PrintJob

#### Properties

- contentType
  string
  The document content type. Supported formats are `"application/pdf"` and `"image/pwg-raster"`.
- document
  Blob
  Blob containing the document data to print. Format must match `contentType`.
- printerId
  string
  ID of the printer which should handle the job.
- ticket
  object
  Print ticket in [CJT format](https://developers.google.com/cloud-print/docs/cdd#cjt).
  The CJT reference is marked as deprecated. It is deprecated for Google Cloud Print only. is not deprecated for ChromeOS printing.
- title
  string
  The print job title.

## Events

### onGetCapabilityRequested

```
chrome.printerProvider.onGetCapabilityRequested.addListener(
  callback: function,
)
```

Event fired when print manager requests printer capabilities.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(printerId: string, resultCallback: function) => void
```

- printerId
  string
- resultCallback
  function

                              The `resultCallback` parameter looks like:

```
(capabilities: object) => void
```

- capabilities
  object
  Device capabilities in [CDD format](https://developers.google.com/cloud-print/docs/cdd#cdd).

### onGetPrintersRequested

```
chrome.printerProvider.onGetPrintersRequested.addListener(
  callback: function,
)
```

Event fired when print manager requests printers provided by extensions.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(resultCallback: function) => void
```

- resultCallback
  function

                              The `resultCallback` parameter looks like:

```
(printerInfo: [PrinterInfo](#type-PrinterInfo)[]) => void
```

- printerInfo
  [PrinterInfo](#type-PrinterInfo)[]

### onGetUsbPrinterInfoRequested

Chrome 45+

```
chrome.printerProvider.onGetUsbPrinterInfoRequested.addListener(
  callback: function,
)
```

Event fired when print manager requests information about a USB device that may be a printer.
Note: An application should not rely on this event being fired more than once per device. If a connected device is supported it should be returned in the ``[onGetPrintersRequested](#event-onGetPrintersRequested) event.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(device: [usb.Device](https://developer.chrome.com/docs/extensions/reference/usb/#type-Device), resultCallback: function) => void
```

- device
  [usb.Device](https://developer.chrome.com/docs/extensions/reference/usb/#type-Device)
- resultCallback
  function

                              The `resultCallback` parameter looks like:

```
(printerInfo?: [PrinterInfo](#type-PrinterInfo)) => void
```

- printerInfo
  [PrinterInfo](#type-PrinterInfo)optional

### onPrintRequested

```
chrome.printerProvider.onPrintRequested.addListener(
  callback: function,
)
```

Event fired when print manager requests printing.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(printJob: [PrintJob](#type-PrintJob), resultCallback: function) => void
```

- printJob
  [PrintJob](#type-PrintJob)
- resultCallback
  function

                              The `resultCallback` parameter looks like:

```
(result: [PrintError](#type-PrintError)) => void
```

- result
  [PrintError](#type-PrintError)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
