---------------------------------------------------------------------
--
-- ports.elm
-- Port-based Diceware example for DevRandom module.
-- Copyright (c) 2017 Bill St. Clair <billstclair@gmail.com>
-- Some rights reserved.
-- Distributed under the MIT License
-- See LICENSE.txt
--
----------------------------------------------------------------------

port module Main exposing (..)

import Diceware exposing (Model, Msg(..))
import Html exposing (Html)

port getDevRandomInt : Int -> Cmd msg
port receiveRandomInt : ((Bool, Int) -> msg) -> Sub msg

main =
    Html.programWithFlags
        { init = init
        , view = Diceware.view
        , update = Diceware.update
        , subscriptions = subscriptions
        }

init : () -> ( Model, Cmd Msg )
init _ =
    Diceware.init <| Just getDevRandomInt

subscriptions : Model -> Sub Msg
subscriptions model =
    receiveRandomInt ReceiveInt
