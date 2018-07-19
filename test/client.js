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
  document.body.innerHTML = ''

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
  document.body.innerHTML = ''

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

test('setProps', async t => {
  document.body.innerHTML = ''

  class Div extends Tonic {
    render (props) {
      return `<div ${this.id}>${props.number}</div>`
    }
  }

  const root = new Div({ number: 1 })
  root.insert(document.body)

  let d1 = document.querySelector('div')
  t.equal(d1.innerHTML, '1', 'div contained the correct value')
  root.setProps({ number: 2 })

  let d2 = document.querySelector('div')
  t.equal(d2.innerHTML, '2', 'div changed to the correct value')
  t.end()
})

test('compose', t => {
  document.body.innerHTML = ''

  class Span extends Tonic {
    click (e) {
      console.log('clicked span', e)
    }

    mount (el) {
      t.ok(true, 'span was mounted')
    }

    render (props) {
      return `
        <span ${this.id} data-num="${props.x}">Span</span>
      `
    }
  }

  const span = new Span()

  class Div extends Tonic {
    mount (el) {
      t.ok(el, 'div was mounted')

      const span = el.querySelector('span')
      t.ok(span, 'div contains span')

      t.equal(span.textContent, 'Span', 'span includes correct text')

      const prop = span.dataset.num
      t.equal(prop, '1', 'span has correct property value')
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
  document.body.innerHTML = ''

  class Span extends Tonic {
    click (e) {
      console.log('clicked span', e)
    }

    mount (el) {
      t.ok(true, 'span was mounted')
    }

    async getX (props) {
      await sleep(500)
      return props.x
    }

    async render (props) {
      return `
        <span ${this.id} data-num="${await this.getX(props)}">Span</span>
      `
    }
  }

  const span = new Span()

  class Div extends Tonic {
    mount (el) {
      t.ok(el, 'div was mounted')

      const span = el.querySelector('span')
      t.ok(span, 'div contains span')

      t.equal(span.textContent, 'Span', 'span includes correct text')

      const prop = span.dataset.num
      t.equal(prop, '1', 'span has correct property value')
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
