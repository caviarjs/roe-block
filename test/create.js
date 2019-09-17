const {resolve} = require('test-fixture')()
const {runBlock} = require('@caviar/test')
const supertest = require('supertest')

const RoeBlock = require('..')

module.exports = async (name, options) => {
  options.cwd = resolve(name)

  let port

  if (options.listen) {
    options.apply = getHooks => {
      getHooks(RoeBlock).listening.tap('FOO', p => {
        port = p
      })
    }
  }

  const block = await runBlock(RoeBlock, options)

  let app

  if (options.listen) {
    await block.listen()
    app = supertest(`http://localhost:${port}`)
  } else {
    app = supertest(block.middleware())
  }

  return {
    app,
    get (path) {
      return app.get(path)
    },
    block
  }
}
