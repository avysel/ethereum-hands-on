var helloABI = [
                   {
                     "inputs": [],
                     "payable": false,
                     "stateMutability": "nonpayable",
                     "type": "constructor"
                   },
                   {
                     "anonymous": false,
                     "inputs": [
                       {
                         "indexed": false,
                         "internalType": "bytes32",
                         "name": "newName",
                         "type": "bytes32"
                       }
                     ],
                     "name": "NameChanged",
                     "type": "event"
                   },
                   {
                     "constant": false,
                     "inputs": [
                       {
                         "internalType": "bytes32",
                         "name": "_newName",
                         "type": "bytes32"
                       }
                     ],
                     "name": "setName",
                     "outputs": [],
                     "payable": false,
                     "stateMutability": "nonpayable",
                     "type": "function"
                   },
                   {
                     "constant": true,
                     "inputs": [],
                     "name": "getName",
                     "outputs": [
                       {
                         "internalType": "bytes32",
                         "name": "",
                         "type": "bytes32"
                       }
                     ],
                     "payable": false,
                     "stateMutability": "view",
                     "type": "function"
                   }
                 ];