const he = require('he')

class Component {
  constructor (props = {}, state = {}) {
    this.props = props
    this.state = state
    this.componentid = Component.createid(2)

    Component.registry[this.componentid] = this
  }

  static clean (o) {
    if (!o) return

    Object.keys(o).forEach(key => {
      if (typeof o[key] === 'string') {
        o[key] = he.escape(o[key])
      } else if (typeof o[key] === 'object') {
        Component.clean(o[key])
      }
    })

    return o
  }

  static match (el, s) {
    while (!el.matches) {
      el = el.parentNode
      if (el.tagName === 'html') return null
    }
    return el.matches(s) ? el : el.closest(s)
  }

  static createid (s = 2, e) {
    return Math.random().toString(16).slice(s, e)
  }

  get id () {
    return `data-componentid="${this.componentid}"`
  }

  static html ([s, ...strings], ...values) {
    return values
      .reduce((a, b) => a.concat(b, strings.shift()), [s])
      .filter(s => s && (s !== true || s === 0))
      .join('')
  }

  setProps (o) {
    this.props = o
    const component = Component.registry[this.componentid]

    const tmp = document.createElement('tmp')
    tmp.innerHTML = this.toString()

    const child = tmp.firstElementChild
    const parent = component.el.parentNode
    parent.replaceChild(child, component.el)
    component.el = child
  }

  dispatch (e) {
    const match = Component.match(e.target, '[data-componentid]')
    if (!match) return

    const id = match.dataset.componentid
    const component = Component.registry[id]
    if (!component) return

    if (component[e.type]) {
      component[e.type](e)
    }
  }

  attach (el) {
    el.innerHTML = this.toString()

    ;[...el.querySelectorAll('[data-componentid]')].forEach(c => {
      const component = Component.registry[c.dataset.componentid]
      if (component && component.mount) component.mount(c)
    })

    for (const key in el) {
      if (key.search('on') !== 0) continue
      el.addEventListener(key.slice(2), this.dispatch)
    }
  }

  toString () {
    const o = Component.clean(this.props)
    return Component.html`${this.render(o)}`
  }
}

Component.registry = {}
module.exports = Component
