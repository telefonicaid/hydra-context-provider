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
var hcpLogger = require('logops');
var hcpConfig = require(ROOT_PATH + '/lib/hcpConfiguration');
var hcpServerUtils = require(ROOT_PATH + '/lib/hcpServerUtils');
var hcpHeaderValidator = require(ROOT_PATH + '/lib/hcpHeaderValidator');
var hcpGetVersionHandler = require(ROOT_PATH + '/lib/hcpGetVersionHandler');
var hcpGetLogLevelHandler = require(ROOT_PATH + '/lib/hcpGetLogLevelHandler');
var hcpSetLogLevelHandler = require(ROOT_PATH + '/lib/hcpSetLogLevelHandler');
var hcpNotFoundHandler = require(ROOT_PATH + '/lib/hcpNotFoundHandler');
var hcpUpdateContext = require(ROOT_PATH + '/lib/hcpUpdateContext');
var hapi = require('hapi');
var joi = require('joi');

var server;

var attendedRequests = 0;

/**
 * Effectively starts and configures the hapi server
 * @param  {String}   host     The host
 * @param  {Number}   port     The port
 * @param  {Function} callback The callback
 */
function doStartServer(host, port, callback) {
  server = new hapi.Server();

  server.on('log', function (event, tags) {
    if (tags.load) {
      hcpLogger.warn(
        hcpConfig.LOGGING_CONTEXT.SERVER_LOG,
        'event=' + JSON.stringify(event)
      );
    }
  });

  server.on('request-internal', function (request, event, tags) {
    if (tags.error) {
      if (tags.auth || tags.handler || tags.state || tags.payload || tags.validation) {
        hcpLogger.warn(
          hcpServerUtils.getContext(request),
          request.method.toUpperCase() + ' ' + request.url.path +
          ', event=' + JSON.stringify(event)
        );
      } else {
        hcpLogger.error(
          hcpServerUtils.getContext(request),
          request.method.toUpperCase() + ' ' + request.url.path +
          ', event=' + JSON.stringify(event)
        );
      }
    }
  });

  server.connection({
    host: host,
    port: port
  });

  server.route([
    {
      method: 'POST',
      path: '/v1/updateContext',
      handler: hcpUpdateContext,
      config: {
        validate: {
          headers: hcpHeaderValidator
        }
      }
    },
    {
      method: 'GET',
      path: '/version',
      handler: hcpGetVersionHandler
    },
    {
      method: 'PUT',
      path: '/admin/log',
      handler: hcpSetLogLevelHandler,
      config: {
        validate: {
          query: {
            level: joi.string().insensitive().valid('FATAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG').required()
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/admin/log',
      handler: hcpGetLogLevelHandler
    },
    {
      method: '*',
      path: '/{p*}',
      handler: hcpNotFoundHandler
    }
  ]);

  // Start the server
  server.start(function (err) {
    return callback(err, server);
  });
}

/**
 * Starts the server asynchronously
 * @param {String} host The HCP server host
 * @param {String} port The HCP server port
 * @param {Function} callback Callback function to notify the result of the operation
 */
function startServer(host, port, callback) {
  if (server && server.info && server.info.started) {
    hcpLogger.info(
      hcpConfig.LOGGING_CONTEXT.SERVER_STOP,
      'HCP server already started'
    );
    return process.nextTick(callback.bind(null, null, server));
  } else {
    doStartServer(host, port, callback);
  }
}

/**
 * Stops the server asynchronously
 * @param {Function} callback Callback function to notify the result
 *  of the operation
 */
function stopServer(callback) {
  hcpLogger.info(
    hcpConfig.LOGGING_CONTEXT.SERVER_STOP,
    'Stopping the HCP server...'
  );
  if (server && server.info && server.info.started) {
    server.stop(function (err) {
      // Server successfully stopped
      hcpLogger.info(
        hcpConfig.LOGGING_CONTEXT.SERVER_STOP,
        'hapi server successfully stopped'
      );
      return callback(err);
    });
  } else {
    hcpLogger.info(
      hcpConfig.LOGGING_CONTEXT.SERVER_STOP,
      'No hapi server running'
    );
    return process.nextTick(callback);
  }
}

/**
 * Returns the server KPIs
 * @return {{attendedRequests: number}}
 */
function getKPIs() {
  return {
    attendedRequests: attendedRequests
  };
}

/**
 * Resets the server KPIs
 */
function resetKPIs() {
  attendedRequests = 0;
}

module.exports = {
  get server() {
    return server;
  },
  startServer: startServer,
  stopServer: stopServer,
  getKPIs: getKPIs,
  resetKPIs: resetKPIs
};
