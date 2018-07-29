![tonic](https://github.com/hxoht/tonic/raw/addimage/readme-tonic.png)

# SYNOPSIS
A minimalist component library inspired by React, based on Web Components.

# GOALS
- Quickly read and understand the whole codebase; `~100` lines.
- React-like component composition.
- One-way binding; pipe data though connected components.
- Single source event dispatch; no event rebinding needed.
- Bring your own Routers, Reducers, Validators, etc.
- True encapsulation via standard web technology.

# NON-GOALS
- When re-rendering performance is *truly* important, a virtual dom is
not the right tool. In these cases you should either A. update some
specific dom nodes directly or B. use a graphics/animation engine. The
one-way-everywhere approach might make some code easy to reason about,
but it ends up being a performance compromise with added complexity.
- "Isomorphic" components add a huge amount of complexity to a component
library. I don't send html from a server very often. My html
pages are pretty static and served by a cdn. Otherwise, I'm creating
electron apps for the decentralized web. This may be a deal breaker for
some people doing more traditional client-server development.
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

# EXAMPLE
```js
class ChildComponent extends Tonic {
  //
  // A constructor is not required.
  //
  constructor (props) {
    super(props)

    //
    // One way of adding styles (check the render function
    // for how it's used). Since it's just a string it could
    // be read-in from a separate file at compile-time.
    //
    this.stylesheet = `
      <style>
        div {
          display: inline-block;
          border: 1px dotted #666;
          height: 100px;
          width: 100px;
          line-height: 90px;
        }
      </style>
    `
  }

  //
  // You can listen to any dom event by creating a method with
  // the corresponding name. The method will receive the plain
  // old Javascript event object.
  //
  mouseover (e) {
    e.target.style.backgroundColor = someRandomColor
  }

  mouseout (e) {
    e.target.style.backgroundColor = '#fff'
  }

  //
  // The render function should return a string. This could
  // come from an external file or it can be a string of html.
  //
  render () {
    return `
      <div class="child">
        Child ${this.props.value}
      </div>
    `
  }
}
```

# API

## STATIC METHODS

| Method | Description |
| :--- | :--- |
| add(Class, Object) | Register a class as a new custom-tag and provide optional options for it. |
| escape(String) | Returns html to be parsed or a dom node that will overwrite. |
| sanitize(Object) | Escapes all the strings found in an object literal. |
| match(Node, Selector) | Match the given node against a selector or any matching parent of the given node. This is useful when trying to locate a node from the actual node that was interacted with. |

## INSTANCE METHODS

| Method | Description |
| :--- | :--- |
| setProps(Object) | Set the properties of a component instance. |
| render() | Returns html to be parsed or a dom node that will overwrite. There is usually no need to call this directly, prefer `componentInstance.setProps({ ... })`. |
| html\`...\` | Tidy up an html string (use as a [tagged template][2]). |

## "LIFECYCLE" INSTANCE METHODS

The standard "[reactions][1]" (aka lifecycle methods) are available on every
component.

| Method | Description |
| :--- | :--- |
| constructor | An instance of the element is created or upgraded. Useful for initializing state, settings up event listeners, or creating shadow dom. See the spec for restrictions on what you can do in the constructor. |
| connected | Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time. |
| disconnected | Called every time the element is removed from the DOM. Useful for running clean up code. |
| attributeChanged(attrName, oldVal, newVal) | Called when an observed attribute has been added, removed, updated, or replaced. Also called for initial values when an element is created by the parser, or upgraded. Note: only attributes listed in the observedAttributes property will receive this callback. |
| adopted | The custom element has been moved into a new document (e.g. someone called document.adoptNode(el)). |

## MORE DOCS AND EXAMPLES
Visit [this][0] demo page for more information.

[0]:https://hxoht.github.io/tonic/
[1]:https://developers.google.com/web/fundamentals/web-components/customelements
[2]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
