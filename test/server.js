const http = require('http')
const test = require('tape')
const Component = require('..')

const hostname = '127.0.0.1'
const port = 3000

let server

test('sanity', t => {
  t.ok(true)
  t.end()
})

test('setup', t => {
  server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')

    class Quxx extends Component {
      render (props) {
        return `<div>${props.n}</div>`
      }
    }

    const quxx = new Quxx({ n: 100 })

    res.end(quxx.render({ n: Component.createid(2) }))
  })

  server.listen(port, hostname, () => {
    t.end()
  })
})

test('create request', t => {
  http.get('http://localhost:3000', res => {
    res.on('data', data => {
      const s = data.toString()
      t.notEqual(s, '<div>100</div>', 'value changed from initial')
      t.ok(s.match(/<div>\w+<\/div>/), 'received html')
    })
    res.on('end', () => t.end())
  })
})

test('teardown', t => {
  t.end()
  process.exit(0)
})
