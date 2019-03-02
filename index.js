class Tonic {
  constructor ({ node, state } = {}) {
    this.props = {}
    this.state = state || {}
    const name = Tonic._splitName(this.constructor.name)
    const r = this.root = node || document.createElement(name)
    r._id = Tonic._createId()
    r._unmount = index => this._unmount(index)
    r.reRender = v => this.reRender(v)
    r.setState = v => this.setState(v)
    r.getProps = () => this.getProps()
    r.getState = () => this.getState()

    this._events()

    if (this.wrap) {
      const render = this.render
      this.render = () => this.wrap(render.bind(this))
    }

    this._connect()
    Tonic._refs.push(this.root)
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
    if (!c.name || c.name.length === 1) throw Error('Mangling. https://bit.ly/2TkJ6zP')

    const d = document
    const name = Tonic._splitName(c.name)
    Tonic._reg[name.toUpperCase()] = c
    Tonic._tags = Object.keys(Tonic._reg)
    if (c.registered) return
    c.registered = true

    if (!Tonic.styleNode) {
      const t = d.createElement('style')
      Tonic.nonce && t.setAttribute('nonce', Tonic.nonce)
      Tonic.styleNode = d.head.appendChild(t)
    }

    if (root || c.name === 'App') Tonic.init(root || d.firstElementChild)
  }

  static init (node = document.firstElementChild, states = {}) {
    node = node.firstElementChild

    while (node) {
      const t = node.tagName

      if (Tonic._tags.includes(t) && !node._id) { /* eslint-disable no-new */
        new Tonic._reg[t]({ node, state: states[node.id] })
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
      const isObject = typeof v === 'object'
      if (isObject && v.__children__) return this._children(v)
      if (isObject || typeof v === 'function') return this._prop(v)
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
    if (!this.root) return
    const oldProps = JSON.parse(JSON.stringify(this.props))
    this.props = Tonic.sanitize(typeof o === 'function' ? o(this.props) : o)
    Tonic.init(this.root, this._set(this.root, this.render()))
    this.updated && this.updated(oldProps)
  }

  getProps () {
    return this.props
  }

  handleEvent (e) {
    this[e.type](e)
  }

  _events () {
    const hp = Object.getOwnPropertyNames(window.HTMLElement.prototype)
    for (const p of this._props) {
      if (hp.indexOf('on' + p) === -1) continue
      this.root.addEventListener(p, this)
    }
  }

  _set (target, content = '') {
    const states = {}

    // for (const t of Tonic._tags) {
      // for (const node of target.getElementsByTagName(t)) {
    target.querySelectorAll(Tonic._tags.join()).forEach(node => {
      const index = Tonic._refs.findIndex(ref => ref === node)
      if (index === -1) return
      states[node.id] = node.getState()
      node._unmount(index)
    })
      // }
    // }

    if (typeof content === 'string') {
      target.innerHTML = content.trim()

      if (this.styles) {
        const styles = this.styles()
        target.querySelectorAll('[styles]').forEach(el =>
          el.getAttribute('styles').split(/\s+/).forEach(s =>
            Object.assign(el.style, styles[s.trim()])))
      }

      target.querySelectorAll('tonic-children').forEach(el => {
        const root = Tonic._elements[this.root._id]
        root[el.id].forEach(node => {
          el.parentNode.insertBefore(node, el)
        })
        delete root[el.id]
        el.parentNode.removeChild(el)
      })
    } else {
      target.innerHTML = ''
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

    const defaults = this.defaults && this.defaults()
    this.props = Object.assign(Tonic.sanitize(this.props), defaults)

    this.willConnect && this.willConnect()
    this.children = [...this.root.childNodes].map(node => node.cloneNode(true))
    this.children.__children__ = true
    this._set(this.root, this.render())
    Tonic.init(this.root)

    if (this.stylesheet && !Tonic._reg[this.root.tagName].styled) {
      Tonic._reg[this.root.tagName].styled = true
      Tonic.styleNode.appendChild(document.createTextNode(this.stylesheet()))
    }

    this.connected && this.connected()
  }

  _unmount (index) {
    this.disconnected && this.disconnected()
    delete Tonic._data[this.root._id]
    delete Tonic._elements[this.root._id]
    delete this.root
    Tonic._refs.splice(index, 1)
  }
}

Tonic.render = Tonic.add

Object.assign(Tonic, {
  _tags: [],
  _refs: [],
  _data: {},
  _elements: {},
  _reg: {},
  escapeRe: /["&'<>`]/g,
  escapeMap: { '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;' }
})

if (typeof module === 'object') module.exports = Tonic
