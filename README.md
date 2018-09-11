The [billstclair/elm-dev-random](http://package.elm-lang.org/packages/billstclair/elm-dev-random/latest) package provides cryptographically secure random number generation via JavaScript's `window.crypto.getRandomValues()` function.

As of version 2.0.0, the `PortFunnel.DevRandom` module uses [billstclair/elm-port-funnel](http://package.elm-lang.org/packages/billstclair/elm-port-funnel/latest) to share a pair of ports with other port modules. This implies a fairly major change to clients.

If you want to continue to use the earlier `DevRandom` port setup, use version 1.1.6 for Elm 0.19 or 1.1.5 for Elm 0.18.

The `PortFunnel.DevRandom` module contains a pure Elm API, using the standard Elm `Random` module. If you follow the directions in the README for the [`example` directory](https://github.com/billstclair/elm-dev-random/tree/master/example), you can use the `getRandomValue()` mechanism instead.

The package name is a reflection of `/dev/random`, the OS-provided cryptographically-secure random number generator for Unix-like systems (e.g. Linux and MacOS).

Bill St. Clair &lt;billstclair@gmail.com&gt; --
28 February 2017
