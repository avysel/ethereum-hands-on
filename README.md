# Ethereum hands on

Basic example how to read and write data on Ethereum blockchain with Web3.js framework.

## Files
- **Hello.sol** : the smart contract
- **src/index.html** : the main file of the DApp
- **src/web3.min.js** : the Web3.js framework, included in index.html
- **src/blockchain.js** : function to interact with blockchain, included in index.html
- **src/hello-abi.js** : the smart contract interface, included in index.html
- **src/index.js** : Nodejs file to serve index.html from a server (mandatory to use Web3)

## Prerequisite

- Node.js

- Install Metamask on your browser (https://metamask.io/) and create an account.

- Request some test Ether on faucet (https://faucet.metamask.io/) on Ropsten test network.

## Run

Deploy Hello.sol contract on blockchain.

Set contract address in **blockchain.js**

```
const contractAddress = "0x5749Fc6....";
```

After that, you can run the app :

```
cd src
node index.js
```

Then open browser at http://localhost:3000