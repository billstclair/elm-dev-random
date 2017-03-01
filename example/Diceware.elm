---------------------------------------------------------------------
--
-- DicewareStrings.elm
-- Dictionary mapping integer to Diceware string
-- Copyright (c) 2017 Bill St. Clair <billstclair@gmail.com>
-- Some rights reserved.
-- Distributed under the MIT License
-- See LICENSE.txt
--
----------------------------------------------------------------------

module Diceware exposing ( Msg (..)
                         , init, update, view )

import DevRandom exposing ( Config, SendPort )
import DicewareStrings

type alias Model =
    { config : Config Msg
    , countString : String
    , count : Int
    , strings : List String
    }

init : Maybe (SendPort Msg) -> ( Model, Cmd Msg )
init sendPort =
    let config = case sendPort of
                     Nothing -> { sendPort = Nothing
                                , receiveMsgWrapper = Just ReceiveBytes
                                }
                     _ ->
                         { sendPort = sendPort
                         , receiveMsgWrapper = Nothing
                         }
    in
        ( { config = config
          , countString = "5"
          , count = 5
          , strings = []
          }
        , Cmd.none
        )

type Msg = UpdateCount String
         | Compute    
         | ReceiveBytes (List Int)

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateCount countString ->
            ( { model
                  | countString = countString
                  , count = case String.toInt countString of
                                Ok count -> count
                                Err _ -> 0
              }
            , Cmd.none )
        Compute ->
            case 2 * model.count of
                0 ->
                    ( model, Cmd.none )
                bytes ->
                    ( model, DevRandom.generate bytes model.config )
        ReceiveBytes bytes ->
            ( { model | strings = receiveBytes bytes [] }
            , Cmd.none
            )

receiveBytes : List Int -> List String -> List String
receiveBytes bytes res =
    case bytes of
        b0 :: rest ->
             case rest of
                 b1 :: rest2 ->
                      (DicewareStrings.bytesToString b0 b1) :: res
                          |> receiveBytes rest2
                 _ ->
                     res
        _ ->
            res

view : Model -> Model
view model =
    model
