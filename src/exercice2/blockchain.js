
// address of smart contract
const contractAddress = "0x36e80547B55baa2a7442C23714e3529c1148aE93";

// contract global object
var helloContract;

function displayAll() {
	displayBlockchainInfo();
	displayName();
	displayEvents();
	displayWithdrawEvents();
}

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

		ethereum.on("accountsChanged", (accounts) => { document.location.reload(true); });

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

/**
* Init the contract object
*/
function initContract() {
	console.log("Load contract at : "+contractAddress);
	try {
		helloContract =  new web3.eth.Contract(payableHelloABI, contractAddress);
	}
	catch(error) {
		console.error("Error loading contract : "+error);
	}
}

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

	$('#contractBalance').text(web3.utils.fromWei(await web3.eth.getBalance(contractAddress)));
}

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

/**
* Create a transaction to udpate the name in the smart contract
* @param newName : the new name to set
* @param account : the account that will create the transaction
*/
/*async function setName(newName, account) {
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
			displayAll();
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
	.catch((error) => {console.error(error); stopWaiting(); });
}*/

// ------ From here, need PayableHello ----------

/**
* Create a transaction to udpate the name in the smart contract
* @param newName : the new name to set
* @param account : the account that will create the transaction
* @param price : the price in ETH to pay to change the name
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
			displayAll();
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
	.catch((error) => {console.error(error); stopWaiting(); });
}


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

/**
* Withdraw contract balance. Only works for contract owner
* @param account : the address to send ethers to
*/
async function withdraw(account) {

	console.log("Call withdraw with "+account);

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
	.catch((error) => {console.error(error); stopWaiting(); });
}

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