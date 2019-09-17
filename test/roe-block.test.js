const test = require('ava')
const getPort = require('get-port')

const create = require('./create')

const run = async (name, t, listen) => {
  const layer = {
    server: () => ({
      plugins: []
    }),

    router (app) {
      app.router.get('/', ctx => {
        ctx.body = 'hello'
      })
    }
  }

  const options = {
    configChain: [layer, {
      server: (appInfo, config) => config,
      router (app, apply) {
        app.router.get('/foo', ctx => {
          ctx.body = 'bar'
        })

        apply(app)
      }
    }]
  }

  if (listen) {
    layer.port = await getPort()
    options.listen = true
  }

  const {
    get
  } = await create(name, options)

  const {
    statusCode,
    text
  } = await get('/')

  t.is(statusCode, 200)
  t.is(text, 'hello')

  const {
    statusCode: s1,
    text: t1
  } = await get('/foo')

  t.is(s1, 200)
  t.is(t1, 'bar')
}

test('simple', t => run('simple', t))
test('listen', t => run('simple', t, true))
