---------------------------------------------------------------------
--
-- noports.elm
-- Pure Elm Diceware example for DevRandom module.
-- Dictionary mapping integer to Diceware string
-- Copyright (c) 2017 Bill St. Clair <billstclair@gmail.com>
-- Some rights reserved.
-- Distributed under the MIT License
-- See LICENSE.txt
--
----------------------------------------------------------------------

module Main exposing (..)

import Diceware
import Html exposing (Html)

main =
    Html.program
        { init = Diceware.init Nothing
        , view = Diceware.view
        , update = Diceware.update
        , subscriptions = (\x -> Sub.none)
        }
