const test = require('tape')
const Tonic = require('..')

// const sleep = n => new Promise(resolve => setTimeout(resolve, n))

test('sanity', t => {
  t.ok(true)
  t.end()
})

test('attach to dom', t => {
  class ChildComponent extends Tonic {
    render () {
      return `<div></div>`
    }
  }

  Tonic.add(ChildComponent)
  document.body.innerHTML = `<child-component/>`
  const div = document.querySelector('div')
  t.ok(div, 'a div was created and attached')
  t.end()
})

test('cleanup, ensure exist', t => {
  t.end()
  process.exit(0)
})
