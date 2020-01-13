# Migrating from v10 to v11

The implementation of HTML escaping changed between v10 and v11
of `@optoolco/tonic`.

The main takeaway is that v10 had a potential XSS injection as
we only escaped strings that exist on `this.props.someKey`,
we've now changed the implementation to sanitize all strings
that are passed into ``this.html`<div>${someStr}<div>```.

This breaks some existing patterns that are common in applications
like the following

```js
class Comp extends Windowed {
  render () {
    return this.html`
      <div>
        <header>Some header</header>
        ${super.render()}
      </div>
    `
  }
}
```

Or

```js
class Toaster extends Tonic {
  render () {
    return this.html`
      <div>
        ${this.renderIcon()}
        ${this.renderLabel()}
        <div>${title}</div>
      </div>
    `
  }
}
```

In both cases the HTML returned from either `super.render()` or
from `this.renderIcon()` is now being escaped which is probably
not the desired behavior.

You will have to patch the code to call
`${Tonic.raw(this.renderIcon())}` or
`${Tonic.raw(super.render())}`

If you want to quickly find all occurences of the above patterns
you can run the following git grep on your codebase.

```sh
git grep -C10 '${' | grep ')}'
```

The fix is to add `Tonic.raw()` calls in various places.

We have updated `@optoolco/components` and you will have to
update to version `7.4.0` as well

```sh
npm install @optoolco/components@^7.4.0 -ES
```
