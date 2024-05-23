const { ethers } = require("ethers");

const TokenABIJson = require("./artifacts/contracts/EscrowV3.sol/EscrowV3.json");

const ERC20ABIJson = require("./utils/erc20.abi.json");

require('dotenv').config();

const OWNER_API_KEY = process.env.OWNER_PRIVATE_KEY;

const ARBITOR_PRIVATE_KEY = process.env.ARBITOR_PRIVATE_KEY;

const SELLER_PRIVATE_KEY = process.env.SELLER_PRIVATE_KEY;

const ownerAddress = "0x8C998Ca53F797646b6CBa17bBD191d521648E4EC";
const sellerAddress = "0x31B2821B611b8e07d88c9AFcb494de8E36b09537";
const arbitorAdress = "0x141adc0e0158B4c6886534701412da2E2b0d7fF1";


//wallet
const provider = new ethers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
const wallet = new ethers.Wallet(OWNER_API_KEY, provider);


//cusd
const cUsdAddress = "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9";
const celoContract = new ethers.Contract(cUsdAddress, ERC20ABIJson, wallet);


// arbitor contract
const abWallet = new ethers.Wallet(ARBITOR_PRIVATE_KEY, provider);
const abContract = new ethers.Contract(cUsdAddress, ERC20ABIJson, abWallet);


// ABI and Address of the deployed contract
const contractABI = TokenABIJson.abi;
const escrowContractAddress = "0x6244fa4Be9E12dA7b8A3a9C5b56c253be99395Ff";

// Connect to the contract
const contract = new ethers.Contract(escrowContractAddress, contractABI, wallet);


async function readFunction() {
    const owner = await contract.owner();
    console.log("Owner:", owner);

    const name = await contract.name();
    console.log("Name:", name);
}


async function productDetails() {
    let product = await contract.getProduct(sellerAddress, "ID-1");
    console.log(product);
}


async function addproduct() {
    let tx = await contract.addProduct(sellerAddress, arbitorAdress, "ID-1", 100);
    let r = await tx.wait();
}

async function balance(address) {
    const balance = await celoContract.balanceOf(arbitorAdress);
    console.log(`Balance is ${balance}`);
}

async function Tx() {

    //const balance = await celoContract.balanceOf(ownerAddress);
    //console.log(`Balance is ${balance}`);

    //const approveTx = await celoContract.approve(escrowContractAddress, 100);
    //let txres = await approveTx.wait();

    //let tx = await contract.deposit(sellerAddress, "ID-1", 100);
    //let res = await tx.wait();


    const approveTx = await abContract.approve(escrowContractAddress, 100);
    await approveTx.wait();

    let tx = await contract.approvedByBuyer(sellerAddress, "ID-1");
    await tx.wait();

}


//addproduct();

//productDetails();

//balance();

Tx();


