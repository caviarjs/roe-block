const {Errors, exitOnNotDefined} = require('err-object')

const {error, TE} = new Errors({
  messagePrefix: '[@caviar/roe-block] ',
  codePrefix: 'CAVIAR_ROE_',
  notDefined: exitOnNotDefined
})

TE('INVALID_SERVER_ANCHOR_TYPE',
  'the config anchor of server in "%s" must be a function')

TE('INVALID_SERVER_ANCHOR_RETURN_TYPE',
  'the config anchor of server in "%s" should return an object')

TE('INVALID_ANCHOR_TYPE',
  'the config anchor of router in "%s" must be a function')

module.exports = {
  error
}