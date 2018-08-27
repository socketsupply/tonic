class Tonic {
  constructor ({ node, state } = {}) {
    this.props = {}
    this.state = state || {}
    const name = Tonic._splitName(this.constructor.name)
    this.root = node || document.createElement(name)
    this.root._id = Tonic._createId()
    this.root.disconnect = index => this._disconnect(index)
    this.root.reRender = v => this.reRender(v)
    this.root.setState = v => this.setState(v)
    this.root.getProps = () => this.getProps()
    this.root.getState = () => this.getState()
    this._bindEventListeners()
    if (this.wrap) {
      const render = this.render
      this.render = () => this.wrap(render.bind(this))
    }
    this._connect()
    Tonic.refs.push(this.root)
  }

  static _createId () {
    return Math.random().toString(16).slice(2, 8)
  }

  static match (el, s) {
    if (!el.matches) el = el.parentElement
    return el.matches(s) ? el : el.closest(s)
  }

  static add (c) {
    c.prototype._props = Object.getOwnPropertyNames(c.prototype)
    if (!c.name || c.name.length === 1) throw Error('Mangling detected, see guide. https://github.com/hxoht/tonic/blob/master/HELP.md.')

    const name = Tonic._splitName(c.name)
    Tonic.registry[name.toUpperCase()] = Tonic[c.name] = c
    Tonic.tags = Object.keys(Tonic.registry)
    if (c.registered) throw new Error(`Already registered ${c.name}`)
    c.registered = true

    if (!Tonic.styleNode) {
      const styleTag = document.createElement('style')
      styleTag.setAttribute('nonce', Tonic.nonce)
      Tonic.styleNode = document.head.appendChild(styleTag)
    }

    Tonic._constructTags()
  }

  static _constructTags (root, states = {}) { /* eslint-disable no-new */
    for (const tagName of Tonic.tags) {
      for (const node of (root || document).getElementsByTagName(tagName)) {
        if (!node.disconnect) new Tonic.registry[tagName]({ node, state: states[node.id] })
      }
    }
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

  static _splitName (s) {
    return s.match(/[A-Z][a-z]*/g).join('-')
  }

  html ([s, ...strings], ...values) {
    const reduce = (a, b) => a.concat(b, strings.shift())
    const filter = s => s && (s !== true || s === 0)
    const ref = v => {
      if (typeof v === 'object' || typeof v === 'function') return this._prop(v)
      if (typeof v === 'number') return `${v}__float`
      return v
    }
    return values.map(ref).reduce(reduce, [s]).filter(filter).join('')
  }

  setState (o) {
    this.state = typeof o === 'function' ? o(this.state) : o
  }

  getState () {
    return this.state
  }

  reRender (o = this.props) {
    const oldProps = JSON.parse(JSON.stringify(this.props))
    this.props = Tonic.sanitize(typeof o === 'function' ? o(this.props) : o)
    if (!this.root) throw new Error('.reRender called on destroyed component, see guide.')
    Tonic._constructTags(this.root, this._setContent(this.root, this.render()))
    this.updated && this.updated(oldProps)
  }

  getProps () {
    return this.props
  }

  _bindEventListeners () {
    const hp = Object.getOwnPropertyNames(window.HTMLElement.prototype)
    for (const p of this._props) {
      if (hp.indexOf('on' + p) === -1) continue
      this.root.addEventListener(p, e => this[p](e))
    }
  }

  _setContent (target, content = '') {
    const states = {}
    for (const tagName of Tonic.tags) {
      for (const node of target.getElementsByTagName(tagName)) {
        const index = Tonic.refs.findIndex(ref => ref === node)
        if (index === -1) continue
        states[node.id] = node.getState()
        node.disconnect(index)
      }
    }

    if (typeof content === 'string') {
      target.innerHTML = content.trim()

      if (this.styles) {
        const styles = this.styles()
        Array.from(target.querySelectorAll('[styles]')).forEach(el =>
          el.getAttribute('styles').split(/\s+/).forEach(s =>
            Object.assign(el.style, styles[s.trim()])))
      }
    } else {
      while (target.firstChild) target.removeChild(target.firstChild)
      target.appendChild(content.cloneNode(true))
    }
    this.root = target
    return states
  }

  _prop (o) {
    const id = this.root._id
    const p = `__${id}__${Tonic._createId()}__`
    if (!Tonic._data[id]) Tonic._data[id] = {}
    Tonic._data[id][p] = o
    return p
  }

  _connect () {
    for (let { name, value } of this.root.attributes) {
      name = name.replace(/-(.)/g, (_, m) => m.toUpperCase())
      const p = this.props[name] = value

      if (/__\w+__\w+__/.test(p)) {
        const { 1: root } = p.split('__')
        this.props[name] = Tonic._data[root][p]
        continue
      } else if (/\d+__float/.test(p)) {
        this.props[name] = parseFloat(p, 10)
      }
    }

    this.props = Tonic.sanitize(this.props)

    for (const [k, v] of Object.entries(this.defaults ? this.defaults() : {})) {
      if (!this.props[k]) this.props[k] = v
    }

    this.willConnect && this.willConnect()
    this.children = this.children || this.root.innerHTML
    this._setContent(this.root, this.render())
    Tonic._constructTags(this.root)
    const style = this.stylesheet && this.stylesheet()

    if (style && !Tonic.registry[this.root.tagName].styled) {
      Tonic.registry[this.root.tagName].styled = true
      Tonic.styleNode.appendChild(document.createTextNode(style))
    }

    this.connected && this.connected()
  }

  _disconnect (index) {
    this.disconnected && this.disconnected()
    delete Tonic._data[this.root._id]
    delete this.root
    Tonic.refs.splice(index, 1)
  }
}

Tonic.tags = []
Tonic.refs = []
Tonic._data = {}
Tonic.registry = {}
Tonic.escapeRe = /["&'<>`]/g
Tonic.escapeMap = { '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;' }

if (typeof module === 'object') module.exports = Tonic
