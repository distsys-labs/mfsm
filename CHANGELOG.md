# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
