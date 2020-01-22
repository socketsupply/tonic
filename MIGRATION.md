# Migrating from v10 to v11

The implementation of HTML escaping changed between v10 and v11
of `@optoolco/tonic`.

The main takeaway is that v10 had a potential XSS injection as
we only escaped strings that exist on `this.props.someKey`,
we've now changed the implementation to sanitize all strings
that are passed into ``this.html`<div>${someStr}<div>`;``.

This breaks some existing patterns that are common in applications
like the following

```js
class Comp extends Tonic {
  renderLabel () {
    return `<label>${this.props.label}</label>`
  }

  render () {
    return this.html`
      <div>
        <header>Some header</header>
        ${this.renderLabel()}
      </div>
    `
  }
}
```

In this case the HTML returned from `this.renderLabel()` is now
being escaped which is probably not what you meant.

You will have to patch the code to use `this.html` for the
implementation of `renderLabel()` like

```js
  renderLabel () {
    return this.html`<label>${this.props.label}</label>`
  }
```

Or to call `Tonic.raw()` manually like

```js
  render () {
    return this.html`
      <div>
        <header>Some header</header>
        ${Tonic.raw(this.renderLabel())}
      </div>
    `
  }
```

If you want to quickly find all occurences of the above patterns
you can run the following git grep on your codebase.

```sh
git grep -C10 '${' | grep ')}'
```

The fix is to add `this.html` calls in various places.

We have updated `@optoolco/components` and you will have to
update to version `7.4.0` as well

```sh
npm install @optoolco/components@^7.4.0 -ES
```

There are other situations in which the increased escaping from
`Tonic.escape()` like for example escaping the `"` character if
you dynamically generate optional attributes

Like:

```js
class Icon extends Tonic {
  render () {
    return this.html`<svg ${tabAttr} styles="icon">
      <use
        width="${size}"
        ${fill ? `fill="${fill}" color="${fill}"` : ''}
        height="${size}">
    </svg>`
  }
}
```

In the above example we do ``fill ? `fill="${fill}"` : ''`` which
leads to `"` getting escaped to `&quot;` and leads to the value
of `use.getAttribute('fill')` to be `"${fill}"` instead of `${fill}`

Here is a regex you can use to find the one-liner use cases.

```
git grep -E '`(.+)="'
```

When building dynamic attribute lists `Tonic` has a spread feature
in the `this.html()` function you can use instead to make it easier.

For example, you can refactor the above `Icon` class to:

```js
class Icon extends Tonic {
  render () {
    return this.html`<svg ${tabAttr} styles="icon">
      <use ...${{
        width: size,
        fill,
        color: fill,
        height: size
      }}>
    </svg>`
  }
}
```

Here we use `...${{ ... }}` to expand an object of attributes to
attribute key value pairs in the HTML. You can also pull out the attrs
into a reference if you prefer, like:

```js
class Icon extends Tonic {
  render () {
    const useAttrs = {
      width: size,
      fill,
      color: fill,
      height: size
    }
    return this.html`<svg ${tabAttr} styles="icon">
      <use ...${useAttrs}>
    </svg>`
  }
}
```
