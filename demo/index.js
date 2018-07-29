const Tonic = require('..')

class ChildComponent extends Tonic {
  constructor (props) {
    super(props)

    this.stylesheet = `
      div {
        display: inline-block;
        border: 1px dotted #666;
        height: 100px;
        width: 100px;
        margin-top: 15px;
        line-height: 90px;
      }
    `
  }

  mouseover (e) {
    const r = Math.random().toString(16).slice(2, 8)
    const div = this.shadowRoot.querySelector('div')
    div.style.backgroundColor = r
  }

  mouseout (e) {
    const div = this.shadowRoot.querySelector('div')
    div.style.backgroundColor = 'fff'
  }

  render () {
    return this.html`
      <div>
        Child ${this.props.number}
      </div>
    `
  }
}

class ParentComponent extends Tonic {
  constructor (props) {
    super(props)

    this.stylesheet = `
      :host {
        display: inline-block;
      }
      .parent {
        display: inline-block;
        user-select: none;
        border: 1px solid #999;
        height: 200px;
        width: 200px;
        padding: 20px;
        margin: auto;
        text-align: center;
      }
    `
  }

  click (e) {
    if (!e.target.matches('.parent')) return
    this.setProps({ number: Math.random().toString(16).slice(2, 4) })
  }

  render (props) {
    return this.html`
      <div class="parent">
        Parent
        <child-component number=${this.props.number}>
        </child-component>
      </div>
    `
  }
}

Tonic.add(ChildComponent, { shadow: true })
Tonic.add(ParentComponent)

document.querySelector('#demo').innerHTML = `<parent-component/>`
