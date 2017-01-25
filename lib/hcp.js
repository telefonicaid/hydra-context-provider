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
var hcpUtils = require(ROOT_PATH + '/lib/hcpUtils');
var hcpServer = require(ROOT_PATH + '/lib/hcpServer');

var isStarted = false, proofOfLifeInterval;

/**
 * Stops the application stopping the server after completing all the
 *  pending requests and closing the server afterwards
 * @param {Error} err The error provoking the exit if any
 */
function exitGracefully(err, callback) {
  function onStopped() {
    isStarted = false;
    var exitCode = 0;
    if (err) {
      exitCode = 1;

    } else {
      hcpLogger.info(
        hcpConfig.LOGGING_CONTEXT.SHUTDOWN,
        'Application exited successfully'
      );
    }
    if (callback) {
      callback(err);
    }
    process.exit(exitCode);
  }

  if (err) {
    var message = err.toString();
    if (message.indexOf('listen EADDRINUSE') !== -1) {
      message += ' (another HCP instance maybe already listening on the same port)';
    }
    hcpLogger.error(
      hcpConfig.LOGGING_CONTEXT.SHUTDOWN,
      message
    );
  }

  if (proofOfLifeInterval) {
    clearInterval(proofOfLifeInterval);
  }
  hcpServer.stopServer(onStopped);
}

/**
 * Convenience method to startup the Node.js HCP application in case the module
 *  has not been loaded via require
 * @param {Function} callback Callback function to notify when startup process
 *  has concluded
 * @return {*}
 */
function startup(callback) {
  if (isStarted) {
    if (callback) {
      return process.nextTick(callback);
    }
    return;
  }

  var version = hcpUtils.getVersion();
  hcpLogger.info(
    hcpConfig.LOGGING_CONTEXT.SERVER_START,
    'Starting up the HCP server version %s...',
    version.version
  );

  // Start the hapi server
  hcpServer.startServer(
    hcpConfig.HCP_HOST, hcpConfig.HCP_PORT, function (err) {
      if (err) {
        hcpLogger.error(
          hcpConfig.LOGGING_CONTEXT.SERVER_START,
          err.toString()
        );
        // Error when starting the server
        return exitGracefully(err, callback);
      } else {
        isStarted = true;
        hcpLogger.info(
          hcpConfig.LOGGING_CONTEXT.SERVER_START,
          'Server started at',
          hcpServer.server.info.uri
        );
        proofOfLifeInterval = setInterval(function () {
          hcpLogger.info(
            hcpConfig.LOGGING_CONTEXT.SERVER_LOG,
            'Everything OK, ' + hcpServer.getKPIs().attendedRequests + ' requests attended in the last ' +
            hcpConfig.PROOF_OF_LIFE_INTERVAL + 's interval'
          );
          hcpServer.resetKPIs();
        }, hcpConfig.PROOF_OF_LIFE_INTERVAL * 1000);
        if (callback) {
          return callback();
        }
      }
    }
  );
}

// Starts the HCP application up in case this file has not been 'require'd,
//  such as, for example, for testing
if (!module.parent) {
  startup();
}

// In case Control+C is clicked, exit gracefully
process.on('SIGINT', function () {
  return exitGracefully(null);
});

// In case of an uncaught exception exists gracefully
process.on('uncaughtException', function (exception) {
  return exitGracefully(exception);
});

module.exports = {
  startup: startup,
  get hcpServer() {
    return hcpServer;
  },
  exitGracefully: exitGracefully
};
