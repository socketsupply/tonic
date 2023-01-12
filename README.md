![tonic](https://raw.githubusercontent.com/socketsupply/tonic/master/readme-tonic.png)

<p align="center">
  https://tonicframework.dev
</p>
<br/>
<br/>
Tonic is a low profile component framework for the web. It's one file, less than 3kb gzipped and has no dependencies. It's designed to be used with modern Javascript and is compatible with all modern browsers and built on top of the Web Components.

## Installation

```sh
npm install @socketsupply/tonic
```

## Usage

```js
import Tonic from '@socketsupply/tonic'

class MyGreeting extends Tonic {
  render () {
    return this.html`<div>Hello, World.</div>`
  }
}

Tonic.add(MyGreeting, 'my-greeting')
```

After adding your Javascript to your HTML, you can use your component anywhere.

```html
<html>
  <head>
    <script src="my-greeting.js"></script>
  </head>
  <body>
    <my-greeting></my-greeting>
  </body>
</html>
```

# Useful links
- [Tonic components](https://github.com/socketsupply/components)
- [Migration from the early versions of Tonic](./MIGRATION.md)
- [API](./API.md)
- [Troubleshooting](./HELP.md)

Copyright (c) 2023 Socket Supply Co.

MIT License
