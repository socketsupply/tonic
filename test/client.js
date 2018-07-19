const test = require('tape')
const Tonic = require('..')

const sleep = n => new Promise(resolve => setTimeout(resolve, n))

test('sanity', t => {
  t.ok(true)
  t.end()
})

test('attach to dom', t => {
  class Div extends Tonic {
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

test('async render and attach', async t => {
  class Div extends Tonic {
    async render () {
      await sleep(100)
      return '<div></div>'
    }
  }

  const root = new Div()
  await root.attach(document.body)

  const div = document.querySelector('div')
  t.ok(div, 'a div was created and attached')
  t.end()
})

test('async render and insert', async t => {
  class Div extends Tonic {
    async render () {
      await sleep(100)
      return '<div></div>'
    }
  }

  const root = new Div()
  await root.insert(document.body)

  const div = document.querySelector('div')
  t.ok(div, 'a div was created and attached')
  t.end()
})

test('compose', t => {
  class Span extends Tonic {
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

  const span = new Span()

  class Div extends Tonic {
    mount (el) {
      t.ok(true, 'div was mounted')
      t.ok(el.innerHTML.indexOf('Span'), 'div includes span')
    }

    render (props) {
      return `<div ${this.id}> Total ${span.render(props)}</div>`
    }
  }

  const root = new Div({ x: 1 })
  root.attach(document.body)
  t.end()
})

test('async compose', async t => {
  class Span extends Tonic {
    click (e) {
      console.log('clicked span', e)
    }

    mount (el) {
      t.ok(true, 'span was mounted')
    }

    async render (props) {
      await sleep(500)
      return `
        <span ${this.id} data-event="click" data-num="${props.x}">Span</span>
      `
    }
  }

  const span = new Span()

  class Div extends Tonic {
    mount (el) {
      t.ok(true, 'div was mounted')
      t.ok(el.innerHTML.indexOf('Span'), 'div includes span')
    }

    async render (props) {
      return `<div ${this.id}> Total ${await span.render(props)}</div>`
    }
  }

  const root = new Div({ x: 1 })
  await root.attach(document.body)
  t.end()
})

test('cleanup, ensure exist', t => {
  t.end()
  process.exit(0)
})
