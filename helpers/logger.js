'use strict';
const config = localRequire('config');
const jtlogger = require('jtlogger');
const path = require('path');

if (config.env === 'production') {
  jtlogger.init([{
    type: 'file',
    filename: path.join('/var/log', config.app, 'out.log')
  }, {
    type: 'udp',
    host: config.udpLog.hostname,
    port: config.udpLog.port,
    tag: config.app
  }]);
}
