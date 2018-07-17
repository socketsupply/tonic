const test = require('tape')
const Component = require('..')

test('sanity', t => {
  t.ok(true)
  t.end()
})

test('attach to dom', t => {
  class Div extends Component {
    render () {
      return '<div></div>'
    }
  }

  const root = new Div()
  root.attach(document.body)

  const div = document.querySelector('div')
  t.ok(div, 'a div was created and attached')
  t.end()
})

test('compose', t => {
  class Span extends Component {
    constructor (props) {
      super(props)
    }

    click (e) {
      console.log('clicked span', e)
    }

    mount (el) {
      t.ok(true, 'span was mounted')
    }

    render (props) {
      return `
        <span ${this.id} data-event="click" data-num="${props.x}">Span</span>
      `
    }
  }

  class Div extends Component {
    constructor (props) {
      super(props)
    }

    mount (el) {
      t.ok(true, 'div was mounted')
      t.ok(el.innerHTML.indexOf('Span'), 'div includes span')
    }

    render (props) {
      return `<div ${this.id}> Total ${new Span(props)}</div>`
    }
  }

  const root = new Div({ x: 1 })
  root.attach(document.body)
  t.end()
})

test('cleanup, ensure exist', t => {
  t.end()
  process.exit(0)
})
