Welcome to Chrome Extension development. Discover everything you need to start building and distributing your first Chrome Extension.

          [Build your first extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world)[See all tutorials](https://developer.chrome.com/docs/extensions/get-started#tutorials)

##

###

        What are extensions?


            Chrome extensions enhance the browsing experience by customizing the user interface, observing browser events, and modifying the web. Visit the [Chrome Web Store](https://chromewebstore.google.com/) for more examples of what extensions can do.

###

        How are they built?


            You can build extensions using the same web technologies that are used to create web applications: [HTML](https://web.dev/learn/html), [CSS](https://web.dev/learn/css), and [JavaScript](https://developer.mozilla.org/docs/Learn/JavaScript).

###

        What can they do?


            In addition to [Web APIs](https://developer.mozilla.org/docs/Web/API), extensions also have access to [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference) to accomplish different tasks. For a more detailed overview, take a look at the [Develop guide](/docs/extensions/develop).

##

        Extension terminology


              A Chrome extension is composed of parts that play different roles.
            [article](https://developer.chrome.com/docs/extensions/reference/manifest)

### [Manifest](https://developer.chrome.com/docs/extensions/reference/manifest)

            The extension's manifest is the only required file that must have a specific file name: manifest.json. It also has to be located in the extension's root directory. The manifest records important metadata, defines resources, declares permissions, and identifies which files to run in the background and on the page.

          [article](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)

### [Service workers](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)

            A service worker runs in the background and handles browser events, like removing a bookmark, or closing a tab. They don't have access to the DOM, but you can combine it with an offscreen document for this use case.

          [article](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

### [Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

            Content scripts run JavaScript in the context of a web page.

          [article](https://developer.chrome.com/docs/extensions/reference/api/action)

### [Toolbar action](https://developer.chrome.com/docs/extensions/reference/api/action)

            Execute code when the user clicks on the extension toolbar icon or show a popup using the Action API.

          [article](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)

### [Side Panel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)

            Display custom UI in the browser's side panel.

          [article](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)

### [DeclarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)

            Intercept, block, or modify network requests.

##

        Publish to the Chrome Web Store


              If you are building the extension for yourself, check out our [getting started tutorial](/docs/extensions/get-started/tutorial/hello-world). If you want to publish to the Chrome Web Store, there are a few things you need to know first.

      palette

###

        Design a high-quality extension


            When choosing which features to support, make sure your extension fulfills a [single purpose](/docs/webstore/program-policies/quality-guidelines-faq) that is narrowly defined and easy to understand.

          [Learn more](https://developer.chrome.com/docs/webstore/best_practices)
      build

###

        Become familiar with the policies


            Extensions distributed on the Chrome Web Store must comply with the [developer program policies](/docs/webstore/program-policies). Explore these policies to ensure your extension can be hosted in the Chrome Web Store.

          [Learn more](https://developer.chrome.com/docs/webstore/program-policies)
      cloud_off

###

        Include all extension logic


            When writing your code, keep in mind that all logic must be included in the extension package. This means no additional JavaScript code may be downloaded at runtime. [Improve extension security](/docs/extensions/migrating/improve-security) provides alternatives to executing remotely hosted code.

          [Learn more](https://developer.chrome.com/docs/extensions/migrating/improve-security)

##

        Tutorials


              Choose any of the following tutorials to begin your extension learning journey.


      code

###

        Your first extension


            Create your first hello world extension, where you will become familiar with the extension development workflow.
          [Start tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world)
      code

###

        Run scripts on every page


            Learn to automatically add elements to a specified site.
          [Start tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-on-every-tab)
      code

###

        Inject scripts into the active tab


            Learn to simplify the style of the current page by clicking the toolbar icon.
          [Start tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-activetab)
      code

###

        Create a tab manager


            Learn to create a popup that manages your tabs.
          [Start tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/popup-tabs-manager)
      code

###

        Handle events with service workers


            Learn to create and debug an extension service worker.
          [Start tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/service-worker-events)
      code

###

        Debug your extension


            Learn to find logs and error messages during debugging.
          [Start tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/debug)
      [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],[],[],[]]
