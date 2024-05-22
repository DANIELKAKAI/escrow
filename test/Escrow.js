
const { expect } = require("chai");

const { ethers } = require('hardhat');

const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Escrow contract", function () {
    async function deployTokenFixture() {

        const [owner, addr1, addr2] = await ethers.getSigners();

        const escrowContract = await ethers.deployContract("Escrow");

        await escrowContract.waitForDeployment();

        return { escrowContract, owner, addr1, addr2 };
    }

    describe("Deployment", function () {

        it("Should set the right owner", async function () {
            const { escrowContract, owner } = await loadFixture(deployTokenFixture);
            expect(await escrowContract.owner()).to.equal(owner.address);
        });

    });

});