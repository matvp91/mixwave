[![npm version](https://badgen.net/npm/v/vast-client)](https://badgen.net/npm/v/vast-client)
[![downloads per week](https://badgen.net/npm/dw/vast-client)](https://badgen.net/npm/dw/vast-client)
[![license](https://badgen.net/npm/license/vast-client)](https://badgen.net/npm/license/vast-client)

# VAST Client JS

Vast Client JS is a JavaScript library to fetch and parse Digital Video Ad Serving Template (VAST) documents.

This library provides three components:

* A **VAST Client** to fetch and parse VAST XML resources into JavaScript Objects.
* A **VAST Parser** to directly parse a VAST XML.
* A **VAST Tracker** to batch and call tracking URLs.

For the full API documentation go [here](#api).
For the full Class reference go [here](https://github.com/dailymotion/vast-client-js/blob/master/docs/api/class-reference.md)

To explore a practical example of how the vast client can be implemented, please visit this [link](https://githubbox.com/dailymotion/vast-client-js/tree/master/examples).

Complies with the [VAST 4.3 specification](https://iabtechlab.com/wp-content/uploads/2022/09/VAST_4.3.pdf) provided by the [Interactive Advertising Bureau (IAB)](https://www.iab.com/).

## Get Started

VAST Client JS is available as an NPM package and can be easily installed with:

```Bash
npm i @dailymotion/vast-client
```

Then import the components you need.

### VASTClient

If you need to fetch and parse VAST documents, you can use the `get` method from the **VASTClient**:

```javascript
import { VASTClient } from '@dailymotion/vast-client'

const vastClient = new VASTClient();

vastClient.get('https://www.examplevast.com/vast.xml')
  .then(parsedVAST => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  });
```

In addition to fetching and parsing a VAST resource, **VASTClient** provides options to filter a sequence of calls based on count and time of execution, together with the possibility to track URLs using **VASTTracker**.

If you need to directly parse a VAST XML and also follow any wrappers chain, you can use the  `parseVAST` method from the  **VASTClient** :

```javascript
import { VASTClient } from '@dailymotion/vast-client'

const vastClient = new VASTClient();

vastClient.parseVAST(vastXml)
  .then(parsedVAST => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  });
```
### VASTParser

To directly parse a VAST XML you can use the **VASTParser**:
The **VASTParser** will make no fetching, the final response will only contain the first VAST encountered.

```Javascript
import { VASTParser } from '@dailymotion/vast-client'

const vastParser = new VASTParser();

vastParser.parseVAST(vastXml)
  .then(parsedVAST => {
    // Do something with the parsed VAST response
  })
  .catch(err => {
    // Deal with the error
  });
```

### VASTTracker

To track the execution of an ad, create a **VASTTracker** instance and use the dedicated [methods](docs/api/vast-tracker.md) to calls [VAST tracking elements](https://iabtechlab.com/wp-content/uploads/2019/06/VAST_4.2_final_june26.pdf#page=28).

```Javascript
import { VASTTracker } from '@dailymotion/vast-client'

const vastTracker = new VASTTracker(vastClient, ad, creative);

// Track an impression for the given ad. Will call any <Impression> URI from the <InLine> and <Wrapper> tracking elements.
vastTracker.trackImpression();
```

## API Documentation<a name="api"></a>

The API documentation is organized by components:

* [VASTClient](docs/api/vast-client.md)
* [VASTParser](docs/api/vast-parser.md)
* [VASTTracker](docs/api/vast-tracker.md)

Changelog and migration guides can be found in the [release notes](https://github.com/dailymotion/vast-client-js/releases).

### Pre-bundled versions

We provide several pre-bundled versions of the client (see [`dist` directory](dist/))

#### Bundlers

A version for js bundlers (like webpack or rollup) is available by default when adding the lib using a package manager (like npm or yarn): [`vast-client.js`](dist/vast-client.js) or [`vast-client.min.js`](dist/vast-client.min.js) [minified].

```javascript
const import {
  VASTClient,
  VASTParser,
  VASTTracker
} from '@dailymotion/vast-client'

const vastClient = new VASTClient();
const vastParser = new VASTParser();
const vastTracker = new VASTTracker();
```

#### Browser script

A pre-bundled version of VAST Client JS is available: [`vast-client.min.js`](dist/vast-client.min.js) [minified].

To use it, either host it on your CDN or locally in your project. If you're using a script tag make sure to set the type property to module like below.

_your index.html_
```html
<script type="module" src="your-main-file.js"></script>
```
_main.js_
```javascript
import {VASTClient, VASTParser, VASTTracker} from "vast-client.min.js"

const vastClient = new VASTClient();
const vastParser = new VASTParser();
const vastTracker = new VASTTracker();
```

#### Node

A pre-bundled version for node is available too: [`vast-client-node.js`](dist/vast-client-node.js) or [`vast-client-node.min.js`](dist/vast-client-node.min.js) [minified].

```javascript
// Method 1: From npm
const VAST = require('@dailymotion/vast-client')

// Method 2: For pre-bundled you must copy first the file inside your project
// then you will be able to require it without the need of npm
const VAST = require('your/path/vast-client-node.min.js')

const vastClient = new VAST.VASTClient();
const vastParser = new VAST.VASTParser();
const vastTracker = new VAST.VASTTracker();
```

## Build / Contribute

See [CONTRIBUTING](docs/CONTRIBUTING.md)
