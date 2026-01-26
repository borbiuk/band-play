## Description

Use the `chrome.documentScan` API to discover and retrieve images from attached document scanners.
The Document Scan API is designed to allow apps and extensions to view the
content of paper documents on an attached document scanner.

## Permissions

`documentScan`

## Availability

Chrome 44+

        ChromeOS only

Availability for API members added later is shown with those members.

## Concepts and usage

This API supports two means of scanning documents. If your use case can work
with any scanner and doesn't require control of the configuration, use the
`scan()` method. More complicated use cases require a combination of methods,
which are only supported in Chrome 124 and later.

### Simple scanning

For simple use cases, meaning those that can work with any scanner and don't
require control of configuration, call `scan()`. This method takes a
`ScanOptions` object and returns a Promise that resolves with a `ScanResults`
object. The capabilities of this option are limited to the number of scans and
the MIME types that will be accepted by the caller. Scans are returned as URLs
for display in an `<img>` tag for a user interface.

### Complex scanning

Complex scans are accomplished in three phases as described in this section.
This outline does not describe every method argument or every property returned
in a response. It is only intended to give you a general guide to writing scanner
code.Note: Calling `[openScanner()](#method-openscanner),
`[getScannerList()](#method-getscannerlist), or
``[startScan()](#method-startscan) more than once will cancel operations
initiated by previous calls to these methods. See the descriptions of these
methods for specifics.

#### Discovery

Call `[getScannerList()](#method-getscannerlist). Available scanners are
returned in a Promise that resolves with a
`[GetScannerListResponse](#type-getscannerlistresponse).

- The response object contains an array of ``[ScannerInfo](#type-scannerinfo)
  objects.
- The array may contain multiple entries for a single scanner if that scanner
  supports multiple protocols or connection methods.
  Select a scanner from the returned array and save the value of its
  `scannerId` property.
  Use the properties of individual `ScannerInfo` objects
  to distinguish among multiple objects for the same scanner. Objects from the
  same scanner will have the same value for the `deviceUuid` property.
  `ScannerInfo` also contains an `imageFormats` property containing an array of
  supported image types.

#### Scanner configuration

Call `[openScanner()](#method-openscanner), passing in the saved scanner ID.
It returns a Promise that resolves with an `[OpenScannerResponse](#type-openscannerresponse).
The response object contains:

A `scannerHandle` property, which you'll need to save.
An options property containing scanner-specific properties, which you'll
need to set. See Retrieve scanner options for more information.
(Optional) If you need the user to provide values for scanner options,
construct a user interface. You will need the scanner options provided by the
previous step, and you'll need to retrieve option groups provided by the
scanner. See [Construct a user interface](/docs/extensions/develop/ui) for more information.
Construct an array of ``[OptionSetting](#type-optionsetting) objects using
programmatic or user-provided values. See Set scanner options for more
information.
Pass the array of `OptionSetting` objects to
``[setOptions()](#method-setoptions) to set options for the scanner. It
returns a Promise that resolves with a
``[SetOptionsResponse](#type-setoptionsresponse). This object contains an
updated version of the scanner options retrieved in step 1 of scanner
configuration.
Since changing one
option can alter constraints on another option, you may need to repeat these
steps several times.

#### Scanning

Construct a `[StartScanOptions](#type-startscanoptions) object and pass it
to `[startScan()](#method-startscan). It returns a Promise that resolves
with a ``[StartScanResponse](#type-startscanresponse). Its `job` property is
a handle that you will use to either read scan data or cancel the scan.
Pass the job handle to ``[readScanData()](#method-readscandata). It returns a
Promise that resolves with a
``[ReadScanDataResponse](#type-readscandataresponse) object. If data was read
successfully, its `result` property equals `SUCCESS` and its `data` property
contains an
``[ArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
with part of the scan. Note that `estimatedCompletion` contains an estimated
percentage of the total data that has been delivered so far.Note: If `result` is `SUCCESS`, but `data` is empty, delay briefly before calling `readScanData()` again.
Repeat the previous step until the `result` property equals `EOF` or an error.
When the end of the scan is reached, call
`[closeScanner()](#method-closescanner) with the scanner handle saved in step
3. It returns a Promise that resolves with a
`[CloseScannerResponse](#type-closescannerresponse). Calling
``[cancelScan()](#method-cancelscan) at any time after the job is created will
end scanning.

### Response objects

All methods return a Promise that resolves with a response object of some kind.
Most of these contain a `result` property whose value is a member of
``[OperationResult](#type-operationresult). Some properties of response objects
won't contain values unless the value of `result`has a specific value. These
relationships are described in the reference for each response object.
For example,`OpenScannerResponse.scannerHandle`will only have a value when`OpenScannerResponse.result`equals`SUCCESS`.

### Scanner options

Scanner options vary considerably by device. Consequently, it's not possible to
reflect scanner options directly within the documentScan API. To get around
this, the `[OpenScannerResponse](#type-openscannerresponse) (retrieved using
`[openScanner()](#method-openscanner)) and the
`[SetOptionsResponse](#type-setoptionsresponse) (the response object for
`[setOptions()](#method-setoptions)) contain an `options` property which is an
object containing scanner-specific options. Each option is a key-value mapping
where the key is a device-specific option and the value is an instance of
``[ScannerOption](#type-scanneroption).
The structure generally looks like this:

```
{
  "key1": { scannerOptionInstance }
  "key2": { scannerOptionInstance }
}

```

For example, imagine a scanner that returns options named "source" and
"resolution". The structure of the returned `options` object will look something
like the following example. For simplicity, only partial `ScannerOption`
responses are shown.

```
{
  "source": {
    "name": "source",
    "type": OptionType.STRING,
...
},
  "resolution": {
    "name": "resolution",
    "type": OptionType.INT,
...
  },
...
}

```

### Construct a user interface

Though not required to use this API, you may want a user to choose the value for
a particular option. This requires a user interface. Use the
`[OpenScannerResponse](#type-openscannerresponse) (opened by
`[openScanner()](#type-openscanner)) to retrieve the options for the attached
scanner as described in the previous section.
Some scanners group options in device-specific ways. They don't affect option
behaviors, but since these groups may be mentioned in a scanner's product
documentation, such groups should be shown to the user. You can retrieve these
groups by calling `[getOptionGroups()](#method-getoptionsgroup). This returns a
Promise that resolves with a
`[GetOptionGroupsResponse](#type-getoptiongroupsreponse) object. Its `groups`
property contains a scanner-specific array of groups. Use the information in
these groups to organize the options in the
``[OpenScannerResponse](#type-openscannerresponse) for display.

```
{
  scannerHandle: "123456",
  result: SUCCESS,
  groups: [
    {
      title: "Standard",
      members: [ "resolution", "mode", "source" ]
    }
  ]
}

```

As stated under Scanner configuration, changing one option can alter constraints
on another option. This is why
`[setOptionsResponse](#method-setoptionsresponse) (the response object for
`[setOptions()](#method-setoptions)) contains another `options` property. Use
this to update the user interface. Then repeat as needed until all options are
set.

### Set scanner options

Set scanner options by passing an array of
`[OptionSetting](#type-optionsetting) objects to
`[setOptions()](#method-setoptions). For an example, see the following [Scan one letter-size page](#scan_one_letter-size_page) section.

## Examples

### Retrieve a page as a blob

This example shows one way to retrieve a page from the scanner as a blob and
demonstrates use of `startScan()` and `readScanData()` using the value of
`OperationResult`.

```
async function pageAsBlob(handle) {
  let response = await chrome.documentScan.startScan(
      handle, {format: "image/jpeg"});
  if (response.result != chrome.documentScan.OperationResult.SUCCESS) {
    return null;
  }
  const job = response.job;

  let imgParts = [];
  response = await chrome.documentScan.readScanData(job);
  while (response.result == chrome.documentScan.OperationResult.SUCCESS) {
    if (response.data && response.data.byteLength > 0) {
        imgParts.push(response.data);
    } else {
      // Delay so hardware can make progress.
      await new Promise(r => setTimeout(r, 100));
    }
    response = await chrome.documentScan.readScanData(job);
  }
  if (response.result != chrome.documentScan.OperationResult.EOF) {
    return null;
  }
  if (response.data && response.data.byteLength > 0) {
    imgParts.push(response.data);
  }
  return new Blob(imgParts, { type: "image/jpeg" });
}

```

### Scan one letter-size page

This example shows how to select a scanner, set its options, and open it. It
then retrieves the contents of a single page and closes the scanner. This process
demonstrates using `getScannerList()`, `openScanner()`, `setOptions()`, and
`closeScanner()`. Note that the contents of the page are retrieved by calling
the `pageAsBlob()` function from the previous example.

```
async function scan() {
    let response = await chrome.documentScan.getScannerList({ secure: true });
    let scanner = await chrome.documentScan.openScanner(
        response.scanners[0].scannerId);
    const handle = scanner.scannerHandle;

    let options = [];
    for (source of scanner.options["source"].constraint.list) {
        if (source.includes("ADF")) {
            options.push({
                name: "source",
                type: chrome.documentScan.OptionType.STRING,
                value: { value: source }
            });
            break;
        }
    }
    options.push({
        name: "tl-x",
        type: chrome.documentScan.OptionType.FIXED,
        value: 0.0
    });
    options.push({
        name: "br-x",
        type: chrome.documentScan.OptionType.FIXED,
        value: 215.9  // 8.5" in mm
    });
    options.push({
        name: "tl-y",
        type: chrome.documentScan.OptionType.FIXED,
        value: 0.0
    });
    options.push({
        name: "br-y",
        type: chrome.documentScan.OptionType.FIXED,
        value: 279.4  // 11" in mm
    });
    response = await chrome.documentScan.setOptions(handle, options);

    let imgBlob = await pageAsBlob(handle);
    if (imgBlob != null) {
        // Insert imgBlob into DOM, save to disk, etc
    }
    await chrome.documentScan.closeScanner(handle);
}

```

### Show the configuration

As stated elsewhere, showing a scanner's configuration options to a user requires
calling `getOptionGroups()` in addition to the scanner options returned from a
call to `openScanner()`. This is so that options can be shown to users in
manufacturer-defined groups. This example shows how to do that.

```
async function showConfig() {
  let response = await chrome.documentScan.getScannerList({ secure: true });
  let scanner = await chrome.documentScan.openScanner(
      response.scanners[0].scannerId);
  let groups = await chrome.documentScan.getOptionGroups(scanner.scannerHandle);

  for (const group of groups.groups) {
    console.log("=== " + group.title + " ===");
    for (const member of group.members) {
      const option = scanner.options[member];
      if (option.isActive) {
        console.log("  " + option.name + " = " + option.value);
      } else {
        console.log("  " + option.name + " is inactive");
      }
    }
  }
}

```

## Types

### CancelScanResponse

Chrome 125+

#### Properties

- job
  string
  Provides the same job handle that was passed to `cancelScan()`.
- result
  [OperationResult](#type-OperationResult)
  The backend's cancel scan result. If the result is `OperationResult.SUCCESS` or `OperationResult.CANCELLED`, the scan has been cancelled and the scanner is ready to start a new scan. If the result is `OperationResult.DEVICE_BUSY` , the scanner is still processing the requested cancellation; the caller should wait a short time and try the request again. Other result values indicate a permanent error that should not be retried.

### CloseScannerResponse

Chrome 125+

#### Properties

- result
  [OperationResult](#type-OperationResult)
  The result of closing the scanner. Even if this value is not `SUCCESS`, the handle will be invalid and should not be used for any further operations.
- scannerHandle
  string
  The same scanner handle as was passed to ``[closeScanner](#method-closeScanner).

### Configurability

Chrome 125+

How an option can be changed.

#### Enum

"NOT_CONFIGURABLE"
The option is read-only.
"SOFTWARE_CONFIGURABLE"
The option can be set in software.
"HARDWARE_CONFIGURABLE"
The option can be set by the user toggling or pushing a button on the scanner.

### ConnectionType

Chrome 125+

Indicates how the scanner is connected to the computer.

#### Enum

"UNSPECIFIED"

"USB"

"NETWORK"

### ConstraintType

Chrome 125+

The data type of constraint represented by an ``[OptionConstraint](#type-OptionConstraint).

#### Enum

"INT_RANGE"
The constraint on a range of `OptionType.INT` values. The `min`, `max`, and `quant` properties of `OptionConstraint` will be `long`, and its `list` propety will be unset.
"FIXED_RANGE"
The constraint on a range of `OptionType.FIXED` values. The `min`, `max`, and `quant` properties of `OptionConstraint` will be `double`, and its `list` property will be unset.
"INT_LIST"
The constraint on a specific list of `OptionType.INT` values. The `OptionConstraint.list` property will contain `long` values, and the other properties will be unset.
"FIXED_LIST"
The constraint on a specific list of `OptionType.FIXED` values. The `OptionConstraint.list` property will contain `double` values, and the other properties will be unset.
"STRING_LIST"
The constraint on a specific list of `OptionType.STRING` values. The `OptionConstraint.list` property will contain `DOMString` values, and the other properties will be unset.

### DeviceFilter

Chrome 125+

#### Properties

- local
  boolean optional
  Only return scanners that are directly attached to the computer.
- secure
  boolean optional
  Only return scanners that use a secure transport, such as USB or TLS.

### GetOptionGroupsResponse

Chrome 125+

#### Properties

- groups
  [OptionGroup](#type-OptionGroup)[] optional
  If `result` is `SUCCESS`, provides a list of option groups in the order supplied by the scanner driver.
- result
  [OperationResult](#type-OperationResult)
  The result of getting the option groups. If the value of this is `SUCCESS`, the `groups` property will be populated.
- scannerHandle
  string
  The same scanner handle as was passed to ``[getOptionGroups](#method-getOptionGroups).

### GetScannerListResponse

Chrome 125+

#### Properties

- result
  [OperationResult](#type-OperationResult)
  The enumeration result. Note that partial results could be returned even if this indicates an error.
- scanners
  [ScannerInfo](#type-ScannerInfo)[]
  A possibly-empty list of scanners that match the provided ``[DeviceFilter](#type-DeviceFilter).

### OpenScannerResponse

Chrome 125+

#### Properties

- options
  object optional
  If `result` is `SUCCESS`, provides a key-value mapping where the key is a device-specific option and the value is an instance of ``[ScannerOption](#type-ScannerOption).
- result
  [OperationResult](#type-OperationResult)
  The result of opening the scanner. If the value of this is `SUCCESS`, the `scannerHandle` and `options` properties will be populated.
- scannerHandle
  string optional
  If `result` is `SUCCESS`, a handle to the scanner that can be used for further operations.
- scannerId
  string
  The scanner ID passed to `openScanner()`.

### OperationResult

Chrome 125+

An enum that indicates the result of each operation.

#### Enum

"UNKNOWN"
An unknown or generic failure occurred.
"SUCCESS"
The operation succeeded.
"UNSUPPORTED"
The operation is not supported.
"CANCELLED"
The operation was cancelled.
"DEVICE_BUSY"
The device is busy.
"INVALID"
Either the data or an argument passed to the method is not valid.
"WRONG_TYPE"
The supplied value is the wrong data type for the underlying option.
"EOF"
No more data is available.
"ADF_JAMMED"
The document feeder is jammed.
"ADF_EMPTY"
The document feeder is empty.
"COVER_OPEN"
The flatbed cover is open.
"IO_ERROR"
An error occurred while communicating with the device.
"ACCESS_DENIED"
The device requires authentication.
"NO_MEMORY"
Not enough memory is available on the Chromebook to complete the operation.
"UNREACHABLE"
The device is not reachable.
"MISSING"
The device is disconnected.
"INTERNAL_ERROR"
An error has occurred somewhere other than the calling application.

### OptionConstraint

Chrome 125+

#### Properties

- list
  string[] | number[] optional
- max
  number optional
- min
  number optional
- quant
  number optional
- type
  [ConstraintType](#type-ConstraintType)

### OptionGroup

Chrome 125+

#### Properties

- members
  string[]
  An array of option names in driver-provided order.
- title
  string
  Provides a printable title, for example "Geometry options".

### OptionSetting

Chrome 125+

#### Properties

- name
  string
  Indicates the name of the option to set.
- type
  [OptionType](#type-OptionType)
  Indicates the data type of the option. The requested data type must match the real data type of the underlying option.
- value
  string | number | boolean | number[] optional
  Indicates the value to set. Leave unset to request automatic setting for options that have `autoSettable` enabled. The data type supplied for `value` must match `type`.

### OptionType

Chrome 125+

The data type of an option.

#### Enum

"UNKNOWN"
The option's data type is unknown. The `value` property will be unset.
"BOOL"
The `value` property will be one of `true`false.
"INT"
A signed 32-bit integer. The `value` property will be long or long[], depending on whether the option takes more than one value.
"FIXED"
A double in the range -32768-32767.9999 with a resolution of 1/65535. The `value` property will be double or double[] depending on whether the option takes more than one value. Double values that can't be exactly represented will be rounded to the available range and precision.
"STRING"
A sequence of any bytes except NUL ('\0'). The `value` property will be a DOMString.
"BUTTON"
An option of this type has no value. Instead, setting an option of this type causes an option-specific side effect in the scanner driver. For example, a button-typed option could be used by a scanner driver to provide a means to select default values or to tell an automatic document feeder to advance to the next sheet of paper.
"GROUP"
Grouping option. No value. This is included for compatibility, but will not normally be returned in `ScannerOption` values. Use `getOptionGroups()` to retrieve the list of groups with their member options.

### OptionUnit

Chrome 125+

Indicates the data type for ``[ScannerOption.unit](#property-ScannerOption-unit).

#### Enum

"UNITLESS"
The value is a unitless number. For example, it can be a threshold.
"PIXEL"
The value is a number of pixels, for example, scan dimensions.
"BIT"
The value is the number of bits, for example, color depth.
"MM"
The value is measured in millimeters, for example, scan dimensions.
"DPI"
The value is measured in dots per inch, for example, resolution.
"PERCENT"
The value is a percent, for example, brightness.
"MICROSECOND"
The value is measured in microseconds, for example, exposure time.

### ReadScanDataResponse

Chrome 125+

#### Properties

- data
  ArrayBuffer optional
  If `result` is `SUCCESS`, contains the next chunk of scanned image data. If `result` is `EOF`, contains the last chunk of scanned image data.
- estimatedCompletion
  number optional
  If `result` is `SUCCESS`, an estimate of how much of the total scan data has been delivered so far, in the range 0 to 100.
- job
  string
  Provides the job handle passed to `readScanData()`.
- result
  [OperationResult](#type-OperationResult)
  The result of reading data. If its value is `SUCCESS`, then `data` contains the next (possibly zero-length) chunk of image data that is ready for reading. If its value is `EOF`, the `data` contains the last chunk of image data.

### ScannerInfo

Chrome 125+

#### Properties

- connectionType
  [ConnectionType](#type-ConnectionType)
  Indicates how the scanner is connected to the computer.
- deviceUuid
  string
  For matching against other `ScannerInfo` entries that point to the same physical device.
- imageFormats
  string[]
  An array of MIME types that can be requested for returned scans.
- manufacturer
  string
  The scanner manufacturer.
- model
  string
  The scanner model if it is available, or a generic description.
- name
  string
  A human-readable name for the scanner to display in the UI.
- protocolType
  string
  A human-readable description of the protocol or driver used to access the scanner, such as Mopria, WSD, or epsonds. This is primarily useful for allowing a user to choose between protocols if a device supports multiple protocols.
- scannerId
  string
  The ID of a specific scanner.
- secure
  boolean
  If true, the scanner connection's transport cannot be intercepted by a passive listener, such as TLS or USB.

### ScannerOption

Chrome 125+

#### Properties

- configurability
  [Configurability](#type-Configurability)
  Indicates whether and how the option can be changed.
- constraint
  [OptionConstraint](#type-OptionConstraint)optional
  Defines ``[OptionConstraint](#type-OptionConstraint) on the current scanner option.
- description
  string
  A longer description of the option.
- isActive
  boolean
  Indicates the option is active and can be set or retrieved. If false, the `value` property will not be set.
- isAdvanced
  boolean
  Indicates that the UI should not display this option by default.
- isAutoSettable
  boolean
  Can be automatically set by the scanner driver.
- isDetectable
  boolean
  Indicates that this option can be detected from software.
- isEmulated
  boolean
  Emulated by the scanner driver if true.
- name
  string
  The option name using lowercase ASCII letters, numbers, and dashes. Diacritics are not allowed.
- title
  string
  A printable one-line title.
- type
  [OptionType](#type-OptionType)
  The data type contained in the `value` property, which is needed for setting this option.
- unit
  [OptionUnit](#type-OptionUnit)
  The unit of measurement for this option.
- value
  string | number | boolean | number[] optional
  The current value of the option, if relevant. Note that the data type of this property must match the data type specified in `type`.

### ScanOptions

#### Properties

- maxImages
  number optional
  The number of scanned images allowed. The default is 1.
- mimeTypes
  string[] optional
  The MIME types that are accepted by the caller.

### ScanResults

#### Properties

- dataUrls
  string[]
  An array of data image URLs in a form that can be passed as the "src" value to an image tag.
- mimeType
  string
  The MIME type of the `dataUrls`.

### SetOptionResult

Chrome 125+

#### Properties

- name
  string
  Indicates the name of the option that was set.
- result
  [OperationResult](#type-OperationResult)
  Indicates the result of setting the option.

### SetOptionsResponse

Chrome 125+

#### Properties

- options
  object optional
  An updated key-value mapping from option names to ``[ScannerOption](#type-ScannerOption) values containing the new configuration after attempting to set all supplied options. This has the same structure as the `options` property in ``[OpenScannerResponse](#type-OpenScannerResponse).
  This property will be set even if some options were not set successfully, but will be unset if retrieving the updated configuration fails (for example, if the scanner is disconnected in the middle of scanning).
- results
  [SetOptionResult](#type-SetOptionResult)[]
  An array of results, one each for every passed-in `OptionSetting`.
- scannerHandle
  string
  Provides the scanner handle passed to `setOptions()`.

### StartScanOptions

Chrome 125+

#### Properties

- format
  string
  Specifies the MIME type to return scanned data in.
- maxReadSize
  number optional
  If a non-zero value is specified, limits the maximum scanned bytes returned in a single ``[readScanData](#method-readScanData) response to that value. The smallest allowed value is 32768 (32 KB). If this property is not specified, the size of a returned chunk may be as large as the entire scanned image.

### StartScanResponse

Chrome 125+

#### Properties

- job
  string optional
  If `result` is `SUCCESS`, provides a handle that can be used to read scan data or cancel the job.
- result
  [OperationResult](#type-OperationResult)
  The result of starting a scan. If the value of this is `SUCCESS`, the `job` property will be populated.
- scannerHandle
  string
  Provides the same scanner handle that was passed to `startScan()`.

## Methods

### cancelScan()

Chrome 125+

```
chrome.documentScan.cancelScan(
  job: string,
): Promise<[CancelScanResponse](#type-CancelScanResponse)>
```

Cancels a started scan and returns a Promise that resolves with a ``[CancelScanResponse](#type-CancelScanResponse) object. If a callback is used, the object is passed to it instead.

#### Parameters

- job
  string
  The handle of an active scan job previously returned from a call to ``[startScan](#method-startScan).

#### Returns

Promise<[CancelScanResponse](#type-CancelScanResponse)>
Returns a Promise which resolves with the result.

### closeScanner()

Chrome 125+

```
chrome.documentScan.closeScanner(
  scannerHandle: string,
): Promise<[CloseScannerResponse](#type-CloseScannerResponse)>
```

Closes the scanner with the passed in handle and returns a Promise that resolves with a ``[CloseScannerResponse](#type-CloseScannerResponse) object. If a callback is used, the object is passed to it instead. Even if the response is not a success, the supplied handle becomes invalid and should not be used for further operations.

#### Parameters

- scannerHandle
  string
  Specifies the handle of an open scanner that was previously returned from a call to ``[openScanner](#method-openScanner).

#### Returns

Promise<[CloseScannerResponse](#type-CloseScannerResponse)>
Returns a Promise which resolves with the result.

### getOptionGroups()

Chrome 125+

```
chrome.documentScan.getOptionGroups(
  scannerHandle: string,
): Promise<[GetOptionGroupsResponse](#type-GetOptionGroupsResponse)>
```

Gets the group names and member options from a scanner previously opened by `[openScanner](#method-openScanner). This method returns a Promise that resolves with a `[GetOptionGroupsResponse](#type-GetOptionGroupsResponse) object. If a callback is passed to this function, returned data is passed to it instead.

#### Parameters

- scannerHandle
  string
  The handle of an open scanner returned from a call to ``[openScanner](#method-openScanner).

#### Returns

Promise<[GetOptionGroupsResponse](#type-GetOptionGroupsResponse)>
Returns a Promise which resolves with the result.

### getScannerList()

Chrome 125+

```
chrome.documentScan.getScannerList(
  filter: [DeviceFilter](#type-DeviceFilter),
): Promise<[GetScannerListResponse](#type-GetScannerListResponse)>
```

Gets the list of available scanners and returns a Promise that resolves with a ``[GetScannerListResponse](#type-GetScannerListResponse) object. If a callback is passed to this function, returned data is passed to it instead.

#### Parameters

- filter
  [DeviceFilter](#type-DeviceFilter)
  A ``[DeviceFilter](#type-DeviceFilter) indicating which types of scanners should be returned.

#### Returns

Promise<[GetScannerListResponse](#type-GetScannerListResponse)>
Returns a Promise which resolves with the result and list of scanners.

### openScanner()

Chrome 125+

```
chrome.documentScan.openScanner(
  scannerId: string,
): Promise<[OpenScannerResponse](#type-OpenScannerResponse)>
```

Opens a scanner for exclusive access and returns a Promise that resolves with an ``[OpenScannerResponse](#type-OpenScannerResponse) object. If a callback is passed to this function, returned data is passed to it instead.

#### Parameters

- scannerId
  string
  The ID of a scanner to be opened. This value is one returned from a previous call to ``[getScannerList](#method-getScannerList).

#### Returns

Promise<[OpenScannerResponse](#type-OpenScannerResponse)>
Returns a Promise which resolves with the result.

### readScanData()

Chrome 125+

```
chrome.documentScan.readScanData(
  job: string,
): Promise<[ReadScanDataResponse](#type-ReadScanDataResponse)>
```

Reads the next chunk of available image data from an active job handle, and returns a Promise that resolves with a ``[ReadScanDataResponse](#type-ReadScanDataResponse) object. If a callback is used, the object is passed to it instead.
**Note:**It is valid for a response result to be `SUCCESS`with a zero-length`data`member. This means the scanner is still working but does not yet have additional data ready. The caller should wait a short time and try again.
When the scan job completes, the response will have the result value of`EOF`. This response may contain a final non-zero `data` member.

#### Parameters

- job
  string
  Active job handle previously returned from ``[startScan](#method-startScan).

#### Returns

Promise<[ReadScanDataResponse](#type-ReadScanDataResponse)>
Returns a Promise which resolves with the result.

### scan()

```
chrome.documentScan.scan(
  options: [ScanOptions](#type-ScanOptions),
): Promise<[ScanResults](#type-ScanResults)>
```

Performs a document scan and returns a Promise that resolves with a ``[ScanResults](#type-ScanResults) object. If a callback is passed to this function, the returned data is passed to it instead.

#### Parameters

- options
  [ScanOptions](#type-ScanOptions)
  An object containing scan parameters.

#### Returns

Promise<[ScanResults](#type-ScanResults)>Chrome 96+

Returns a Promise which resolves with the scan results.

### setOptions()

Chrome 125+

```
chrome.documentScan.setOptions(
  scannerHandle: string,
  options: [OptionSetting](#type-OptionSetting)[],
): Promise<[SetOptionsResponse](#type-SetOptionsResponse)>
```

Sets options on the specified scanner and returns a Promise that resolves with a `[SetOptionsResponse](#type-SetOptionsResponse) object containing the result of trying to set every value in the order of the passed-in `[OptionSetting](#type-OptionSetting) object. If a callback is used, the object is passed to it instead.

#### Parameters

- scannerHandle
  string
  The handle of the scanner to set options on. This should be a value previously returned from a call to ``[openScanner](#method-openScanner).
- options
  [OptionSetting](#type-OptionSetting)[]
  A list of `OptionSetting` objects to be applied to the scanner.

#### Returns

Promise<[SetOptionsResponse](#type-SetOptionsResponse)>
Returns a Promise which resolves with the result.

### startScan()

Chrome 125+

```
chrome.documentScan.startScan(
  scannerHandle: string,
  options: [StartScanOptions](#type-StartScanOptions),
): Promise<[StartScanResponse](#type-StartScanResponse)>
```

Starts a scan on the specified scanner and returns a Promise that resolves with a ``[StartScanResponse](#type-StartScanResponse). If a callback is used, the object is passed to it instead. If the call was successful, the response includes a job handle that can be used in subsequent calls to read scan data or cancel a scan.

#### Parameters

- scannerHandle
  string
  The handle of an open scanner. This should be a value previously returned from a call to ``[openScanner](#method-openScanner).
- options
  [StartScanOptions](#type-StartScanOptions)
  A ``[StartScanOptions](#type-StartScanOptions) object indicating the options to be used for the scan. The `StartScanOptions.format`property must match one of the entries returned in the scanner's`ScannerInfo`.

#### Returns

Promise<[StartScanResponse](#type-StartScanResponse)>
Returns a Promise which resolves with the result.
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-01-07 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
