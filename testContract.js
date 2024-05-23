const { ethers } = require("ethers");

const TokenABIJson = require("./artifacts/contracts/Escrow.sol/Escrow.json");

require('dotenv').config();

const OWNER_API_KEY = process.env.OWNER_PRIVATE_KEY;

const ARBITOR_PRIVATE_KEY = process.env.ARBITOR_PRIVATE_KEY;

const SELLER_PRIVATE_KEY = process.env.SELLER_PRIVATE_KEY;

const sellerAddress = "0x31B2821B611b8e07d88c9AFcb494de8E36b09537";
const arbitorAdress = "0x141adc0e0158B4c6886534701412da2E2b0d7fF1";

// Connect to Sepolia network
const provider = new ethers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');

const wallet = new ethers.Wallet(OWNER_API_KEY, provider);

// ABI and Address of the deployed contract
const contractABI = TokenABIJson.abi;
const contractAddress = "0xa3CB462dFE182a88d7bc58dF5A5B28051B5aaB20";

// Connect to the contract
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Example: Call a read-only function
async function readFunction() {
    const owner = await contract.owner();
    console.log("Owner:", owner);

    const name = await contract.name();
    console.log("Name:", name);

    //let tx = await contract.addProduct(sellerAddress, arbitorAdress, "ID-1", 1);

    //let r = await tx.wait();

    //console.log(r);

    let product = await contract.getProduct(sellerAddress, "ID-1");

    console.log(product.productId, product.amount);
}


readFunction();

//transfer("0x141adc0e0158B4c6886534701412da2E2b0d7fF1")


