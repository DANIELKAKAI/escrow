const { ethers } = require("ethers");

require('dotenv').config();

//const ARBITOR_PRIVATE_KEY = process.env.ARBITOR_PRIVATE_KEY;

const decimals = 18;

function cUsdToWei(amount) {
    const amountInSmallestUnit = ethers.parseUnits(amount.toString(), decimals);
    return amountInSmallestUnit;
}

function weiToCusd(amountInWei) {
    const amountInCusd = ethers.formatUnits(amountInWei, decimals);
    return amountInCusd;
}

async function arbitorApproval(amount) {
    require('dotenv').config();
    const ERC20ABIJson = require("./erc20.abi.json");
    const cUsdAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

    const ARBITOR_PRIVATE_KEY = "b9c054b148727a388dd06cf329c5c67e37324a8085fb2893f0023d1802097754"

    // arbitor contract
    const provider = new ethers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
    const abWallet = new ethers.Wallet(ARBITOR_PRIVATE_KEY, provider);
    const abContract = new ethers.Contract(cUsdAddress, ERC20ABIJson, abWallet);
    const escrowContractAddress = "0x30137D3B965E3E3E1EA28dE9C85E77383CAEf4D1";

    const approveTx = await abContract.approve(
        escrowContractAddress,
        cUsdToWei(amount)
    );

    let res = await approveTx.wait();

    console.log(res);

}

module.exports = { cUsdToWei, weiToCusd, arbitorApproval };