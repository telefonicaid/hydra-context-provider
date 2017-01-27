/*
 * Copyright 2016 Telefónica Investigación y Desarrollo, S.A.U
 *
 * This file is part of the Hydra Context Provider (HCP) component
 *
 * The HCP is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * The HCP is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with Hydra Context Provider.
 * If not, see http://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with: [german.torodelvalle@telefonica.com]
 */

'use strict';

var ROOT_PATH = require('app-root-path');
var config = require(ROOT_PATH + '/config.js');
var hcpLogger = require('logops');

var ENV = process.env;

module.exports = {
  GENERAL: 'GENERAL',
  REDUCIDA: 'REDUCIDA',
  OFF: 'OFF',
  DATE_TIME: 'DateTime',
  NUMBER: 'Number',
  TEXT: 'Text',
  LAST_COMMAND: 'lastCommand',
  LAST_COMMAND_TIMESTAMP: 'lastCommandTimestamp',
  ACTUACION_ENCENDIDO_CON_SEGURIDAD_2: 'ACTUACION:EncendidoconSeguridad2ONOFF',
  ACTUACION_ENCENDIDO_CON_SEGURIDAD: 'ACTUACION:EncendidoconSeguridadONOFF',
  POWER_STATE_GENERAL: 'powerState_general',
  POWER_STATE_REDUCED: 'powerState_reduced',
  OPERATION_TYPE: {
    NOT_AVAILABLE: 'NA',
    STARTUP: 'OPER_HCP_STARTUP',
    SHUTDOWN: 'OPER_HCP_SHUTDOWN',
    SERVER_START: 'OPER_HCP_SERVER_START',
    SERVER_LOG: 'OPER_HCP_SERVER_LOG',
    SERVER_STOP: 'OPER_HCP_SERVER_STOP'
  },
  OPERATION_TYPE_PREFIX: 'OPER_HCP_',
  HEADER: {
    CORRELATOR: 'fiware-correlator',
    FIWARE_SERVICE: 'fiware-service',
    FIWARE_SERVICE_PATH: 'fiware-servicepath',
    X_REAL_IP: 'x-real-ip'
  },
  STATUS_NOTIFICACION_SUFFIX: 'Status'
};

module.exports.LOGGING_CONTEXT = {
  STARTUP: {
    from: 'n/a',
    srv: 'n/a',
    subsrv: 'n/a',
    comp: 'HCP',
    op: module.exports.OPERATION_TYPE.STARTUP
  },
  SHUTDOWN: {
    from: 'n/a',
    srv: 'n/a',
    subsrv: 'n/a',
    comp: 'HCP',
    op: module.exports.OPERATION_TYPE.SHUTDOWN
  },
  SERVER_START: {
    from: 'n/a',
    srv: 'n/a',
    subsrv: 'n/a',
    comp: 'HCP',
    op: module.exports.OPERATION_TYPE.SERVER_START
  },
  SERVER_STOP: {
    from: 'n/a',
    srv: 'n/a',
    subsrv: 'n/a',
    comp: 'HCP',
    op: module.exports.OPERATION_TYPE.SERVER_STOP
  },
  SERVER_LOG: {
    from: 'n/a',
    srv: 'n/a',
    subsrv: 'n/a',
    comp: 'HCP',
    op: module.exports.OPERATION_TYPE.SERVER_LOG
  }
};

var invalidLoggingLevel;
var LOGGING_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
if (ENV.LOGOPS_LEVEL && LOGGING_LEVELS.indexOf(ENV.LOGOPS_LEVEL.toUpperCase()) !== -1) {
  module.exports.LOGOPS_LEVEL = ENV.LOGOPS_LEVEL.toUpperCase();
} else if (config && config.logging && config.logging.level &&
  LOGGING_LEVELS.indexOf(config.logging.level.toUpperCase()) !== -1) {
  module.exports.LOGOPS_LEVEL = config.logging.level.toUpperCase();
} else {
  invalidLoggingLevel = true;
  module.exports.LOGOPS_LEVEL = 'INFO';
}
hcpLogger.setLevel(module.exports.LOGOPS_LEVEL);

var invalidLoggingFormat;
var LOGGING_FORMATS = ['json', 'dev', 'pipe'];
if (ENV.LOGOPS_FORMAT && LOGGING_FORMATS.indexOf(ENV.LOGOPS_FORMAT.toLowerCase()) !== -1) {
  module.exports.LOGOPS_FORMAT = ENV.LOGOPS_FORMAT.toLowerCase();
} else if (config && config.logging && config.logging.format &&
  LOGGING_FORMATS.indexOf(config.logging.format.toLowerCase()) !== -1) {
  module.exports.LOGOPS_FORMAT = config.logging.format.toLowerCase();
} else {
  invalidLoggingFormat = true;
  module.exports.LOGOPS_FORMAT = 'pipe';
}
switch (module.exports.LOGOPS_FORMAT) {
  case 'json':
    hcpLogger.format = hcpLogger.formatters.json;
    break;
  case 'dev':
    hcpLogger.format = hcpLogger.formatters.dev;
    break;
  case 'pipe':
    hcpLogger.format = hcpLogger.formatters.pipe;
    break;
}

hcpLogger.info(
  module.exports.LOGGING_CONTEXT.STARTUP,
  'Starting the HCP component configuration...'
);

if (invalidLoggingLevel) {
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Invalid or not configured logging level, setting to default value: ' + module.exports.LOGOPS_LEVEL
  );
} else {
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Logging level set to value: ' + module.exports.LOGOPS_LEVEL
  );
}

if (invalidLoggingFormat) {
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Invalid or not configured logging format, setting to default value: ' + module.exports.LOGOPS_FORMAT
  );
} else {
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Logging format set to value: ' + module.exports.LOGOPS_FORMAT
  );
}

module.exports.HCP_HOST = ENV.HCP_HOST || (config && config.server && config.server.host) || 'localhost';
if (!ENV.HCP_HOST && !(config && config.server && config.server.host)) {
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Not configured HCP host, setting to default value: ' + module.exports.HCP_HOST
  );
} else {
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'HCP host set to value: ' + module.exports.HCP_HOST
  );
}

if (ENV.HCP_PORT && !isNaN(ENV.HCP_PORT)) {
  module.exports.HCP_PORT = parseInt(ENV.HCP_PORT, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'HCP port set to value: ' + module.exports.HCP_PORT
  );
} else if (config && config.server && config.server.port && !isNaN(config.server.port)) {
  module.exports.HCP_PORT = parseInt(config.server.port, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'HCP port set to value: ' + module.exports.HCP_PORT
  );
} else {
  module.exports.HCP_PORT = 8777;
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Invalid or not configured HCP port, setting to default value: ' + module.exports.HCP_PORT
  );
}

if (ENV.HCP_DELAY_MINIMUM && !isNaN(ENV.HCP_DELAY_MINIMUM)) {
  module.exports.HCP_DELAY_MINIMUM = parseInt(ENV.HCP_DELAY_MINIMUM, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'HCP minimum delay for the status notification set to value: ' + module.exports.HCP_DELAY_MINIMUM
  );
} else if (config && config.server && config.server.delay && config.server.delay.minimum &&
    !isNaN(config.server.delay.minimum)) {
  module.exports.HCP_DELAY_MINIMUM = parseInt(config.server.delay.minimum, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'HCP minimum delay for the status notification set to value: ' + module.exports.HCP_DELAY_MINIMUM
  );
} else {
  module.exports.HCP_DELAY_MINIMUM = 1000;
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Invalid or not configured HCP minimum delay for the status notification, setting to default value: ' +
      module.exports.HCP_DELAY_MINIMUM
  );
}

if (ENV.HCP_DELAY_MAXIMUM && !isNaN(ENV.HCP_DELAY_MAXIMUM)) {
  module.exports.HCP_DELAY_MAXIMUM = parseInt(ENV.HCP_DELAY_MAXIMUM, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'HCP maximum delay for the status notification set to value: ' + module.exports.HCP_DELAY_MAXIMUM
  );
} else if (config && config.server && config.server.delay && config.server.delay.maximum &&
    !isNaN(config.server.delay.maximum)) {
  module.exports.HCP_DELAY_MAXIMUM = parseInt(config.server.delay.maximum, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'HCP maximum delay for the status notification set to value: ' + module.exports.HCP_DELAY_MAXIMUM
  );
} else {
  module.exports.HCP_DELAY_MAXIMUM = 1000;
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Invalid or not configured HCP maximum delay for the status notification, setting to default value: ' +
      module.exports.HCP_DELAY_MAXIMUM
  );
}

module.exports.HCP_CONTEXT_BROKER_PROTOCOL = ENV.HCP_CONTEXT_BROKER_PROTOCOL || (config && config.contextBroker &&
  config.contextBroker.protocol) || 'https';
if (!ENV.HCP_CONTEXT_BROKER_PROTOCOL && !(config && config.contextBroker && config.contextBroker.protocol)) {
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Not configured Context Broker protocol, setting to default value: ' + module.exports.HCP_CONTEXT_BROKER_PROTOCOL
  );
} else {
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Context Broker protocol set to value: ' + module.exports.HCP_CONTEXT_BROKER_PROTOCOL
  );
}

module.exports.HCP_CONTEXT_BROKER_HOST = ENV.HCP_CONTEXT_BROKER_HOST || (config && config.contextBroker &&
  config.contextBroker.host) || 'localhost';
if (!ENV.HCP_CONTEXT_BROKER_HOST && !(config && config.contextBroker && config.contextBroker.host)) {
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Not configured Context Broker host, setting to default value: ' + module.exports.HCP_CONTEXT_BROKER_HOST
  );
} else {
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Context Broker host set to value: ' + module.exports.HCP_CONTEXT_BROKER_HOST
  );
}

if (ENV.HCP_CONTEXT_BROKER_PORT && !isNaN(ENV.HCP_CONTEXT_BROKER_PORT)) {
  module.exports.HCP_CONTEXT_BROKER_PORT = parseInt(ENV.HCP_CONTEXT_BROKER_PORT, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Context Broker port set to value: ' + module.exports.HCP_CONTEXT_BROKER_PORT
  );
} else if (config && config.contextBroker && config.contextBroker.port && !isNaN(config.contextBroker.port)) {
  module.exports.HCP_CONTEXT_BROKER_PORT = parseInt(config.contextBroker.port, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Context Broker port set to value: ' + module.exports.HCP_CONTEXT_BROKER_PORT
  );
} else {
  module.exports.HCP_CONTEXT_BROKER_PORT = 1026;
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Invalid or not configured Context Broker port, setting to default value: ' + module.exports.HCP_CONTEXT_BROKER_PORT
  );
}

module.exports.HCP_AUTH_PROTOCOL = ENV.HCP_AUTH_PROTOCOL || (config && config.auth &&
  config.auth.protocol) || 'https';
if (!ENV.HCP_AUTH_PROTOCOL && !(config && config.auth && config.auth.protocol)) {
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Not configured Identity Manager protocol, setting to default value: ' + module.exports.HCP_AUTH_PROTOCOL
  );
} else {
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Identity Manager protocol set to value: ' + module.exports.HCP_AUTH_PROTOCOL
  );
}

module.exports.HCP_AUTH_HOST = ENV.HCP_AUTH_HOST || (config && config.auth &&
  config.auth.host) || 'localhost';
if (!ENV.HCP_AUTH_HOST && !(config && config.auth && config.auth.host)) {
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Not configured Identity Manager host, setting to default value: ' + module.exports.HCP_AUTH_HOST
  );
} else {
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Identity Manager host set to value: ' + module.exports.HCP_AUTH_HOST
  );
}

if (ENV.HCP_AUTH_PORT && !isNaN(ENV.HCP_AUTH_PORT)) {
  module.exports.HCP_AUTH_PORT = parseInt(ENV.HCP_AUTH_PORT, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Identity Manager port set to value: ' + module.exports.HCP_AUTH_PORT
  );
} else if (config && config.auth && config.auth.port && !isNaN(config.auth.port)) {
  module.exports.HCP_AUTH_PORT = parseInt(config.auth.port, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Identity Manager port set to value: ' + module.exports.HCP_AUTH_PORT
  );
} else {
  module.exports.HCP_AUTH_PORT = 5001;
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Invalid or not configured Identity Manager port, setting to default value: ' + module.exports.HCP_AUTH_PORT
  );
}

module.exports.HCP_AUTH_USER = ENV.HCP_AUTH_USER || (config && config.auth &&
  config.auth.user) || 'user';
if (!ENV.HCP_AUTH_USER && !(config && config.auth && config.auth.user)) {
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Not configured Identity Manager user, setting to default value: ' + module.exports.HCP_AUTH_USER
  );
} else {
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Identity Manager user set to value: ' + module.exports.HCP_AUTH_USER
  );
}

module.exports.HCP_AUTH_PASSWORD = ENV.HCP_AUTH_PASSWORD || (config && config.auth &&
  config.auth.password) || 'password';
if (!ENV.HCP_AUTH_PASSWORD && !(config && config.auth && config.auth.password)) {
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Not configured Identity Manager password, setting to default value: ' + module.exports.HCP_AUTH_PASSWORD
  );
} else {
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Identity Manager password set to value: ' + module.exports.HCP_AUTH_PASSWORD
  );
}

if (ENV.PROOF_OF_LIFE_INTERVAL && !isNaN(ENV.PROOF_OF_LIFE_INTERVAL)) {
  module.exports.PROOF_OF_LIFE_INTERVAL = parseInt(ENV.PROOF_OF_LIFE_INTERVAL, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Proof of life interval set to value: ' + module.exports.PROOF_OF_LIFE_INTERVAL
  );
} else if (config && config.logging && config.logging.proofOfLifeInterval &&
  !isNaN(config.logging.proofOfLifeInterval)) {
  module.exports.PROOF_OF_LIFE_INTERVAL = parseInt(config.logging.proofOfLifeInterval, 10);
  hcpLogger.info(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Proof of life interval set to value: ' + module.exports.PROOF_OF_LIFE_INTERVAL
  );
} else {
  module.exports.PROOF_OF_LIFE_INTERVAL = 60;
  hcpLogger.warn(
    module.exports.LOGGING_CONTEXT.STARTUP,
    'Invalid or not configured proof of life interval, setting to default value: ' +
      module.exports.PROOF_OF_LIFE_INTERVAL
  );
}

hcpLogger.info(
  module.exports.LOGGING_CONTEXT.STARTUP,
  'HCP component configuration successfully completed'
);
