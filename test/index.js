const test = require('tape')
const path = require('path')

const src = path.join(__dirname, process.env['MIN']
  ? '../dist/tonic.min.js'
  : '..')

const Tonic = require(src)

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

  document.body.innerHTML = `
    <component-a></component-a>
  `

  Tonic.add(ComponentA, document.body)

  const div = document.querySelector('div')
  t.ok(div, 'a div was created and attached')
  t.end()
})

test('pass props', t => {
  document.body.innerHTML = `

    <component-b
      id="x"
      test-item="true"
      disabled
      empty=''>
    </component-b>
  `

  Tonic.add(class ComponentBB extends Tonic {
    render () {
      return `<div>${this.props.data[0].foo}</div>`
    }
  })

  Tonic.add(class ComponentB extends Tonic {
    connected () {
      this.root.setAttribute('id', this.props.id)
      t.equal(this.props.disabled, '', 'disabled property was found')
      t.equal(this.props.empty, '', 'empty property was found')
      t.ok(this.props.testItem, 'automatically camelcase props')
    }

    render () {
      const test = [
        { foo: 'hello, world' }
      ]

      return this.html`
        <component-b-b
          id="y"
          data=${test}
          number=${42.42}
          fn=${() => 'hello, world'}>
        </component-b-b>
      `
    }
  }, document.body)

  const bb = document.getElementById('y')
  {
    const props = bb.getProps()
    t.equal(props.fn(), 'hello, world', 'passed a function')
    t.equal(props.number, 42.42, 'float parsed properly')
  }

  const div1 = document.getElementsByTagName('div')[0]
  t.equal(div1.textContent, 'hello, world', 'data prop received properly')

  const div2 = document.getElementById('x')
  t.ok(div2)

  const props = div2.getProps()
  t.equal(props.testItem, 'true', 'correct props')

  t.end()
})

test('get element by id and set properties via the api', t => {
  document.body.innerHTML = `
    <component-c number=1></component-c>
  `

  class ComponentC extends Tonic {
    willConnect () {
      this.root.setAttribute('id', 'test')
    }
    render () {
      return `<div>${this.props.number}</div>`
    }
  }

  Tonic.add(ComponentC, document.body)

  {
    const div = document.getElementById('test')
    t.ok(div, 'a component was found by its id')
    t.equal(div.textContent, '1', 'initial value is set by props')
    t.ok(div.reRender, 'a component has the reRender method')
  }

  const div = document.getElementById('test')
  div.reRender({ number: 2 })
  t.equal(div.textContent, '2', 'the value was changed by reRender')
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
  const d = new ComponentD()
  document.body.appendChild(d.root)

  d.reRender({ number: 3 })
  const div1 = document.body.querySelector('div')
  t.equal(div1.getAttribute('number'), '3', 'attribute was set in component')

  d.reRender({ number: 6 })
  const div2 = document.body.querySelector('div')
  t.equal(div2.getAttribute('number'), '6', 'attribute was set in component')
  t.end()
})

test('fail to connect before reRender', t => {
  document.body.innerHTML = ''

  class ComponentE extends Tonic {
    render () {
      return `<div number="${this.props.number}"></div>`
    }
  }

  Tonic.add(ComponentE)
  const c = document.createElement('component-e')

  t.ok(!c.reRender, 'Component not yet connected')
  t.end()
})

test('stylesheets and inline styles', t => {
  document.body.innerHTML = `
    <component-f number=1></component-f>
  `

  class ComponentF extends Tonic {
    stylesheet () {
      return `component-f div { color: red; }`
    }

    styles () {
      return {
        foo: {
          color: 'red'
        },
        bar: {
          backgroundColor: 'red'
        }
      }
    }

    render () {
      return `<div styles="foo bar"></div>`
    }
  }

  Tonic.add(ComponentF, document.body)
  const style = document.head.getElementsByTagName('style')[0]
  const expected = `component-f div { color: red; }`
  t.equal(style.textContent, expected, 'style was prefixed')
  const div = document.querySelector('div')
  const computed = window.getComputedStyle(div)
  t.equal(computed.color, 'rgb(255, 0, 0)', 'inline style was set')
  t.equal(computed.backgroundColor, 'rgb(255, 0, 0)', 'inline style was set')

  t.end()
})

test('component composition', t => {
  document.body.innerHTML = `
    A Few
    <bar></bar>
    Noisy
    <bar></bar>
    Text Nodes
  `

  class Foo extends Tonic {
    render () {
      return `<div class="foo"></div>`
    }
  }

  class Bar extends Tonic {
    render () {
      return `
        <div class="bar">
          <foo></foo>
          <foo></foo>
        </div>
      `
    }
  }

  Tonic.add(Foo, document.body)
  Tonic.add(Bar, document.body)

  t.equal(document.body.querySelectorAll('.bar').length, 2, 'two bar divs')
  t.equal(document.body.querySelectorAll('.foo').length, 4, 'four foo divs')
  t.end()
})

test('persist named component state after re-renering', t => {
  document.body.innerHTML = `
    <stateful-parent>
    </stateful-parent>
  `

  class StatefulParent extends Tonic {
    render () {
      return `<div>
        <stateful-child id="stateful-child">
        </stateful-child>
      </div>`
    }
  }

  class StatefulChild extends Tonic {
    connected () {
      this.setState(state => Object.assign({}, state, {
        count: (state.count || 0) + 1
      }))
    }

    render () {
      return `<div>CHILD</div>`
    }
  }

  Tonic.add(StatefulChild)
  Tonic.add(StatefulParent, document.body)
  const parent = document.getElementsByTagName('stateful-parent')[0]
  parent.reRender()
  const child = document.getElementsByTagName('stateful-child')[0]
  const { count } = child.getState()
  t.equal(count, 2, `the named element's state was persisted after re-rendering`)
  t.end()
})

test('lifecycle events', t => {
  document.body.innerHTML = `<quxx></quxx>`

  class Bazz extends Tonic {
    constructor (p) {
      super(p)
      t.ok(true, 'calling bazz ctor')
    }

    disconnected () {
      t.ok(true, 'disconnected event fired')
    }
    render () {
      return `<div class="bar"></div>`
    }
  }

  class Quxx extends Tonic {
    constructor (p) {
      super(p)
      t.ok(true, 'calling quxx ctor')
    }

    willConnect () {
      t.ok(true, 'willConnect event fired')
      const expected = `<quxx></quxx>`
      t.equal(document.body.innerHTML, expected, 'nothing added yet')
    }

    connected () {
      t.ok(true, 'connected event fired')
      const expected = `<quxx><div class="quxx"><bazz><div class="bar"></div></bazz></div></quxx>`
      t.equal(document.body.innerHTML, expected, 'rendered')
    }

    render () {
      t.ok(true, 'render event fired')
      return `<div class="quxx"><bazz></bazz></div>`
    }
  }

  Tonic.add(Bazz)
  Tonic.add(Quxx, document.body)
  const q = document.querySelector('quxx')
  q.reRender({})
  const refsLength = Tonic._refs.length

  // once again to overwrite the old instances
  q.reRender({})
  t.equal(Tonic._refs.length, refsLength, 'Cleanup, refs correct count')

  // once again to check that the refs length is the same
  q.reRender({})
  t.equal(Tonic._refs.length, refsLength, 'Cleanup, refs still correct count')
  t.end()
})

test('compose sugar (this.children)', t => {
  class ComponentG extends Tonic {
    render () {
      return this.html`<div class="parent">${this.children}</div>`
    }
  }

  class ComponentH extends Tonic {
    render () {
      return `<div class="child">${this.props.value}</div>`
    }
  }

  document.body.innerHTML = `
    <component-g>
      <component-h value="x"></component-h>
    </component-g>
  `

  Tonic.add(ComponentG)
  Tonic.add(ComponentH)
  Tonic.init(document.body)

  const g = document.querySelector('component-g')
  const children = g.querySelectorAll('.child')
  t.equal(children.length, 1, 'child element was added')
  t.equal(children[0].innerHTML, 'x')

  const h = document.querySelector('component-h')

  h.reRender({
    value: 'y'
  })

  const childrenAfterSetProps = g.querySelectorAll('.child')
  t.equal(childrenAfterSetProps.length, 1, 'child element was replaced')
  t.equal(childrenAfterSetProps[0].innerHTML, 'y')
  t.end()
})

test('check that composed elements use (and re-use) their initial innerHTML correctly', t => {
  class ComponentI extends Tonic {
    render () {
      return this.html`<div class="i">
        <component-j>
          <component-k value="${this.props.value}">
          </component-k>
        </component-j>
      </div>`
    }
  }

  class ComponentJ extends Tonic {
    render () {
      return this.html`<div class="j">${this.children}</div>`
    }
  }

  class ComponentK extends Tonic {
    render () {
      return `<div class="k">${this.props.value}</div>`
    }
  }

  document.body.innerHTML = `
    <component-i value="x">
    </component-i>
  `

  Tonic.add(ComponentJ)
  Tonic.add(ComponentK)
  Tonic.add(ComponentI)
  Tonic.init()

  t.comment('Uses init() instead of <app>')

  const i = document.querySelector('component-i')
  const kTags = i.getElementsByTagName('component-k')
  t.equal(kTags.length, 1)

  const kClasses = i.querySelectorAll('.k')
  t.equal(kClasses.length, 1)

  const kText = kClasses[0].textContent
  t.equal(kText, 'x', 'The text of the inner-most child was rendered correctly')

  i.reRender({
    value: 1
  })

  const kTagsAfterSetProps = i.getElementsByTagName('component-k')
  t.equal(kTagsAfterSetProps.length, 1, 'correct number of components rendered')

  const kClassesAfterSetProps = i.querySelectorAll('.k')
  t.equal(kClassesAfterSetProps.length, 1, 'correct number of elements rendered')
  const kTextAfterSetProps = kClassesAfterSetProps[0].textContent
  t.equal(kTextAfterSetProps, '1', 'The text of the inner-most child was rendered correctly')
  t.end()
})

test('mixed order declaration', t => {
  class App extends Tonic {
    render () {
      return this.html`<div class="app">${this.children}</div>`
    }
  }

  class ComponentA extends Tonic {
    render () {
      return `<div class="a">A</div>`
    }
  }

  class ComponentB extends Tonic {
    render () {
      return this.html`<div class="b">${this.children}</div>`
    }
  }

  class ComponentC extends Tonic {
    render () {
      return this.html`<div class="c">${this.children}</div>`
    }
  }

  class ComponentD extends Tonic {
    render () {
      return `<div class="d">D</div>`
    }
  }

  document.body.innerHTML = `
    <App>
      <component-a>
      </component-a>

      <component-b>
        <component-c>
          <component-d>
          </component-d>
        </component-c>
      </component-b> 
    </App>
  `

  Tonic.add(ComponentD)
  Tonic.add(ComponentA)
  Tonic.add(ComponentC)
  Tonic.add(ComponentB)
  Tonic.add(App)

  {
    const div = document.querySelector('.app')
    t.ok(div, 'a div was created and attached')
  }

  {
    const div = document.querySelector('body .app .a')
    t.ok(div, 'a div was created and attached')
  }

  {
    const div = document.querySelector('body .app .b')
    t.ok(div, 'a div was created and attached')
  }

  {
    const div = document.querySelector('body .app .b .c')
    t.ok(div, 'a div was created and attached')
  }

  {
    const div = document.querySelector('body .app .b .c .d')
    t.ok(div, 'a div was created and attached')
  }

  t.end()
})

test('cleanup, ensure exist', t => {
  t.end()
  process.exit(0)
})
