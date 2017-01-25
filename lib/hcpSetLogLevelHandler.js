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
var hcpServerUtils = require(ROOT_PATH + '/lib/hcpServerUtils');

/**
 * Sets the log level to the value passed in the request
 * @param request The received request
 * @param reply hapi's server reply() function
 */
function setLogLevelHandler(request, reply) {
  var response;

  request.hcp = request.hcp || {};
  request.hcp.context = hcpServerUtils.getContext(request);

  hcpLogger.debug(
    request.hcp.context,
    'Set log level request received: { ' +
      'method: "' + request.method.toUpperCase() + '", ' +
      'path: "' + request.url.path + '", ' +
      'payload: "' + JSON.stringify(request.payload) + '" ' +
    '}'
  );

  var level = (request.query.level.toUpperCase() === 'WARNING') ?
    'WARN' : request.query.level.toUpperCase();
  hcpLogger.setLevel(level);

  hcpLogger.info(
    request.hcp.context,
    'Log level set to: ' + level
  );

  response = reply();
  hcpServerUtils.addFiwareCorrelator(request, response);

  hcpLogger.debug(
    request.hcp.context,
    'Log level set response sent: { level: "' + level + '" }'
  );
}

module.exports = setLogLevelHandler;
