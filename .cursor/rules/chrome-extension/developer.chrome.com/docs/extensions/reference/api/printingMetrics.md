## Description

Use the `chrome.printingMetrics` API to fetch data about printing usage.

## Permissions

`printingMetrics`

## Availability

Chrome 79+

        ChromeOS only
      [Requires policy](https://support.google.com/chrome/a/answer/9296680)

## Types

### ColorMode

#### Enum

"BLACK_AND_WHITE"
Specifies that black and white mode was used.
"COLOR"
Specifies that color mode was used.

### DuplexMode

#### Enum

"ONE_SIDED"
Specifies that one-sided printing was used.
"TWO_SIDED_LONG_EDGE"
Specifies that two-sided printing was used, flipping on long edge.
"TWO_SIDED_SHORT_EDGE"
Specifies that two-sided printing was used, flipping on short edge.

### MediaSize

#### Properties

- height
  number
  Height (in micrometers) of the media used for printing.
- vendorId
  string
  Vendor-provided ID, e.g. "iso_a3_297x420mm" or "na_index-3x5_3x5in". Possible values are values of "media" IPP attribute and can be found on [IANA page](https://www.iana.org/assignments/ipp-registrations/ipp-registrations.xhtml) .
- width
  number
  Width (in micrometers) of the media used for printing.

### Printer

#### Properties

- name
  string
  Displayed name of the printer.
- source
  [PrinterSource](#type-PrinterSource)
  The source of the printer.
- uri
  string
  The full path for the printer. Contains protocol, hostname, port, and queue.

### PrinterSource

The source of the printer.

#### Enum

"USER"
Specifies that the printer was added by user.
"POLICY"
Specifies that the printer was added via policy.

### PrintJobInfo

#### Properties

- completionTime
  number
  The job completion time (in milliseconds past the Unix epoch).
- creationTime
  number
  The job creation time (in milliseconds past the Unix epoch).
- id
  string
  The ID of the job.
- numberOfPages
  number
  The number of pages in the document.
- printer
  [Printer](#type-Printer)
  The info about the printer which printed the document.
- printer_status
  [PrinterStatus](https://developer.chrome.com/docs/extensions/reference/printing/#type-PrinterStatus)Chrome 85+

The status of the printer.

- settings
  [PrintSettings](#type-PrintSettings)
  The settings of the print job.
- source
  [PrintJobSource](#type-PrintJobSource)
  Source showing who initiated the print job.
- sourceId
  string optional
  ID of source. Null if source is PRINT_PREVIEW or ANDROID_APP.
- status
  [PrintJobStatus](#type-PrintJobStatus)
  The final status of the job.
- title
  string
  The title of the document which was printed.

### PrintJobSource

The source of the print job.

#### Enum

"PRINT_PREVIEW"
Specifies that the job was created from the Print Preview page initiated by the user.
"ANDROID_APP"
Specifies that the job was created from an Android App.
"EXTENSION"
Specifies that the job was created by extension via Chrome API.
"ISOLATED_WEB_APP"
Specifies that the job was created by an Isolated Web App via API.

### PrintJobStatus

Specifies the final status of the print job.

#### Enum

"FAILED"
Specifies that the print job was interrupted due to some error.
"CANCELED"
Specifies that the print job was canceled by the user or via API.
"PRINTED"
Specifies that the print job was printed without any errors.

### PrintSettings

#### Properties

- color
  [ColorMode](#type-ColorMode)
  The requested color mode.
- copies
  number
  The requested number of copies.
- duplex
  [DuplexMode](#type-DuplexMode)
  The requested duplex mode.
- mediaSize
  [MediaSize](#type-MediaSize)
  The requested media size.

## Methods

### getPrintJobs()

```
chrome.printingMetrics.getPrintJobs(): Promise<[PrintJobInfo](#type-PrintJobInfo)[]>
```

Returns the list of the finished print jobs.

#### Returns

Promise<[PrintJobInfo](#type-PrintJobInfo)[]>Chrome 96+

## Events

### onPrintJobFinished

```
chrome.printingMetrics.onPrintJobFinished.addListener(
  callback: function,
)
```

Event fired when the print job is finished. This includes any of termination statuses: FAILED, CANCELED and PRINTED.

#### Parameters

- callback
  function

                              The `callback` parameter looks like:

```
(jobInfo: [PrintJobInfo](#type-PrintJobInfo)) => void
```

- jobInfo
  [PrintJobInfo](#type-PrintJobInfo)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
