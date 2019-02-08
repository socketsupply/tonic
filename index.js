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

  static add (c, root) {
    c.prototype._props = Object.getOwnPropertyNames(c.prototype)
    if (!c.name || c.name.length === 1) throw Error('Mangling detected. https://github.com/heapwolf/tonic/blob/master/HELP.md')

    const name = Tonic._splitName(c.name)
    Tonic.registry[name.toUpperCase()] = Tonic[c.name] = c
    Tonic.tags = Object.keys(Tonic.registry)
    if (c.registered) throw new Error(`Already registered ${c.name}`)
    c.registered = true

    if (!Tonic.styleNode) {
      const styleTag = document.createElement('style')
      Tonic.nonce && styleTag.setAttribute('nonce', Tonic.nonce)
      Tonic.styleNode = document.head.appendChild(styleTag)
    }

    if (root || c.name === 'App') Tonic.init(root || document.firstElementChild)
  }

  static init (node = document.firstElementChild, states = {}) {
    node = node.firstElementChild

    while (node) {
      const tagName = node.tagName

      if (Tonic.tags.includes(tagName)) { /* eslint-disable no-new */
        new Tonic.registry[tagName]({ node, state: states[node.id] })
        node = node.nextElementSibling
        continue
      }

      Tonic.init(node, states)
      node = node.nextElementSibling
    }
  }

  static sanitize (o) {
    if (o === null) return o
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
      if (typeof v === 'object' && v.__children__) return this._children(v)
      if (typeof v === 'object' || typeof v === 'function') return this._prop(v)
      if (typeof v === 'number') return `${v}__float`
      if (typeof v === 'boolean') return `${v.toString()}`
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
    Tonic.init(this.root, this._setContent(this.root, this.render()))
    this.updated && this.updated(oldProps)
  }

  getProps () {
    return this.props
  }

  handleEvent (e) {
    this[e.type](e)
  }

  _bindEventListeners () {
    const hp = Object.getOwnPropertyNames(window.HTMLElement.prototype)
    for (const p of this._props) {
      if (hp.indexOf('on' + p) === -1) continue
      this.root.addEventListener(p, this)
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

      Array.from(target.querySelectorAll('tonic-children')).forEach(el => {
        const root = Tonic._elements[this.root._id]
        Array.from(root[el.id]).forEach(node => {
          el.parentNode.insertBefore(node, el)
        })
        delete root[el.id]
        el.parentNode.removeChild(el)
      })
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

  _children (r) {
    const id = this.root._id
    const ref = Tonic._createId()
    if (!Tonic._elements[id]) Tonic._elements[id] = {}
    Tonic._elements[id][ref] = r
    return `<tonic-children id="${ref}"/></tonic-children>`
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
    this.children = [...this.root.childNodes].map(node => node.cloneNode(true))
    this.children.__children__ = true
    this._setContent(this.root, this.render())
    Tonic.init(this.root)
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
    delete Tonic._elements[this.root._id]
    delete this.root
    Tonic.refs.splice(index, 1)
  }
}

Tonic.tags = []
Tonic.refs = []
Tonic._data = {}
Tonic._elements = {}
Tonic.registry = {}
Tonic.escapeRe = /["&'<>`]/g
Tonic.escapeMap = { '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;' }

if (typeof module === 'object') module.exports = Tonic
