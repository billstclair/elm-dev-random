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
devRandomPort.initInt = initInt;

function err(msg) {
  throw new Error(msg);
}

function getBytes(bytes, crypto) {
  var res = [];
  if (bytes <= 0) {
    return res;
  }
  if (crypto) {
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
  return res;
}

function getCrypto() {
  var crypto = window.crypto;
  var secure = false;
  if (crypto) {
    if (!crypto.getRandomValues) {
      crypto = null;
    }
  }
  return crypto;
}

function init(cmdPort, subPort) {
  var crypto = getCrypto();
  var secure = crypto ? true : false;
  cmdPort.subscribe(function(bytes) {
    subPort.send([secure, getBytes(bytes, crypto)]);
  });
}

function bitSize(num) {
  return num.toString(2).length;
}

function byteSize(num) {
  var bits = bitSize(num);
  return Math.floor((bits + 7) / 8);
}

// Thanks to Patrick Chkoreff for the algorithm to ensure uniform coverage:
// https://github.com/chkoreff/Loom/blob/master/code/random.pm#L38
function initInt(cmdPort, subPort) {
  var crypto = getCrypto();
  var secure = crypto ? true : false;
  cmdPort.subscribe(function(ceiling) {
    if (ceiling <= 0) {
      subPort.send([secure, 0]);
      return;
    }
    var bytes = byteSize(ceiling);
    var maxInt = (ceiling * (256^bytes % ceiling)) - 1;
    var num;
    while (true) {
      var buf = getBytes(bytes, crypto);
      num = 0;
      for (var i in buf) {
        num = num*256 + buf[i];
      }
      if (num <= maxInt) {
        break;
      }
    }
    subPort.send([secure, num % ceiling]);
  });
}


})();    // Execute the enclosing function
