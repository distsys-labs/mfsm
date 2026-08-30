# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.1.0](https://github.com/distsys-labs/mfsm/compare/mfsm-v3.0.0...mfsm-v3.1.0) (2026-08-30)


### Features

* add entry handler and allow for dispatch handlers to be defined declaritively ([63f554f](https://github.com/distsys-labs/mfsm/commit/63f554f4799fca89a3d3b635137d5a4dfceb2496))
* add forward as an API call ([8621479](https://github.com/distsys-labs/mfsm/commit/86214793b77e6330368bb37774eed93a388b004b))
* improve declarative ability by adding forwarding and deferred logs ([fbe4137](https://github.com/distsys-labs/mfsm/commit/fbe41370452b0db6601408704554d55cd1d17264))
* improve declarative handling by removing mutual exclusions ([323c37f](https://github.com/distsys-labs/mfsm/commit/323c37f98597ba289f0640bd8c73bc8151f9333c))
* release typescript rewrite ([1bb70b0](https://github.com/distsys-labs/mfsm/commit/1bb70b0f339fb6edecd3b295b009b54245deb645))
* support handling events by transitioning to a new state with declarative ([d1fe8b5](https://github.com/distsys-labs/mfsm/commit/d1fe8b5edc2ada6a47771b39b26609bd25b7af00))
* update API to work with topic-dispatch 1.2.0 ([e7a5a6a](https://github.com/distsys-labs/mfsm/commit/e7a5a6a8d226c082b06c5f7f82682c28e1e2bb2c))


### Bug Fixes

* add debug level logging to assist with troubleshooting state transitions ([eddc5e3](https://github.com/distsys-labs/mfsm/commit/eddc5e34e59d6dc7302370820b29e92f3595b1d0))
* bump fauxdash/topic-dispatch dependency ranges to their fixed versions ([3f864b8](https://github.com/distsys-labs/mfsm/commit/3f864b88ecfb47b1f3da5bb0233be271e01d48f0))
* bump topic dispatch to v 1.1.3 ([1a2bf5e](https://github.com/distsys-labs/mfsm/commit/1a2bf5eed86a5a940c355f160d7088745d99926f))
* bump topic dispatch to v 1.1.4 ([f626366](https://github.com/distsys-labs/mfsm/commit/f626366aa67b6084f2ca8fce6ce18ad908160dcf))
* bump topic-dispatch dependency to 1.3.1 ([b9fe650](https://github.com/distsys-labs/mfsm/commit/b9fe650fac3fb8bbf6ae254ecff6cbabd81bbfcd))
* correct state-entry emit timing and imperative deferUntil/forward ([3f52e2f](https://github.com/distsys-labs/mfsm/commit/3f52e2feaa76702e2b7f3383be1e0f7e8a5bf720))
* improve debug messages by including state. fix broken pass through of event between states ([ec876e4](https://github.com/distsys-labs/mfsm/commit/ec876e4ec9267c55bc9f18bb38dfb1c0bd950dd7))
* log error when next is called for a non-existent state ([48052c6](https://github.com/distsys-labs/mfsm/commit/48052c6d6eb42a56b0432f3141e29050878336ec))
* point repository at distsys-labs, not the retired deftly org ([ddd0d9b](https://github.com/distsys-labs/mfsm/commit/ddd0d9b31b634348b0793e3acecf328008e40dd1))
* state-entry emit timing and imperative deferUntil/forward ([29f7cb4](https://github.com/distsys-labs/mfsm/commit/29f7cb4773fa5df3f58ae1bb020121b311fedb1c))
* updates for node 18 and a new test ([0baad84](https://github.com/distsys-labs/mfsm/commit/0baad84b11db3b5edb9cbe030fb360f91e0f7055))
* upgrade npm before publish so OIDC trusted publishing actually authenticates ([1221d81](https://github.com/distsys-labs/mfsm/commit/1221d81fcc0069aefeb2e2df6adba297544cd0a5))

## [1.6.0](///compare/v1.5.0...v1.6.0) (2021-04-06)


### Features

* add forward as an API call ([8621479](///commit/86214793b77e6330368bb37774eed93a388b004b))

## [1.5.0](///compare/v1.4.0...v1.5.0) (2021-03-12)


### Features

* improve declarative handling by removing mutual exclusions ([323c37f](///commit/323c37f98597ba289f0640bd8c73bc8151f9333c))


### Bug Fixes

* bump topic-dispatch dependency to 1.3.1 ([b9fe650](///commit/b9fe650fac3fb8bbf6ae254ecff6cbabd81bbfcd))

## [1.4.0](///compare/v1.3.3...v1.4.0) (2021-02-27)


### Features

* improve declarative ability by adding forwarding and deferred logs ([fbe4137](///commit/fbe41370452b0db6601408704554d55cd1d17264))

### [1.3.3](///compare/v1.3.1...v1.3.3) (2021-02-24)


### Bug Fixes

* add debug level logging to assist with troubleshooting state transitions ([eddc5e3](///commit/eddc5e34e59d6dc7302370820b29e92f3595b1d0))
* improve debug messages by including state. fix broken pass through of event between states ([ec876e4](///commit/ec876e4ec9267c55bc9f18bb38dfb1c0bd950dd7))

### [1.3.2](///compare/v1.3.1...v1.3.2) (2021-02-22)


### Bug Fixes

* add debug level logging to assist with troubleshooting state transitions ([eddc5e3](///commit/eddc5e34e59d6dc7302370820b29e92f3595b1d0))

### [1.3.1](///compare/v1.3.0...v1.3.1) (2021-02-22)


### Bug Fixes

* log error when next is called for a non-existent state ([48052c6](///commit/48052c6d6eb42a56b0432f3141e29050878336ec))

## [1.3.0](///compare/v1.2.0...v1.3.0) (2021-02-22)


### Features

* support handling events by transitioning to a new state with declarative ([d1fe8b5](///commit/d1fe8b5edc2ada6a47771b39b26609bd25b7af00))

## [1.2.0](///compare/v1.1.2...v1.2.0) (2021-01-27)


### Features

* update API to work with topic-dispatch 1.2.0 ([e7a5a6a](///commit/e7a5a6a8d226c082b06c5f7f82682c28e1e2bb2c))

### [1.1.2](///compare/v1.1.1...v1.1.2) (2021-01-24)


### Bug Fixes

* bump topic dispatch to v 1.1.4 ([f626366](///commit/f626366aa67b6084f2ca8fce6ce18ad908160dcf))

### [1.1.1](///compare/v1.1.0...v1.1.1) (2021-01-24)


### Bug Fixes

* bump topic dispatch to v 1.1.3 ([1a2bf5e](///commit/1a2bf5eed86a5a940c355f160d7088745d99926f))

## [1.1.0](///compare/v1.0.0...v1.1.0) (2021-01-22)


### Features

* add entry handler and allow for dispatch handlers to be defined declaritively ([63f554f](///commit/63f554f4799fca89a3d3b635137d5a4dfceb2496))
