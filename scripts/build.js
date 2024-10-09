const fs = require('fs')
const path = require('path')
const ncc = require('@vercel/ncc')

const build = () => {
  const entry = path.resolve(__dirname, '../src/asset-relocator.js')

  ncc(entry, {
    externals: ["resolve"],
    minify: true
  }).then(({ code }) => {
    const distFile = path.resolve(__dirname, '../dist/index.js')

    // replace all __nccwpck_require__ with __webpack_require__ caused by ncc
    const newCode = code.replace(
      /__nccwpck_require__/g,
      '__webpack_require__'
    )

    fs.writeFileSync(distFile, newCode)
  }).catch(err => {
    console.error(err)

    process.exit(1)
  })
}

build()