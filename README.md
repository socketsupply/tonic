![tonic](https://github.com/hxoht/tonic/raw/addimage/readme-tonic.png)

# SYNOPSIS
A minimalist component library inspired by React and Web Components.

# GOALS
- Quickly read and understand the whole codebase; `~150` lines.
- React-like component composition.
- One-way binding; pipe data though connected components.
- Single source event dispatch; no event rebinding needed.
- Bring your own Routers, Reducers, Validators, etc.

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
You can find an api doc [here][0], and a trouble shooting guide [here][1].

```bash
npm install hxoht/tonic
```

# EXAMPLE
```js
class Greeting extends Tonic {
  style () {
    return `
      greeting div {
        display: inline-block;
        border: 1px dotted #666;
        height: 100px;
        width: 100px;
        line-height: 90px;
      }
    `
  }

  click (event) {
    alert(this.innerHTML)
  }

  render () {
    return `
      <h1 class="example">
        ${this.props.value}
      </h1>
    `
  }
}

Tonic.add(Greeting)
```

```xml
<greeting value="Hello, World">
</greeting>
```

[0]:/API.md
[1]:/HELP.md
