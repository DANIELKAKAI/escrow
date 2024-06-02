const { ethers } = require("ethers");

const TokenABIJson = require("./artifacts/contracts/EscrowV4.sol/EscrowV4.json");

const ERC20ABIJson = require("./utils/erc20.abi.json");

require('dotenv').config();

const { cUsdToWei, weiToCusd } = require("./utils/utils")

const OWNER_API_KEY = process.env.OWNER_PRIVATE_KEY;

const ARBITOR_PRIVATE_KEY = process.env.ARBITOR_PRIVATE_KEY;

const SELLER_PRIVATE_KEY = process.env.SELLER_PRIVATE_KEY;

const ownerAddress = "0x8C998Ca53F797646b6CBa17bBD191d521648E4EC";
const sellerAddress = "0x31B2821B611b8e07d88c9AFcb494de8E36b09537";
const arbitorAdress = "0x141adc0e0158B4c6886534701412da2E2b0d7fF1";


//wallet
const provider = new ethers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
//const provider = new ethers.JsonRpcProvider('https://forno.celo.org');
const wallet = new ethers.Wallet(OWNER_API_KEY, provider);


//cusd
const cUsdAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
const celoContract = new ethers.Contract(cUsdAddress, ERC20ABIJson, wallet);


// arbitor contract
const abWallet = new ethers.Wallet(ARBITOR_PRIVATE_KEY, provider);
const abContract = new ethers.Contract(cUsdAddress, ERC20ABIJson, abWallet);


// ABI and Address of the deployed contract
const contractABI = TokenABIJson.abi;

// aljores
const escrowContractAddress = "0x30137D3B965E3E3E1EA28dE9C85E77383CAEf4D1";

//mainnet
//const escrowContractAddress = "0xa3CB462dFE182a88d7bc58dF5A5B28051B5aaB20";

// Connect to the contract
const contract = new ethers.Contract(escrowContractAddress, contractABI, wallet);


async function readFunction() {
    const owner = await contract.owner();
    console.log("Owner:", owner);

    const name = await contract.name();
    console.log("Name:", name);
}


async function productDetails(id) {
    let product = await contract.getProduct(sellerAddress, id);
    console.log(product);
}


async function addproduct() {
    let tx = await contract.addProduct(sellerAddress, arbitorAdress, "ID-3", cUsdToWei(1));
    let r = await tx.wait();
}

async function balance(address, name) {
    const balance = await celoContract.balanceOf(address);
    console.log(`Balance of ${name} is ${weiToCusd(balance)}`);
}

async function approveBuyerTx() {
    const approveTx = await abContract.approve(escrowContractAddress, cUsdToWei(1));
    await approveTx.wait();

    try {
        let tx = await contract.approvedByBuyer(sellerAddress, "1131");
        let res = await tx.wait();
        console.log(res.hash);
    }
    catch (error) {
        console.log(error.shortMessage);
    }

}

async function depositTx() {

    try {
        const approveTx = await celoContract.approve(escrowContractAddress, cUsdToWei(0.1));
        let txres = await approveTx.wait();
    }
    catch (error) {
        console.log(error);
    }

    try {
        let tx = await contract.deposit(sellerAddress, "006", cUsdToWei(0.1));
        let res = await tx.wait();

        console.log(res);
    }
    catch (error) {
        console.log(error.shortMessage);
        console.log(error);
    }

}

//addproduct();

productDetails("119");

//balance(ownerAddress, "buyer");
//balance(arbitorAdress, "arbitor");
//balance(sellerAddress, "seller");

//depositTx();

//approveBuyerTx();


// npm install @celo/contractkit web3







function walletConnect() {

    const { Web3 } = require('web3');
    const ContractKit = require('@celo/contractkit');

    const web3 = new Web3('https://forno.celo.org');
    const kit = ContractKit.newKitFromWeb3(web3);

    async function getWalletAddress(phoneNumber) {
        // Normalize the phone number
        const accounts = await kit.contracts.getAccounts();
        const attestations = await kit.contracts.getAttestations();

        const hash = web3.utils.keccak256(phoneNumber);
        const identifier = await attestations.lookupAccountsForIdentifier(hash);
        if (identifier.length > 0) {
            return identifier[0].address; // Return the first associated address
        } else {
            throw new Error('No address found for this phone number');
        }
    }

    const phoneNumber = '+254789256781';  // Replace with the actual phone number
    getWalletAddress(phoneNumber).then(address => {
        console.log('Wallet Address:', address);
    }).catch(error => {
        console.error('Error:', error);
    });

}




