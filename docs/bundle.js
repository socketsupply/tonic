(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"..":2}],2:[function(require,module,exports){
class Tonic {
  constructor (props = {}, state = {}) {
    this.props = props
    this.state = state
    this.componentid = Tonic.createid(2)
    Tonic.registry[this.componentid] = this
    this._escapeRe = /["&'<>`]/g
    this._escapeMap = {
      '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;'
    }
  }

  static match (el, s) {
    while (!el.matches) {
      el = el.parentNode
      if (el.tagName === 'HTML') return null
    }
    return el.matches(s) ? el : el.closest(s)
  }

  static createid (s = 2, e) {
    return Math.random().toString(16).slice(s, e)
  }

  static find (cmp) {
    return Object.values(Tonic.registry).find(cmp)
  }

  get id () {
    return `data-componentid="${this.componentid}"`
  }

  html ([s, ...strings], ...values) {
    const escape = s => s.replace(this._escapeRe, ch => this._escapeMap[ch])
    const reducer = (a, b) => a.concat(b, escape(strings.shift()))
    const filter = s => s && (s !== true || s === 0)
    return values.reduce(reducer, [s]).filter(filter).join('')
  }

  setProps (o) {
    this.props = o
    this.rerender()
  }

  async rerender () {
    const tmp = document.createElement('tmp')

    tmp.innerHTML = this.html`${this.isAsync()
      ? await this.render(this.props)
      : this.render(this.props)
    }`

    const child = tmp.firstElementChild
    this.el.parentNode.replaceChild(child, this.el)
    this.el = child
  }

  dispatch (e) {
    let el = e.target

    while (true) {
      el = Tonic.match(el, `[data-componentid]`)
      if (!el) break

      const component = Tonic.registry[el.dataset.componentid]
      if (component && component[e.type]) component[e.type](e)

      el = el.parentNode
    }
  }

  isAsync () {
    return this.render[Symbol.toStringTag] === 'AsyncFunction'
  }

  async attach (el) {
    const tmp = document.createElement('tmp')
    tmp.innerHTML = this.html`${this.isAsync()
      ? await this.render(this.props)
      : this.render(this.props)
    }`

    el.insertAdjacentElement('beforeend', tmp.firstElementChild)

    const ids = [...document.body.querySelectorAll('[data-componentid]')]

    for (const c of ids) {
      const component = Tonic.registry[c.dataset.componentid]
      component.el = c
      if (component && component.mount && !component.mounted) {
        component.mount(c)
        component.mounted = true
      }
    }

    if (Tonic.bound) return
    Tonic.bound = true

    for (const key in document.body) {
      if (key.search('on') !== 0) continue
      document.body.addEventListener(key.slice(2), e => this.dispatch(e))
    }
  }
}

Tonic.registry = {}
if (typeof module === 'object') module.exports = Tonic

},{}]},{},[1]);
