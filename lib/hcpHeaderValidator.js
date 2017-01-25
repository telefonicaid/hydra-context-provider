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
var boom = require('boom');

/**
 * Header validation handler
 * @param value The headers
 * @param options Possible options
 * @param next The header validation next() function
 * @return {*} This function does not return anything of interest
 */
function headerValidator(value, options, next) {
  var error, message;

  if (!value[hcpConfig.HEADER.FIWARE_SERVICE]) {
    message = 'error=child "' + hcpConfig.HEADER.FIWARE_SERVICE + '" fails because [' +
      hcpConfig.HEADER.FIWARE_SERVICE + ' is required]';
    hcpLogger.warn(
      hcpConfig.LOGGING_CONTEXT.SERVER_LOG,
      message
    );
    error = boom.badRequest(message);
    return next(error);
  } else if (!value[hcpConfig.HEADER.FIWARE_SERVICE_PATH]) {
    message = 'child "' + hcpConfig.HEADER.FIWARE_SERVICE_PATH + '" fails because [' +
      hcpConfig.HEADER.FIWARE_SERVICE_PATH + ' is required]';
    hcpLogger.warn(
      hcpConfig.LOGGING_CONTEXT.SERVER_LOG,
      message
    );
    error = boom.badRequest(message);
    return next(error);
  }
  return next();
}

module.exports = headerValidator;
