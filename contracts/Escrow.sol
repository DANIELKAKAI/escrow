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

    mapping(address => mapping(string => Product)) public sellerProducts;

    event ProductAdded(address sellerAddress,address arbitorAddress,address buyerAddress,string memory productId,uint256 amount);
    event PaymentDeposited(address depositor, uint256 amount);

    function addProduct(
        address sellerAddress,
        address arbitorAddress,
        string memory productId,
        uint256 amount
    ) public {
        Product memory newProduct = Product({
            productId: productId,
            buyer: newBuyer,
            amount: amount,
            status: Status.AWAITING_PAYMENT,
            buyerAddress: msg.sender,
            arbitorAddress: arbitorAddress
        });

        escrowProducts[sellerAddress][productId] = newProduct;

        emit ProductAdded(sellerAddress,arbitorAddress,msg.sender,productId,amount);
    }

    function deposit(
        uint256 amount,
        address sellerAdress,
        string productId
    ) external  {
        require(escrowProducts[sellerAddress][productId]["status"] == State.AWAITING_PAYMENT);
        require(
            escrowProducts[sellerAddress][productId]["amount"] >= msg.value,
            "Deposit amount must be greater than or equal to product"
        );
        require(
            escrowProducts[sellerAddress][productId]["buyerAddress"] ==
                msg.sender,
            "Only the buyer can deposit funds"
        );

        escrowProducts[sellerAddress][productId]["status"] = State
            .AWAITING_DELIVERY;

        //transfer funds to arbitor

        emit PaymentDeposited(sellerAddress,[sellerAddress][productId]["arbitorAddress"],msg.sender,productId,amount);
    }

    function approveByBuyer(address sellerAddress,string memory productId)
        external 
    {
        require(escrowProducts[sellerAddress][productId]["buyerAddress"] == msg.sender, "Only the buyer can call this function");
        require(escrowProducts[sellerAddress][productId]["status"] == State.AWAITING_PAYMENT);

        //transfer from arbitor to seller address

        escrowProducts[sellerAddress][productId]["status"] = State.COMPLETE;
        
    }

    function rejectedByBuyer(address sellerAddress,string memory productId)
        external 
    {
        require(escrowProducts[sellerAddress][productId]["buyerAddress"] == msg.sender, "Only the buyer can call this function");
        require(escrowProducts[sellerAddress][productId]["status"] == State.AWAITING_DELIVERY);

        escrowProducts[sellerAddress][productId]["status"] = State.REJECTED;
    }

    function productReturned(string memory productId)
        external public
    {
        require(escrowProducts[msg.sender][productId] == State.REJECTED, "Product must be rejected");

        //transfer from arbitor to buyer

        escrowProducts[sellerAddress][productId]["status"] = State.REFUNDED;
        
    }
}
