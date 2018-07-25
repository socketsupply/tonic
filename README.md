![tonic](https://github.com/hxoht/tonic/raw/addimage/readme-tonic.png)

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
- When re-rendering performance is *truly* important, a virtual dom is
not the right tool. In these cases you should either A. update some
specific dom nodes directly or B. use a graphics/animation engine. The
one-way-everywhere approach might make some code easy to reason about,
but it ends up being a performance compromise with added complexity.
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
  // Render will return a string. It can be an async function,
  // if it is, it can be awaited (don't forget to await attach
  // or insert).
  //
  render (props) {
    return `
      <div ${this.id} style="${this.style}">
        Box Container ${box.render(props)}
      </div>
    `
  }
}
```

## WORKING BETWEEN COMPONENTS
Sometimes you want an instance of a component to tell another one what to do.
You can use `Tonic.find` to to test arbitrary properties and find the one you're
looking for.

```js
class A extends Tonic {
  constructor (props) {
    super(props)
    this.name = 'A'
  }
}

class B extends Tonic {
  someMethod () {
    const component = Tonic.find(c => c.name === 'A')
    component.setProps({})
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

[A]:https://hxoht.github.io/tonic/
[0]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
