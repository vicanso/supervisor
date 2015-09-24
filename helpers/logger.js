'use strict';
const config = localRequire('config');
const jtlogger = require('jtlogger');
const path = require('path');
const url = require('url');
let transports = [];
if (config.env === 'production') {
  transports.push({
    type: 'file',
    timestamp: true,
    filename: path.join('/var/log', config.app, 'out.log')
  });
  if (config.udpLog) {
    let urlInfo = url.parse(config.udpLog);
    transports.push({
      type: 'udp',
      host: urlInfo.hostname,
      port: urlInfo.port,
      tag: config.app,
      timestamp: true
    });
  }
  jtlogger.init(transports);
}
