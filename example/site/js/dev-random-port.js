//////////////////////////////////////////////////////////////////////
//
// dev-random-port.js
// JavaScript for DevRandomPort.elm
// Copyright (c) 2017 Bill St. Clair <billstclair@gmail.com>
// Some rights reserved.
// Distributed under the MIT License
// See LICENSE.txt
//
//////////////////////////////////////////////////////////////////////

// The single global variable defined by this file
var devRandomPort = {};

(function() {

// External entry points
devRandomPort.init = init;

var getRandomValues = null;

function err(msg) {
  throw new Error(msg);
}

function init(app, cmdPortName, subPortName) {
  var crypto = window.crypto;
  if (crypto) {
    getRandomValues = crypto.getRandomValues;
  }
  var ports = app.ports;
  if (!ports) {
    err('app has no ports.');
  }
  var cmdPort = ports[cmdPortName];
  var subPort = ports[subPortName];
  if (!cmdPort) {
    err('Missing command port: ' + cmdPortName);
  }
  if (!subPort) {
    err('Missing subscription port: ' + subPortName);
  }
  cmdPort.subscribe(function(bytes) {
    var buf = new Uint8Array(bytes);
    if (getRandomValues) {
      getRandomValues(buf);
    } else {
      for (var i=0; i<bytes; i++) {
        buf[i] = Math.trunc(256 * Math.random());
      }
    }
    subPort.send(buf);
  });
}

})();    // Execute the enclosing function
