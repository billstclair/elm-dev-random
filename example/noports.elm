---------------------------------------------------------------------
--
-- noports.elm
-- Pure Elm Diceware example for DevRandom module.
-- Copyright (c) 2017 Bill St. Clair <billstclair@gmail.com>
-- Some rights reserved.
-- Distributed under the MIT License
-- See LICENSE.txt
--
----------------------------------------------------------------------


module Main exposing (main)

import Browser
import Diceware


main =
    Browser.element
        { init = \() -> Diceware.init Nothing
        , view = Diceware.view
        , update = Diceware.update
        , subscriptions = \x -> Sub.none
        }
