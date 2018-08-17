class Tonic {
  constructor (node) {
    this.props = {}
    this.state = {}
    const name = Tonic._splitName(this.constructor.name)
    this.root = node || document.createElement(name)
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
      Tonic.styleNode = document.head.appendChild(document.createElement('style'))
    }

    Tonic._constructTags()
  }

  static _constructTags (root) { /* eslint-disable no-new */
    for (const tagName of Tonic.tags) {
      for (const node of (root || document).getElementsByTagName(tagName)) {
        if (!node.disconnect) new Tonic.registry[tagName](node)
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
    const reducer = (a, b) => a.concat(b, strings.shift())
    const filter = s => s && (s !== true || s === 0)
    return values.reduce(reducer, [s]).filter(filter).join('')
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
    this._setContent(this.root, this.render())
    Tonic._constructTags(this.root)
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
    for (const tagName of Tonic.tags) {
      for (const node of target.getElementsByTagName(tagName)) {
        const index = Tonic.refs.findIndex(ref => ref === node)
        if (index === -1) continue
        node.disconnect(index)
      }
    }

    if (typeof content === 'string') {
      target.innerHTML = content.trim()
    } else {
      while (target.firstChild) target.removeChild(target.firstChild)
      target.appendChild(content.cloneNode(true))
    }
    this.root = target
  }

  _connect () {
    for (let { name, value } of this.root.attributes) {
      name = name.replace(/-(.)/g, (_, m) => m.toUpperCase())
      const p = this.props[name] = value === 'undefined' ? undefined : (value || name)

      const m = p && p[0] === '{' && /{(.+)}/.exec(p)
      if (m && m[1]) {
        try {
          this.props[name] = JSON.parse(m[1])
        } catch (err) {
          this.props[name] = m[1]
          console.error(`Parse error (${name}), ${err.message}`)
        }
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

    if (this.style && !Tonic.registry[this.root.tagName].styled) {
      Tonic.registry[this.root.tagName].styled = true
      const textNode = document.createTextNode(this.style())
      Tonic.styleNode.appendChild(textNode)
    }

    this.connected && this.connected()
  }

  _disconnect (index) {
    this.disconnected && this.disconnected()
    delete this.root
    Tonic.refs.splice(index, 1)
  }
}

Tonic.tags = []
Tonic.refs = []
Tonic.registry = {}
Tonic.escapeRe = /["&'<>`]/g
Tonic.escapeMap = { '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;' }

if (typeof module === 'object') module.exports = Tonic
