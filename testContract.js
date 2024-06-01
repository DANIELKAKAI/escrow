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
const wallet = new ethers.Wallet(OWNER_API_KEY, provider);


//cusd
const cUsdAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
const celoContract = new ethers.Contract(cUsdAddress, ERC20ABIJson, wallet);


// arbitor contract
const abWallet = new ethers.Wallet(ARBITOR_PRIVATE_KEY, provider);
const abContract = new ethers.Contract(cUsdAddress, ERC20ABIJson, abWallet);


// ABI and Address of the deployed contract
const contractABI = TokenABIJson.abi;
const escrowContractAddress = "0x30137D3B965E3E3E1EA28dE9C85E77383CAEf4D1";

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
        let tx = await contract.approvedByBuyer(sellerAddress, "ID-3");
        let res = await tx.wait();
        console.log(res.hash);
    }
    catch (error) {
        console.log(error.shortMessage);
    }

}

async function depositTx() {

    const approveTx = await celoContract.approve(escrowContractAddress, cUsdToWei(1));
    let txres = await approveTx.wait();


    try {
        let tx = await contract.deposit(sellerAddress, "ID-3", cUsdToWei(1));
        let res = await tx.wait();

        console.log(res);
    }
    catch (error) {
        console.log(error.shortMessage);
    }

}

//addproduct();

productDetails("111");

//balance(ownerAddress, "buyer");
//balance(arbitorAdress, "arbitor");
//balance(sellerAddress, "seller");

//depositTx();

//approveBuyerTx();





