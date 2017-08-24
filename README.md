# can-set

[![Join the chat at https://gitter.im/canjs/canjs](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/canjs/canjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canjs/can-set/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/can-set.svg)](https://www.npmjs.com/package/can-set)
[![Travis build status](https://travis-ci.org/canjs/can-set.svg?branch=master)](https://travis-ci.org/canjs/can-set)
[![Greenkeeper badge](https://badges.greenkeeper.io/canjs/can-set.svg)](https://greenkeeper.io/)

__can-set__ is a utility for comparing [sets](http://en.wikipedia.org/wiki/Set_theory#Basic_concepts_and_notation) that
are represented by the parameters commonly passed to service requests.

For example, the set `{type: "critical"}` might represent all
critical todos.  It is a superset of the set `{type: "critical", due: "today"}`
which might represent all critical todos due today.

__can-set__ is useful for building caching and other data-layer
optimizations.  It can be used in client or server
environments. [can-connect](http://connect.canjs.com) uses can-set to create data modeling
utilities and middleware for the client.

[Play around in this JSBin!](https://justinbmeyer.jsbin.com/faveda/4/edit?js,console)

## Documentation

Read the [can-set API docs on CanJS.com](https://canjs.com/doc/can-set.html).

## Changelog

See the [latest releases on GitHub](https://github.com/canjs/can-set/releases).

## Contributing

The [contribution guide](https://github.com/canjs/can-set/blob/master/CONTRIBUTING.md) has information on getting help, reporting bugs, developing locally, and more.

## License

[MIT](https://github.com/canjs/can-set/blob/master/LICENSE)

