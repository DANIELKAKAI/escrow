/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
};

require("@nomicfoundation/hardhat-toolbox")

require('dotenv').config();

const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

alfajores = {
  solidity: "0.8.24",
  networks: {
    alfajores: {
      url: 'https://alfajores-forno.celo-testnet.org',
      chainId: 44787,
      accounts: [OWNER_PRIVATE_KEY]
    }
  },
  defaultNetwork: "alfajores"
};

mainnet = {
  solidity: "0.8.24",
  networks: {
    mainnet: {
      url: 'https://forno.celo.org',
      chainId: 42220,
      accounts: [OWNER_PRIVATE_KEY]
    }
  },
  defaultNetwork: "mainnet"
};

if (process.env.DEPLOY_CONFIG) {
  module.exports = mainnet;
}
