This directory contains two implementations of a simple Diceware passphrase generator, using the `DevRandom` module to generate random numbers for the dice rolls.

## Files

* `noports.elm` is a pure Elm version, that uses the (_not_ cryptographically secure) Elm `Random` module.
* `ports.elm` is a version that uses two ports to the JavaScript code in the [`site`](site/) directory to call `window.crypto.getRandomBytes()`, which _is_ cryptographically secure. It must be compiled into JavaScript for use by `site/index.html`.
* `Diceware.elm` is a shared user interface module used by both `noports.elm` and `ports.elm`.
* `DicewareStrings.elm` contains the 7,776 (6^5) Diceware strings, one for each roll of five six-sided dice.

## Running the examples

The easiest way to run `noports.elm` is via Elm reactor:

    cd .../elm-dev-random/example
    elm reactor

Then aim your web browser at [localhost:8000/noports.elm](http://localhost:8000/noports.elm).

In order to run `ports.elm`, you need to compile it into JavaScript as `site/js/Main.js`:

    cd .../elm-dev-random/example
    bin/build

Then aim your web browser at `site/index.html`.

The `site` directory is live at [lisplog.org/diceware](https://lisplog.org/diceware/).

`bin/m <file>` is a shortcut for `elm make <file>.elm --output /dev/null`.

## Adding the ports to your own Elm program

The JavaScript code communicates with your program via two ports, as defined in `ports.elm`:

    port getDevRandom : Int -> Cmd msg
    port receiveRandomBytes : (List Int -> msg) -> Sub msg

You can name these anything you want, but the signatures must match. If you use different names, you must change the `site/index.html` code to use your names.

Your `index.html` file must include the `site/js/dev-random-port.js` file, e.g via a line in its `&lt;head>` section:

    &lt;script type='text/javascript' src='js/dev-random-port.js'>&lt;/script>

Your `index.html` file must call `devRandomPort.init()` to attach the code that calls `window.crypto.getRandomBytes()` to your ports:

    var app = Elm.Main.fullscreen(null);
    devRandomPort.init(app, "getDevRandom", "receiveRandomBytes");

If your `init` function takes an argument, you'll pass that value instead of `null` to `Elm.Main.fullscreen()`.
