# SYNOPSIS
A minimalist composable component inspired by React.

# MOTIVATION
`Web Components` have weird opinions & caveats. React is `85,000 Lines Of
Code` and has a lot of features i'm not interested in. Also not all UIs
built with the web stack are intended to run in a browser (electron, etc).

# GOALS
- Inder a minute or two to grock, `< ~100LOC`.
- Easy to compose components.
- One-way binding.
- Single source event dispatch.
- Routing agnostic.

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
