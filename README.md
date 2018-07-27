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
- "Isomorphic" components add a huge amount of unwanted complexity to a
component library. I don't send html from a server very often. My html
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

# MORE DOCS
Visit [this][0] page.

[0]:https://hxoht.github.io/tonic/
