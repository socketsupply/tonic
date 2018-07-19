# SYNOPSIS
A minimalist [composable component][A] inspired by React.

# GOALS
- Quickly read and understand the whole codebase; `~100` lines.
- React-like component composition.
- One-way binding; pipe data though connected components.
- Single source event dispatch; no event rebinding needed.
- Routing agnostic (not all UIs are intended to run in a browser).
- Server and client side rendering.

# NON-GOALS
- Re-rendering performance is not important in all cases. `innerHTML`
is fast enough for most cases. And while the "vdom everywhere" approach
might make code easy to reason about at a high level, it ends up being
a compromise when performance actually matters. When programming for
performance, target exact nodes and manage updates explicitly.
- JSX
- Magic

# USAGE
Install using npm, yarn, etc.

```bash
npm install hxoht/tonic
```

Import the component constructor.

```js
const Tonic = require('tonic')
```

An (incomplete) example.

```js
class Box extends Tonic {
  //
  // You can listen to any dom event by creating a method with
  // the corresponding name. The method will receive the plain
  // old Javascript event object.
  //
  mouseover (e) {
    e.target.style.backgroundColor = '#aaa'
  }

  // 
  // You can test if the element that was clicked matches a
  // selector by using the Tonic.match() method.
  //
  mouseout (e) {
    if (!Tonic.match(e.target, '.box')) return

    e.target.style.backgroundColor = '#fff'
  }

  //
  // Render must return one root element (which can contain as
  // many elements as you want). The root must have ${this.id}
  // if you want to listen to dom or lifecycle events.
  //
  render (props) {
    return `
      <div ${this.id} class="box">
        Box (${props.n})
      </div>
    `
  }
}

const box = new Box()
```

A component that will contain the `box` component.

```js
class BoxContainer extends Tonic {
  //
  // A constructor is not required.
  //
  constructor (props) {
    super(props)

    //
    // One way of adding styles (check the render function
    // for how it's used). Since it's just a string it could
    // be rendered into a style tag and could even be read-in
    // from a separate file.
    //
    this.style = `
      border: 1px solid blue;
      height: 200px;
      width: 200px;
    `
  }

  //
  // The mount event is fired once the root element is attached
  // to the dom.
  //
  mount (el) {
    console.log('mounted!')
  }

  click (e) {
    //
    // Set state on a component instance or on this instance,
    // .setProps() will cause a downward cascade of re-rendering.
    //
    box.setProps({ n: someRandomNumber })
  }

  //
  // Calling the render method of a component will return its
  // html.
  //
  render (props) {
    return `
      <div ${this.id} style="${this.style}">
        Container ${box.render(props)}
      </div>
    `
  }
}
```

## CLIENT SIDE RENDERING
The root component can be attached to any node.

```js
const container = new BoxContainer({ n: 100 })
container.attach(document.body)
```

Alternatively, you can insert the componet (where `element` is a valid dom
node, something like `document.body`)...

```js
container.insert([element], [position])
```

- `beforebegin`: Before the element itself.
- `afterbegin`: Just inside the element, before its first child.
- `beforeend`: Just inside the element, after its last child (*default*).
- `afterend`: After the element itself.

## SERVER SIDE RENDERING
The render method returns a string.

```js
http.createServer((req, res) => {
  const container = new BoxContainer({ n: 100 })
  res.end(container.render())
})
```

# EXTENDING
The following built-in methods are static and can be overridden
by assigning new functions to the property name.

### `Tonic.html`
A [tagged template][0] function that will tidy the html returned by
the render function.

### `Tonic.clean`
A sanitation function that uses [he][1] to escape strings found in
object literals. This helps prevent XSS.

[A]:https://hxoht.github.io/tonic/
[0]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
[1]:https://github.com/mathiasbynens/he
