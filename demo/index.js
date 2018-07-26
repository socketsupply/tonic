const Tonic = require('..')

class Box extends Tonic {
  constructor (props) {
    super(props)

    this.style = `
      border: 1px dotted #666;
      height: 100px;
      width: 100px;
      margin: 20px auto;
      line-height: 90px;
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
      <div ${this.id} style="${this.style}">
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
      user-select: none;
      border: 1px solid #999;
      height: 200px;
      width: 200px;
      padding: 20px;
      margin: auto;
      text-align: center;
    `
  }

  click (e) {
    box.setProps({ n: Math.random().toString(16).slice(2, 4) })
  }

  render (props) {
    return `
      <div ${this.id} style="${this.style}">
        Box Container ${box.render(props)}
      </div>
    `
  }
}

const container = new Container({ n: '0f' })
container.attach(document.querySelector('#demo'))
