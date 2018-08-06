class Tonic {
  constructor (node) {
    this.props = {}
    this.state = {}
    const name = Tonic._splitName(this.constructor.name)
    this.root = node || document.createElement(name.toLowerCase())
    Tonic.refs.push(this.root)
    this.root.destroy = index => this._disconnect(index)
    this.root.setProps = v => this.setProps(v)
    this.root.setState = v => this.setState(v)
    this._bindEventListeners()
    this._connect()
  }

  static match (el, s) {
    if (!el.matches) el = el.parentElement
    return el.matches(s) ? el : el.closest(s)
  }

  static add (c) {
    c.prototype._props = Object.getOwnPropertyNames(c.prototype)
    if (!c.name) throw Error('Mangling detected, see guide.')

    const name = Tonic._splitName(c.name).toUpperCase()
    Tonic.registry[name] = c
    if (c.registered) throw new Error(`Already registered ${c.name}`)
    c.registered = true

    if (!Tonic.styleNode) {
      Tonic.styleNode = document.head.appendChild(document.createElement('style'))
    }

    Tonic._constructTags()
  }

  static _constructTags () {
    for (const tagName of Object.keys(Tonic.registry)) {
      for (const node of document.getElementsByTagName(tagName.toLowerCase())) {
        if (!Tonic.registry[tagName] || node.destroy) continue
        const t = new Tonic.registry[tagName](node)
        if (!t) throw Error('Unable to construct component, see guide.')
      }
    }
  }

  static _scopeCSS (s, tagName) {
    return s.split('\n').map(line => {
      if (!line.includes('{')) return line
      const parts = line.split('{').map(s => s.trim())
      const selector = parts[0].split(',').map(p => `${tagName} ${p}`).join(', ')
      return `${selector} { ${parts[1]}`
    }).join('\n')
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
    return Tonic.sanitize(values).reduce(reducer, [s]).filter(filter).join('')
  }

  setState (o) {
    this.state = typeof o === 'function' ? o(this.state) : o
  }

  setProps (o) {
    const oldProps = JSON.parse(JSON.stringify(this.props))
    this.props = Tonic.sanitize(typeof o === 'function' ? o(this.props) : o)
    this.root.appendChild(this._setContent(this.render()))
    Tonic._constructTags()
    this.updated && this.updated(oldProps)
  }

  _bindEventListeners () {
    const hp = Object.getOwnPropertyNames(window.HTMLElement.prototype)
    for (const p of this._props) {
      if (hp.indexOf('on' + p) === -1) continue
      this.root.addEventListener(p, e => this[p](e))
    }
  }

  _setContent (content) {
    while (this.root.firstChild) this.root.firstChild.remove()
    let node = null

    if (typeof content === 'string') {
      const tmp = document.createElement('tmp')
      tmp.innerHTML = content
      node = tmp.firstElementChild
    } else {
      node = content.cloneNode(true)
    }

    if (this.styleNode) node.insertAdjacentElement('afterbegin', this.styleNode)
    Tonic.refs.forEach((e, i) => !e.parentNode && e.destroy(i))
    return node
  }

  _connect () {
    for (let { name, value } of this.root.attributes) {
      name = name.replace(/-(.)/gui, (_, m) => m.toUpperCase())
      this.props[name] = value
    }

    if (this.props.data) {
      try { this.props.data = JSON.parse(this.props.data) } catch (e) {}
    }

    this.props = Tonic.sanitize(this.props)

    for (const [k, v] of Object.entries(this.defaults ? this.defaults() : {})) {
      if (!this.props[k]) this.props[k] = v
    }

    this.willConnect && this.willConnect()
    this.root.appendChild(this._setContent(this.render()))
    Tonic._constructTags()

    if (this.style && !Tonic.registry[this.root.tagName].styled) {
      Tonic.registry[this.root.tagName].styled = true
      const css = Tonic._scopeCSS(this.style(), this.root.tagName.toLowerCase())
      const textNode = document.createTextNode(css)
      Tonic.styleNode.appendChild(textNode)
    }

    this.connected && this.connected()
  }

  _disconnect (index) {
    this.disconnected && this.disconnected()
    delete this.styleNode
    delete this.root
    Tonic.refs.splice(index, 1)
  }
}

Tonic.refs = []
Tonic.registry = {}
Tonic.escapeRe = /["&'<>`]/g
Tonic.escapeMap = { '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;' }

if (typeof module === 'object') module.exports = Tonic
