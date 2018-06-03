# js-layer2lib
A javascript library for building state channel applications

To run tests:
```
npm install
brew install redis
brew services run redis
# NOTE: ganache-cli currently broken, use GUI instead https://github.com/trufflesuite/ganache-cli/issues/506
# Mnemonic:      visa humor despair early retire harvest govern gym film verify cargo magnet
# ganache-cli -s layer2libTest -b 5
npm run test
```