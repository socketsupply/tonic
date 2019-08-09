const { constructor: AsyncFunction } = async function () {}
const { constructor: AsyncFunctionGenerator } = async function * () {}

class Tonic extends window.HTMLElement {
  constructor () {
    super()
    const state = Tonic._states[this.id]
    delete Tonic._states[this.id]
    this.state = state || {}
    this.props = {}
    this.elements = [...this.children].map(el => el.cloneNode(true))
    this.elements.__children__ = true
    this.nodes = [...this.childNodes].map(el => el.cloneNode(true))
    this.nodes.__children__ = true
    this._events()
  }

  static _createId () {
    return Math.random().toString(16).slice(2)
  }

  static match (el, s) {
    if (!el.matches) el = el.parentElement
    return el.matches(s) ? el : el.closest(s)
  }

  static add (c) {
    c.prototype._props = Object.getOwnPropertyNames(c.prototype)

    if (!c.name || c.name.length === 1) {
      throw Error('Mangling. https://bit.ly/2TkJ6zP')
    }

    const name = Tonic._splitName(c.name).toLowerCase()
    if (window.customElements.get(name)) return

    Tonic._reg[name] = c
    Tonic._tags = Object.keys(Tonic._reg).join()
    window.customElements.define(name, c)
  }

  static sanitize (o) {
    if (!o) return o
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'object') o[k] = Tonic.sanitize(v)
      if (typeof v === 'string') o[k] = Tonic.escape(v)
    }
    return o
  }

  static escape (s) {
    return s.replace(Tonic.ESC, c => Tonic.MAP[c])
  }

  static _splitName (s) {
    return s.match(/[A-Z][a-z]*/g).join('-')
  }

  static _normalizeAttrs (o, x = {}) {
    [...o].forEach(o => (x[o.name] = o.value))
    return x
  }

  html ([s, ...strings], ...values) {
    const refs = o => {
      if (o && o.__children__) return this._placehold(o)
      switch (({}).toString.call(o)) {
        case '[object HTMLCollection]':
        case '[object NodeList]': return this._placehold([...o])
        case '[object Array]':
        case '[object Object]':
        case '[object Function]': return this._prop(o)
        case '[object NamedNodeMap]': return this._prop(Tonic._normalizeAttrs(o))
        case '[object Number]': return `${o}__float`
        case '[object Boolean]': return `${o}__boolean`
      }
      return o
    }
    const reduce = (a, b) => a.concat(b, strings.shift())
    return values.map(refs).reduce(reduce, [s]).join('')
  }

  setState (o) {
    this.state = typeof o === 'function' ? o(this.state) : o
  }

  getState () {
    return this.state
  }

  reRender (o = this.props) {
    this.props = Tonic.sanitize(typeof o === 'function' ? o(this.props) : o)
    this._set(this, this.render)

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
      this.addEventListener(p, this)
    }
  }

  async _set (target, render, content = '') {
    if (render instanceof AsyncFunction) {
      content = await render.call(this) || ''
    } else if (render instanceof AsyncFunctionGenerator) {
      const itr = render.call(this)
      while (true) {
        const { value, done } = await itr.next()
        this._set(target, null, value)
        if (done) break
      }
      return
    } else if (render instanceof Function) {
      content = render.call(this) || ''
    }

    for (const node of target.querySelectorAll(Tonic._tags)) {
      if (Tonic._refs.findIndex(ref => ref === node) === -1) continue
      Tonic._states[node.id] = node.getState()
    }

    if (typeof content === 'string') {
      content = content.replace(Tonic.SPREAD, (_, p) => {
        const o = Tonic._data[p.split('__')[1]][p]
        return Object.entries(o).map(([key, value]) => {
          const k = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
          return `${k}="${Tonic.escape(String(value))}"`
        }).join(' ')
      })

      target.innerHTML = content

      if (this.styles) {
        const styles = this.styles()
        for (const node of target.querySelectorAll('[styles]')) {
          for (const s of node.getAttribute('styles').split(/\s+/)) {
            Object.assign(node.style, styles[s.trim()])
          }
        }
      }

      const children = Tonic._children[this._id] || {}

      const walk = (node, fn) => {
        if (node.nodeType === 3) {
          const id = node.textContent.trim()
          if (children[id]) return fn(node, children[id])
        }
        node = node.firstChild
        while (node) {
          walk(node, fn)
          node = node.nextSibling
        }
      }

      walk(target, (node, children) => {
        for (const child of children) {
          node.parentNode.appendChild(child)
        }
        delete Tonic._children[this._id][node.id]
        node.parentNode.removeChild(node)
      })
    } else {
      target.innerHTML = ''
      target.appendChild(content.cloneNode(true))
    }

    if (this.stylesheet) {
      const styleNode = document.createElement('style')
      styleNode.appendChild(document.createTextNode(this.stylesheet()))
      target.insertBefore(styleNode, target.firstChild)
    }
  }

  _prop (o) {
    const id = this._id
    const p = `__${id}__${Tonic._createId()}__`
    Tonic._data[id] = Tonic._data[id] || {}
    Tonic._data[id][p] = o
    return p
  }

  _placehold (r) {
    const ref = `__${Tonic._createId()}__`
    Tonic._children[this._id] = Tonic._children[this._id] || {}
    Tonic._children[this._id][ref] = r
    return ref
  }

  connectedCallback () {
    this.root = this.shadowRoot || this

    if (this.wrap) {
      this.wrapped = this.render
      this.render = this.wrap
    }

    Tonic._refs.push(this)
    const cc = s => s.replace(/-(.)/g, (_, m) => m.toUpperCase())

    for (const { name: _name, value } of this.attributes) {
      const name = cc(_name)
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

    if (!this._id) {
      this.source = this.innerHTML
    } else {
      this.innerHTML = this.source
    }

    this._id = this._id || Tonic._createId()

    this.willConnect && this.willConnect()
    this._set(this, this.render)
    this.connected && this.connected()
  }

  disconnectedCallback (index) {
    this.disconnected && this.disconnected()
    this.elements.length = 0
    this.nodes.length = 0
    delete Tonic._data[this._id]
    delete Tonic._children[this._id]
    Tonic._refs.splice(index, 1)
  }
}

Object.assign(Tonic, {
  _tags: '',
  _refs: [],
  _data: {},
  _states: {},
  _children: {},
  _reg: {},
  _index: 0,
  SPREAD: /\.\.\.(__\w+__\w+__)/g,
  ESC: /["&'<>`]/g,
  AsyncFunctionGenerator,
  AsyncFunction,
  MAP: { '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;' }
})

if (typeof module === 'object') module.exports = Tonic
