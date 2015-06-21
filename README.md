<img src="http://bitcore.io/css/images/module-message.png" alt="bitcore message" height="35">
# Namecore Support Module for Bitcore


[![NPM Package](https://img.shields.io/npm/v/bitcore-message.svg?style=flat-square)](https://www.npmjs.org/package/bitcore-message)
[![Build Status](https://img.shields.io/travis/bitpay/bitcore-message.svg?branch=master&style=flat-square)](https://travis-ci.org/bitpay/bitcore-message)
[![Coverage Status](https://img.shields.io/coveralls/bitpay/bitcore-message.svg?style=flat-square)](https://coveralls.io/r/bitpay/bitcore-message?branch=master)

bitcore-namecoin adds namecoin support to bitcore for creating namecoin `name_*` transactions, private keys, and scripts in [Node.js](http://nodejs.org/) and web browsers.

See [the main bitcore repo](https://github.com/bitpay/bitcore) for more information.

## Getting Started

```sh
npm install bitcore-namecoin
```

```sh
bower install bitcore-namecoin
```

To import a namecoin WIF (from vanitygen, for example):

```javascript
var bitcore = require('bitcore');
var Message = require('bitcore-namecoin');

var privateKey = bitcore.PrivateKey.fromWIF('74pxNKNpByQ2kMow4d9kF6Z77BYeKztQNLq3dSyU4ES1K5KLNiz');
var address = privateKey.toAddress();
console.log( address.toString());
// NAMEuWT2icj3ef8HWJwetZyZbXaZUJ5hFT
```

To create a `name_new` transaction:
To create a `name_firstupdate` transaction:
To create a `name_update` transaction:

```javascript
```

## Contributing

See [CONTRIBUTING.md](https://github.com/bitpay/bitcore/blob/master/CONTRIBUTING.md) on the main bitcore repo for information about how to contribute.

## License

Code released under [the MIT license](https://github.com/bitpay/bitcore/blob/master/LICENSE).

Written in 2015 by Brandon Robertz.

