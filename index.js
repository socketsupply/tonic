class Tonic extends window.HTMLElement {
  constructor () {
    super()
    const state = Tonic._states[this.id]
    delete Tonic._states[this.id]
    this.state = state || {}
    this.props = {}
    this.root = this.shadowRoot || this
    this._events()
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

    if (!c.name || c.name.length === 1) {
      throw Error('Mangling. https://bit.ly/2TkJ6zP')
    }

    const name = Tonic._splitName(c.name).toLowerCase()
    if (window.customElements.get(name)) return

    Tonic._reg[name] = c
    Tonic._tags = Object.keys(Tonic._reg)
    window.customElements.define(name, c)
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
    return s.replace(Tonic.ERE, ch => Tonic.MAP[ch])
  }

  static _splitName (s) {
    return s.match(/[A-Z][a-z]*/g).join('-')
  }

  html ([s, ...strings], ...values) {
    const reduce = (a, b) => a.concat(b, strings.shift())
    const filter = s => s && (s !== true || s === 0)
    const ref = o => {
      switch (({}).toString.call(o).slice(8, -1)) {
        case 'HTMLCollection':
        case 'NodeList':
          const v = [...o].map(node => node.cloneNode(true))
          return this._placehold(v)
        case 'Array':
        case 'Object':
        case 'Function': return this._prop(o)
        case 'Number': return `${o}__float`
        case 'Boolean': return `${o}__boolean`
      }
      return o
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
    const p = typeof o === 'function' ? o(this.props) : o
    this.props = Tonic.sanitize(p)
    this._set(this.root, this.render())

    if (this.updated) {
      const oldProps = JSON.parse(JSON.stringify(this.props))
      this.updated(oldProps)
    }
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
    target.querySelectorAll(Tonic._tags.join()).forEach(node => {
      const index = Tonic._refs.findIndex(ref => ref === node)
      if (index === -1) return
      Tonic._states[node.id] = node.getState()
    })

    if (typeof content === 'string') {
      target.innerHTML = content.trim()

      if (this.styles) {
        const styles = this.styles()
        target.querySelectorAll('[styles]').forEach(el =>
          el.getAttribute('styles').split(/\s+/).forEach(s =>
            Object.assign(el.style, styles[s.trim()])))
      }

      target.querySelectorAll('tonic-children').forEach(el => {
        const nodes = Tonic._children[this._id][el.id]
        nodes.forEach(node => el.parentNode.insertBefore(node, el))

        delete Tonic._children[el.id]
        el.parentNode.removeChild(el)
      })
    } else {
      target.innerHTML = ''
      target.appendChild(content.cloneNode(true))
    }

    if (this.stylesheet) {
      const styleNode = document.createElement('style')
      const source = document.createTextNode(this.stylesheet())
      styleNode.appendChild(source)
      target.insertBefore(styleNode, target.firstChild)
    }
    this.root = target
  }

  _prop (o) {
    const id = this._id
    const p = `__${id}__${Tonic._createId()}__`
    if (!Tonic._data[id]) Tonic._data[id] = {}
    Tonic._data[id][p] = o
    return p
  }

  _placehold (r) {
    const id = this._id
    const ref = Tonic._createId()
    if (!Tonic._children[id]) Tonic._children[id] = {}
    Tonic._children[id][ref] = r
    return `<tonic-children id="${ref}"/></tonic-children>`
  }

  connectedCallback () {
    this.root = (this.shadowRoot || this)
    this._id = Tonic._createId()

    if (this.wrap) {
      const render = this.render
      this.render = () => this.wrap(render.bind(this))
    }

    Tonic._refs.push(this)

    for (let { name, value } of this.attributes) {
      name = name.replace(/-(.)/g, (_, m) => m.toUpperCase())
      const p = this.props[name] = value

      if (/__\w+__\w+__/.test(p)) {
        const { 1: root } = p.split('__')
        this.props[name] = Tonic._data[root][p]
      } else if (/\d+__float/.test(p)) {
        this.props[name] = parseFloat(p, 10)
      } else if (/\w+__boolean/.test(p)) {
        this.props[name] = p.includes('true')
      }
    }
    this.props = Object.assign(
      (this.defaults && this.defaults()) || {},
      Tonic.sanitize(this.props))

    this.willConnect && this.willConnect()
    this._set(this.root, this.render())
    this.connected && this.connected()
  }

  disconnectedCallback (index) {
    this.disconnected && this.disconnected()
    delete Tonic._data[this._id]
    delete Tonic._children[this._id]
    delete this.root
    Tonic._refs.splice(index, 1)
  }
}

Object.assign(Tonic, {
  _tags: [],
  _refs: [],
  _data: {},
  _states: {},
  _children: {},
  _reg: {},
  ERE: /["&'<>`]/g,
  MAP: { '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;' }
})

if (typeof module === 'object') module.exports = Tonic
