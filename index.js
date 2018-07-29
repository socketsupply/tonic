class Tonic extends window.HTMLElement {
  constructor () {
    super()
    this.props = {}
    this.state = {}
    if (this.shadow) this.attachShadow({ mode: 'open' })
    this.bindEventListeners()
  }

  bindEventListeners () {
    this.events.forEach(event => {
      this.addEventListener(event, e => this[event](e))
    })
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
    this.root.innerHTML = this.render()
  }

  connectedCallback () {
    for (let { name, value } of this.attributes) {
      if (name === 'id') this.setAttribute('id', value)
      try { value = JSON.parse(value) } catch (e) {}
      this.props[name] = value
    }
    this.root = (this.shadowRoot || this)
    this.props = Tonic.sanitize(this.props)
    this.root.innerHTML = this.render()
    this.connected && this.connected()
  }
}

Tonic.escapeRe = /["&'<>`]/g
Tonic.escapeMap = {
  '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;'
}

if (typeof module === 'object') module.exports = Tonic
