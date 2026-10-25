# Architecture decision records

Short records of decisions that are not obvious from the code. Each record has a status, the context, the decision and its consequences. The rules in [.claude/rules/](../../.claude/rules/) say what the code does; these records say why.

| Record                                    | Title                                                        | Status   |
| ----------------------------------------- | ------------------------------------------------------------ | -------- |
| [0001](0001-exact-dependency-versions.md) | Pin exact dependency versions and wait a week before updates | Accepted |
| [0002](0002-typescript-7-type-check.md)   | Type check with TypeScript 7, build with TypeScript 6        | Accepted |
| [0003](0003-one-file-per-entry.md)        | Build every entry as one file with a fixed name              | Accepted |
| [0004](0004-bandcamp-snapshots.md)        | Test on saved Bandcamp pages and check the live markup daily | Accepted |
| [0005](0005-batch-download-state.md)      | Keep the batch download state in storage and alarms          | Accepted |

A new record gets the next number. Dates come from the commit that made the decision.
