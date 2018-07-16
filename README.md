# SYNOPSIS
A minimalist composable component inspired by React.

# GOALS
- Less than a minute or two to grock the entire codebase, `~100LOC`.
- Preact/React style component composition.
- One-way binding. Pipeline data though connected components.
- Single source event dispatch. No event rebinding needed.
- Routing agnostic.

# NON-GOALS
- Re-rendering performance. The "vdom everywhere" approach makes code
easy to reason about at a high level, but ends up being a compromise
when performance is actually important. In this case I prefer to target
exact nodes and manage updates manually.
- JSX

# USAGE
```bash
npm install hxoht/component
```

```js
const Component = require('.')

class Box extends Component {
  constructor (props) {
    super(props)

    this.style = `
      border: 1px solid red;
      height: 100px;
      width: 100px;
    `
  }

  mouseover (e) {
    const r = Math.random().toString(16).slice(2, 8)
    e.target.style.backgroundColor = r
  }

  mouseout (e) {
    e.target.style.backgroundColor = 'fff'
  }

  render (props) {
    return `
      <div ${this.id()} style="${this.style}">
        Box (${props.n})
      </div>
    `
  }
}

const box = new Box()

class Container extends Component {
  constructor (props) {
    super(props)

    this.style = `
      border: 1px solid blue;
      height: 200px;
      width: 200px;
    `
  }

  mount (el) {
    console.log('mounted!')
  }

  click (e) {
    box.setProps({ n: Math.random().toString(16).slice(2, 4) })
    // ...or this.setProps()
  }

  render (props) {
    //
    // Render must return one root element (which can contain as
    // many elements as you want) which must also have ${this.id}.
    //
    return `
      <div ${this.id} style="${this.style}">
        Container ${box.render(props)}
      </div>
    `
  }
}

const container = new Container({ n: 100 })
container.attach(document.body)
```
