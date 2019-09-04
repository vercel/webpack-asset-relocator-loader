const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const MemoryFS = require('memory-fs')

jest.setTimeout(20000)

it(`should generate correct output for relative to source path`, async () => {
  const dir = `${__dirname}/relative-to-source`
  const entry = `${dir}/input.js`
  const expected = fs
    .readFileSync(`${dir}/output.js`)
    .toString()
    .trim()
    // Windows support
    .replace(/\r/g, '')

  const mfs = new MemoryFS()
  const compiler = webpack({
    entry,
    optimization: { nodeEnv: false, minimize: false },
    mode: 'production',
    target: 'node',
    output: {
      path: '/',
      filename: 'index.js',
      libraryTarget: 'commonjs2',
    },
    module: {
      rules: [
        {
          test: /\.(js|mjs|node)$/,
          parser: { amd: false },
          use: [
            {
              loader:
                __dirname + '/../src/asset-relocator',
                options: {
                  relativeToSource: true,
                  writeMode: true
                }
            },
          ],
        },
      ],
    },
  })

  compiler.outputFileSystem = mfs

  try {
    var stats = await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) return reject(err)
        resolve(stats)
      })
    })
  } catch (err) {
    if (shouldError) return
    throw err
  }

  let code
  try {
    code = mfs.readFileSync('/index.js', 'utf8')
  } catch (e) {
    throw new Error(stats.toString())
  }

  const actual = code
    .trim()
    // Windows support
    .replace(/\r/g, '')

  try {
    expect(actual).toBe(expected)
  } catch (e) {
    // useful for updating fixtures
    fs.writeFileSync(`${dir}/actual.js`, actual)
    throw e
  }
})
