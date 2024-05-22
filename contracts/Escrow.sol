// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    enum Status {
        AWAITING_PAYMENT,
        AWAITING_DELIVERY,
        REJECTED,
        COMPLETE,
        REFUNDED
    }

    struct Product {
        string productId;
        uint256 amount;
        Status status;
        address buyerAddress;
        address arbitorAddress;
    }

    mapping(address => mapping(string => Product)) public escrowProducts;

    event ProductAdded(
        address sellerAddress,
        address arbitorAddress,
        address buyerAddress,
        string productId,
        uint256 amount
    );
    event PaymentDeposited(
        address sellerAddress,
        address arbitorAddress,
        address buyerAddress,
        string productId,
        uint256 amount
    );

    event ApprovedByBuyer(
        address sellerAddress,
        address arbitorAddress,
        address buyerAddress,
        string productId
    );

    event RejectedByBuyer(
        address sellerAddress,
        address arbitorAddress,
        address buyerAddress,
        string productId
    );

    event ProductReturned(
        address sellerAddress,
        address arbitorAddress,
        address buyerAddress,
        string productId
    );

    function addProduct(
        address sellerAddress,
        address arbitorAddress,
        string memory productId,
        uint256 amount
    ) public {
        Product memory newProduct = Product({
            productId: productId,
            amount: amount,
            status: Status.AWAITING_PAYMENT,
            buyerAddress: msg.sender,
            arbitorAddress: arbitorAddress
        });

        escrowProducts[sellerAddress][productId] = newProduct;

        emit ProductAdded(
            sellerAddress,
            arbitorAddress,
            msg.sender,
            productId,
            amount
        );
    }

    function deposit(
        address sellerAddress,
        string memory productId,
        uint256 amount
    ) external {
        require(
            escrowProducts[sellerAddress][productId].status ==
                Status.AWAITING_PAYMENT
        );
        require(
            escrowProducts[sellerAddress][productId].amount == amount,
            "Deposit amount must be equal to product amount"
        );
        require(
            escrowProducts[sellerAddress][productId].buyerAddress == msg.sender,
            "Only the buyer can deposit funds"
        );

        escrowProducts[sellerAddress][productId].status = Status
            .AWAITING_DELIVERY;

        //transfer funds to arbitor

        emit PaymentDeposited(
            sellerAddress,
            escrowProducts[sellerAddress][productId].arbitorAddress,
            msg.sender,
            productId,
            escrowProducts[sellerAddress][productId].amount
        );
    }

    function approveByBuyer(
        address sellerAddress,
        string memory productId
    ) external {
        require(
            escrowProducts[sellerAddress][productId].buyerAddress == msg.sender,
            "Only the buyer can call this function"
        );
        require(
            escrowProducts[sellerAddress][productId].status ==
                Status.AWAITING_PAYMENT
        );

        //transfer from arbitor to seller address

        escrowProducts[sellerAddress][productId].status = Status.COMPLETE;

        emit ApprovedByBuyer(
            sellerAddress,
            escrowProducts[sellerAddress][productId].arbitorAddress,
            msg.sender,
            productId
        );
    }

    function rejectedByBuyer(
        address sellerAddress,
        string memory productId
    ) external {
        require(
            escrowProducts[sellerAddress][productId].buyerAddress == msg.sender,
            "Only the buyer can call this function"
        );
        require(
            escrowProducts[sellerAddress][productId].status ==
                Status.AWAITING_DELIVERY
        );

        escrowProducts[sellerAddress][productId].status = Status.REJECTED;

        emit RejectedByBuyer(
            sellerAddress,
            escrowProducts[sellerAddress][productId].arbitorAddress,
            msg.sender,
            productId
        );
    }

    function productReturned(string memory productId) external {
        require(
            escrowProducts[msg.sender][productId].status == Status.REJECTED,
            "Product must be rejected"
        );

        //transfer from arbitor to buyer

        escrowProducts[msg.sender][productId].status = Status.REFUNDED;

        emit ProductReturned(
            msg.sender,
            escrowProducts[msg.sender][productId].arbitorAddress,
            escrowProducts[msg.sender][productId].buyerAddress,
            productId
        );

        delete escrowProducts[msg.sender][productId];
    }
}
