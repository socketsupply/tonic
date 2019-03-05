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
  document.body.appendChild(d)

  d.reRender({ number: 3 })
  const div1 = document.body.querySelector('div')
  t.equal(div1.getAttribute('number'), '3', 'attribute was set in component')

  d.reRender({ number: 6 })
  const div2 = document.body.querySelector('div')
  t.equal(div2.getAttribute('number'), '6', 'attribute was set in component')
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

  Tonic.add(ComponentF)

  const expected = `component-f div { color: red; }`
  const style = document.querySelector('component-f style')
  t.equal(style.textContent, expected, 'style was prefixed')
  const div = document.querySelector('component-f div')
  const computed = window.getComputedStyle(div)
  t.equal(computed.color, 'rgb(255, 0, 0)', 'inline style was set')
  t.equal(computed.backgroundColor, 'rgb(255, 0, 0)', 'inline style was set')

  t.end()
})

test('component composition', t => {
  document.body.innerHTML = `
    A Few
    <x-bar></x-bar>
    Noisy
    <x-bar></x-bar>
    Text Nodes
  `

  class XFoo extends Tonic {
    render () {
      return `<div class="foo"></div>`
    }
  }

  class XBar extends Tonic {
    render () {
      return `
        <div class="bar">
          <x-foo></x-foo>
          <x-foo></x-foo>
        </div>
      `
    }
  }

  Tonic.add(XFoo)
  Tonic.add(XBar)

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
  Tonic.add(StatefulParent)

  const parent = document.getElementsByTagName('stateful-parent')[0]
  parent.reRender()
  const child = document.getElementsByTagName('stateful-child')[0]
  const { count } = child.getState()
  t.equal(count, 2, `the named element's state was persisted after re-rendering`)
  t.end()
})

test('lifecycle events', t => {
  document.body.innerHTML = `<x-quxx></x-quxx>`

  class XBazz extends Tonic {
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

  class XQuxx extends Tonic {
    constructor (p) {
      super(p)
      t.ok(true, 'calling quxx ctor')
    }

    willConnect () {
      t.ok(true, 'willConnect event fired')
      const expected = `<x-quxx></x-quxx>`
      t.equal(document.body.innerHTML, expected, 'nothing added yet')
    }

    connected () {
      t.ok(true, 'connected event fired')
      const expected = `<x-quxx><div class="quxx"><x-bazz><div class="bar"></div></x-bazz></div></x-quxx>`
      t.equal(document.body.innerHTML, expected, 'rendered')
    }

    render () {
      t.ok(true, 'render event fired')
      return `<div class="quxx"><x-bazz></x-bazz></div>`
    }
  }

  Tonic.add(XBazz)
  Tonic.add(XQuxx)
  const q = document.querySelector('x-quxx')
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

test('compose sugar (children with children, etc)', t => {
  class ComposeA extends Tonic {
    render () {
      return this.html`
        ${this.children}
      `
    }
  }

  class ComposeB extends Tonic {
    render () {
      return this.html`
        <select>
          ${this.childNodes}
        </select>
      `
    }
  }

  class ComposeC extends Tonic {
    render () {
      return this.html`

      `
    }
  }

  document.body.innerHTML = `
    <compose-a>
      <compose-b>
        <option value="a">1</option>
        <option value="b">2</option>
        <option value="c">3</option>
      </compose-b>
    </compose-a>
    <compose-a>
      <compose-b>
        <option value="a">1</option>
        <option value="b">2</option>
      </compose-b>
    </compose-a>
  `

  Tonic.add(ComposeA)
  Tonic.add(ComposeB)
  Tonic.add(ComposeC)

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
  class AppXx extends Tonic {
    render () {
      return this.html`<div class="app">${this.children}</div>`
    }
  }

  class ComponentAx extends Tonic {
    render () {
      return `<div class="a">A</div>`
    }
  }

  class ComponentBx extends Tonic {
    render () {
      return this.html`<div class="b">${this.children}</div>`
    }
  }

  class ComponentCx extends Tonic {
    render () {
      return this.html`<div class="c">${this.children}</div>`
    }
  }

  class ComponentDx extends Tonic {
    render () {
      return `<div class="d">D</div>`
    }
  }

  document.body.innerHTML = `
    <app-xx>
      <component-ax>
      </component-ax>

      <component-bx>
        <component-cx>
          <component-dx>
          </component-dx>
        </component-cx>
      </component-bx>
    </app-xx>
  `

  Tonic.add(ComponentDx)
  Tonic.add(ComponentAx)
  Tonic.add(ComponentCx)
  Tonic.add(AppXx)
  Tonic.add(ComponentBx)

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

test('spread props', t => {
  class SpreadComponent extends Tonic {
    render () {
      return this.html`
        <div ...${this.props}></div>
      `
    }
  }

  class AppContainer extends Tonic {
    render () {
      const o = {
        a: 'testing',
        b: 2.2,
        FooBar: '"ok"'
      }

      const el = document.querySelector('#el').attributes

      return this.html`
        <spread-component ...${o}>
        </spread-component>

        <div ...${o}>
        </div>

        <span ...${el}></span>
      `
    }
  }

  document.body.innerHTML = `
    <app-container></app-container>
    <div id="el" d="1" e="3.3" f="xxx"></div>
  `

  Tonic.add(AppContainer)
  Tonic.add(SpreadComponent)

  const component = document.querySelector('spread-component')
  t.equal(component.getAttribute('a'), 'testing')
  t.equal(component.getAttribute('b'), '2.2')
  t.equal(component.getAttribute('foo-bar'), '"ok"')
  const div = document.querySelector('div:first-of-type')
  const span = document.querySelector('span:first-of-type')
  t.equal(div.attributes.length, 3, 'div also got expanded attributes')
  t.equal(span.attributes.length, 4, 'span got all attributes from div#el')
  t.end()
})

test('cleanup, ensure exist', t => {
  t.end()
  process.exit(0)
})
