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


module Diceware exposing
    ( Model
    , Msg(..)
    , init
    , update
    , view
    )

import Array exposing (Array)
import Char
import Debug exposing (log)
import DevRandom exposing (IntConfig, SendPort)
import DicewareStrings
import Html
    exposing
        ( Attribute
        , Html
        , a
        , button
        , div
        , h2
        , h3
        , img
        , input
        , label
        , li
        , option
        , p
        , select
        , span
        , text
        , ul
        )
import Html.Attributes
    exposing
        ( alt
        , checked
        , href
        , maxlength
        , readonly
        , selected
        , size
        , src
        , style
        , title
        , type_
        , value
        )
import Html.Events exposing (keyCode, on, onClick, onInput)
import Json.Decode as Json
import List.Extra as LE
import NewDicewareStrings
import ShortDicewareStrings


type DicewareTable
    = OldTable
    | NewTable
    | ShortTable


type alias Modifications =
    { spaces : Bool
    , showTotalLength : Bool
    , totalLength : Int
    , uppercase : Int
    , numbers : Int
    , specialChars : Int
    }


defaultModifications : Modifications
defaultModifications =
    { spaces = True
    , showTotalLength = False
    , totalLength = 30
    , uppercase = 0
    , numbers = 0
    , specialChars = 0
    }


type RandomReason
    = RandomPassphrase
    | RandomNumber


type alias Model =
    { config : IntConfig Msg
    , randomReason : RandomReason
    , countString : String
    , count : Int
    , strings : List String
    , isSecure : Bool
    , whichTable : DicewareTable
    , diceString : String
    , enableModifications : Bool
    , modifications : Modifications
    , randomMaxString : String
    , randomMax : Int
    , randomNumber : Int
    }


makeConfig : Maybe (SendPort Msg) -> IntConfig Msg
makeConfig sendPort =
    case sendPort of
        Nothing ->
            { sendPort = Nothing
            , receiveIntMsgWrapper = Just ReceiveInt
            }

        _ ->
            { sendPort = sendPort
            , receiveIntMsgWrapper = Nothing
            }


makeInitialModel : Int -> Maybe (SendPort Msg) -> Model
makeInitialModel count sendPort =
    let
        config =
            makeConfig sendPort

        model =
            { config = config
            , randomReason = RandomPassphrase
            , countString = String.fromInt count
            , count = count
            , strings = []
            , isSecure = True
            , whichTable = ShortTable
            , diceString = ""
            , enableModifications = False
            , modifications = defaultModifications
            , randomMaxString = "100"
            , randomMax = 0
            , randomNumber = 10
            }
    in
    model


init : Maybe (SendPort Msg) -> ( Model, Cmd Msg )
init sendPort =
    let
        count =
            6

        model =
            makeInitialModel count sendPort
    in
    ( { model | randomReason = RandomPassphrase }
    , DevRandom.generateInt (getCount model) model.config
    )


getDiceCount : Model -> Int
getDiceCount model =
    case model.whichTable of
        NewTable ->
            5

        OldTable ->
            5

        ShortTable ->
            4


getCount : Model -> Int
getCount model =
    case model.whichTable of
        NewTable ->
            NewDicewareStrings.count

        OldTable ->
            DicewareStrings.count

        ShortTable ->
            ShortDicewareStrings.count


getArray : Model -> Array String
getArray model =
    case model.whichTable of
        NewTable ->
            NewDicewareStrings.array

        OldTable ->
            DicewareStrings.array

        ShortTable ->
            ShortDicewareStrings.array


entropyPerDie : DicewareTable -> Float
entropyPerDie table =
    case table of
        NewTable ->
            12.9

        OldTable ->
            12.9

        ShortTable ->
            10.3


getEntropy : Model -> Float
getEntropy model =
    (toFloat <| List.length model.strings) * entropyPerDie model.whichTable


type Msg
    = UpdateCount String
    | UpdateDice String
    | DiceKeydown Int
    | Generate
    | Clear
    | ReceiveInt ( Bool, Int )
    | LookupDice
    | ChangeTable String
    | ToggleModifications
    | ToggleSpaces
    | ToggleShowTotalLength
    | UpdateTotalLength String
    | UpdateUpperCase String
    | UpdateNumbers String
    | UpdateSpecialChars String
    | RandomMaxDown Int
    | UpdateRandomMaxString String
    | GenerateRandomNumber


stringToInt : String -> Result String Int
stringToInt string =
    case String.toInt string of
        Just int ->
            Ok int

        Nothing ->
            Err "invalid integer string"


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        modifications =
            model.modifications
    in
    case msg of
        UpdateCount countString ->
            ( { model
                | countString = countString
                , count =
                    case stringToInt countString of
                        Ok count ->
                            max 0 (min count 20)

                        Err _ ->
                            0
              }
            , Cmd.none
            )

        UpdateDice string ->
            ( { model
                | diceString = string
              }
            , Cmd.none
            )

        DiceKeydown keycode ->
            ( if keycode == 13 then
                lookupDice model

              else
                model
            , Cmd.none
            )

        Generate ->
            case model.count of
                0 ->
                    ( { model | strings = [] }
                    , Cmd.none
                    )

                _ ->
                    ( { model
                        | strings = []
                        , randomReason = RandomPassphrase
                      }
                    , DevRandom.generateInt (getCount model) model.config
                    )

        Clear ->
            ( { model
                | strings = []
                , isSecure = True
              }
            , Cmd.none
            )

        ReceiveInt ( isSecure, idx ) ->
            case model.randomReason of
                RandomNumber ->
                    ( { model
                        | randomNumber = idx + 1
                        , isSecure = isSecure
                      }
                    , Cmd.none
                    )

                RandomPassphrase ->
                    let
                        string =
                            case Array.get idx <| getArray model of
                                Nothing ->
                                    "a"

                                Just s ->
                                    s

                        strings =
                            string :: model.strings
                    in
                    ( { model
                        | strings = strings
                        , isSecure = isSecure
                        , randomReason = RandomPassphrase
                      }
                    , if List.length strings >= model.count then
                        Cmd.none

                      else
                        DevRandom.generateInt (getCount model) model.config
                    )

        LookupDice ->
            ( lookupDice model
            , Cmd.none
            )

        ChangeTable table ->
            let
                oldTable =
                    model.whichTable

                newTable =
                    stringToTable table

                count =
                    newRollCount newTable model
            in
            ( { model
                | whichTable = stringToTable table
                , count = count
                , countString = String.fromInt count
                , strings = []
                , diceString = ""
                , randomReason = RandomPassphrase
              }
            , DevRandom.generateInt count model.config
            )

        ToggleModifications ->
            ( { model | enableModifications = not model.enableModifications }
            , Cmd.none
            )

        ToggleSpaces ->
            ( { model
                | modifications =
                    { modifications
                        | spaces = not modifications.spaces
                    }
              }
            , Cmd.none
            )

        ToggleShowTotalLength ->
            ( { model
                | modifications =
                    { modifications
                        | showTotalLength = not modifications.showTotalLength
                    }
              }
            , Cmd.none
            )

        UpdateTotalLength string ->
            updateModificationsInt
                (if string == "" then
                    "0"

                 else
                    string
                )
                (\int -> { modifications | totalLength = int })
                model

        UpdateUpperCase string ->
            updateModificationsInt string
                (\int -> { modifications | uppercase = int })
                model

        UpdateNumbers string ->
            updateModificationsInt string
                (\int -> { modifications | numbers = int })
                model

        UpdateSpecialChars string ->
            updateModificationsInt string
                (\int -> { modifications | specialChars = int })
                model

        -- TODO
        RandomMaxDown keycode ->
            if keycode == 13 then
                update GenerateRandomNumber model

            else
                ( model, Cmd.none )

        UpdateRandomMaxString string ->
            ( { model | randomMaxString = string }
            , Cmd.none
            )

        GenerateRandomNumber ->
            let
                mdl =
                    { model | randomNumber = 0 }
            in
            case String.toInt model.randomMaxString of
                Nothing ->
                    ( mdl, Cmd.none )

                Just max ->
                    if max <= 0 then
                        ( mdl, Cmd.none )

                    else
                        ( { mdl
                            | randomReason = RandomNumber
                            , randomMax = max
                            , randomNumber = 0
                          }
                        , DevRandom.generateInt max model.config
                        )


updateModificationsInt : String -> (Int -> Modifications) -> Model -> ( Model, Cmd Msg )
updateModificationsInt string setter model =
    case stringToInt string of
        Err _ ->
            ( model, Cmd.none )

        Ok int ->
            ( { model | modifications = setter int }
            , Cmd.none
            )


newRollCount : DicewareTable -> Model -> Int
newRollCount newTable model =
    let
        count =
            toFloat model.count

        perDie =
            entropyPerDie model.whichTable

        oldEntropy =
            count * perDie

        newPerDie =
            entropyPerDie newTable
    in
    round <| (oldEntropy / newPerDie)


stringToTable : String -> DicewareTable
stringToTable table =
    case table of
        "old" ->
            OldTable

        "new" ->
            NewTable

        _ ->
            ShortTable


dieNum : String -> Int
dieNum string =
    case stringToInt string of
        Err _ ->
            0

        Ok n ->
            if n < 0 || n > 6 then
                0

            else
                n


computeUserDice : Model -> Maybe (List Int)
computeUserDice model =
    let
        diceNumber =
            getDiceCount model

        digits =
            List.map String.fromChar <| String.toList model.diceString
    in
    if diceNumber /= List.length digits then
        Nothing

    else
        Just <|
            List.map dieNum digits


lookupDice : Model -> Model
lookupDice model =
    case computeUserDice model of
        Nothing ->
            model

        Just dice ->
            case LE.find (\x -> x == 0) dice of
                Just _ ->
                    model

                Nothing ->
                    let
                        count =
                            model.count

                        strings =
                            model.strings

                        stringsTail =
                            List.drop
                                (List.length strings - count + 1)
                                strings

                        idx =
                            List.foldl
                                (\x y -> (6 * y) + x - 1)
                                0
                                dice

                        string =
                            case Array.get idx <| getArray model of
                                Nothing ->
                                    "a"

                                Just x ->
                                    x
                    in
                    { model
                        | strings = List.append stringsTail [ string ]
                        , isSecure = True
                        , diceString = ""
                    }


nbsp : String
nbsp =
    String.fromList [ Char.fromCode 160 ]


br : Html Msg
br =
    Html.br [] []


onKeyDown : (Int -> msg) -> Attribute msg
onKeyDown tagger =
    on "keydown" (Json.map tagger keyCode)


checkbox : Bool -> msg -> String -> Html msg
checkbox isChecked msg name =
    label []
        [ input
            [ type_ "checkbox"
            , checked isChecked
            , onClick msg
            ]
            []
        , text name
        ]


{-| [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[https://docs.oracle.com/cd/E11223\_01/doc.910/e11197/app\_special\_char.htm#MCMAD416](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)](https://docs.oracle.com/cd/E11223_01/doc.910/e11197/app_special_char.htm#MCMAD416)
-}
specialChars : String
specialChars =
    "!@#$%"


numbers : String
numbers =
    "1234567890"


modifyStrings : Model -> String
modifyStrings model =
    if not model.enableModifications then
        String.join " " model.strings

    else
        let
            mods =
                model.modifications

            count =
                List.length model.strings

            spaces =
                count - 1

            changes1 =
                String.left mods.numbers numbers
                    ++ String.left mods.specialChars specialChars

            added =
                String.length changes1

            length =
                List.foldl (\s sum -> sum + String.length s) 0 model.strings

            trim =
                if mods.showTotalLength then
                    max 0 <| length + added - mods.totalLength

                else
                    0

            strings1 =
                trimStrings trim model.strings

            strings =
                addUppercase mods.uppercase strings1

            newlen =
                length + added - trim

            addspaces1 =
                if mods.showTotalLength then
                    max 0 (min (spaces - added) (mods.totalLength - newlen))

                else
                    max 0 (spaces - added)

            addspaces =
                if addspaces1 < spaces - added then
                    0

                else
                    addspaces1

            changes =
                changes1 ++ String.repeat addspaces " "

            res =
                distributeChanges changes strings
        in
        if not mods.spaces then
            String.filter ((/=) ' ') res

        else
            res


trim1 : List String -> ( List String, Bool )
trim1 strings =
    let
        maxlen =
            List.foldl (\s res -> max res (String.length s)) 0 strings
    in
    if maxlen <= 1 then
        ( strings, False )

    else
        let
            loop ss res =
                case ss of
                    [] ->
                        -- can't happen
                        ( List.reverse res, False )

                    s :: tail ->
                        if String.length s == maxlen then
                            ( List.concat
                                [ List.reverse res
                                , [ String.dropRight 1 s ]
                                , tail
                                ]
                            , True
                            )

                        else
                            loop tail (s :: res)
        in
        loop strings []


trimStrings : Int -> List String -> List String
trimStrings trim strings =
    if trim <= 0 then
        strings

    else
        let
            loop len ss =
                if len <= 0 then
                    ss

                else
                    let
                        ( ss2, changed ) =
                            Debug.log "trim1" <| trim1 ss
                    in
                    if changed then
                        loop (len - 1) ss2

                    else
                        ss2
        in
        loop trim strings


upcase1 : String -> ( String, Bool )
upcase1 string =
    let
        loop chars res =
            case chars of
                [] ->
                    ( res, False )

                c :: tail ->
                    if Char.isLower c then
                        ( res
                            ++ (String.fromChar <| Char.toUpper c)
                            ++ String.fromList tail
                        , True
                        )

                    else
                        loop tail <| res ++ String.fromChar c
    in
    loop (String.toList string) ""


addUppercase : Int -> List String -> List String
addUppercase count strings =
    let
        loop cnt stringsTail changed res =
            if cnt <= 0 then
                List.concat [ List.reverse res, stringsTail ]

            else
                case stringsTail of
                    [] ->
                        if changed then
                            loop cnt (List.reverse res) False []

                        else
                            List.reverse res

                    s :: tail ->
                        let
                            ( s2, ch ) =
                                upcase1 s

                            cnt2 =
                                if ch then
                                    cnt - 1

                                else
                                    cnt
                        in
                        loop cnt2
                            tail
                            (changed || ch)
                            (s2 :: res)
    in
    loop count strings False []


distributeChanges : String -> List String -> String
distributeChanges changes strings =
    let
        loop ch ss res =
            if ch == "" then
                res ++ String.concat ss

            else
                case ss of
                    [] ->
                        res ++ ch

                    s :: tail ->
                        loop (String.dropLeft 1 ch)
                            tail
                            (res ++ s ++ String.left 1 ch)
    in
    loop changes strings ""


view : Model -> Html Msg
view model =
    let
        string =
            modifyStrings model
    in
    div
        [ style "width" "40em"
        , style "margin-left" "2em"
        ]
        [ h2 [] [ text "Diceware Passphrase Generator" ]
        , p []
            [ text "This page generates passphrases using JavaScript running in your web browser, using the browser's cryptographically secure random number generator. See below for instructions." ]
        , p []
            [ select [ onInput ChangeTable ]
                [ option
                    [ value "short"
                    , selected <| model.whichTable == ShortTable
                    ]
                    [ text "EFF Short List" ]
                , option
                    [ value "new"
                    , selected <| model.whichTable == NewTable
                    ]
                    [ text "EFF Long List" ]
                , option
                    [ value "old"
                    , selected <| model.whichTable == OldTable
                    ]
                    [ text "Traditional List" ]
                ]
            , text " Words: "
            , input
                [ size 3
                , onInput UpdateCount
                , value model.countString
                ]
                []
            , text " "
            , button [ onClick Generate ] [ text "Generate" ]
            , text " "
            , button [ onClick Clear ] [ text "Clear" ]
            , text <|
                " Entropy: "
                    ++ (String.fromInt <| round <| getEntropy model)
                    ++ " bits"
            ]
        , div []
            [ p
                [ style "margin-left" "1em"
                , style "font-size" "150%"
                , style "padding-left" "0.5em"
                , style "color"
                    (if model.isSecure then
                        "black"

                     else
                        "red"
                    )
                ]
                [ text string ]
            ]
        , h3 []
            [ text "Roll Your Own Dice" ]
        , p []
            [ input
                (let
                    count =
                        getDiceCount model
                 in
                 [ size count
                 , maxlength count
                 , onKeyDown DiceKeydown
                 , onInput <| UpdateDice
                 , value model.diceString
                 ]
                )
                []
            , text " "
            , button [ onClick LookupDice ] [ text "Lookup" ]
            ]
        , p []
            [ checkbox model.enableModifications
                ToggleModifications
                "modifications"
            , if model.enableModifications then
                renderModifications (String.length string) model

              else
                text ""
            ]
        , h3 []
            [ text "Generate a Random Number" ]
        , p []
            [ Html.b [] [ text "N: " ]
            , input
                [ size 8
                , maxlength 8
                , onKeyDown RandomMaxDown
                , onInput UpdateRandomMaxString
                , value model.randomMaxString
                ]
                []
            , text " "
            , button [ onClick GenerateRandomNumber ] [ text "Random from 1 to N" ]
            ]
        , p []
            (if model.randomMax <= 0 then
                []

             else
                [ p []
                    [ Html.b []
                        [ text
                            ("Random number from 1 to "
                                ++ String.fromInt model.randomMax
                                ++ ": "
                            )
                        ]
                    ]
                , p
                    [ style "margin-left" "1em"
                    , style "font-size" "150%"
                    , style "padding-left" "0.5em"
                    , style "color"
                        (if model.isSecure then
                            "black"

                         else
                            "red"
                        )
                    ]
                    [ text <| String.fromInt model.randomNumber ]
                ]
            )
        , p []
            [ text "To generate a passphrase, choose which of the three lists to use from the selector (initially \"EFF Short List\"), fill in \"Words\" with the number of words to generate, and click the \"Generate\" button. To clear the word string, click \"Clear\"."
            ]
        , p []
            [ text "If the passphrase is black, then cryptographically-secure random number generation was used. If it is red, then the random number generation was NOT cryptographically secure, because "
            , text <|
                case model.config.sendPort of
                    Nothing ->
                        "you are running the pure Elm version of the code."

                    _ ->
                        "your browser does not support it."
            ]
        , p []
            [ text "If you prefer rolling your own dice to using your computer's random number generator, you can type into the box to the left of the \"Lookup\" button four or five numbers (from 1-6) from four or five six-sided dice rolls, then click that button (four dice rolls for the \"EFF Short List\" or five for the other two). It will add one word to the end of the list."
            ]
        , p []
            [ text "If you check the \"modifications\" box, you can choose whether to put spaces between the words, the maximum password length, and how many upper case, numeric, and special characters to put in the result. This allows you to easily satisfy the most common password requirements from people who don't understand that length is the only password property that really matters for security." ]
        , p []
            [ text "If you enter \"N\" and click \"Random from 1 to N\", a random number between 1 and N will be printed below that line." ]
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
                , li []
                    [ text "EFF Long List"
                    , br
                    , text "The long list from the "
                    , effListLink
                    , text "."
                    ]
                , li []
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
            , text "Copyright 2017-2018 Bill St. Clair"
            ]
        ]


numberSelector : Int -> Int -> (String -> Msg) -> Html Msg
numberSelector current max wrapper =
    let
        intOption i =
            option
                [ value <| String.fromInt i
                , selected (i == current)
                ]
                [ text <|
                    if i == 0 then
                        "none"

                    else
                        String.fromInt i
                ]
    in
    select [ onInput wrapper ] <|
        List.map intOption <|
            List.range 0 max


renderModifications : Int -> Model -> Html Msg
renderModifications length model =
    let
        modifications =
            model.modifications
    in
    div [ style "margin-left" "1em" ]
        [ checkbox modifications.spaces ToggleSpaces "spaces"
        , br
        , checkbox modifications.showTotalLength
            ToggleShowTotalLength
            (if modifications.showTotalLength then
                "limit length: "

             else
                "limit length"
            )
        , if not modifications.showTotalLength then
            text ""

          else
            span []
                [ input
                    [ size 3
                    , onInput UpdateTotalLength
                    , value <| String.fromInt modifications.totalLength
                    ]
                    []
                , if length > modifications.totalLength then
                    span [ style "color" "red" ]
                        [ text " too short" ]

                  else
                    text ""
                ]
        , br
        , text "uppercase letters: "
        , numberSelector modifications.uppercase 5 UpdateUpperCase
        , br
        , text "numbers: "
        , numberSelector modifications.numbers 5 UpdateNumbers
        , br
        , text "special chars: "
        , numberSelector modifications.specialChars 5 UpdateSpecialChars
        ]


effListLink : Html msg
effListLink =
    span []
        [ text "EFF's July 2016 \""
        , a
            [ href
                "https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases"
            ]
            [ text "New Wordlists for Random Passphrases" ]
        , text "\""
        ]
