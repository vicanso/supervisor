'use strict';
const config = localRequire('config');
const debug = require('debug')('jt.' + config.app);

module.exports = debug;
