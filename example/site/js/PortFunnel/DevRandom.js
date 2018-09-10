//////////////////////////////////////////////////////////////////////
//
// DevRandom.js
// A PortFunnel for DevRandomPort.elm
// Copyright (c) 2017-2018 Bill St. Clair <billstclair@gmail.com>
// Some rights reserved.
// Distributed under the MIT License
// See LICENSE.txt
//
//////////////////////////////////////////////////////////////////////

(function() {

  var moduleName = 'DevRandom';
  var sub = PortFunnel.sub;

  var crypto = getCrypto();
  var secure = crypto ? true : false;

  PortFunnel.modules[moduleName].cmd = dispatcher;

  // Let the Elm code know we've started.
  sub.send({ module: moduleName,
             tag: "startup",
             args: null
           });

  function dispatcher(tag, args) {
    if (tag == 'generatebytes') {
      var bytes = getBytes(args, crypto);
      return { module: moduleName,
               tag: 'randombytes',
               args: { isSecure: secure,
                       bytes: bytes
                     }
             }
    } else if (tag == 'generateint') {
      var int = getInt(args, crypto);
      return { module: moduleName,
               tag: 'randomint',
               args: { isSecure: secure,
                       int: int
                     }
             }
    } else {
      return null;
    }    
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
  function bitSize(num) {
    return num.toString(2).length;
  }

  function byteSize(num) {
    var bits = bitSize(num);
    return Math.floor((bits + 7) / 8);
  }

// Thanks to Patrick Chkoreff for the algorithm to ensure uniform coverage:
// https://github.com/chkoreff/Loom/blob/master/code/random.pm#L38
  function getInt(ceiling, crypto) {
    if (ceiling <= 0) {
      return 0;
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
    return num % ceiling;
  }


})();    // Execute the enclosing function
