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

var crypto = null;

function err(msg) {
  throw new Error(msg);
}

function init(app, cmdPortName, subPortName) {
  crypto = window.crypto;
  if (crypto) {
    if (!crypto.getRandomValues) {
      crypto = null;
    }
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
    var res = [];
    var secure = false;
    if (crypto) {
      secure = true;
      var buf = new Uint8Array(bytes);
      crypto.getRandomValues(buf);
      for (var i in buf) {
        res.push(buf[i]);
      }
    } else {
      for (var i=0; i<bytes; i++) {
        res.push(Math.trunc(256 * Math.random()));
      }
    }
    subPort.send([secure, res]);
  });
}

})();    // Execute the enclosing function
