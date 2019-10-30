const puppeteer = require('puppeteer')
const browserify = require('browserify')
const os = require('os')
const path = require('path')
const fs = require('fs')

const bundle = async src => ({
  then (resolve) {
    const b = browserify({
      standalone: 'test'
    })

    b.add(src)
    b.bundle((err, data) => resolve({ err, data }))
  }
})

async function main (browserName) {
  const src = `${__dirname}/tests/index.js`
  const { err, data } = await bundle(src)

  if (err) {
    console.error(`Unable to bundle ${src}.`)
    console.log(err)
    process.exit(1)
  }

  const html = `
    <html>
      <head>
        <script>
          ${data.toString()}
        </script>
      </head>
      <body>
      </body>
    </html>
  `

  const dest = path.join(os.tmpdir(), 'index.html')
  fs.writeFileSync(dest, html)

  const browser = await puppeteer.launch({})
  const page = await browser.newPage()

  page.on('console', msg => console.log(msg.text()))
  page.on('error', err => console.log(err.toString()))
  page.on('pageerror', err => console.log(err.toString()))

  const url = `file://${dest}`
  const options = { waitUntil: 'networkidle2' }

  await page.goto(url, options)
  await page.waitForSelector('body.finished', { timeout: 6e5 })
  await browser.close()
}

main()
