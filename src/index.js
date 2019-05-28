const {parse} = require('url')
const {isFunction, isObject} = require('core-util-is')
const {Roe} = require('roe')
const {
  SyncHook
} = require('tapable')
const {
  Block
} = require('caviar')
const {error} = require('./error')

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
  configFilepath
}) => {
  if (!isFunction(anchor)) {
    throw error('INVALID_SERVER_ANCHOR_TYPE', configFilepath, anchor)
  }

  return (appInfo, config = {}) => {
    if (prev) {
      config = prev(appInfo, config)
    }

    config = anchor(appInfo, config)

    if (!isObject(config)) {
      throw error('INVALID_SERVER_ANCHOR_RETURN_TYPE', configFilepath, config)
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
  configFilepath
}) => {
  if (!isFunction(anchor)) {
    throw error('INVALID_ROUTER_ANCHOR_TYPE', configFilepath, anchor)
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

    // Binder will check the config structure
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
      }
    }

    this.hooks = {
      server: new SyncHook(['serverConfig', 'caviarOptions'])
    }
  }

  async _build () {
    // do nothing
  }

  // Override
  // - config `Object` the composed configuration
  // - caviarOptions `Object`
  //   - cwd
  //   - dev
  async _ready (config, caviarOptions) {
    const {cwd, pkg} = caviarOptions

    const app = new Roe({
      // framework,
      baseDir: cwd,
      https: false,
      title: pkg.name,
      type: 'application',
      config: appInfo => {
        const serverConfig = config.server(appInfo)
        this.hooks.serverConfig.call(serverConfig, caviarOptions)
        return serverConfig
      }
    })

    return new Promise((resolve, reject) => {
      app.ready(err => {
        if (err) {
          reject(err)
          return
        }

        resolve(app)
      })
    })
  }

  // Custom public methods
  middleware () {
    return this.outlet.callback()
  }
}
