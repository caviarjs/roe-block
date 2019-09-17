const test = require('ava')
const create = require('./create')

const CASES = [
  ['ERR_READ_PKG', 'err-pkg', {
    configChain: [{
      server: () => ({})
    }]
  }],
  ['INVALID_SERVER_ANCHOR_TYPE', 'simple', {
    configChain: [{
      server: 1
    }]
  }],
  ['INVALID_SERVER_ANCHOR_RETURN_TYPE', 'simple', {
    configChain: [{
      server: () => 1
    }]
  }],
  ['INVALID_ROUTER_ANCHOR_TYPE', 'simple', {
    configChain: [{
      server: () => ({}),
      router: 1
    }]
  }],
  ['PKG_NOT_FOUND', 'no-pkg', {
    configChain: [{
      server: () => ({})
    }]
  }],
  ['NO_PKG_NAME', 'no-name', {
    configChain: [{
      server: () => ({})
    }]
  }],
]

CASES.forEach(([code, name, options], i) => {
  test(`${i}: ${code}`, async t => {
    await t.throwsAsync(() => create(name, options), {
      code: `CAVIAR_ROE_${code}`
    })
  })
})
