---------------------------------------------------------------------
--
-- ElmRandom.elm
-- Cryptographically secure random number generator.
-- Copyright (c) 2017 Bill St. Clair <billstclair@gmail.com>
-- Some rights reserved.
-- Distributed under the MIT License
-- See LICENSE.txt
--
----------------------------------------------------------------------

module DevRandom exposing ( generate
                          , Config
                          , SendPort, ReceiveMsgWrapper
                          )

{-|
The `DevRandom` module provides a way to generate cryptographically-secure random numbers. It does this by using two ports to communicate with JavaScript code that calls `window.crypto.getRandomValues()`.

There are two ways to call the generator, depending on the `Config` parameter to `generate`. One way works in a pure Elm environment, and uses the normal Elm `Random` module, which is _not_ cryptographically secure. The other way requires you to use ports to communicate with JavaScript code, most of which is provided with the example.

See the [example readme](https://github.com/billstclair/elm-dev-random/tree/master/example) for instructions on creating the ports and using the included JavaScript code.

# Types
@docs SendPort, ReceiveMsgWrapper, Config

# Functions
@docs generate
-}

import Random

{-| Signature of send port for dev-random-port.js

The `Int` arg is the number of bytes (8-bit integers) to generate.
-}
type alias SendPort msg =
    Int -> Cmd msg

{-| Message wrapper for receive port of dev-random-port.js

    (isSecure, bytes) -> msg

If isSecure is True, then the random number generation was cryptographically secure.
-}
type alias ReceiveMsgWrapper msg =
    (Bool, List Int) -> msg

{-| Parameter to `generate` that determines whether to use the Elm `Random` module or ports to the JavaScript code that calls `window.crypto.getRandomValues()`.

If `sendPort` is not `Nothing`, will use the ports.

If `sendPort` is `Nothing`, and `receiveMsgWrapper` is not `Nothing`, will use the Elm `Random` module.
-}
type alias Config msg =
    { sendPort : Maybe (SendPort msg)
    , receiveMsgWrapper : Maybe (ReceiveMsgWrapper msg)
    }

{-| Generate a number of random bytes (integers between 0 and 255, inclusive).

    generate bytes config
    
If `config.sendPort` is not `Nothing`, return a `Cmd` that sends `bytes` through the port. Otherwise, if `config.receiveMsgWrapper` is not `Nothing`, use it to wrap the result of `Random.generate()` as a message for your `update` function.
-}
generate : Int -> Config msg -> Cmd msg
generate bytes config =
    case config.sendPort of
        Just thePort ->
            thePort bytes
        Nothing ->
            case config.receiveMsgWrapper of
                Nothing -> Cmd.none
                Just wrapper ->
                    Random.generate (\x -> wrapper (False, x)) <| generator bytes

generator : Int -> Random.Generator (List Int)
generator bytes =
    Random.list bytes <| Random.int 0 255
