This directory contains a simple Diceware passphrase generator, using the `DevRandom` module to generate random numbers for the dice rolls.

## Files

* `Main.elm` is the top-level user interface module.
* `DicewareStrings.elm` contains the 7,776 (6^5) Diceware strings, one for each roll of five six-sided dice.
* `NewDiceWareStrings.elm` contains the EFF's new 7,776 Diceware strings.
* `ShortDicewareStrings.elm` contains the EFF's new 1,296 (6^4) Diceware strings.
* `eff_large_wordlist.txt` contains just the words for the Electronic Freedom Foundation's long [new word lists](https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases). This file is here just to archive it. The code uses `NewDicewareStrings.elm`.
* `eff_short_wordlist_1.txt` contains just the words for the Electronic Freedom Foundation's first short word list. Again, just here as an archive.

## Running the example

To run the example in `elm reactor`

    cd .../elm-dev-random/example
    elm reactor

Then aim your web browser at [localhost:8000/Main.elm](http://localhost:8000/Main.elm).

In order to run it with real ports, you need to compile it into JavaScript as `site/js/elm.js`:

    cd .../elm-dev-random/example
    bin/build

Then aim your web browser at `site/index.html` (or run `elm reactor`, and aim your browser at [localhost:8000/site/index.html](http://localhost:8000/site/index.html)).

The `site` directory is live at [lisplog.org/diceware](https://lisplog.org/diceware/).

`bin/m <file>` is a shortcut for `elm make <file>.elm --output /dev/null`.

## Adding the ports to your own Elm program

The JavaScript code communicates with your program via two ports, managed by [billstclair/elm-port-funnel](http://package.elm-lang.org/packages/billstclair/elm-portfunnel/latest). These are defined in `Main.elm`:

    port cmdPort : Value -> Cmd msg
    port subPort : (Value -> msg) -> Sub msg

If you change these names, you'll have to change

Your `index.html` file must include the `site/js/dev-random-port.js` file, e.g via a line in its `<head>` section:

    <script type='text/javascript' src='js/dev-random-port.js'></ script>

Your `index.html` file must call `devRandomPort.init()` to attach the code that calls `window.crypto.getRandomBytes()` to your ports:

    var app = Elm.Main.fullscreen(null);
    devRandomPort.init(app.ports.getDevRandom, app.ports.receiveRandomBytes);

If your `init` function takes an argument, you'll pass that value instead of `null` to `Elm.Main.fullscreen()`.
