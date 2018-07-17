const Tonic = require('.')

class Box extends Tonic {
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

class Container extends Tonic {
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
    return `
      <div ${this.id()} style="${this.style}">
        Container ${box.render(props)}
      </div>
    `
  }
}

const container = new Container({ n: 100 })
container.attach(document.body)
