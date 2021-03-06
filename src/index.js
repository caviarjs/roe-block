const {isFunction, isObject} = require('core-util-is')
const {join} = require('path')
// const log = require('util').debuglog('caviar:roe-block')
const {Roe} = require('roe')
const {
  SyncHook
} = require('tapable')
const {
  Block
} = require('caviar')
const {error} = require('./error')

const readProjectName = cwd => {
  const packageFile = join(cwd, 'package.json')

  let pkg

  try {
    pkg = require(packageFile)
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw error('PKG_NOT_FOUND', cwd)
    }

    throw error('ERR_READ_PKG', cwd, err.stack)
  }

  const {name} = pkg

  if (!name) {
    throw error('NO_PKG_NAME', packageFile)
  }

  return name
}

// Usage
// ```js
// roe (appInfo, config) {
//   // ...
//   return config
// }
// ```
const composeConfig = ({
  prev,
  anchor,
  configFile
}) => {
  if (!isFunction(anchor)) {
    throw error('INVALID_SERVER_ANCHOR_TYPE', configFile, anchor)
  }

  return (appInfo, config = {}) => {
    if (prev) {
      config = prev(appInfo, config)
    }

    config = anchor(appInfo, config)

    if (!isObject(config)) {
      throw error('INVALID_SERVER_ANCHOR_RETURN_TYPE', configFile, config)
    }

    return config
  }
}

const NOOP = () => {}

// Usage
// ```js
// router (app, apply) {
//   // apply previous router
//   apply(app)
// }
// ```
const composeRouter = ({
  prev = NOOP,
  anchor,
  configFile
}) => {
  if (!isFunction(anchor)) {
    throw error('INVALID_ROUTER_ANCHOR_TYPE', configFile, anchor)
  }

  return app => {
    if (anchor.length === 2) {
      anchor(app, prev)
      return
    }

    prev(app)
    anchor(app)
  }
}

// Thinking(DONE):
// inherit or delegate? inherit
module.exports = class RoeBlock extends Block {
  constructor () {
    super()

    // Mixer will check the config structure
    // this.config is a setter
    this.config = {
      server: {
        type: 'compose',
        compose: composeConfig
      },

      router: {
        type: 'compose',
        optional: true,
        compose: composeRouter
      },

      port: {
        type: 'bailTop',
        optional: true
      }
    }

    this.hooks = {
      serverConfig: new SyncHook(['serverConfig', 'caviarOptions']),
      routerLoaded: new SyncHook(['app', 'caviarOptions']),
      loaded: new SyncHook(['app', 'caviarOptions']),
      listening: new SyncHook(['port', 'caviarOptions'])
    }
  }

  create (config, caviarOptions) {
    const {cwd} = caviarOptions

    return new Roe({
      // framework,
      baseDir: cwd,
      https: false,
      title: readProjectName(cwd),
      type: 'application',
      config: appInfo => {
        const serverConfig = config.server(appInfo)
        this.hooks.serverConfig.call(serverConfig, caviarOptions)
        return serverConfig
      }
    })
  }

  // Override
  // - config `Object` the composed configuration
  // - caviarOptions `Object`
  //   - cwd
  //   - dev
  async run (config, caviarOptions) {
    const app = this.created

    if (config.router) {
      config.router(app)
      this.hooks.routerLoaded.call(app, caviarOptions)
    }

    // Load roe
    await new Promise((resolve, reject) => {
      app.ready(err => {
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    })

    this.hooks.loaded.call(app, caviarOptions)

    this._port = parseInt(config.port, 10) || undefined
  }

  async listen () {
    const port = this._port
    if (!port) {
      return
    }

    return new Promise(resolve => {
      this.created.listen(port, () => {
        this.hooks.listening.call(port, this.options)
        resolve(port)
      })
    })
  }

  // Custom public methods
  middleware () {
    return this.created.callback()
  }
}
