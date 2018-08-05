# TROUBLE SHOOTING

### Class Name Mangling
If you are using Uglify (or something similar), it will mangle your class names.
To fix this, just pass the `keep_fnames` option babel-minify has something
similar.

```js
new UglifyJsPlugin({
  uglifyOptions: {
    keep_fnames: true
  },
  extractComments: true,
  parallel: true
})
```

### Babel Transpiler Issues
Built-in classes such as Date, Array, DOM etc cannot be properly subclassed due
to limitations in ES5. This babel plugin will usually fix this problem.

```js
{
  test: /\.js$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  query: {
    presets: [['env', { exclude: ['transform-es2015-classes'] }]]
  }
}
```
