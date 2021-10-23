/* eslint-disable no-undef */
import fs from "fs"
import esbuild from "esbuild"
import serve, { error, log } from "create-serve"

if (!fs.existsSync("./dist")) {
  fs.mkdirSync("./dist")
}

fs.copyFile("./src/index.html", "./dist/index.html", (err) => {
  if (err) throw err
})

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/bundle.js",
    minify: false,
    sourcemap: true,
    incremental: true,
    target: ["esnext"],
    define: {
      "process.env.NODE_ENV": '"development"',
    },
    watch: {
      onRebuild(err) {
        serve.update()
        err ? error("❌ Failed") : log("✅ Updated")
      },
    },
  })
  .catch(() => process.exit(1))

serve.start({
  port: 5000,
  root: "./dist",
  live: true,
})
