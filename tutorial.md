author: Alexandre Vanryssel
summary: Ethereum Hands-on
id: ethereum-handson
categories: ethereum
environments: linux
status: draft
feedback link: https://github.com/avysel/ethereum-devoxx

# Ethereum Hands-on

## Introduction

Nous allons voir comment connecter une application javascript à la blockchain Ethereum en utilisant le framework *web3.js*.

A travers l'exemple d'un simple Hello World, nous allons également voir comment lire et écrire des données.

Nous découvrirons comment utiliser les événements, afin de tracer les modifications importantes.

Ca sera également l'occasion de toucher à Solidity, le langage d'écriture des smart contract sur Ethereum.

Documentation :
* Solidity : [https://solidity.readthedocs.io/en/latest/](https://solidity.readthedocs.io/en/latest/)
* Web3.js : [https://web3js.readthedocs.io/en/v1.2.6/](https://web3js.readthedocs.io/en/v1.2.6/)


## Présentation du projet

Nous allons exposer un fichier *index.html* via une application Node.js (*app.js*). L'utilisation du framework Web3.js impose de passer par un serveur web pour raisons de sécurité.

Le fichier HTML se compose de plusieurs zones et champs.
Des fonctions javascript seront définies dans le fichier *blockchain.js* pour interagir avec la bockchain et mettre à jour les affichages dans *index.html*.


## Déployer le smart contract

```solidity
pragma solidity ^0.5.0;

contract Hello {

    string private name;
    
    event NameChanged(string newName);
    
    constructor() public {
        name = "nobody";
    }
    
    function setName(string memory newName) public {
        name = newName;
        emit NameChanged(newName);
    }
    
    function getName() public view returns (string memory) {
        return name;
    }
}
```

Déployer le smart contract avec Remix, Truffle ...

Mettre à jour la configuration avec l'adresse du smart contract dans *blockchain.js*

```javascript
// address of smart contract
const contractAddress = "0x...;
```

## Connexion à la blockchain

```javascript
/**
* Create a Web3 object to connect to blockchain
*/
async function initWeb3() {
	// Modern dapp browsers...
	if (window.ethereum) {
		ethereum.autoRefreshOnNetworkChange = true;
		window.web3 = new Web3(ethereum);
		try {
			// Request account access if needed
			await ethereum.enable();
			console.log("Ethereum enabled with account : "+ethereum.selectedAddress);
		} catch (error) {
			console.error("Access denied for metamask by user");
		}
	}
	// Legacy dapp browsers...
	else if (window.web3) {
		window.web3 = new Web3(web3.currentProvider);
	}
	// Non-dapp browsers...
	else {
		console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
	}

	console.log("web3 : "+web3.version);
}
```

## Connexion au smart contract

Nous allons interagir avec le smart contract via l'objet suivant :
```javascript
// contract global object
var helloContract;
```

Il est initialisé de cette façon : 

```javascript
/**
* Init the contract object
*/
function initContract() {
	console.log("Load contract at : "+contractAddress);
	try {
		helloContract =  new web3.eth.Contract(helloABI, contractAddress);
	}
	catch(error) {
		console.error("Error loading contract : "+error);
	}
}
```

## Afficher les informations de la blockchain

````javascript
/**
* Retrieve and basic info from blockchain node
*/
async function displayBlockchainInfo() {
	$('#nodeInfo').text(await web3.eth.getNodeInfo());
	$('#blockNumber').text(await web3.eth.getBlockNumber());

	web3.eth.getAccounts()
	.then( async (accounts) => {

		let account = accounts[0];
		console.log("Account : "+account);
		$('#account').text(account);

		let balance = await web3.eth.getBalance(account);
		let balanceInEth = web3.utils.fromWei(balance);
		console.log("Balance : "+balanceInEth);
		$('#balance').text(balanceInEth);
	})
	.catch( (error) => {
		console.error("Error getting accounts : "+error);
	});
}
````


## Récupérer le nom

```javascript
/**
* Read and display "name" from blockchain
*/
async function displayName() {
	helloContract.methods.getName().call()
	.then( (name) => {
			$('#name').text("Hello "+name);
		}
	)
	.catch( (error) => {
		console.error("Error reading name : "+error);
	});
}
```

## Modifier le nom
```javascript
/**
* Create a transaction to udpate the name in the smart contract
* @param newName : the new name to set
* @param account : the account that will create the transaction
*/
async function setName(newName, account) {
	console.log("Set new name : "+newName);

	// first, estimate gas cost
	helloContract.methods.setName(newName).estimateGas({from: account})
	.then( (gasAmount) => {

		console.log("Estimated gas : "+gasAmount);

		// then, send a transaction to setName using previously estimated gas amount
		helloContract.methods.setName(newName).send({from: account, gas: gasAmount})
		.on('transactionHash', (hash) => {
			console.log("Tx created "+hash);
			$('#txLink').html("<a target='_blank' href='https://ropsten.etherscan.io/tx/"+hash+"'>"+hash+"</a>");
		})
		.on('receipt', (receipt) => {
			console.log("Tx confirmed in block "+receipt.blockNumber);
			displayName();
			displayBlockchainInfo();
			stopWaiting();
		})
		.on('confirmation', (confirmationNumber, receipt) => {
			//console.log("confirmation "+confirmationNumber);
		})
		.on('error',(error) => {
			console.error("Error : "+error);
			stopWaiting();
		});

	})
	.catch(console.error);
}
```


## Récupérer les événements

````javascript
/**
* Read and display smart contract events
*/
async function displayEvents() {

	// get all emited events from first block to last block
	helloContract.getPastEvents("NameChanged", { fromBlock: 0, toBlock: 'latest' })
	.then((events, error) => {
		let htmlEvents = "<ul>";
		events.forEach(function(item, index, array) {
			htmlEvents+= ("<li><b>"+item.returnValues.newName+"</b> ("+item.blockNumber+")</li>");
		});
		htmlEvents += "</ul>";
 		$('#events').html(htmlEvents);
	});
}

````

## Champs privé ? Vraiment ?

Avez-vous remarqué dans le smart contract la présence d'un champ privé ? 
```solidity
string private name;
```

Essayez-donc ceci dans la console javascript du navigateur :
```javascript
web3.eth.getStorageAt("<contract address>",0,"latest")
.then( (v) => {console.log(web3.utils.toAscii(v));} );
``` 

Surprise :)

Le mot clé *private* permet seulement d'empêcher un smart contract d'accéder à certains champs d'un autre smart contract.
Physiquement, la donnée reste stockée dans une zone mémoire dont l'accès est permis en dehors de tout smart contract.


## Rendre la modification du nom payante

### Nouveau smart contract
Regardez le nouveau smart contract : PayableHello.

Il est construit sur la même base que le précédent mais il ajoute une dimension payante.

Il demande à l'utilisateur d'envoyer au moins 2 ETH pour pouvoir modifier le nom.
Il va également permette à son créateur de récupérer les sommes envoyées par les utilisateurs.


```solidity
pragma solidity ^0.5.0;

contract PayableHello is owned {

    string private name;

    event NameChanged(string newName, address userAddress, uint value);
    event Withdraw(address ownerAddress, uint balance);

    constructor() public {
        name = "nobody";
    }

    function setName(string memory newName) public payable {
    	require(msg.value >= 2 ether, "Pay 2 ETH or more");
        name = newName;
        emit NameChanged(newName, msg.sender, msg.value);
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function withdraw() public onlyOwner {
    	uint balance = address(this).balance;
		msg.sender.transfer(balance);
		emit Withdraw(msg.sender, balance);
    }

    function() external payable {
        revert();
    }

}
```

### Ajout du champ "prix" au formulaire
Dans *index.html* :
```html
<div class="form-group">
    <input type="text" class="form-control" id="price" placeholder="Price">
</div>
```

Et passer cette valeur à l'appel à setName :

```javascript
function updateName() {
    startWaiting();
    setName( $('#newName').val(), ethereum.selectedAddress, $('#price').val() );
    $('#newName').val('');
    $('#price').val('');
}
```
### Envoi de la somme demandée

Mise à jour de *setName* :  

```javascript
/**
* Create a transaction to udpate the name in the smart contract
* @param newName : the new name to set
* @param account : the account that will create the transaction
*/
async function setName(newName, account, price) {
	console.log("Set new name : "+newName+" for "+price+" ETH.");

	// first, estimate gas cost
	helloContract.methods.setName(newName).estimateGas({from: account, value: web3.utils.toWei(price, "ether")})
	.then( (gasAmount) => {

		console.log("Estimated gas : "+gasAmount);

		// then, send a transaction to setName using previously estimated gas amount
		helloContract.methods.setName(newName).send({from: account, gas: gasAmount, value: web3.utils.toWei(price, "ether")})
		.on('transactionHash', (hash) => {
			console.log("Tx created "+hash);
			$('#txLink').html("<a target='_blank' href='https://ropsten.etherscan.io/tx/"+hash+"'>"+hash+"</a>");
		})
		.on('receipt', (receipt) => {
			console.log("Tx confirmed in block "+receipt.blockNumber);
			displayName();
			displayBlockchainInfo();
			displayEvents();
			stopWaiting();
		})
		.on('confirmation', (confirmationNumber, receipt) => {
			//console.log("confirmation "+confirmationNumber);
		})
		.on('error',(error) => {
			console.error("Error : "+error);
			stopWaiting();
		});

	})
	.catch(console.error);
}
```

### Afficher la balance du contrat

Ajouter un champ dans les informations de la blockchain :

```html
<br/>
Contract balance : <span id="contractBalance"></span> ETH
```

Dans *displayBlockchainInfo*, remplir ce champa avec la balance du contrat :

```javascript
$('#contractBalance').text(web3.utils.fromWei(await web3.eth.getBalance(contractAddress)));
```


## Gérer le retrait

Nouveau contrat : owned.

Ce contrat permet de garder en mémoire l'adresse utilisée pour déployer le contrat et de la considérer comme celle de l'administrateur.

Il définit un *modifier* que l'on va appliquer à toutes les fonctions de notre contrat PayableHello accessibles uniquement par l'administrateur.

Il vérifie que l'appel à une fonction est effectué depuis la même adresse que celle de l'administrateur.

Enfin, il permet à l'admnistrateur de détruire le contrat.

```solidity
pragma solidity ^0.5.0;

contract owned {
	address payable owner;

	// Contract constructor: set owner
	constructor() public {
		owner = msg.sender;
	}

	// Access control modifier
	modifier onlyOwner {
	    require(msg.sender == owner, "Only the contract owner can call this function");
	    _;
	}

	// Contract destructor
	function destroy() public onlyOwner {
		selfdestruct(owner);
	}

}
```

Il ne reste qu'à définir *PayableHello* comme héritant de *owned* afin de bénéficier de ces fonctionnalités.

```solidity
contract PayableHello is owned
```
 

### Ajouter un bouton de retrait

Ajouter le bouton : 
```
<button type="button" class="btn btn-primary" onclick="javascript:callWithdraw()">Withdraw</button>
```

Et la fonction pour lancer le retrait :

```
/**
* Call the withdraw function
*/
function startWithdraw() {
    startWaiting();
    withdraw(ethereum.selectedAddress);
}
```

### Gérer le retrait

```javascript
/**
* Retreive contract balance. Only works for contract owner
* withdrawAccount : the address to send ethers to
*/
async function withdraw(account) {

	console.log("> call withdraw with "+account);

	helloContract.methods.withdraw().estimateGas({from: account})
	.then( (gasAmount) => {

		console.log("Estimated gas : "+gasAmount);

		// then, send a transaction to setName using previously estimated gas amount
		helloContract.methods.withdraw().send({from: account, gas: gasAmount})
		.on('transactionHash', (hash) => {
			console.log("Tx created "+hash);
			$('#txLink').html("<a target='_blank' href='https://ropsten.etherscan.io/tx/"+hash+"'>"+hash+"</a>");
		})
		.on('receipt', (receipt) => {
			console.log("Tx confirmed in block "+receipt.blockNumber);
			displayName();
			displayBlockchainInfo();
			displayEvents();
			stopWaiting();
		})
		.on('confirmation', (confirmationNumber, receipt) => {
			//console.log("confirmation "+confirmationNumber);
		})
		.on('error',(error) => {
			console.error("Error : "+error);
			stopWaiting();
		});

	})
	.catch(console.error);

}
```

### Test de sécurité

Usurper l'identité de l'administrateur :

Sélectionner dans Metamask un compte autre que celui qui a déployé le contrat.

En console, récupérer l'adresse *owner* du contrat puis appeler la fonction *withdraw* avec cette adresse en paramètre.

```javascript
web3.eth.getStorageAt("0x...",0,"latest").then( (v) => {console.log(v);} );
```
```javascript
withdraw("0x...");
```

Ca ne fonctionne pas, Metamask empêche d'utiliser les clés privés d'un compte qui n'est pas le compte en cours d'utilisation.


## Exercice 1 : afficher les événements de retrait

Sur le même modèle que pour les événements NameChanged, afficher les événement Withdraw.

## Exercice 1 : solution

Dans **index.html**, ajouter une zone :

```html
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <h5 class="card-header">Withdraws</h5>
            <div class="card-body">
                <div id="withdraw-events"></div>
            </div>
        </div>
    </div>
</div>
```
Dans **blockchain.js**, créer une fonction qui récupère les événements et les affiche :

```javascript
/**
* Read and display smart contract withdraw events
*/
async function displayWithdrawEvents() {

    // get all emited events from first block to last block
    helloContract.getPastEvents("Withdraw", { fromBlock: 0, toBlock: 'latest' })
    .then((events, error) => {
        let htmlEvents = "<ul>";
        events.forEach(function(item, index, array) {
            htmlEvents+= ("<li>"+item.returnValues.ownerAddress+" : "+web3.utils.fromWei(item.returnValues.balance)+" ("+item.blockNumber+")</li>");
        });
        htmlEvents += "</ul>";
        $('#withdraw-events').html(htmlEvents);
    });
}
```
## Exercice 2 : le plus offrant

Nous allons ajouter une nouvelle règle.

Chaque modification de nom ne sera pas immédiatement validée. Elles seront enregistrées dans le smart contract sous forme de proposition.

Une proposition = un nom, un émetteur, un prix, une date/heure de création

L'administrateur aura accès à une fonctionnalité qui sélectionnera automatiquement parmi toutes les proposition celle qui lui rapporte le plus. Elle sera alors appliquée. Les propositions non acceptées seront remboursées.

On affichera l'ensemble des propositions disponibles.

Un compte peut avoir une seule proposition en attente.

Si deux propositions ont un prix équivalent, celle proposée en premier sera sélectionnée.

Indications :
* [https://solidity.readthedocs.io/en/latest/](https://solidity.readthedocs.io/en/latest/)
* on utilisera les **struct** de Solidity pour représenter les propositions
* on utilisera **mapping** pour stocker les propositions en les associants à l'adresse de l'émetteur
* les **mapping** ne sont pas itérables, on gèrera un index manuellement avec un tableau d'adresses émetteur
* on n'oubliera pas de vider ces structures de données un fois qu'elles ne sont plus utiles


## Exercice 2 : solution

Le smart contract :

```solidity
pragma solidity ^0.5.0;

contract owned {
	address payable owner;

	// Contract constructor: set owner
	constructor() public {
		owner = msg.sender;
	}

	// Access control modifier
	modifier onlyOwner {
	    require(msg.sender == owner, "Only the contract owner can call this function");
	    _;
	}

	// Contract destructor
	function destroy() public onlyOwner {
		selfdestruct(owner);
	}

}

contract ProposableHello is owned {

    string private name;

    event NameChanged(string newName, address userAddress, uint value);
    event Withdraw(address ownerAddress, uint balance);

    struct Proposal {
        address payable sender;
        string name;
        uint value;
        uint time;
    }

    address [] public proposers;

    mapping(address => Proposal) public proposals;

    constructor() public {
        name = "nobody";
    }

    function setName(string memory newName) public payable {
    	require(msg.value >= 2 ether, "Pay 2 ETH or more");
        name = newName;
        emit NameChanged(newName, msg.sender, msg.value);
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function withdraw() public onlyOwner {
    	uint balance = address(this).balance;
        msg.sender.transfer(balance);
        emit Withdraw(msg.sender, balance);
    }

    function() external payable {
        revert();
    }

    function createProposal(string memory newName) public payable {
        require(msg.value >= 2 ether, "Pay 2 ETH or more");
        proposers.push(msg.sender);
        proposals[msg.sender] = Proposal(msg.sender, newName, msg.value, now);
    }

    function selectBestProposal() public onlyOwner {

        Proposal memory bestProposal = proposals[proposers[0]];
        delete proposals[proposers[0]];
        delete proposers[0];

        // search best proposal
        for (uint i=1; i<proposers.length; i++) {
            Proposal memory currentProposal = proposals[proposers[i]];
            
            if(( currentProposal.value > bestProposal.value) || (currentProposal.value == bestProposal.value && currentProposal.time < bestProposal.time)) {
                
                address payable sender = bestProposal.sender;
                uint value = bestProposal.value;
                
                bestProposal = currentProposal;
                
                // refund sender of previous best
                sender.transfer(value);
                
            }
            else {
                // refund sender
                currentProposal.sender.transfer(currentProposal.value);
            }
            
            delete proposals[proposers[i]];
            delete proposers[i];
        }
        
        // change value
        name = bestProposal.name;
        emit NameChanged(bestProposal.name, bestProposal.sender, bestProposal.value);
        
    }

}
```


## Affaire à suivre ...

Il est possible de faire évoluer ce projet de multiples façons :

* Passer le projet côté serveur en Node.js et le connecter à un noeud de blockchain local qui contiendra un portefeuille administré localement. 
* Gérer le déploiement des contrat avec un outil comme Truffle
* Ecrire des cas de test et les exécuter, toujours avec Truffle.
* ...
