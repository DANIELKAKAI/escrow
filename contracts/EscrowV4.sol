// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EscrowV4 {
    string public name = "360Deals";

    address public owner;

    address private cUsdAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

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

    constructor() {
        owner = msg.sender;
    }

    function addProduct(
        address sellerAddress,
        address arbitorAddress,
        string memory productId,
        uint256 amount
    ) external {
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

    function getProduct(
        address sellerAddress,
        string memory productId
    ) public view returns (Product memory) {
        return escrowProducts[sellerAddress][productId];
    }

    function deposit(
        address sellerAddress,
        string memory productId,
        uint256 amount
    ) external {
        require(
            escrowProducts[sellerAddress][productId].status ==
                Status.AWAITING_PAYMENT,
            "Product must be awaiting payment to allow deposit"
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
        require(
            IERC20(cUsdAddress).transferFrom(
                msg.sender,
                escrowProducts[sellerAddress][productId].arbitorAddress,
                escrowProducts[sellerAddress][productId].amount
            ),
            "Transfer failed"
        );

        emit PaymentDeposited(
            sellerAddress,
            escrowProducts[sellerAddress][productId].arbitorAddress,
            msg.sender,
            productId,
            escrowProducts[sellerAddress][productId].amount
        );
    }

    function approvedByBuyer(
        address sellerAddress,
        string memory productId
    ) external {
        require(
            escrowProducts[sellerAddress][productId].buyerAddress == msg.sender,
            "Only the buyer can call this function"
        );

        require(
            escrowProducts[sellerAddress][productId].status ==
                Status.AWAITING_DELIVERY,
            "Only product awaiting delivery can be approved"
        );

        //transfer from arbitor to seller address
        require(
            IERC20(cUsdAddress).transferFrom(
                escrowProducts[sellerAddress][productId].arbitorAddress,
                sellerAddress,
                escrowProducts[sellerAddress][productId].amount
            ),
            "Transfer failed"
        );

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
                Status.AWAITING_DELIVERY,
            "Only product awaiting delivery can be approved"
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
        require(
            IERC20(cUsdAddress).transferFrom(
                escrowProducts[msg.sender][productId].arbitorAddress,
                msg.sender,
                escrowProducts[msg.sender][productId].amount
            ),
            "Transfer failed"
        );

        escrowProducts[msg.sender][productId].status = Status.REFUNDED;

        emit ProductReturned(
            msg.sender,
            escrowProducts[msg.sender][productId].arbitorAddress,
            escrowProducts[msg.sender][productId].buyerAddress,
            productId
        );
    }
}
