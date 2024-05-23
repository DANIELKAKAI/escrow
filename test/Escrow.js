
const { expect } = require("chai");

const { ethers } = require('hardhat');

const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Escrow contract", function () {
    async function deployTokenFixture() {

        const product = { productId: "22", amount: 10 }

        const [owner, buyer, arbitor, seller] = await ethers.getSigners();

        const escrowContract = await ethers.deployContract("Escrow");

        await escrowContract.waitForDeployment();

        return { product, escrowContract, owner, buyer, arbitor, seller };
    }

    async function addProductFixture() {
        const { product, escrowContract, buyer, arbitor, seller } = await loadFixture(deployTokenFixture);
        await escrowContract.connect(buyer).addProduct(seller.address, arbitor.address, product.productId, product.amount);
    }

    describe("Deployment", function () {

        it("Should set the right owner", async function () {
            const { escrowContract, owner } = await loadFixture(deployTokenFixture);
            expect(await escrowContract.owner()).to.equal(owner.address);
        });

    });

    describe("AddProduct", function () {
        it("Buyer Can Add Product", async function () {
            const { product, escrowContract, buyer, arbitor, seller } = await loadFixture(deployTokenFixture);

            await expect(escrowContract.connect(buyer).addProduct(seller.address, arbitor.address, product.productId, product.amount))
                .to.emit(escrowContract, "ProductAdded")
                .withArgs(seller.address, arbitor.address, buyer.address, product.productId, product.amount);

            let newProduct = await escrowContract.getProduct(seller.address, product.productId);

            expect(newProduct.productId).to.equal(product.productId);
            expect(newProduct.amount).to.equal(product.amount);
            expect(newProduct.buyerAddress).to.equal(buyer.address);
            expect(newProduct.arbitorAddress).to.equal(arbitor.address);
            expect(newProduct.status).to.equal(0);
        });
    });


    describe("Deposit Payment", function () {
        it("Buyer Can Deposit Payment", async function () {
            const { product, escrowContract, buyer, arbitor, seller } = await loadFixture(deployTokenFixture);

            await loadFixture(addProductFixture);

            await expect(escrowContract.connect(buyer).deposit(seller.address, product.productId, product.amount))
                .to.emit(escrowContract, "PaymentDeposited")
                .withArgs(seller.address, arbitor.address, buyer.address, product.productId, product.amount);

            let newProduct = await escrowContract.getProduct(seller.address, product.productId);

            expect(newProduct.status).to.equal(1);
        });
    });

});