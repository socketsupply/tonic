class Tonic {
  constructor (props = {}, state = {}) {
    this.props = props
    this.state = state
    this.componentid = Tonic.createid(2)
    Tonic.registry[this.componentid] = this
    this._escapeRe = /["&'<>`]/g
    this._escapeMap = {
      '"': '&quot;', '&': '&amp;', '\'': '&#x27;', '<': '&lt;', '>': '&gt;', '`': '&#x60;'
    }
  }

  static match (el, s) {
    while (!el.matches) {
      el = el.parentNode
      if (el.tagName === 'HTML') return null
    }
    return el.matches(s) ? el : el.closest(s)
  }

  static createid (s = 2, e) {
    return Math.random().toString(16).slice(s, e)
  }

  static find (cmp) {
    return Object.values(Tonic.registry).find(cmp)
  }

  get id () {
    return `data-componentid="${this.componentid}"`
  }

  html ([s, ...strings], ...values) {
    const escape = s => s.replace(this._escapeRe, ch => this._escapeMap[ch])
    const reducer = (a, b) => a.concat(b, escape(strings.shift()))
    const filter = s => s && (s !== true || s === 0)
    return values.reduce(reducer, [s]).filter(filter).join('')
  }

  setProps (o) {
    this.props = o
    this.rerender()
  }

  async rerender () {
    const component = Tonic.registry[this.componentid]
    const tmp = document.createElement('tmp')

    tmp.innerHTML = this.html`${this.isAsync()
      ? await this.render(this.props)
      : this.render(this.props)
    }`

    const child = tmp.firstElementChild
    const parent = component.el.parentNode
    parent.replaceChild(child, component.el)
    component.el = child
  }

  dispatch (e) {
    let el = e.target

    while (true) {
      el = Tonic.match(el, `[data-componentid]`)
      if (!el) break

      const component = Tonic.registry[el.dataset.componentid]
      if (component && component[e.type]) component[e.type](e)

      el = el.parentNode
    }
  }

  isAsync () {
    return this.render[Symbol.toStringTag] === 'AsyncFunction'
  }

  async insert (el, pos = 'beforeend') {
    this.isAsync() ? (await this.attach(el, pos)) : this.attach(el, pos)
  }

  async attach (el, pos) {
    const s = this.html`${this.isAsync()
      ? await this.render(this.props)
      : this.render(this.props)
    }`

    pos ? el.insertAdjacentHTML(pos, s) : (el.innerHTML = s)

    const ids = [...document.body.querySelectorAll('[data-componentid]')]

    for (const c of ids) {
      const component = Tonic.registry[c.dataset.componentid]
      component.el = c
      if (component && component.mount && !component.mounted) {
        component.mount(c)
        component.mounted = true
      }
    }

    if (Tonic.bound) return
    Tonic.bound = true

    for (const key in document.body) {
      if (key.search('on') !== 0) continue
      document.body.addEventListener(key.slice(2), e => this.dispatch(e))
    }
  }
}

Tonic.registry = {}
if (typeof module === 'object') module.exports = Tonic
