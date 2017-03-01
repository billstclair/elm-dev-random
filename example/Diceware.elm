---------------------------------------------------------------------
--
-- Diceware.elm
-- Shared user interface for Diceware example of using DevRandom module.
-- Copyright (c) 2017 Bill St. Clair <billstclair@gmail.com>
-- Some rights reserved.
-- Distributed under the MIT License
-- See LICENSE.txt
--
----------------------------------------------------------------------

module Diceware exposing ( Model, Msg (..)
                         , init, update, view )

import DevRandom exposing ( Config, SendPort )
import DicewareStrings

import Html exposing ( Html, Attribute
                     , div, p, h2, h3, text
                     , input, button, a, img
                     )
import Html.Attributes exposing ( value, size, href, src, title, alt, style )
import Html.Events exposing ( onClick, onInput )
import Array exposing ( Array )
import Char
import List.Extra as LE
import Debug exposing (log)

type alias Model =
    { config : Config Msg
    , countString : String
    , count : Int
    , strings : List String
    , diceStrings : Array String
    , dice : Array Int
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
          , diceStrings = Array.fromList [ "1", "1", "1", "1", "1" ]
          , dice = Array.fromList [ 1, 1, 1, 1, 1 ]
          }
        , Cmd.none
        )

type Msg = UpdateCount String
         | UpdateDie Int String
         | Generate
         | Clear
         | ReceiveBytes (List Int)
         | LookupDice

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateCount countString ->
            ( { model
                  | countString = countString
                  , count = case String.toInt countString of
                                Ok count -> max 0 (min count 20)
                                Err _ -> 0
              }
            , Cmd.none
            )

        UpdateDie idx string ->
            let value = case String.toInt string of
                            Ok v ->
                                if v < 1 || v > 6 then
                                    0
                                else
                                    v
                            Err _ ->
                                0
            in
                ( { model
                        | diceStrings = Array.set idx string model.diceStrings
                        , dice = Array.set idx value model.dice
                  }
                , Cmd.none
                )
            
        Generate ->
            case 2 * model.count of
                0 ->
                    ( { model | strings = [] }
                      , Cmd.none
                    )
                bytes ->
                    ( model, DevRandom.generate bytes model.config )

        Clear ->
            ( { model | strings = [] }
            , Cmd.none
            )

        ReceiveBytes bytes ->
            ( { model | strings = receiveBytes bytes [] }
            , Cmd.none
            )
            
        LookupDice ->
            ( lookupDice model
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

lookupDice : Model -> Model
lookupDice model =
    case LE.find (\x -> x == 0) (Array.toList model.dice) of
        Just _ ->
            model
        Nothing ->
            let count = model.count
                strings = model.strings
                stringsTail = List.drop
                                ((List.length strings) - count + 1) strings
                idx = List.foldl
                        (\x y -> (6 * y) + x - 1)
                        0
                        <| Array.toList model.dice
                string = case Array.get idx DicewareStrings.array of
                             Nothing -> "a"
                             Just x -> x
            in
                { model
                    | strings = List.append stringsTail [string]
                }

nbsp : String
nbsp =
    String.fromList [ Char.fromCode 160 ]

dieString : Int -> Model -> String
dieString idx model =
    case Array.get idx model.diceStrings of
        Nothing -> "1"
        Just s -> s

dieInputs : Model -> List (Html Msg)
dieInputs model =
    List.intersperse
        (text " ")
        <| List.map (\x ->
                         input
                           [ size 1
                           , onInput <| UpdateDie x
                           , value <| dieString x model
                           ]
                           []
                    )
                    [0, 1, 2, 3, 4]

br : Html Msg
br =
    Html.br [] []

view : Model -> Html Msg
view model =
    div [ style [ ( "width", "40em" ) ]
        ]
        [ h2 [] [ text "Diceware Passphrase Generator" ]
        , p []
            [ text "This page generates passphrases using JavaScript running in your web browser, using the browser's cryptographically secure random number generator. See below for instructions." ]
        , p []
            [ text "Words: "
            , input [ size 3
                    , onInput UpdateCount
                    , value model.countString
                    ]
                  []
            , text " "
            , button [ onClick Generate ] [ text "Generate" ]
            , text " "
            , button [ onClick Clear ] [ text "Clear" ]
            ]
        , p [ style [ ( "margin-left", "1em" ) ]
            ]
            ( let strings = case model.strings of
                                [] -> [nbsp]
                                ss -> ss
              in
                  List.map (\s -> text (s ++ " ")) strings
            )
        , h3 []
            [ text "Roll Your Own Dice" ]
        , p []
            <| List.append
                 (dieInputs model)
                 [ button [ onClick LookupDice ] [ text "Lookup" ]
                 ]
        , p []
            [ text "To generate a passphrase, will in \"Words\" with the number of words to generate and click the \"Generate\" button. To clear the word string, click \"Clear\". If you prefer rolling your own dice to using your computer's random number generator, you can fill in the five numbers to the left of the \"Lookup\" button with the numbers from five dice, then click that button. It will add one word to the end of the list."
            ]
        , p []
            [ text "For more information about Diceware, see "
            , a [ href "http://diceware.com/" ]
                [ text "Diceware.com" ]
            , text "."
            ]
        , p []
            [ text "Source code: "
            , a [ href "https://github.com/billstclair/elm-dev-random" ]
                [ text "github.com/billstclair/elm-dev-random" ]
            , br
            , text "Copyright 2017 Bill St. Clair" ]
        ]
