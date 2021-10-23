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

  try {
    esbuild.buildSync({
      entryPoints: [p],
      outdir: "./dist",
      minify: true,
      bundle: true,
      sourcemap: true,
      format: "cjs",
      target: "esnext",
      tsconfig: "./tsconfig.build.json",
    })

    esbuild.buildSync({
      entryPoints: [p],
      outdir: "./dist",
      minify: true,
      bundle: true,
      sourcemap: true,
      format: "esm",
      outExtension: {
        ".js": ".esm.js",
      },
      target: "esnext",
      tsconfig: "./tsconfig.build.json",
    })
  } catch (e) {
    console.log(`× Build failed due to an error.`)
    console.log(e)
  }
}

main()
