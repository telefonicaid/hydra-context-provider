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
var hcpConfig = require(ROOT_PATH + '/lib/hcpConfiguration');
var hcpLogger = require('logops');
var npmRequest = require('request');
var uuid = require('uuid');

/**
 * Returns the platform correlator if included in a request
 * @param {object} request The HTTP request
 * @return {string} The correlator, if any
 */
function getCorrelator(request) {
  return request && request.headers[hcpConfig.HEADER.CORRELATOR];
}

/**
 * Adds the Fiware-Correlator header into the response object
 * @param {object} request  The request
 * @param {object} response The response
 */
function addFiwareCorrelator(request, response) {
  response.header(hcpConfig.HEADER.CORRELATOR, getCorrelator(request) || request.hcp.context.trans);
}

/**
 * Generates the transaction identifier to be used for logging
 * @return {string} The generated transaction
 */
function createTransaction() {
  return uuid.v4();
}

/**
 * Returns the operation type for a concrete request to be used for logging
 * @param {object} request The request
 * @return {string} The operation type
 */
function getOperationType(request) {
  if (!request) {
    return hcpConfig.OPERATION_TYPE.SERVER_LOG;
  } else {
    return hcpConfig.OPERATION_TYPE_PREFIX + request.method.toUpperCase();
  }
}

/**
 * Returns the object to return in case no aggregated data exists for
 *  certain criteria
 * @returns {Array} An empty array
 */
function getEmptyResponse() {
  return [];
}

/**
 * Returns the entity id included in an updateContext request
 * @param  {Object} request The updateContext request
 * @return {String}         The entity id if any, undefined otherwise
 */
function getUpdateContextEntityId(request) {
  if (request && request.payload && request.payload.contextElements && Array.isArray(request.payload.contextElements) &&
    request.payload.contextElements[0]) {
      return request.payload.contextElements[0].id;
  }
}

/**
 * Returns the entity type included in an updateContext request
 * @param  {Object} request The updateContext request
 * @return {String}         The entity id if any, undefined otherwise
 */
function getUpdateContextEntityType(request) {
  if (request && request.payload && request.payload.contextElements && Array.isArray(request.payload.contextElements) &&
    request.payload.contextElements[0]) {
      return request.payload.contextElements[0].type;
  }
}

/**
 * Returns the attribute name included in an updateContext request
 * @param  {Object} request The updateContext request
 * @return {String}         The attribute name if any, undefined otherwise
 */
function getUpdateContextAttributeName(request) {
  if (request && request.payload && request.payload.contextElements && Array.isArray(request.payload.contextElements) &&
    request.payload.contextElements[0] && request.payload.contextElements[0].attributes &&
    Array.isArray(request.payload.contextElements[0].attributes) && request.payload.contextElements[0].attributes[0]) {
      return request.payload.contextElements[0].attributes[0].name;
  }
}

/**
 * Returns the attribute type included in an updateContext request
 * @param  {Object} request The updateContext request
 * @return {String}         The attribute type if any, undefined otherwise
 */
function getUpdateContextAttributeType(request) {
  if (request && request.payload && request.payload.contextElements && Array.isArray(request.payload.contextElements) &&
    request.payload.contextElements[0] && request.payload.contextElements[0].attributes &&
    Array.isArray(request.payload.contextElements[0].attributes) && request.payload.contextElements[0].attributes[0]) {
      return request.payload.contextElements[0].attributes[0].type;
  }
}

/**
 * Returns the attribute value included in an updateContext request
 * @param  {Object} request The updateContext request
 * @return {String}         The attribute value if any, undefined otherwise
 */
function getUpdateContextAttributeValue(request) {
  if (request && request.payload && request.payload.contextElements && Array.isArray(request.payload.contextElements) &&
    request.payload.contextElements[0] && request.payload.contextElements[0].attributes &&
    Array.isArray(request.payload.contextElements[0].attributes) && request.payload.contextElements[0].attributes[0]) {
      return request.payload.contextElements[0].attributes[0].value;
  }
}

/**
 * Returns the attribute value included in an queryContext response
 * @param  {Object} request The updateContext request
 * @return {String}         The attribute value if any, undefined otherwise
 */
function getQueryContextAttributeValue(response) {
  if (response && response.body && response.body.contextResponses && Array.isArray(response.body.contextResponses) &&
    response.body.contextResponses[0] && response.body.contextResponses[0].contextElement &&
    response.body.contextResponses[0].contextElement.attributes &&
    Array.isArray(response.body.contextResponses[0].contextElement.attributes) &&
    response.body.contextResponses[0].contextElement.attributes[0]) {
      return response.body.contextResponses[0].contextElement.attributes[0].value;
  }
}

/**
 * Returns a NGSI formatted response
 * @param request The updateContext request
 * @return {Object}  The response in NGSI format
 */
function getNGSIResponse(request) {
  var ngsiResponse = {
    contextResponses: [
      {
        contextElement: {
          attributes: [
            {
              name: getUpdateContextAttributeName(request),
              type: getUpdateContextAttributeType(request),
              values: ''
            }
          ],
          id: getUpdateContextEntityId(request),
          isPattern: false,
          type: getUpdateContextEntityType(request)
        },
        statusCode: {
          code: '200',
          reasonPhrase: 'OK'
        }
      }
    ]
  };
  return ngsiResponse;
}

/**
 * Returns the logging context associated to a request
 * @param {Object} request The request received
 * @return {Object} The context to be used for logging
 */
function getContext(request) {
  var transactionId = createTransaction();
  return {
    corr: getCorrelator(request) || transactionId,
    trans: transactionId,
    op: getOperationType(request),
    from: request.headers[hcpConfig.HEADER.X_REAL_IP] || 'n/a',
    srv: request.headers[hcpConfig.HEADER.FIWARE_SERVICE],
    subsrv: request.headers[hcpConfig.HEADER.FIWARE_SERVICE_PATH],
    comp: 'HCP'
  };
}

/**
 * Returns the delay to be used in a status notification to the Context Broker
 * @return {Number} The delay in milliseconds
 */
function getStatusNotificationDelay() {
  return Math.floor(Math.random() * (hcpConfig.HCP_DELAY_MAXIMUM - hcpConfig.HCP_DELAY_MINIMUM + 1)) +
    hcpConfig.HCP_DELAY_MINIMUM;
}

/**
 * Request a new authorzation token from the Identity Manager
 * @param  {Object}   request  The original updateContext request
 * @param  {Function} callback The callback
 */
function requestAuthorizationToken(request, callback) {
  var options = {
    uri: hcpConfig.HCP_AUTH_PROTOCOL + '://' + hcpConfig.HCP_AUTH_HOST + ':' +
      hcpConfig.HCP_AUTH_PORT + '/v3/auth/tokens',
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/json'
    },
    json: true,
    body: {
      'auth': {
        'identity': {
          'methods': [
            'password'
          ],
          'password': {
            'user': {
              'domain': {
                'name': request.raw.req.headers[hcpConfig.HEADER.FIWARE_SERVICE]
              },
              'name': hcpConfig.HCP_AUTH_USER,
              'password': hcpConfig.HCP_AUTH_PASSWORD
            }
          }
        },
        'scope': {
          'project': {
            'domain': {
              'name': 'urbo'
            },
            'name': request.raw.req.headers[hcpConfig.HEADER.FIWARE_SERVICE_PATH]
          }
        }
      }
    }
  };
  npmRequest(
    options,
    function(error, response) {
      if (error) {
        return callback(error);
      }
      return callback(null, response.headers['x-subject-token']);
    }
  );

  hcpLogger.debug(
    request.hcp.context,
    'Authorization token request sent to the Identity Manager: ' +
      '{ request: ' + JSON.stringify(options) + ' }'
  );
}

/**
 * Gets a request package options object to be sent to the Context Broker
 * @param  {Object} request        The original updateContext request
 * @param  {String} attributeName  The attribute name
 * @param  {String} attributeType  The attribute type
 * @param  {Object} attributeValue The attribute value
 * @return {Object}                The request package options object to be sent to the Context Broker
 */
function getUpdateContextOptions(request, attributeName, attributeType, attributeValue) {
  var options = {
    uri: hcpConfig.HCP_CONTEXT_BROKER_PROTOCOL + '://' + hcpConfig.HCP_CONTEXT_BROKER_HOST + ':' +
      hcpConfig.HCP_CONTEXT_BROKER_PORT + '/v1/updateContext',
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      'fiware-service': request.raw.req.headers[hcpConfig.HEADER.FIWARE_SERVICE],
      'fiware-servicepath': request.raw.req.headers[hcpConfig.HEADER.FIWARE_SERVICE_PATH],
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Auth-Token': request.hcp.token
    },
    json: true,
    body: {
      'contextElements': [
        {
          'id': getUpdateContextEntityId(request),
          'isPattern': 'false',
          'type': getUpdateContextEntityType(request),
          'attributes': [
            {
              'name': attributeName,
              'type': attributeType,
              'value': attributeValue
            }
          ]
        }
      ],
      'updateAction': 'APPEND'
    }
  };
  return options;
}

/**
 * Gets a request package options object to be sent to the Context Broker
 * @param  {Object} request        The original updateContext request
 * @param  {Array} attributeNames  The attribute names array
 * @param  {Array} attributeTypes  The attribute types array
 * @param  {Array} attributeValues The attribute values array
 * @return {Object}                The request package options object to be sent to the Context Broker
 */
function getUpdateContextOptionsArray(request, attributeNames, attributeTypes, attributeValues) {
  var options = {
    uri: hcpConfig.HCP_CONTEXT_BROKER_PROTOCOL + '://' + hcpConfig.HCP_CONTEXT_BROKER_HOST + ':' +
      hcpConfig.HCP_CONTEXT_BROKER_PORT + '/v1/updateContext',
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      'fiware-service': request.raw.req.headers[hcpConfig.HEADER.FIWARE_SERVICE],
      'fiware-servicepath': request.raw.req.headers[hcpConfig.HEADER.FIWARE_SERVICE_PATH],
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Auth-Token': request.hcp.token
    },
    json: true,
    body: {
      'contextElements': [
        {
          'id': getUpdateContextEntityId(request),
          'isPattern': 'false',
          'type': getUpdateContextEntityType(request),
          'attributes': [
          ]
        }
      ],
      'updateAction': 'APPEND'
    }
  };

  for (var ii = 0; ii < attributeNames.length; ii++) {
    options.body.contextElements[0].attributes.push(
      {
        'name': attributeNames[ii],
        'type': attributeTypes[ii],
        'value': attributeValues[ii]
      }
    );
  }
  return options;
}

/**
 * Gets a request package options object for a queryContext to be sent to the Context Broker
 * @param  {Object} request        The original updateContext request
 * @param  {String} attributeName  The attribute name
 * @return {Object}                The request package options object for a queryContext to be sent to the
 *                                 Context Broker
 */
function getQueryContextOptions(request, attributeName) {
  var options = {
    uri: hcpConfig.HCP_CONTEXT_BROKER_PROTOCOL + '://' + hcpConfig.HCP_CONTEXT_BROKER_HOST + ':' +
      hcpConfig.HCP_CONTEXT_BROKER_PORT + '/v1/queryContext',
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      'fiware-service': request.raw.req.headers[hcpConfig.HEADER.FIWARE_SERVICE],
      'fiware-servicepath': request.raw.req.headers[hcpConfig.HEADER.FIWARE_SERVICE_PATH],
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Auth-Token': request.hcp.token
    },
    json: true,
    body: {
      'entities': [
        {
          'id': getUpdateContextEntityId(request),
          'isPattern': 'false',
          'type': getUpdateContextEntityType(request)
        }
      ],
      'attributes': [ attributeName ]
    }
  };
  return options;
}

/**
 * Send the status notification to the Context Broker
 * @param  {Object}    request The original updateContext request
 */
function sendStatus2CB(request) {
  var options = getUpdateContextOptions(
    request,
    getUpdateContextAttributeName(request) + hcpConfig.STATUS_NOTIFICACION_SUFFIX,
    getUpdateContextAttributeType(request),
    'OK'
  );

  npmRequest(
    options,
    function(error, response, body) {
      if (error || (body && body.contextResponses && Array.isArray(body.contextResponses) && body.contextResponses[0] &&
        body.contextResponses[0].statusCode && body.contextResponses[0].statusCode.code &&
        body.contextResponses[0].statusCode.code[0] !== '2')) {
          hcpLogger.error(
            request.hcp.context,
            'Error response by the Context Broker to a status notification update request: ' +
              '{ request: ' + JSON.stringify(options) + ', error: ' +
              JSON.stringify(error || body.contextResponses[0].statusCode) + '}'
          );
      } else {
        hcpLogger.debug(
          request.hcp.context,
          'Successful response by the Context Broker to a status notification update request: {' +
            'request: ' + JSON.stringify(options) + ', ' +
            'response: ' + JSON.stringify(body) + ' ' +
          '}'
        );
      }
    }
  );

  hcpLogger.debug(
    request.hcp.context,
    'Status notification update request sent to the Context Broker: ' +
      '{ request: ' + JSON.stringify(options) + ' }'
  );
}

/**
 * Sends an updateContext request to the Context Broker
 * @param  {Object} request The original updateContext request
 * @param  {Object} options The request NPM package options to be sent
 */
function sendUpdateContextRequest(request, options) {
  npmRequest(
    options,
    function(error, response, body) {
      if (error || (body && body.contextResponses && Array.isArray(body.contextResponses) && body.contextResponses[0] &&
        body.contextResponses[0].statusCode && body.contextResponses[0].statusCode.code &&
        body.contextResponses[0].statusCode.code[0] !== '2')) {
          hcpLogger.error(
            request.hcp.context,
            'Error response by the Context Broker to a command request: ' +
              '{ request: ' + JSON.stringify(options) + ', error: ' +
              JSON.stringify(error || body.contextResponses[0].statusCode) + '}'
          );
      } else {
        hcpLogger.debug(
          request.hcp.context,
          'Successful response by the Context Broker to a command request: {' +
            'request: ' + JSON.stringify(options) + ', ' +
            'response: ' + JSON.stringify(body) + ' ' +
          '}'
        );

        sendStatus2CB(request);
      }
    }
  );

  hcpLogger.debug(
    request.hcp.context,
    'Command associated attibutes updateContext sent to the Context Broker: ' +
      '{ request: ' + JSON.stringify(options) + ' }'
  );
}

/**
 * Process a command request
 * @param  {Object} request The original updateContext request
 */
function processCommand(request) {
  var options;
  requestAuthorizationToken(request, function(err, token) {
    if (err) {
      hcpLogger.error(
        request.hcp.context,
        'Error response by the Identity Manager to a authorization token request: ' +
          '{ request: ' + JSON.stringify(request.payload) + ', error: ' +
          JSON.stringify(err) + '}'
      );
    }
    request.hcp.token = token;
    if (getUpdateContextAttributeName(request) === hcpConfig.ACTUACION_ENCENDIDO_CON_SEGURIDAD_2) {
      if (getUpdateContextAttributeValue(request) === '1') {
        options = getUpdateContextOptionsArray(
          request,
          [ hcpConfig.LAST_COMMAND, hcpConfig.LAST_COMMAND_TIMESTAMP, hcpConfig.POWER_STATE_GENERAL,
            hcpConfig.POWER_STATE_REDUCED],
          [ hcpConfig.TEXT, hcpConfig.DATE_TIME, hcpConfig.NUMBER, hcpConfig.NUMBER],
          [ hcpConfig.GENERAL, new Date().toISOString(), 1, 0]
        );
        sendUpdateContextRequest(request, options);
      } else if (getUpdateContextAttributeValue(request) === '0') {
        options = getUpdateContextOptionsArray(
          request,
          [ hcpConfig.LAST_COMMAND, hcpConfig.LAST_COMMAND_TIMESTAMP, hcpConfig.POWER_STATE_GENERAL,
            hcpConfig.POWER_STATE_REDUCED],
          [ hcpConfig.TEXT, hcpConfig.DATE_TIME, hcpConfig.NUMBER, hcpConfig.NUMBER],
          [ hcpConfig.OFF, new Date().toISOString(), 0, 0]
        );
        sendUpdateContextRequest(request, options);
      }
    } else if (getUpdateContextAttributeName(request) === hcpConfig.ACTUACION_ENCENDIDO_CON_SEGURIDAD) {
      options = getQueryContextOptions(request, hcpConfig.POWER_STATE_GENERAL);
      npmRequest(
        options,
        function(error, response, body) {
          if (error || (body && body.contextResponses && Array.isArray(body.contextResponses) &&
            body.contextResponses[0] && body.contextResponses[0].statusCode &&
            body.contextResponses[0].statusCode.code &&
            body.contextResponses[0].statusCode.code[0] !== '2')) {
              hcpLogger.error(
                request.hcp.context,
                'Error response by the Context Broker to a queryContext request: ' +
                  '{ request: ' + JSON.stringify(options) + ', error: ' +
                  JSON.stringify(error || body.contextResponses[0].statusCode) + '}'
              );
          } else {
            hcpLogger.debug(
              request.hcp.context,
              'Successful response by the Context Broker to a queryContext request: {' +
                'request: ' + JSON.stringify(options) + ', ' +
                'response: ' + JSON.stringify(body) + ' ' +
              '}'
            );

            var powerStateGeneral = getQueryContextAttributeValue(response);
            if (powerStateGeneral === '1') {
              if (getUpdateContextAttributeValue(request) === '1') {
                options = getUpdateContextOptionsArray(
                  request,
                  [ hcpConfig.LAST_COMMAND, hcpConfig.LAST_COMMAND_TIMESTAMP, hcpConfig.POWER_STATE_GENERAL,
                    hcpConfig.POWER_STATE_REDUCED],
                  [ hcpConfig.TEXT, hcpConfig.DATE_TIME, hcpConfig.NUMBER, hcpConfig.NUMBER],
                  [ hcpConfig.REDUCIDA, new Date().toISOString(), 1, 1]
                );
                sendUpdateContextRequest(request, options);
              } else if (getUpdateContextAttributeValue(request) === '0') {
                options = getUpdateContextOptionsArray(
                  request,
                  [ hcpConfig.LAST_COMMAND, hcpConfig.LAST_COMMAND_TIMESTAMP, hcpConfig.POWER_STATE_GENERAL,
                    hcpConfig.POWER_STATE_REDUCED],
                  [ hcpConfig.TEXT, hcpConfig.DATE_TIME, hcpConfig.NUMBER, hcpConfig.NUMBER],
                  [ hcpConfig.GENERAL, new Date().toISOString(), 1, 0]
                );
                sendUpdateContextRequest(request, options);
              }
            }
          }
        }
      );
    }
  });
}

module.exports = {
  addFiwareCorrelator: addFiwareCorrelator,
  getContext: getContext,
  getCorrelator: getCorrelator,
  getEmptyResponse: getEmptyResponse,
  getNGSIResponse: getNGSIResponse,
  getStatusNotificationDelay: getStatusNotificationDelay,
  processCommand: processCommand
};
