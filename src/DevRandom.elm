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

import Random

{-| Signature of send port for dev-random-port.js -}
type alias SendPort msg =
    Int -> Cmd msg

{-| Message wrapper for receive port of dev-random-port.js -}
type alias ReceiveMsgWrapper msg =
    List Int -> msg

type alias Config msg =
    { sendPort : Maybe (SendPort msg)
    , receiveMsgWrapper : Maybe (ReceiveMsgWrapper msg)
    }

generate : Int -> Config msg -> Cmd msg
generate bytes config =
    case config.sendPort of
        Just thePort ->
            thePort bytes
        Nothing ->
            case config.receiveMsgWrapper of
                Nothing -> Cmd.none
                Just wrapper ->
                    Random.generate wrapper <| generator bytes

generator : Int -> Random.Generator (List Int)
generator bytes =
    Random.list bytes <| Random.int 0 255
