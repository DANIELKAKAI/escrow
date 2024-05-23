const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const EscrowModule = buildModule("EscrowModule", (m) => {
    const escrow = m.contract("Escrow");

    return { escrow };
});

module.exports = EscrowModule;