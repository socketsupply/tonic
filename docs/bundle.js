(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"..":2}],2:[function(require,module,exports){
class Tonic extends window.HTMLElement {
  constructor () {
    super()
    this.props = {}
    this.state = {}
    if (this.shadow) this.attachShadow({ mode: 'open' })
    this._bindEventListeners()
  }

  static match (el, s) {
    while (!el.matches) {
      el = el.parentNode
      if (el.tagName === 'HTML') return null
    }
    return el.matches(s) ? el : el.closest(s)
  }

  static add (c, opts = {}) {
    const name = c.name.match(/[A-Z][a-z]*/g).join('-').toLowerCase()
    if (window.customElements.get(name)) return

    const methods = Object.getOwnPropertyNames(c.prototype)
    c.prototype.events = []
    if (opts.shadow) c.prototype.shadow = true

    for (const key in this.prototype) {
      const k = key.slice(2)
      if (methods.includes(k)) {
        c.prototype.events.push(k)
      }
    }

    window.customElements.define(name, c)
  }

  static sanitize (o) {
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'object') o[k] = Tonic.sanitize(v)
      if (typeof v === 'string') o[k] = Tonic.escape(v)
    }
    return o
  }

  static escape (s) {
    return s.replace(Tonic.escapeRe, ch => Tonic.escapeMap[ch])
  }

  html ([s, ...strings], ...values) {
    const reducer = (a, b) => a.concat(b, strings.shift())
    const filter = s => s && (s !== true || s === 0)
    return Tonic.sanitize(values).reduce(reducer, [s]).filter(filter).join('')
  }

  disconnectedCallback (...args) {
    this.disconnected && this.disconnected(...args)
  }

  attributesChangedCallback (...args) {
    this.attributeChanged && this.attributeChanged(...args)
  }

  adoptedCallback (...args) {
    this.adopted && this.adopted(...args)
  }

  setProps (o) {
    this.props = Tonic.sanitize(typeof o === 'function' ? o(this.props) : o)
    if (!this.root) throw new Error('Component not yet connected')
    this.root.appendChild(this._setContent(this.render()))
  }

  _bindEventListeners () {
    this.events.forEach(event => {
      this.addEventListener(event, e => this[event](e))
    })
  }

  _setContent (content) {
    // if (this.styleNode) this.root.parentNode.removeChild(this.styleNode)
    while (this.root.firstChild) this.root.firstChild.remove()
    let node = content
    if (typeof content === 'string') {
      const tmp = document.createElement('tmp')
      tmp.innerHTML = content
      node = tmp.firstElementChild
    }
    console.log('>>>', node)
    if (this.styleNode) node.appendChild(this.styleNode)
    return node
  }

  connectedCallback () {
    for (let { name, value } of this.attributes) {
      if (name === 'id') this.setAttribute('id', value)
      if (name === 'data') value = JSON.parse(value)
      this.props[name] = value
    }
    this.root = (this.shadowRoot || this)
    this.props = Tonic.sanitize(this.props)
    this.root.appendChild(this._setContent(this.render()))
    this.connected && this.connected()

    if (this.stylesheet) {
      const style = document.createElement('style')
      style.textContent = this.stylesheet
      this.styleNode = this.root.appendChild(style)
    }
  }
}

Tonic.escapeRe = /["&'<>`]/g
Tonic.escapeMap = { '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;' }

if (typeof module === 'object') module.exports = Tonic

},{}]},{},[1]);
