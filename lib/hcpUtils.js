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
var hcpPackage = require(ROOT_PATH + '/package.json');

/**
 * Returns version information about this concrete instance of the HCP component
 * @return {object} A JSON-formatted object including the version information
 */
function getVersion() {
  var message = {};
  if (hcpPackage) {
    if (hcpPackage.version) {
      message.version = hcpPackage.version;
    }
  }
  if (Object.getOwnPropertyNames(message).length === 0) {
    message.version = 'No version information available';
  }
  return message;
}

module.exports = {
  getVersion: getVersion
};
