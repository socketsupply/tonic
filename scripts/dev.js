/* eslint-disable */
const esbuild = require("esbuild")
const path = require("path")
const fs = require("fs")

async function main() {
  const root = path.join(__dirname, "..")
  const p = path.join(root, "src", "index.ts")

  if (fs.existsSync("./dist")) {
    fs.rmSync("./dist", { recursive: true }, (e) => {
      if (e) {
        throw e
      }
    })
  }

  esbuild.build({
    entryPoints: [p],
    outdir: "./dist",
    minify: false,
    bundle: true,
    format: "esm",
    outExtension: {
      ".js": ".esm.js",
    },
    target: "esnext",
    tsconfig: "./tsconfig.json",
    incremental: true,
    sourcemap: true,
    watch: {
      onRebuild(error) {
        if (error) {
          console.log(`× An error in prevented the rebuild.`)
          return
        }
        console.log(`✔ Rebuilt.`)
      },
    },
  })
}

main()
