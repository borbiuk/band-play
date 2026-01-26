## Description

Use the `chrome.ttsEngine` API to implement a text-to-speech(TTS) engine using an extension. If your extension registers using this API, it will receive events containing an utterance to be spoken and other parameters when any extension or Chrome App uses the ``[tts](https://developer.chrome.com/docs/extensions/reference/tts/) API to generate speech. Your extension can then use any available web technology to synthesize and output the speech, and send events back to the calling function to report the status.

## Permissions

`ttsEngine`

## Concepts and usage

An extension can register itself as a speech engine. By doing so, it can intercept some or all calls
to functions such as `[tts.speak()](/docs/extensions/reference/api/tts#method-speak) and `[tts.stop()](/docs/extensions/reference/api/tts#method-stop) and provide an alternate implementation.
Extensions are free to use any available web technology to provide speech, including streaming audio
from a server, HTML5 audio. An extension could even do something different
with the utterances, like display closed captions in a popup or send them as log messages to
a remote server.
To implement a TTS engine, an extension must declare the "ttsEngine" permission and then declare all
voices it provides in the extension manifest, like this:

```
{
  "name": "My TTS Engine",
  "version": "1.0",
  "permissions": ["ttsEngine"],
  "tts_engine": {
    "voices": [
      {
        "voice_name": "Alice",
        "lang": "en-US",
        "event_types": ["start", "marker", "end"]
      },
      {
        "voice_name": "Pat",
        "lang": "en-US",
        "event_types": ["end"]
      }
    ]
  },
  "background": {
    "page": "background.html",
    "persistent": false
  }
}

```

An extension can specify any number of voices.
The `voice_name` parameter is required. The name should be descriptive enough that it identifies the
name of the voice and the engine used. In the unlikely event that two extensions register voices
with the same name, a client can specify the ID of the extension that should do the synthesis.
The `lang` parameter is optional, but highly recommended. Almost always, a voice can synthesize
speech in just a single language. When an engine supports more than one language, it can easily
register a separate voice for each language. Under rare circumstances where a single voice can
handle more than one language, it's easiest to just list two separate voices and handle them using
the same logic internally. However, if you want to create a voice that will handle utterances in any
language, leave out the `lang` parameter from your extension's manifest.
Finally, the `event_types` parameter is required if the engine can send events to update the client
on the progress of speech synthesis. At a minimum, supporting the `'end'` event type to indicate
when speech is finished is highly recommended, otherwise Chrome cannot schedule queued utterances.
Once loaded, an extension can replace the list of declared voices by calling
`chrome.ttsEngine.updateVoices`. (Note that the parameters used in the programatic call to
`updateVoices` are in camel case: e.g., `voiceName`, unlike the manifest file which uses
`voice_name`.)Note: If your TTS engine does not support the `'end'` event type, Chrome cannot queue utterances
because it has no way of knowing when your utterance has finished. To help mitigate this, Chrome
passes an additional boolean `enqueue` option to your engine's onSpeak handler, giving you the
option of implementing your own queueing. This is discouraged because then clients are unable to
queue utterances that should get spoken by different speech engines.
The possible event types that you can send correspond to the event types that the `speak()` method
receives:

- `'start'`: The engine has started speaking the utterance.
- `'word'`: A word boundary was reached. Use `event.charIndex` to determine the current speech
  position.
- `'sentence'`: A sentence boundary was reached. Use `event.charIndex` to determine the current
  speech position.
- `'marker'`: An SSML marker was reached. Use `event.charIndex` to determine the current speech
  position.
- `'end'`: The engine has finished speaking the utterance.
- `'error'`: An engine-specific error occurred and this utterance cannot be spoken. Pass more
  information in `event.errorMessage`.
  The `'interrupted'` and `'cancelled'` events are not sent by the speech engine; they are generated
  automatically by Chrome.
  Text-to-speech clients can get the voice information from your extension's manifest by calling
  ``[tts.getVoices](/docs/extensions/reference/api/tts#method-getVoices), assuming you've registered speech event listeners as described below.

### Handle speech events

To generate speech at the request of clients, your extension must register listeners for both
`onSpeak` and `onStop`, like this:

```
const speakListener = (utterance, options, sendTtsEvent) => {
  sendTtsEvent({type: 'start', charIndex: 0})

  // (start speaking)

  sendTtsEvent({type: 'end', charIndex: utterance.length})
};

const stopListener = () => {
  // (stop all speech)
};

chrome.ttsEngine.onSpeak.addListener(speakListener);
chrome.ttsEngine.onStop.addListener(stopListener);

```

Caution: If your extension does not register listeners for both `onSpeak` and `onStop`, it
will not intercept any speech calls, regardless of what is in the manifest.
The decision of whether or not to send a given speech request to an extension is based solely on
whether the extension supports the given voice parameters in its manifest and has registered
listeners for `onSpeak` and `onStop`. In other words, there's no way for an extension to receive a
speech request and dynamically decide whether to handle it.

## Types

### AudioBuffer

Chrome 92+

Parameters containing an audio buffer and associated data.

#### Properties

- audioBuffer
  ArrayBuffer
  The audio buffer from the text-to-speech engine. It should have length exactly audioStreamOptions.bufferSize and encoded as mono, at audioStreamOptions.sampleRate, and as linear pcm, 32-bit signed float i.e. the Float32Array type in javascript.
- charIndex
  number optional
  The character index associated with this audio buffer.
- isLastBuffer
  boolean optional
  True if this audio buffer is the last for the text being spoken.

### AudioStreamOptions

Chrome 92+

Contains the audio stream format expected to be produced by an engine.

#### Properties

- bufferSize
  number
  The number of samples within an audio buffer.
- sampleRate
  number
  The sample rate expected in an audio buffer.

### LanguageInstallStatus

Chrome 132+

The install status of a voice.

#### Enum

"notInstalled"

"installing"

"installed"

"failed"

### LanguageStatus

Chrome 132+

Install status of a language.

#### Properties

- error
  string optional
  Detail about installation failures. Optionally populated if the language failed to install.
- installStatus
  [LanguageInstallStatus](#type-LanguageInstallStatus)
  Installation status.
- lang
  string
  Language string in the form of language code-region code, where the region may be omitted. Examples are en, en-AU, zh-CH.

### LanguageUninstallOptions

Chrome 132+

Options for uninstalling a given language.

#### Properties

- uninstallImmediately
  boolean
  True if the TTS client wants the language to be immediately uninstalled. The engine may choose whether or when to uninstall the language, based on this parameter and the requestor information. If false, it may use other criteria, such as recent usage, to determine when to uninstall.

### SpeakOptions

Chrome 92+

Options specified to the tts.speak() method.

#### Properties

- gender
  [VoiceGender](#type-VoiceGender)optional
  Deprecated since Chrome 92
  Gender is deprecated and will be ignored.

Gender of voice for synthesized speech.

- lang
  string optional
  The language to be used for synthesis, in the form language-region. Examples: 'en', 'en-US', 'en-GB', 'zh-CN'.
- pitch
  number optional
  Speaking pitch between 0 and 2 inclusive, with 0 being lowest and 2 being highest. 1.0 corresponds to this voice's default pitch.
- rate
  number optional
  Speaking rate relative to the default rate for this voice. 1.0 is the default rate, normally around 180 to 220 words per minute. 2.0 is twice as fast, and 0.5 is half as fast. This value is guaranteed to be between 0.1 and 10.0, inclusive. When a voice does not support this full range of rates, don't return an error. Instead, clip the rate to the range the voice supports.
- voiceName
  string optional
  The name of the voice to use for synthesis.
- volume
  number optional
  Speaking volume between 0 and 1 inclusive, with 0 being lowest and 1 being highest, with a default of 1.0.

### TtsClient

Chrome 131+

Identifier for the client requesting status.

#### Properties

- id
  string
  Client making a language management request. For an extension, this is the unique extension ID. For Chrome features, this is the human-readable name of the feature.
- source
  [TtsClientSource](#type-TtsClientSource)
  Type of requestor.

### TtsClientSource

Chrome 131+

Type of requestor.

#### Enum

"chromefeature"

"extension"

### VoiceGender

Chrome 54+

        Deprecated since Chrome 70

Gender is deprecated and will be ignored.

#### Enum

"male"

"female"

## Methods

### updateLanguage()

Chrome 132+

```
chrome.ttsEngine.updateLanguage(
  status: [LanguageStatus](#type-LanguageStatus),
): void
```

Called by an engine when a language install is attempted, and when a language is uninstalled. Also called in response to a status request from a client. When a voice is installed or uninstalled, the engine should also call ttsEngine.updateVoices to register the voice.

#### Parameters

- status
  [LanguageStatus](#type-LanguageStatus)
  The install status of the language.

### updateVoices()

Chrome 66+

```
chrome.ttsEngine.updateVoices(
  voices: [TtsVoice](https://developer.chrome.com/docs/extensions/reference/tts/#type-TtsVoice)[],
): void
```

Called by an engine to update its list of voices. This list overrides any voices declared in this extension's manifest.

#### Parameters

- voices
  [TtsVoice](https://developer.chrome.com/docs/extensions/reference/tts/#type-TtsVoice)[]
  Array of ``[tts.TtsVoice](https://developer.chrome.com/docs/extensions/reference/tts/#type-TtsVoice) objects representing the available voices for speech synthesis.

## Events

### onInstallLanguageRequest

Chrome 131+

```
chrome.ttsEngine.onInstallLanguageRequest.addListener(
  callback: function,
)
```

Fired when a TTS client requests to install a new language. The engine should attempt to download and install the language, and call ttsEngine.updateLanguage with the result. On success, the engine should also call ttsEngine.updateVoices to register the newly available voices.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(requestor: [TtsClient](#type-TtsClient), lang: string) => void
```

- requestor
  [TtsClient](#type-TtsClient)
- lang
  string

### onLanguageStatusRequest

Chrome 132+

```
chrome.ttsEngine.onLanguageStatusRequest.addListener(
  callback: function,
)
```

Fired when a TTS client requests the install status of a language.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(requestor: [TtsClient](#type-TtsClient), lang: string) => void
```

- requestor
  [TtsClient](#type-TtsClient)
- lang
  string

### onPause

```
chrome.ttsEngine.onPause.addListener(
  callback: function,
)
```

Optional: if an engine supports the pause event, it should pause the current utterance being spoken, if any, until it receives a resume event or stop event. Note that a stop event should also clear the paused state.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
() => void
```

### onResume

```
chrome.ttsEngine.onResume.addListener(
  callback: function,
)
```

Optional: if an engine supports the pause event, it should also support the resume event, to continue speaking the current utterance, if any. Note that a stop event should also clear the paused state.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
() => void
```

### onSpeak

```
chrome.ttsEngine.onSpeak.addListener(
  callback: function,
)
```

Called when the user makes a call to tts.speak() and one of the voices from this extension's manifest is the first to match the options object.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(utterance: string, options: [SpeakOptions](#type-SpeakOptions), sendTtsEvent: function) => void
```

- utterance
  string
- options
  [SpeakOptions](#type-SpeakOptions)
- sendTtsEvent
  function

                            The `sendTtsEvent` parameter looks like:

```
(event: [tts.TtsEvent](https://developer.chrome.com/docs/extensions/reference/tts/#type-TtsEvent)) => void
```

- event
  [tts.TtsEvent](https://developer.chrome.com/docs/extensions/reference/tts/#type-TtsEvent)
  The event from the text-to-speech engine indicating the status of this utterance.

### onSpeakWithAudioStream

Chrome 92+

```
chrome.ttsEngine.onSpeakWithAudioStream.addListener(
  callback: function,
)
```

Called when the user makes a call to tts.speak() and one of the voices from this extension's manifest is the first to match the options object. Differs from ttsEngine.onSpeak in that Chrome provides audio playback services and handles dispatching tts events.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(utterance: string, options: [SpeakOptions](#type-SpeakOptions), audioStreamOptions: [AudioStreamOptions](#type-AudioStreamOptions), sendTtsAudio: function, sendError: function) => void
```

- utterance
  string
- options
  [SpeakOptions](#type-SpeakOptions)
- audioStreamOptions
  [AudioStreamOptions](#type-AudioStreamOptions)
- sendTtsAudio
  function

                            The `sendTtsAudio` parameter looks like:

```
(audioBufferParams: [AudioBuffer](#type-AudioBuffer)) => void
```

- audioBufferParams
  [AudioBuffer](#type-AudioBuffer)
  Parameters containing an audio buffer and associated data.
- sendError
  functionChrome 94+

                            The `sendError` parameter looks like:

```
(errorMessage?: string) => void
```

- errorMessage
  string optional
  A string describing the error.

### onStop

```
chrome.ttsEngine.onStop.addListener(
  callback: function,
)
```

Fired when a call is made to tts.stop and this extension may be in the middle of speaking. If an extension receives a call to onStop and speech is already stopped, it should do nothing (not raise an error). If speech is in the paused state, this should cancel the paused state.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
() => void
```

### onUninstallLanguageRequest

Chrome 132+

```
chrome.ttsEngine.onUninstallLanguageRequest.addListener(
  callback: function,
)
```

Fired when a TTS client indicates a language is no longer needed.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(requestor: [TtsClient](#type-TtsClient), lang: string, uninstallOptions: [LanguageUninstallOptions](#type-LanguageUninstallOptions)) => void
```

- requestor
  [TtsClient](#type-TtsClient)
- lang
  string
- uninstallOptions
  [LanguageUninstallOptions](#type-LanguageUninstallOptions)
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
