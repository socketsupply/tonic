const test = require('tape')
const Tonic = require('..')

test('sanity', t => {
  t.ok(true)
  t.end()
})

test('attach to dom', t => {
  class ComponentA extends Tonic {
    render () {
      return `<div></div>`
    }
  }

  Tonic.add(ComponentA)

  document.body.innerHTML = `
    <component-a></component-a>
  `

  const div = document.querySelector('div')
  t.ok(div, 'a div was created and attached')
  t.end()
})

test('pass props', t => {
  Tonic.add(class ComponentB extends Tonic {
    willConnect () {
      this.setAttribute('id', this.props.id)
    }
    render () {
      return `<div>${this.props.data.message}</div>`
    }
  })

  const d = { message: 'hello' }

  document.body.innerHTML = `

    <component-b
      id="x"
      data=${JSON.stringify(d)}>
    </component-b>

  `

  const div1 = document.querySelector('div')
  const div2 = document.getElementById('x')
  t.equal(div1.textContent, 'hello', 'div contains the prop value')
  t.ok(div2)
  t.end()
})

test('get element by id and set properties via the api', t => {
  class ComponentC extends Tonic {
    wellConnect () {
      this.setAttribute('id', this.props.id)
    }
    render () {
      return `<div>${this.props.number}</div>`
    }
  }

  Tonic.add(ComponentC)

  document.body.innerHTML = `
    <component-c id="test" number=1></component-c>
  `

  const div = document.getElementById('test')
  t.ok(div, 'a component was found by its id')
  t.equal(div.textContent, '1', 'initial value is set by props')
  t.ok(div.setProps, 'a component has the setProps method')
  div.setProps({ number: 2 })
  t.equal(div.textContent, '2', 'the value was changed by setProps')
  t.end()
})

test('construct from api', t => {
  document.body.innerHTML = ''
  class ComponentD extends Tonic {
    render () {
      return `<div number="${this.props.number}"></div>`
    }
  }

  Tonic.add(ComponentD)
  const c = document.createElement('component-d')
  document.body.appendChild(c)
  c.setProps({ number: 3 })
  const div = document.body.querySelector('div')
  t.equal(div.getAttribute('number'), '3', 'attribute was set in component')
  t.end()
})

test('fail to connect before setProps', t => {
  document.body.innerHTML = ''
  class ComponentE extends Tonic {
    render () {
      return `<div number="${this.props.number}"></div>`
    }
  }

  Tonic.add(ComponentE)
  const c = document.createElement('component-e')

  try {
    c.setProps({ number: 3 })
  } catch (err) {
    t.equal(err.message, 'Component not yet connected')
    t.end()
  }
})

test('stylesheet', t => {
  document.body.innerHTML = ''
  class ComponentF extends Tonic {
    constructor () {
      super()
      this.stylesheet = `
        div {
          color: red;
        }
      `
    }
    render () {
      return `<div></div>`
    }
  }

  Tonic.add(ComponentF)
  const c = document.createElement('component-f')
  document.body.appendChild(c)
  t.end()
})

test('cleanup, ensure exist', t => {
  t.end()
  process.exit(0)
})
