[![Build Status](https://travis-ci.org/caviarjs/roe-block.svg?branch=master)](https://travis-ci.org/caviarjs/roe-block)
[![Coverage](https://codecov.io/gh/caviarjs/roe-block/branch/master/graph/badge.svg)](https://codecov.io/gh/caviarjs/roe-block)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/caviarjs/roe-block?branch=master&svg=true)](https://ci.appveyor.com/project/caviarjs/roe-block)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/@caviar/roe-block.svg)](http://badge.fury.io/js/@caviar/roe-block)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/@caviar/roe-block.svg)](https://www.npmjs.org/package/@caviar/roe-block)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/caviarjs/roe-block.svg)](https://david-dm.org/caviarjs/roe-block)
-->

# @caviar/roe-block

Caviar block for roe

## Install

```sh
$ npm i @caviar/roe-block
```

## Usage

In `caviar.config.js`

```js
module.exports = {
  server (appInfo, config) {
    // change config
    return config
  },

  router (app, apply) {
    const {router} = app
    router.get('/foo', controller)

    apply(app)
  }
}
```

## Hooks

### ...builtInBlockHooks

See [Caviar Blocks]

### serverConfig `SyncHook`

Triggered after roe config is generated and before using.

Callback parameters:

- **serverConfig** `object` the composed server configuration
- **caviarOptions** ``

### routerLoaded

Triggered after router anchor has been applied.

Callback parameters:

- **app** `Koa` the roe application
- **caviarOptions**

### loaded

Triggered after all components of the roe application has been loaded, including:

- middlewares
- controllers
- services
- plugins

Callback parameters:

- **app**
- **caviarOptions**

### listening

Triggered when the server is listened to a port

Callback parameters:

- **port** `number` the port the server listening to
- **caviarOptions**

## License

[MIT](LICENSE)
