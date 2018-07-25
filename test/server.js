const http = require('http')
const test = require('tape')
const Tonic = require('..')

const hostname = '127.0.0.1'
const port = 3000

let server

test('sanity', t => {
  t.ok(true)
  t.end()
})

test('setup', t => {
  class Quxx extends Tonic {
    render (props) {
      return `<div>${props.n}</div>`
    }
  }

  const quxx = new Quxx({ n: 100 })

  server = http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')

    res.end(quxx.render({ n: Tonic.createid(2) }))
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
