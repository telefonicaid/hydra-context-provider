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

var config = {};

// HCP server configuration
//--------------------------
config.server = {
  // The host where the HCP server will be started.
  // Default value: "localhost".
  host: 'localhost',
  // The port where the HCP server will be listening.
  // Default value: 8777.
  port: 8777,
  // The minumum and maximum delay in milliseconds to send the status notification to the Context Broker
  delay: {
    // The minimum delay in milliseconds to send the status notification to the Context Broker.
    // Default value: 1000.
    minimum: 3000,
    // The maximum delay in milliseconds to send the status notification to the Context Broker.
    // Default value: 1000.
    maximum: 5000
  }
};

// Context Broker configuration
//------------------------------
config.contextBroker = {
  // The protocol to be use to interact with the Context Broker.
  // Default value: "https".
  protocol: 'https',
  // The host where the Context Broker will be running.
  // Default value: "localhost".
  host: 'localhost',
  // The port where the Context Broker will be listening.
  // Default value: 1026.
  port: 1026,
};

// Authorization configuration
//------------------------------
config.auth = {
  // The protocol to be use to interact with the Identity Manager.
  // Default value: "https".
  protocol: 'https',
  // The host where the Identity Manager will be running.
  // Default value: "localhost".
  host: 'localhost',
  // The port where the Identity Manager will be listening.
  // Default value: 5001.
  port: 5001,
  // The user
  user: 'user',
  // The password
  password: 'password'
};

// Logging configuration
//------------------------
config.logging = {
  // The logging level of the messages. Messages with a level equal or superior to this will be logged.
  // Accepted values are: "debug", "info", "warn" and "error". Default value: "info".
  level: 'info',
  // The logging format:
  // - "json": writes logs as JSON.
  // - "dev": for development. Used as the 'de-facto' value when the NODE_ENV variable is set to 'development'.
  // - "pipe": writes logs separating the fields with pipes.
  format: 'pipe',
  // The time in seconds between proof of life logging messages informing that the server is up and running normally.
  // Default value: "60"
  proofOfLifeInterval: '60'
};

module.exports = config;
