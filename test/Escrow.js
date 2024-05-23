
const { expect } = require("chai");

const { ethers } = require('hardhat');

const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Escrow contract", function () {
    async function deployContractFixture() {

        const product = { productId: "22", amount: 10 }

        const [owner, buyer, arbitor, seller] = await ethers.getSigners();

        const escrowContract = await ethers.deployContract("Escrow");

        await escrowContract.waitForDeployment();

        return { product, escrowContract, owner, buyer, arbitor, seller };
    }

    async function addProductFixture() {
        const { product, escrowContract, buyer, arbitor, seller } = await loadFixture(deployContractFixture);
        await escrowContract.connect(buyer).addProduct(seller.address, arbitor.address, product.productId, product.amount);
        return { escrowContract }
    }

    async function depositAmountFixture() {
        const { product, buyer, seller } = await loadFixture(deployContractFixture);
        const { escrowContract } = await loadFixture(addProductFixture);
        await escrowContract.connect(buyer).deposit(seller.address, product.productId, product.amount);
        return { escrowContract };
    }

    async function rejectProductFixture() {
        const { product, buyer, seller } = await loadFixture(deployContractFixture);
        const { escrowContract } = await loadFixture(depositAmountFixture);
        await escrowContract.connect(buyer).rejectedByBuyer(seller.address, product.productId);
        return { escrowContract };
    }

    describe("Deployment", function () {

        it("Should set the right owner", async function () {
            const { escrowContract, owner } = await loadFixture(deployContractFixture);
            expect(await escrowContract.owner()).to.equal(owner.address);
        });

    });

    describe("AddProduct", function () {
        it("Buyer Can Add Product", async function () {
            const { product, escrowContract, buyer, arbitor, seller } = await loadFixture(deployContractFixture);

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
            const { product, buyer, arbitor, seller } = await loadFixture(deployContractFixture);

            const { escrowContract } = await loadFixture(addProductFixture);

            await expect(escrowContract.connect(buyer).deposit(seller.address, product.productId, product.amount))
                .to.emit(escrowContract, "PaymentDeposited")
                .withArgs(seller.address, arbitor.address, buyer.address, product.productId, product.amount);

            let newProduct = await escrowContract.getProduct(seller.address, product.productId);

            expect(newProduct.status).to.equal(1); //AWAITING_DELIVERY
        });
    });

    describe("Approved By Buyer", function () {
        it("Buyer Can Approve", async function () {
            const { product, buyer, arbitor, seller } = await loadFixture(deployContractFixture);

            const { escrowContract } = await loadFixture(depositAmountFixture);

            await expect(escrowContract.connect(buyer).approvedByBuyer(seller.address, product.productId))
                .to.emit(escrowContract, "ApprovedByBuyer")
                .withArgs(seller.address, arbitor.address, buyer.address, product.productId);

            let newProduct = await escrowContract.getProduct(seller.address, product.productId);

            expect(newProduct.status).to.equal(3); //COMPLETE

        })
    });

    describe("Rejected By Buyer", function () {
        it("Buyer Can Reject", async function () {
            const { product, buyer, arbitor, seller } = await loadFixture(deployContractFixture);

            const { escrowContract } = await loadFixture(depositAmountFixture);

            await expect(escrowContract.connect(buyer).rejectedByBuyer(seller.address, product.productId))
                .to.emit(escrowContract, "RejectedByBuyer")
                .withArgs(seller.address, arbitor.address, buyer.address, product.productId);

            let newProduct = await escrowContract.getProduct(seller.address, product.productId);

            expect(newProduct.status).to.equal(2); //REJECTED

        })

        it("Product Returned after Rejection", async function () {
            const { product, buyer, arbitor, seller } = await loadFixture(deployContractFixture);

            const { escrowContract } = await loadFixture(rejectProductFixture);

            await expect(escrowContract.connect(seller).productReturned(product.productId))
                .to.emit(escrowContract, "ProductReturned")
                .withArgs(seller.address, arbitor.address, buyer.address, product.productId);

            let newProduct = await escrowContract.getProduct(seller.address, product.productId);

            expect(newProduct.status).to.equal(4); //REFUNDED

        })
    });

});