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

module Diceware exposing ( Model, Msg ( ReceiveInt )
                         , init, update, view )

import DevRandom exposing ( IntConfig, SendPort )
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
    { config : IntConfig Msg
    , countString : String
    , count : Int
    , strings : List String
    , isSecure : Bool
    , diceStrings : Array String
    , dice : Array Int
    }

init : Maybe (SendPort Msg) -> ( Model, Cmd Msg )
init sendPort =
    let config = case sendPort of
                     Nothing -> { sendPort = Nothing
                                , receiveIntMsgWrapper = Just ReceiveInt
                                }
                     _ ->
                         { sendPort = sendPort
                         , receiveIntMsgWrapper = Nothing
                         }
    in
        ( { config = config
          , countString = "5"
          , count = 5
          , strings = []
          , isSecure = True
          , diceStrings = Array.fromList [ "", "", "", "", "" ]
          , dice = Array.fromList [ 0, 0, 0, 0, 0 ]
          }
        , DevRandom.generateInt DicewareStrings.count config
        )

type Msg = UpdateCount String
         | UpdateDie Int String
         | Generate
         | Clear
         | ReceiveInt (Bool, Int)
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
            case model.count of
                0 ->
                    ( { model | strings = [] }
                      , Cmd.none
                    )
                _ ->
                    ( { model | strings = [] }
                    , DevRandom.generateInt DicewareStrings.count model.config )

        Clear ->
            ( { model
                  | strings = []
                  , isSecure = True
              }
            , Cmd.none
            )

        ReceiveInt (isSecure, idx) ->
            let string = case (Array.get idx DicewareStrings.array) of
                             Nothing -> "a"
                             Just s -> s
                strings = string :: model.strings
            in
            ( { model
                  | strings = strings
                  , isSecure = isSecure
              }
            , if (List.length strings) >= model.count then
                  Cmd.none
              else
                  DevRandom.generateInt DicewareStrings.count model.config
            )
            
        LookupDice ->
            ( lookupDice model
            , Cmd.none
            )

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
                    , isSecure = True
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
    div [ style [ ( "width", "40em" )
                , ( "margin-left", "2em" )
                ]
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
        , p [ style [ ( "margin-left", "1em" )
                    , ( "font-size", "150%" )
                    , ( "color"
                      , if model.isSecure then
                            "black"
                        else
                            "red"
                      )
                    ]
            ]
            ( let strings = case model.strings of
                                [] -> [nbsp]
                                ss -> ss
              in
                  List.intersperse
                    (text " ")
                    <| List.map text strings
            )
        , h3 []
            [ text "Roll Your Own Dice" ]
        , p []
            <| List.append
                 (dieInputs model)
                 [ text " "
                 , button [ onClick LookupDice ] [ text "Lookup" ]
                 ]
        , p []
            [ text "To generate a passphrase, fill in \"Words\" with the number of words to generate, and click the \"Generate\" button. To clear the word string, click \"Clear\"."
            ]
        , p []
            [ text "If the passphrase is black, then cryptographically-secure random number generation was used. If it is red, then the random number generation was NOT cryptographically secure, because "
            , text
                <| case model.config.sendPort of
                       Nothing ->
                           "you are running the pure Elm version of the code."
                       _ ->
                           "your browser does not support it."
            ]
        , p []
            [ text "If you prefer rolling your own dice to using your computer's random number generator, you can fill in the five boxes to the left of the \"Lookup\" button with the numbers (1-6) from five six-sided dice rolls, then click that button. It will add one word to the end of the list."
            ]
        , p []
            [ text "For more information about Diceware, see "
            , a [ href "http://diceware.com/" ]
                [ text "Diceware.com" ]
            , text ". "
            , text "The classic XKCD cartoon about Diceware is at "
            , a [ href "https://xkcd.com/936/" ]
                [ text "xkcd.com/936" ]
            , text "."
            ]
        , p []
            [ text "A five-word Diceware passphrase has 6^5^5 possibilities, over 64 bits. A ten-word Diceware passphrase has 6^5^10 possibilities, over 129 bits."
            ]
        , p []
            [ text "Source code: "
            , a [ href "https://github.com/billstclair/elm-dev-random" ]
                [ text "github.com/billstclair/elm-dev-random" ]
            , br
            , text "Copyright 2017 Bill St. Clair" ]
        ]
