AI can mean many things: machine learning, large language models, generative AI, and more. Find resources built to help you understand how to effectively use AI in Chrome Extensions.

###

        Enhance browsing with AI-powered extensions


            With Extensions, you can control web content and customize the browser, improving user experience on the web. Take this to the next level with AI.


      web

####

        Control web content


          Use AI to help create and comprehend content on the web.


      favorite

####

        Make the browser more helpful


          Use extension APIs to enrich the bookmark experience, provide a better new tab page or make it easier to re-discover content from your browsing history.


      insert_emoticon

####

        Customize the browser


          Seamlessly embed AI functionality into the browser with a side panel, new-tab page, action bar, or context menus.

###

        Build AI-powered Chrome Extensions with Gemini


            Learn how to use client-side, on-device, and cloud-hosted AI to optimize the web and browser for your needs and the needs of your users. With Gemini's powerful multimodal APIs, you can build completely new experiences. Watch as we examine use cases and endless possibilities of AI in Chrome Extensions.

### [Even more use cases](https://developers.googleblog.com/how-its-made-exploring-ai-x-learning-through-shiffbot-an-ai-experiment-powered-by-the-gemini-api/)

            You can build AI-powered extensions that summarize text, help with translation, generate content, assist with coding, provide recommendations, personalize user interfaces, and so much more. Check out how the Google Creative Lab team used AI and extensions to build an interactive creative coding experience.

          [Read more](https://developers.googleblog.com/how-its-made-exploring-ai-x-learning-through-shiffbot-an-ai-experiment-powered-by-the-gemini-api/)

##

        Integrate AI with extensions


      computer

###

        Client-side AI


            Client-side AI is the latest offering for bringing powerful models to users, while protecting sensitive data and improving latency. Client-side AI cannot completely replace and replicate the work you do on the cloud, however, client-side AI can unlock great possibilities for your extensions such as ability to use purpose-built models, faster response times, offline availability and more.

- [Learn more about client-side AI](https://developer.chrome.com/docs/ai/client-side)
  cloud

###

        Cloud AI


            Cloud AI offers a blend of power, scaleability and ease of integration. Cloud platforms provide access to cutting-edge hardware and software, ensuring high performance and continuous improvement through regular updates. The Gemini ecosystem brings together all of Google's models, products and platforms.

- [Learn more about Gemini](https://ai.google/gemini-ecosystem)

##

        Built-in AI APIs


              Try the new built-in AI APIs in Chrome extensions.

            https://developer.chrome.com/docs/ai/prompt-api

### [Prompt API](https://developer.chrome.com/docs/ai/prompt-api)

            Discover the infinite possibilities of the Prompt API.

          https://developer.chrome.com/docs/ai/writer-apiSign up for the origin trial

### [Writer API](https://developer.chrome.com/docs/ai/writer-api)

            Create new content that conforms to a specified writing task.

          https://developer.chrome.com/docs/ai/rewriter-apiSign up for the origin trial

### [Rewriter API](https://developer.chrome.com/docs/ai/rewriter-api)

            Help your users refine existing text. Make it longer or shorter or change the tone.

          https://developer.chrome.com/docs/ai/translator-api

### [Translator API](https://developer.chrome.com/docs/ai/translator-api)

            Live translate text in the browser and help users contribute in their first language.

          https://developer.chrome.com/docs/ai/language-detection

### [Language Detector API](https://developer.chrome.com/docs/ai/language-detection)

            Identify the language used in any given text with the Language Detector API.

          https://developer.chrome.com/docs/ai/summarizer-api

### [Summarizer API](https://developer.chrome.com/docs/ai/summarizer-api)

            Generate different types of summaries in varied lengths and formats.

          https://developer.chrome.com/docs/ai/proofreader-api

### [Proofreader API](https://developer.chrome.com/docs/ai/proofreader-api)

            Improve your content readability and grammar.

##

        AI-powered extensions in action


              Check out the examples that demonstrate what's possible with Gemini in Chrome extensions.

            https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/ai.gemini-in-the-cloud

### [How to use the Gemini Cloud API in a Chrome extension](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/ai.gemini-in-the-cloud)

            Try out an extension that provides a chat interface for the Gemini API. Explore the code demonstrates how to use the Gemini Cloud API in a Chrome extension.

          https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/ai.gemini-on-device

### [How to use the Gemini Nano API in a Chrome extension](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/ai.gemini-on-device)

            This extension provides a chat interface using the Prompt API with Gemini Nano in Chrome. Try out the extension and explore the code.

          https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/ai.gemini-on-device-summarization

### [Client-side summarization with Gemini Nano](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/ai.gemini-on-device-summarization)

            Try out an extension that summarizes the content of the currently open tab, built with the Summarizer API in Chrome.

##

        Origin trials and Early Preview Program


              Join the origin trials and start using AI APIs in production.

            [How to join an origin trial](https://developer.chrome.com/docs/extensions/how-to/web-platform/origin-trials)https://developer.chrome.com/blog/ai-api-updates-io25

### [New APIs at I/O 2025](https://developer.chrome.com/blog/ai-api-updates-io25)

            At Google I/O 2025, we announced APIs that have begun origin trials and a brand new API for Early Preview Program participants.

          [Read the blog](https://developer.chrome.com/blog/ai-api-updates-io25)https://developer.chrome.com/blog/improved-summaries-gemini-nano

### [Higher quality summaries with LoRA](https://developer.chrome.com/blog/improved-summaries-gemini-nano)

            Chrome collaborated with Google Cloud to fine-tune Gemini Nano with low-rank adaptation (LoRA), to enhance the experience and output quality for all summary styles and lengths.

          [Read the blog](https://developer.chrome.com/blog/improved-summaries-gemini-nano)https://developer.chrome.com/docs/ai/join-epp

### [Participate in the built-in AI Early Preview Program](https://developer.chrome.com/docs/ai/join-epp)

            Join the EPP to provide feedback on early-stage ideas and test in-progress APIs. Your input helps shape the APIs, to ensure they meet your needs, and informs discussions with browser vendors.

          [Join the EPP](https://developer.chrome.com/docs/ai/join-epp)[Learn more](https://developer.chrome.com/docs/ai/built-in)

##

        Best practices


              Follow this guidance to make sure your extensions are safe, secure, and efficient.

###

        When possible, use smaller models


            For larger, client-side models, trigger the download after the extension is installed. Manage the life cycle of your model independently of your extension and your users won't have to download the model with every extension update. Note that models are not considered remote hosted code.

###

        Protect your API keys


            Never share your keys with Chrome Web Store. Ask users to provide an API key. Proxy calls through your  own server. Fetch the API key from your server before using it.

###

        Protect user privacy


            If you're using AI in the cloud or otherwise sharing user input with a server, update your privacy policy to include what information is shared.

          [web.dev](https://web.dev/explore/ai)

### [What is AI?](https://web.dev/articles/ai-overview)

            Understand the basics and definitions of the various emerging technologies, often referred to as AI.

          [Read the docs](https://web.dev/articles/ai-overview)[developer.chrome.com](https://developer.chrome.com/docs/extensions/develop)

### [Learn how to build extensions](https://developer.chrome.com/docs/extensions/develop)

            Learn how extensions work, what they can do, and how to build them.

          [Read the docs](https://developer.chrome.com/docs/extensions/develop)[developer.chrome.com](https://developer.chrome.com/docs/ai)

### [AI on Chrome](https://developer.chrome.com/docs/ai)

            Discover how AI can make it easier for developers to build powerful experiences on the web.

          [Read the docs](https://developer.chrome.com/docs/ai)
      [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],[],[],[]]
