## Description

Use the `system.cpu` API to query CPU metadata.

## Permissions

`system.cpu`

## Types

### CpuInfo

#### Properties

- archName
  string
  The architecture name of the processors.
- features
  string[]
  A set of feature codes indicating some of the processor's capabilities. The currently supported codes are "mmx", "sse", "sse2", "sse3", "ssse3", "sse4_1", "sse4_2", and "avx".
- modelName
  string
  The model name of the processors.
- numOfProcessors
  number
  The number of logical processors.
- processors
  [ProcessorInfo](#type-ProcessorInfo)[]
  Information about each logical processor.
- temperatures
  number[]Chrome 60+

List of CPU temperature readings from each thermal zone of the CPU. Temperatures are in degrees Celsius.
Currently supported on Chrome OS only.

### CpuTime

#### Properties

- idle
  number
  The cumulative time spent idle by this processor.
- kernel
  number
  The cumulative time used by kernel programs on this processor.
- total
  number
  The total cumulative time for this processor. This value is equal to user + kernel + idle.
- user
  number
  The cumulative time used by userspace programs on this processor.

### ProcessorInfo

#### Properties

- usage
  [CpuTime](#type-CpuTime)
  Cumulative usage info for this logical processor.

## Methods

### getInfo()

```
chrome.system.cpu.getInfo(): Promise<[CpuInfo](#type-CpuInfo)>
```

Queries basic CPU information of the system.

#### Returns

Promise<[CpuInfo](#type-CpuInfo)>Chrome 91+

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2025-08-11 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
