const Benchmark = require('benchmark')
const Tonic = require('../dist/tonic.min.js')

window.Benchmark = Benchmark
const suite = new Benchmark.Suite()

class Hello extends Tonic {
  render () {
    return this.html`<h1>${this.props.message}</h1>`
  }
}

class App extends Tonic {
  render () {
    return this.html`
      <hello message="${Math.random()}">
      </hello>
    `
  }
}

document.body.innerHTML = `
  <script></script>
  <App></app>
`

Tonic.add(Hello)

document.addEventListener('DOMContentLoaded', () => {
  Tonic.add(App)

  const app = document.querySelector('app')
  const hello = document.querySelector('hello')

  suite
    .add('re-render a single component', () => {
      hello.reRender({ message: Math.random() })
    })
    .add('re-render a hierarchy component', () => {
      app.reRender()
    })
    .on('cycle', (event) => {
      console.log(String(event.target))
    })
    .on('complete', function () {
      console.log('done')
    })
    .run()
})
