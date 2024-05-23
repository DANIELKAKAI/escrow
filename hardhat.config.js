/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
};

require("@nomicfoundation/hardhat-toolbox")

require('dotenv').config();

if (process.env.DEPLOY_CONFIG) {
  const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

  module.exports = {
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
}
