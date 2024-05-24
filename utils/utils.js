const { ethers } = require("ethers");

const decimals = 18;

function cUsdToWei(amount) {
    const amountInSmallestUnit = ethers.parseUnits(amount.toString(), decimals);
    return amountInSmallestUnit;
}

function weiToCusd(amountInWei) {
    const amountInCusd = ethers.formatUnits(amountInWei, decimals);
    return amountInCusd;
}

module.exports = { cUsdToWei, weiToCusd };