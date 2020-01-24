class TonicRaw {
  constructor (rawText) {
    this.isTonicRaw = true
    this.rawText = rawText
  }

  valueOf () { return this.rawText }
  toString () { return this.rawText }
}

class Tonic extends window.HTMLElement {
  constructor () {
    super()
    const state = Tonic._states[this.id]
    delete Tonic._states[this.id]
    this.isTonicComponent = true
    this.state = state || {}
    this.props = {}
    this.elements = [...this.children].map(el => el.cloneNode(true))
    this.elements.__children__ = true
    this.nodes = [...this.childNodes].map(el => el.cloneNode(true))
    this.nodes.__children__ = true
    this._events()
  }

  static _createId () {
    return `tonic${Tonic._index++}`
  }

  static _maybePromise (p) {
    if (p && typeof p.then === 'function' && typeof p.catch === 'function') {
      p.catch(err => setTimeout(() => { throw err }, 0))
    }
  }

  static _splitName (s) {
    return s.match(/[A-Z][a-z]*/g).join('-')
  }

  static _normalizeAttrs (o, x = {}) {
    [...o].forEach(o => (x[o.name] = o.value))
    return x
  }

  _events () {
    const hp = Object.getOwnPropertyNames(window.HTMLElement.prototype)
    for (const p of this._props) {
      if (hp.indexOf('on' + p) === -1) continue
      this.addEventListener(p, this)
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
    const id = this._id
    const ref = `placehold:${id}:${Tonic._createId()}__`
    Tonic._children[id] = Tonic._children[id] || {}
    Tonic._children[id][ref] = r
    return ref
  }

  static match (el, s) {
    if (!el.matches) el = el.parentElement
    return el.matches(s) ? el : el.closest(s)
  }

  static getPropertyNames (proto) {
    const props = []
    while (proto && proto !== Tonic.prototype) {
      props.push(...Object.getOwnPropertyNames(proto))
      proto = Object.getPrototypeOf(proto)
    }
    return props
  }

  static add (c, htmlName) {
    c.prototype._props = Tonic.getPropertyNames(c.prototype)

    const hasValidName = htmlName || (c.name && c.name.length > 1)
    if (!hasValidName) {
      throw Error('Mangling. https://bit.ly/2TkJ6zP')
    }

    if (!htmlName) htmlName = Tonic._splitName(c.name).toLowerCase()
    if (window.customElements.get(htmlName)) return

    Tonic._reg[htmlName] = c
    Tonic._tags = Object.keys(Tonic._reg).join()
    window.customElements.define(htmlName, c)

    if (c.stylesheet) {
      const styleNode = document.createElement('style')
      styleNode.appendChild(document.createTextNode(c.stylesheet()))
      if (document.head) document.head.appendChild(styleNode)
    }
  }

  static escape (s) {
    return s.replace(Tonic.ESC, c => Tonic.MAP[c])
  }

  static raw (s) {
    return new TonicRaw(s)
  }

  html ([s, ...strings], ...values) {
    const refs = o => {
      if (o && o.__children__) return this._placehold(o)
      if (o && o.isTonicRaw) return o.rawText
      switch (Object.prototype.toString.call(o)) {
        case '[object HTMLCollection]':
        case '[object NodeList]': return this._placehold([...o])
        case '[object Array]':
        case '[object Object]':
        case '[object Function]': return this._prop(o)
        case '[object NamedNodeMap]':
          return this._prop(Tonic._normalizeAttrs(o))
        case '[object Number]': return `${o}__float`
        case '[object String]': return Tonic.escape(o)
        case '[object Boolean]': return `${o}__boolean`
        case '[object Null]': return `${o}__null`
        case '[object HTMLElement]':
          return this._placehold([o])
      }
      if (
        typeof o === 'object' && o && o.nodeType === 1 &&
        typeof o.cloneNode === 'function'
      ) {
        return this._placehold([o])
      }
      return o
    }

    const reduce = (a, b) => a.concat(b, strings.shift())
    const str = values.map(refs).reduce(reduce, [s]).join('')
    return Tonic.raw(str)
  }

  setState (o) {
    this.state = typeof o === 'function' ? o(this.state) : o
  }

  getState () {
    return this.state
  }

  scheduleReRender (oldProps) {
    if (this.pendingReRender) return this.pendingReRender

    this.pendingReRender = new Promise(resolve => {
      window.requestAnimationFrame(() => {
        Tonic._maybePromise(this._set(this.root, this.render))
        this.pendingReRender = null

        if (this.updated) this.updated(oldProps)
        resolve()
      })
    })

    return this.pendingReRender
  }

  reRender (o = this.props) {
    const oldProps = { ...this.props }
    this.props = typeof o === 'function' ? o(oldProps) : o
    return this.scheduleReRender(oldProps)
  }

  getProps () {
    return this.props
  }

  handleEvent (e) {
    Tonic._maybePromise(this[e.type](e))
  }

  async _set (target, render, content = '') {
    for (const node of target.querySelectorAll(Tonic._tags)) {
      if (!node.isTonicComponent) continue
      if (!node.id || !Tonic._refIds.includes(node.id)) continue
      Tonic._states[node.id] = node.getState()
    }

    if (render instanceof Tonic.AsyncFunction) {
      content = await render.call(this) || ''
    } else if (render instanceof Tonic.AsyncFunctionGenerator) {
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

    if (content && content.isTonicRaw) {
      content = content.rawText
    }

    if (typeof content === 'string') {
      content = content.replace(Tonic.SPREAD, (_, p) => {
        const o = Tonic._data[p.split('__')[1]][p]
        return Object.entries(o).map(([key, value]) => {
          const k = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
          if (value === true) return k
          else if (value) return `${k}="${Tonic.escape(String(value))}"`
          else return ''
        }).filter(Boolean).join(' ')
      })

      if (this.stylesheet) {
        content = `<style>${this.stylesheet()}</style>${content}`
      }

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
          if (children[id]) fn(node, children[id])
        }

        const childNodes = node.childNodes
        if (!childNodes) return

        for (let i = 0; i < childNodes.length; i++) {
          walk(childNodes[i], fn)
        }
      }

      walk(target, (node, children) => {
        for (const child of children) {
          node.parentNode.insertBefore(child, node)
        }
        delete Tonic._children[this._id][node.id]
        node.parentNode.removeChild(node)
      })
    } else {
      target.innerHTML = ''
      target.appendChild(content.cloneNode(true))
    }
  }

  connectedCallback () {
    this.root = this.shadowRoot || this

    if (this.wrap) {
      this.wrapped = this.render
      this.render = this.wrap
    }

    if (this.id && !Tonic._refIds.includes(this.id)) {
      Tonic._refIds.push(this.id)
    }
    const cc = s => s.replace(/-(.)/g, (_, m) => m.toUpperCase())

    for (const { name: _name, value } of this.attributes) {
      const name = cc(_name)
      const p = this.props[name] = value

      if (/__\w+__\w+__/.test(p)) {
        const { 1: root } = p.split('__')
        this.props[name] = Tonic._data[root][p]
      } else if (/\d+__float/.test(p)) {
        this.props[name] = parseFloat(p, 10)
      } else if (p === 'null__null') {
        this.props[name] = null
      } else if (/\w+__boolean/.test(p)) {
        this.props[name] = p.includes('true')
      } else if (/placehold:\w+:\w+__/.test(p)) {
        const { 1: root } = p.split(':')
        this.props[name] = Tonic._children[root][p][0]
      }
    }

    this.props = Object.assign(
      this.defaults ? this.defaults() : {},
      this.props
    )

    if (!this._source) {
      this._source = this.innerHTML
    } else {
      this.innerHTML = this._source
    }

    this._id = this._id || Tonic._createId()

    this.willConnect && this.willConnect()
    Tonic._maybePromise(this._set(this.root, this.render))
    Tonic._maybePromise(this.connected && this.connected())
  }

  disconnectedCallback () {
    Tonic._maybePromise(this.disconnected && this.disconnected())
    this.elements.length = 0
    this.nodes.length = 0
    delete Tonic._data[this._id]
    delete Tonic._children[this._id]
  }
}

Object.assign(Tonic, {
  _tags: '',
  _refIds: [],
  _data: {},
  _states: {},
  _children: {},
  _reg: {},
  _index: 0,
  version: typeof require !== 'undefined' ? require('./package').version : null,
  SPREAD: /\.\.\.\s?(__\w+__\w+__)/g,
  ESC: /["&'<>`]/g,
  AsyncFunctionGenerator: async function * () {}.constructor,
  AsyncFunction: async function () {}.constructor,
  MAP: { '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;' }
})

if (typeof module === 'object') module.exports = Tonic
