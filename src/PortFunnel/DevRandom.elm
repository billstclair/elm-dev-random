---------------------------------------------------------------------
--
-- DevRandom.elm
-- Cryptographically secure random number generator.
-- Copyright (c) 2017-2018 Bill St. Clair <billstclair@gmail.com>
-- Some rights reserved.
-- Distributed under the MIT License
-- See LICENSE.txt
--
----------------------------------------------------------------------


module PortFunnel.DevRandom exposing
    ( Message(..), Response(..), State
    , moduleName, moduleDesc, commander
    , initialState
    , send
    , toString, toJsonString
    , makeSimulatedCmdPort
    , isLoaded
    )

{-| The `PortFunnel.DevRandom` module provides a `billstclair/elm-port-funnel` funnel to generate cryptographically-secure random numbers. It does this with JavaScript code that calls `window.crypto.getRandomValues()`.

There is a simulator that uses the standard Elm `Random` module, which is NOT cryptographically secure. See [example/Diceware.elm](https://github.com/billstclair/elm-dev-random/blob/master/example/Diceware.elm) for how to use it.

See the [example readme](https://github.com/billstclair/elm-dev-random/tree/master/example) for instructions on creating the ports and using the included JavaScript code.


# Types

@docs Message, Response, State


# Components of a `PortFunnel.FunnelSpec`

@docs moduleName, moduleDesc, commander


# Initial `State`

@docs initialState


# Sending a `Message` out the `Cmd` Port

@docs send


# Conversion to Strings

@docs toString, toJsonString


# Simulator

@docs makeSimulatedCmdPort


# Non-standard Functions

@docs isLoaded

-}

import Json.Decode as JD exposing (Decoder)
import Json.Encode as JE exposing (Value)
import PortFunnel exposing (GenericMessage, ModuleDesc)
import Random


{-| Our internal state.

This module's state is only used by the simulator. If you don't save it,
the simulator will always use the same random seed.

-}
type State
    = State
        { seed : Random.Seed
        , isLoaded : Bool
        }


{-| A `MessageResponse` encapsulates a message.

`RandomBytesResponse` wraps a list of integers and whether their generation was cryptographically secure.

`RandomIntResponse` wraps an integer and whether its generation was cryptographically secure.

-}
type Response
    = NoResponse
    | RandomBytesResponse
        { isSecure : Bool
        , bytes : List Int
        }
    | RandomIntResponse
        { isSecure : Bool
        , int : Int
        }


type alias RandomBytesRecord =
    { isSecure : Bool
    , bytes : List Int
    }


type alias RandomIntRecord =
    { isSecure : Bool
    , int : Int
    }


{-| The `GenerateBytes` message requests a list of random bytes of the given size.

The `RandomBytes` message returns those random bytes.

The `GenerateInt` message requests a random integer >= 0 and < its arg.

The `RandomInt` message returns that integer.

The `SimulateBytes` and `SimulateInt` messages are used internally by the simulator.

-}
type Message
    = GenerateBytes Int
    | GenerateInt Int
    | RandomBytes RandomBytesRecord
    | RandomInt RandomIntRecord
    | SimulateBytes Int
    | SimulateInt Int
    | Startup


{-| The initial state. Encapsulates a `Random.Seed`.

The arg is passed to `Random.initialSeed`. This is used only by the simulator,
so if you're using the JS code for real random numbers, passing 0 here is fine.

-}
initialState : Int -> State
initialState int =
    State
        { seed = Random.initialSeed int
        , isLoaded = False
        }


{-| The name of this funnel: "DevRandom".
-}
moduleName : String
moduleName =
    "DevRandom"


{-| Our module descriptor.
-}
moduleDesc : ModuleDesc Message State Response
moduleDesc =
    PortFunnel.makeModuleDesc moduleName encode decode process


encode : Message -> GenericMessage
encode message =
    case message of
        GenerateBytes bytes ->
            GenericMessage moduleName "generatebytes" <| JE.int bytes

        GenerateInt ceiling ->
            GenericMessage moduleName "generateint" <| JE.int ceiling

        RandomBytes { isSecure, bytes } ->
            GenericMessage moduleName "randombytes" <|
                JE.object
                    [ ( "isSecure", JE.bool isSecure )
                    , ( "bytes", JE.list JE.int bytes )
                    ]

        RandomInt { isSecure, int } ->
            GenericMessage moduleName "randomint" <|
                JE.object
                    [ ( "isSecure", JE.bool isSecure )
                    , ( "int", JE.int int )
                    ]

        SimulateBytes bytes ->
            GenericMessage moduleName "simulatebytes" <| JE.int bytes

        SimulateInt ceiling ->
            GenericMessage moduleName "simulateint" <| JE.int ceiling

        Startup ->
            GenericMessage moduleName "startup" JE.null


randomBytesDecoder : Decoder RandomBytesRecord
randomBytesDecoder =
    JD.map2 RandomBytesRecord
        (JD.field "isSecure" JD.bool)
        (JD.field "bytes" <| JD.list JD.int)


randomIntDecoder : Decoder RandomIntRecord
randomIntDecoder =
    JD.map2 RandomIntRecord
        (JD.field "isSecure" JD.bool)
        (JD.field "int" JD.int)


decode : GenericMessage -> Result String Message
decode { tag, args } =
    case tag of
        "generatebytes" ->
            case JD.decodeValue JD.int args of
                Ok int ->
                    Ok (GenerateBytes int)

                Err _ ->
                    Err <|
                        "DevRandom 'generatebytes' args not an integer: "
                            ++ JE.encode 0 args

        "randombytes" ->
            case JD.decodeValue randomBytesDecoder args of
                Ok record ->
                    Ok (RandomBytes record)

                Err _ ->
                    Err <|
                        "Malformed DevRandom 'randombytes' args: "
                            ++ JE.encode 0 args

        "generateint" ->
            case JD.decodeValue JD.int args of
                Ok int ->
                    Ok (GenerateInt int)

                Err _ ->
                    Err <|
                        "DevRandom 'generateint' args not an integer: "
                            ++ JE.encode 0 args

        "randomint" ->
            case JD.decodeValue randomIntDecoder args of
                Ok record ->
                    Ok (RandomInt record)

                Err _ ->
                    Err <|
                        "Malformed DevRandom 'randomint' args: "
                            ++ JE.encode 0 args

        "simulatebytes" ->
            case JD.decodeValue JD.int args of
                Ok int ->
                    Ok (SimulateBytes int)

                Err _ ->
                    Err <|
                        "DevRandom 'simulatebytes' args not an integer: "
                            ++ JE.encode 0 args

        "simulateint" ->
            case JD.decodeValue JD.int args of
                Ok int ->
                    Ok (SimulateInt int)

                Err _ ->
                    Err <|
                        "DevRandom 'simulateint' args not an integer: "
                            ++ JE.encode 0 args

        "startup" ->
            Ok Startup

        _ ->
            Err <| "Unknown DevRandom tag: " ++ tag


{-| Send a `Message` through a `Cmd` port.
-}
send : (Value -> Cmd msg) -> Message -> Cmd msg
send =
    PortFunnel.sendMessage moduleDesc


process : Message -> State -> ( State, Response )
process message (State state) =
    case message of
        Startup ->
            ( State { state | isLoaded = True }
            , NoResponse
            )

        RandomBytes record ->
            ( State state, RandomBytesResponse record )

        RandomInt record ->
            ( State state, RandomIntResponse record )

        SimulateBytes bytes ->
            let
                ( list, seed2 ) =
                    Random.step (generator bytes) state.seed
            in
            ( State { state | seed = seed2 }
            , RandomBytesResponse
                { isSecure = False
                , bytes = list
                }
            )

        SimulateInt ceiling ->
            let
                ( int, seed2 ) =
                    Random.step (intGenerator ceiling) state.seed
            in
            ( State { state | seed = seed2 }
            , RandomIntResponse
                { isSecure = False
                , int = int
                }
            )

        _ ->
            ( State state, NoResponse )


{-| Responsible for sending a `CmdResponse` back through the port.

This funnel doesn't initiate any sends, so this function always returns `Cmd.none`.

-}
commander : (GenericMessage -> Cmd msg) -> Response -> Cmd msg
commander _ _ =
    Cmd.none


simulator : Message -> Maybe Message
simulator message =
    case message of
        GenerateBytes bytes ->
            Just (SimulateBytes bytes)

        GenerateInt ceiling ->
            Just (SimulateInt ceiling)

        _ ->
            Nothing


generator : Int -> Random.Generator (List Int)
generator bytes =
    Random.list bytes <| Random.int 0 255


intGenerator : Int -> Random.Generator Int
intGenerator ceiling =
    Random.int 0 (ceiling - 1)


{-| Make a simulated `Cmd` port.
-}
makeSimulatedCmdPort : (Value -> msg) -> Value -> Cmd msg
makeSimulatedCmdPort =
    PortFunnel.makeSimulatedFunnelCmdPort
        moduleDesc
        simulator


{-| Convert a `Message` to a nice-looking human-readable string.
-}
toString : Message -> String
toString message =
    case message of
        GenerateBytes bytes ->
            "GenerateBytes " ++ String.fromInt bytes

        GenerateInt ceiling ->
            "GenerateInt " ++ String.fromInt ceiling

        RandomBytes { isSecure, bytes } ->
            "RandomBytes { isSecure : "
                ++ (if isSecure then
                        "True"

                    else
                        "False"
                   )
                ++ ", bytes : ["
                ++ (List.map String.fromInt bytes |> String.join ", ")
                ++ "]"

        RandomInt { isSecure, int } ->
            "RandomInt { isSecure : "
                ++ (if isSecure then
                        "True"

                    else
                        "False"
                   )
                ++ ", int : "
                ++ String.fromInt int

        SimulateBytes bytes ->
            "SimulateBytes " ++ String.fromInt bytes

        SimulateInt ceiling ->
            "SimulateInt " ++ String.fromInt ceiling

        Startup ->
            "<Startup>"


{-| Convert a `Message` to the same JSON string that gets sent

over the wire to the JS code.

-}
toJsonString : Message -> String
toJsonString message =
    message
        |> encode
        |> PortFunnel.encodeGenericMessage
        |> JE.encode 0


{-| Returns true if a `Startup` message has been processed.

This is sent by the port code after it has initialized.

-}
isLoaded : State -> Bool
isLoaded (State state) =
    state.isLoaded
