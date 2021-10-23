<div></div>

# Serve 🍛

Ultralight http server with live reload.  
<sub><code>CLI + API</code></sub>

<br>

### Simple CLI and API

### With live reload

### Light and modern

### No dependencies

<br>

### One command

```zsh
npm init serve
```

<br>

### Or one function

```js
import serve from 'create-serve';

serve.start();
```

<br>

### To start 🍛

<br>

### CLI

By default, it serves `public` if the folder exists, otherwise root `/`.  
Or you can specify a different folder.

```zsh
npm init serve [folder]
```

<br>

### API

```js
import serve from 'create-serve';

serve.start({
    port: 7000,
    root: '.',
    live: true
});
```

<br>

### Live reload

```js
serve.update();
```

<br>

### Use any file watcher

<br>

[Chokidar](https://github.com/paulmillr/chokidar)

```js
import serve from 'create-serve';
import chokidar from 'chokidar';

serve.start();

chokidar.watch('.').on('change', () => {
    serve.update();
});
```

<br>

[esbuild](https://esbuild.github.io/api/#watch)

Use the official wrapper for esbuild's watch &nbsp; → &nbsp; [esbuild-serve](https://github.com/nativew/esbuild-serve)

<br>

### Log

Import the util functions to log updates with colours.

```js
import serve, { error, log } from 'create-serve';

serve.update();

hasError
    ? error('× Failed') // Red
    : log('✓ Updated'); // Green
```

<br><br>

<p>
    <a href="https://github.com/nativew/nativeweb">
        <img src="https://raw.githubusercontent.com/nativew/nativeweb/1e9405c629e3a6491bb59df726044eb3823967bb/logo-square_nativeweb.svg" alt="Native Web" width="80px">
    </a>
</p>

<div></div>
