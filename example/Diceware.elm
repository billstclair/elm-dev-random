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
import NewDicewareStrings
import ShortDicewareStrings

import Html exposing ( Html, Attribute
                     , div, span, p, h2, h3, text
                     , input, button, a, img
                     , select, option
                     , ul, li
                     )
import Html.Attributes exposing ( value, size, href, src, title
                                , alt, style, selected )
import Html.Events exposing ( onClick, onInput )
import Array exposing ( Array )
import Char
import List.Extra as LE
import Debug exposing (log)

type DicewareTable
    = OldTable
    | NewTable
    | ShortTable

type alias Model =
    { config : IntConfig Msg
    , countString : String
    , count : Int
    , strings : List String
    , isSecure : Bool
    , whichTable : DicewareTable
    , diceStrings : Array String
    , dice : Array Int
    }

makeConfig : Maybe (SendPort Msg) -> IntConfig Msg
makeConfig sendPort =
    case sendPort of
        Nothing -> { sendPort = Nothing
                   , receiveIntMsgWrapper = Just ReceiveInt
                   }
        _ ->
            { sendPort = sendPort
            , receiveIntMsgWrapper = Nothing
            }

makeInitialModel : Int -> Maybe (SendPort Msg) -> Model
makeInitialModel count sendPort =
    let config = makeConfig sendPort
        model = { config = config
                , countString = toString count
                , count = count
                , strings = []
                , isSecure = True
                , whichTable = ShortTable
                , diceStrings = Array.empty
                , dice = Array.empty
                }
    in
        initializeDice model

initializeDice : Model -> Model
initializeDice model =
    let dice = getDice model
    in
        { model
            | diceStrings = Array.fromList <| List.repeat dice ""
            , dice = Array.fromList <| List.repeat dice 0
        }
    
init : Maybe (SendPort Msg) -> ( Model, Cmd Msg )
init sendPort =
    let count = 6
        model = makeInitialModel count sendPort
    in
        ( model
        , DevRandom.generateInt (getCount model) model.config
        )

getDice : Model -> Int
getDice model =
    case model.whichTable of
        NewTable -> 5
        OldTable -> 5
        ShortTable -> 4

getCount : Model -> Int
getCount model =
    case model.whichTable of
        NewTable -> NewDicewareStrings.count
        OldTable -> DicewareStrings.count
        ShortTable -> ShortDicewareStrings.count

getArray : Model -> Array String
getArray model =
    case model.whichTable of
        NewTable -> NewDicewareStrings.array
        OldTable -> DicewareStrings.array
        ShortTable -> ShortDicewareStrings.array

getEntropyPerDie : Model -> Float
getEntropyPerDie model =
    case model.whichTable of
        NewTable -> 12.9
        OldTable -> 12.9
        ShortTable -> 10.3

getEntropy : Model -> Float
getEntropy model =
    (toFloat <| List.length model.strings) * (getEntropyPerDie model)

type Msg = UpdateCount String
         | UpdateDie Int String
         | Generate
         | Clear
         | ReceiveInt (Bool, Int)
         | LookupDice
         | ChangeTable String

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
                    , DevRandom.generateInt (getCount model) model.config )

        Clear ->
            ( { model
                  | strings = []
                  , isSecure = True
              }
            , Cmd.none
            )

        ReceiveInt (isSecure, idx) ->
            let string = case (Array.get idx <| getArray model) of
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
                  DevRandom.generateInt (getCount model) model.config
            )
            
        LookupDice ->
            ( lookupDice model
            , Cmd.none
            )

        ChangeTable table ->
            let oldTable = model.whichTable
                newTable = stringToTable table
                count = newRollCount newTable model
            in
                ( initializeDice
                      { model
                          | whichTable = stringToTable table
                          , count = count
                          , countString = toString count
                          , strings = []
                      }
                , DevRandom.generateInt count model.config
                )

newRollCount : DicewareTable -> Model -> Int
newRollCount newTable model =
    let oldEntropy = getEntropy model
        newPerBit = getEntropyPerDie <| { model | whichTable = newTable }
    in
        round <| (oldEntropy / newPerBit)

stringToTable : String -> DicewareTable
stringToTable table =
    case table of
        "old" -> OldTable
        "new" -> NewTable
        _ -> ShortTable

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
                string = case Array.get idx <| getArray model of
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
        Nothing -> ""
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
            ( if (getDice model) == 5 then
                  [0, 1, 2, 3, 4]
              else
                  [0, 1, 2, 3]
            )

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
            [ select [ onInput ChangeTable ]
                  [ option [ value "short"
                           , selected <| model.whichTable == ShortTable
                           ]
                        [ text "EFF Short List" ]
                  , option [ value "new"
                           , selected <| model.whichTable == NewTable
                           ]
                        [ text "EFF Long List" ]
                  ,option [ value "old"
                          , selected <| model.whichTable == OldTable
                          ]
                        [ text "Traditional List" ]
                  ]
            , text " Words: "
            , input [ size 3
                    , onInput UpdateCount
                    , value model.countString
                    ]
                  []
            , text " "
            , button [ onClick Generate ] [ text "Generate" ]
            , text " "
            , button [ onClick Clear ] [ text "Clear" ]
            , text
                  <| " Entropy: "
                  ++ (toString <| round <| getEntropy model) ++ " bits"
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
            [ text "To generate a passphrase, choose which of the three lists to use from the selector (initially \"EFF Short List\"), fill in \"Words\" with the number of words to generate, and click the \"Generate\" button. To clear the word string, click \"Clear\"."
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
            [ text "If you prefer rolling your own dice to using your computer's random number generator, you can fill in the five boxes to the left of the \"Lookup\" button with the numbers (1-6) from four or five six-sided dice rolls, then click that button. It will add one word to the end of the list."
            ]
        , p []
            [ text "The three lists are as follows:"
            , ul []
                [ li []
                      [ text "EFF Short List"
                      , br
                      , text "The first short list from the "
                      , effListLink
                      , text "."
                      ]
                ,li []
                      [ text "EFF Long List"
                      , br
                      , text "The long list from the "
                      , effListLink
                      , text "."
                      ]
                ,li []
                      [ text "Traditional List"
                      , br
                      , text "The original Diceware word list."
                      ]
                ]
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
            [ text "A five-word Diceware passphrase (from one of the long lists) has 6^5^5 possibilities, over 64 bits. A ten-word Diceware passphrase (again, from one of the long lists) has 6^5^10 possibilities, over 129 bits."
            ]
        , p []
            [ text "Source code: "
            , a [ href "https://github.com/billstclair/elm-dev-random" ]
                [ text "github.com/billstclair/elm-dev-random" ]
            , br
            , text "Copyright 2017 Bill St. Clair" ]
        ]

effListLink : Html msg
effListLink =
    span []
        [ text "EFF's July 2016 \""
        , a [ href
              "https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases"
            ]
              [ text "New Wordlists for Random Passphrases" ]
        , text "\""
        ]
