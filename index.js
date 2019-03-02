class Tonic extends window.HTMLElement {
  constructor () {
    super()

    const state = Tonic._states[this.id]
    delete Tonic._states[this.id]

    this.state = state || {}
    this.props = {}
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
    if (!c.name || c.name.length === 1) throw Error('Mangling. https://bit.ly/2TkJ6zP')

    const name = Tonic._splitName(c.name).toLowerCase()
    if (window.customElements.get(name)) return

    Tonic._reg[name.toUpperCase()] = c
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
    return s.replace(Tonic.escapeRe, ch => Tonic.escapeMap[ch])
  }

  static _splitName (s) {
    return s.match(/[A-Z][a-z]*/g).join('-')
  }

  html ([s, ...strings], ...values) {
    const reduce = (a, b) => a.concat(b, strings.shift())
    const filter = s => s && (s !== true || s === 0)
    const ref = v => {
      if (({}).toString.call(v) === '[object HTMLCollection]') {
        return this._placehold([...v].map(node => node.cloneNode(true)))
      }

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
    if (!this.root) return
    const oldProps = JSON.parse(JSON.stringify(this.props))
    this.props = Tonic.sanitize(typeof o === 'function' ? o(this.props) : o)
    this._set(this.root, this.render(this.state, this.props))
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

    this.root = target
  }

  _prop (o) {
    const id = this.root._id
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
    this.root._id = Tonic._createId()

    if (this.wrap) {
      const render = this.render
      this.render = () => this.wrap(render.bind(this))
    }

    Tonic._refs.push(this.root)

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
    this._set(this.root, this.render(this.state, this.props))

    if (this.stylesheet) {
      const styleNode = document.createElement('style')
      const source = document.createTextNode(this.stylesheet())
      styleNode.appendChild(source)
      this.root.insertBefore(styleNode, this.root.firstChild)
    }

    this.connected && this.connected()
  }

  disconnectedCallback (index) {
    this.disconnected && this.disconnected()
    delete Tonic._data[this.root._id]
    delete Tonic._children[this.root._id]
    delete this.root
    Tonic._refs.splice(index, 1)
  }
}

Tonic.render = Tonic.add

Object.assign(Tonic, {
  _tags: [],
  _refs: [],
  _data: {},
  _states: {},
  _children: {},
  _reg: {},
  escapeRe: /["&'<>`]/g,
  escapeMap: { '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;' }
})

if (typeof module === 'object') module.exports = Tonic
