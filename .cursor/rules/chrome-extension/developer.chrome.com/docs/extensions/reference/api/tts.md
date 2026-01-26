## Description

Use the `chrome.tts` API to play synthesized text-to-speech (TTS). See also the related ``[ttsEngine](https://developer.chrome.com/docs/extensions/reference/ttsEngine/) API, which allows an extension to implement a speech engine.
Chrome provides this capability on Windows (using SAPI 5), Mac OS X, and ChromeOS, using
speech synthesis capabilities provided by the operating system. On all platforms, the user can
install extensions that register themselves as alternative speech engines.

## Permissions

`tts`

## Concepts and usage

### Generate speech

Call `speak()` from your extension to speak. For example:

```
chrome.tts.speak('Hello, world.');

```

To stop speaking immediately, just call `stop()`:

```
chrome.tts.stop();

```

You can provide options that control various properties of the speech, such as its rate, pitch, and
more. For example:

```
chrome.tts.speak('Hello, world.', {'rate': 2.0});

```

It's also a good idea to specify the language so that a synthesizer supporting that language (and
regional dialect, if applicable) is chosen.

```
chrome.tts.speak('Hello, world.', {'lang': 'en-US', 'rate': 2.0});

```

By default, each call to `speak()` interrupts any ongoing speech and speaks immediately. To
determine if a call would be interrupting anything, you can call `isSpeaking()`. In addition, you
can use the `enqueue` option to cause this utterance to be added to a queue of utterances that will
be spoken when the current utterance has finished.

```
chrome.tts.speak('Speak this first.');
chrome.tts.speak(
    'Speak this next, when the first sentence is done.', {9;enqueue': true});

```

A complete description of all options can be found under ``[tts.speak()](#method-speak). Not all speech
engines will support all options.
To catch errors and make sure you're calling `speak()` correctly, pass a callback function that
takes no arguments. Inside the callback, check ``[runtime.lastError](/docs/extensions/reference/api/runtime#property-lastError) to see if there were any
errors.

```
chrome.tts.speak(
  utterance,
  options,
  function() {
    if (chrome.runtime.lastError) {
      console.log('Error: ' + chrome.runtime.lastError.message);
    }
  }
);

```

The callback returns right away, before the engine has started generating speech. The purpose of the
callback is to alert you to syntax errors in your use of the TTS API, not to catch all possible
errors that might occur in the process of synthesizing and outputting speech. To catch these errors
too, you need to use an event listener, described in the next section.

### Listen to events

To get more real-time information about the status of synthesized speech, pass an event listener in
the options to `speak()`, like this:

```
chrome.tts.speak(
  utterance,
  {
    onEvent: function(event) {
      console.log('Event ' + event.type + ' at position ' + event.charIndex);
      if (event.type == 'error') {
        console.log('Error: ' + event.errorMessage);
      }
    }
  },
  callback
);

```

Each event includes an event type, the character index of the current speech relative to the
utterance, and for error events, an optional error message. The event types are:

- `'start'`: The engine has started speaking the utterance.
- `'word'`: A word boundary was reached. Use `event.charIndex` to determine the current speech
  position.
- `'sentence'`: A sentence boundary was reached. Use `event.charIndex` to determine the current
  speech position.
- `'marker'`: An SSML marker was reached. Use `event.charIndex` to determine the current speech
  position.
- `'end'`: The engine has finished speaking the utterance.
- `'interrupted'`: This utterance was interrupted by another call to `speak()` or `stop()` and did
  not finish.
- `'cancelled'`: This utterance was queued, but then cancelled by another call to `speak()` or
  `stop()` and never began to speak at all.
- `'error'`: An engine-specific error occurred and this utterance cannot be spoken. Check
  `event.errorMessage` for details.
  Four of the event types—`'end'`, `'interrupted'`, `'cancelled'`, and `'error'`—are final. After
  one of those events is received, this utterance will no longer speak and no new events from this
  utterance will be received.
  Some voices may not support all event types, and some voices may not send any events at all. If you
  don't want to use a voice unless it sends certain events, pass the events you require in the
  `requiredEventTypes` member of the options object, or use `getVoices()` to choose a voice that meets
  your requirements. Both are described in what follows.

### SSML markup

Utterances used in this API may include markup using the [Speech Synthesis Markup Language
(SSML)](https://www.w3.org/TR/speech-synthesis). If you use SSML, the first argument to `speak()` should be a complete SSML document with
an XML header and a top-level `<speak>` tag, not a document fragment.
For example:

```
chrome.tts.speak(
  &<#39;?xml version=&q>uot;1.0<">;?' +
  &<#39;spea>k'< +
  '>;  The emphasissecond/emphasis ' +
  '  word o<f this> sentence was emphasized.' +
  '/speak'
);

```

Not all speech engines will support all SSML tags, and some may not support SSML at all, but all
engines are required to ignore any SSML they don't support and to still speak the underlying text.

### Choose a voice

By default, Chrome chooses the most appropriate voice for each utterance you want to speak, based on
the language. On most Windows, Mac OS X, and ChromeOS systems, speech synthesis provided by the
operating system should be able to speak any text in at least one language. Some users may have a
variety of voices available, though, from their operating system and from speech engines implemented
by other Chrome extensions. In those cases, you can implement custom code to choose the appropriate
voice, or to present the user with a list of choices.
To get a list of all voices, call `getVoices()` and pass it a function that receives an array of
`TtsVoice` objects as its argument:

```
chrome.tts.getVoices(
  function(voices) {
    for (var i = 0; i < voices.length; i++) {
      console.log('Voice ' + i + ':');
      console.log('  name: ' + voices[i].voiceName);
      console.log('  lang: ' + voices[i].lang);
      console.log('  extension id: ' + voices[i].extensionId);
      console.log('  event types: ' + voices[i].eventTypes);
    }
  }
);

```

## Types

### EventType

Chrome 54+

#### Enum

"start"

"end"

"word"

"sentence"

"marker"

"interrupted"

"cancelled"

"error"

"pause"

"resume"

### TtsEvent

An event from the TTS engine to communicate the status of an utterance.

#### Properties

- charIndex
  number optional
  The index of the current character in the utterance. For word events, the event fires at the end of one word and before the beginning of the next. The `charIndex` represents a point in the text at the beginning of the next word to be spoken.
- errorMessage
  string optional
  The error description, if the event type is `error`.
- length
  number optionalChrome 74+

The length of the next part of the utterance. For example, in a `word` event, this is the length of the word which will be spoken next. It will be set to -1 if not set by the speech engine.

- type
  [EventType](#type-EventType)
  The type can be `start` as soon as speech has started, `word` when a word boundary is reached, `sentence` when a sentence boundary is reached, `marker` when an SSML mark element is reached, `end` when the end of the utterance is reached, `interrupted` when the utterance is stopped or interrupted before reaching the end, `cancelled` when it's removed from the queue before ever being synthesized, or `error` when any other error occurs. When pausing speech, a `pause` event is fired if a particular utterance is paused in the middle, and `resume` if an utterance resumes speech. Note that pause and resume events may not fire if speech is paused in-between utterances.

### TtsOptions

Chrome 77+

The speech options for the TTS engine.

#### Properties

- desiredEventTypes
  string[] optional
  The TTS event types that you are interested in listening to. If missing, all event types may be sent.
- enqueue
  boolean optional
  If true, enqueues this utterance if TTS is already in progress. If false (the default), interrupts any current speech and flushes the speech queue before speaking this new utterance.
- extensionId
  string optional
  The extension ID of the speech engine to use, if known.
- gender
  [VoiceGender](#type-VoiceGender)optional
  Deprecated since Chrome 77
  Gender is deprecated and will be ignored.

Gender of voice for synthesized speech.

- lang
  string optional
  The language to be used for synthesis, in the form language-region. Examples: 'en', 'en-US', 'en-GB', 'zh-CN'.
- pitch
  number optional
  Speaking pitch between 0 and 2 inclusive, with 0 being lowest and 2 being highest. 1.0 corresponds to a voice's default pitch.
- rate
  number optional
  Speaking rate relative to the default rate for this voice. 1.0 is the default rate, normally around 180 to 220 words per minute. 2.0 is twice as fast, and 0.5 is half as fast. Values below 0.1 or above 10.0 are strictly disallowed, but many voices will constrain the minimum and maximum rates further—for example a particular voice may not actually speak faster than 3 times normal even if you specify a value larger than 3.0.
- requiredEventTypes
  string[] optional
  The TTS event types the voice must support.
- voiceName
  string optional
  The name of the voice to use for synthesis. If empty, uses any available voice.
- volume
  number optional
  Speaking volume between 0 and 1 inclusive, with 0 being lowest and 1 being highest, with a default of 1.0.
- onEvent
  void optional
  This function is called with events that occur in the process of speaking the utterance.

                            The `onEvent` function looks like:

```
(event: [TtsEvent](#type-TtsEvent)) =& gt;{...}
```

- event
  [TtsEvent](#type-TtsEvent)
  The update event from the text-to-speech engine indicating the status of this utterance.

### TtsVoice

A description of a voice available for speech synthesis.

#### Properties

- eventTypes
  [EventType](#type-EventType)[] optional
  All of the callback event types that this voice is capable of sending.
- extensionId
  string optional
  The ID of the extension providing this voice.
- gender
  [VoiceGender](#type-VoiceGender)optional
  Deprecated since Chrome 70
  Gender is deprecated and will be ignored.

This voice's gender.

- lang
  string optional
  The language that this voice supports, in the form language-region. Examples: 'en', 'en-US', 'en-GB', 'zh-CN'.
- remote
  boolean optional
  If true, the synthesis engine is a remote network resource. It may be higher latency and may incur bandwidth costs.
- voiceName
  string optional
  The name of the voice.

### VoiceGender

Chrome 54+

        Deprecated since Chrome 70

Gender is deprecated and is ignored.

#### Enum

"male"

"female"

## Methods

### getVoices()

```
chrome.tts.getVoices(): Promise<[TtsVoice](#type-TtsVoice)[]>
```

Gets an array of all available voices.

#### Returns

Promise<[TtsVoice](#type-TtsVoice)[]>Chrome 101+

### isSpeaking()

```
chrome.tts.isSpeaking(): Promise<boolean>
```

Checks whether the engine is currently speaking. On Mac OS X, the result is true whenever the system speech engine is speaking, even if the speech wasn't initiated by Chrome.

#### Returns

Promise<boolean>Chrome 101+

### pause()

```
chrome.tts.pause(): void
```

Pauses speech synthesis, potentially in the middle of an utterance. A call to resume or stop will un-pause speech.

### resume()

```
chrome.tts.resume(): void
```

If speech was paused, resumes speaking where it left off.

### speak()

```
chrome.tts.speak(
  utterance: string,
  options?: [TtsOptions](#type-TtsOptions),
): Promise<void>
```

Speaks text using a text-to-speech engine.

#### Parameters

- utterance
  string
  The text to speak, either plain text or a complete, well-formed SSML document. Speech engines that do not support SSML will strip away the tags and speak the text. The maximum length of the text is 32,768 characters.
- options
  [TtsOptions](#type-TtsOptions)optional
  The speech options.

#### Returns

Promise<void>Chrome 101+

Resolves right away, before speech finishes. If an error occurs, the promise will be rejected. Use options.onEvent to get more detailed feedback.

### stop()

```
chrome.tts.stop(): void
```

Stops any current speech and flushes the queue of any pending utterances. In addition, if speech was paused, it will now be un-paused for the next call to speak.

## Events

### onVoicesChanged

Chrome 124+

```
chrome.tts.onVoicesChanged.addListener(
  callback: function,
)
```

Called when the list of ``[tts.TtsVoice](#type-TtsVoice) that would be returned by getVoices has changed.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
() =& gt;void
```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-01-07 UTC.
[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-07 UTC."],[],[]]
