//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IStore {
  function addProduct(string memory _name, uint _price, uint _quantity) external;
  function setProductQuantity(uint _id, uint _quantity) external;

  function buyProduct(uint _id) external payable;
  function returnProduct(uint _id) external;

  function availableProducts() external view returns (uint[] memory);
  function getProduct(uint _id) external view returns (string memory _name, uint _quantity, uint _price);

  event AddProduct(uint indexed _id, string _name, uint _price, uint _quantity);
  event SetProductQuantity(uint indexed _id, uint _quantity);
  event BuyProduct(uint indexed _id, address _buyer);
  event ReturnProduct(uint indexed _id, address _buyer);
}

contract Store is Ownable {
  struct Product {
    uint price;
    uint quantity;
  }

  string[] private productNames;
  mapping(string => bool) private productNameExists;
  mapping(uint => Product) private products;
  mapping(uint => mapping(address => bool)) private productPurchased;

  event AddProduct(uint indexed _id, string _name, uint _price, uint _quantity);
  event SetProductQuantity(uint indexed _id, uint _quantity);
  event BuyProduct(uint indexed _id, address _buyer);
  event ReturnProduct(uint indexed _id, address _buyer);

  modifier productExists(uint _id) {
    require(_id < productNames.length, "product does not exist");
    _;
  }

  function addProduct(string memory _name, uint _price, uint _quantity)
    external
    onlyOwner
  {
    require(bytes(_name).length > 0, "name cannot be empty");
    require(_price > 0, "price cannot be 0");
    require(_quantity > 0, "quantity cannot be 0");
    require(!productNameExists[_name], "product already added");

    productNameExists[_name] = true;

    uint id = productNames.length;
    Product storage product = products[id];
    product.price = _price;
    product.quantity = _quantity;

    productNames.push(_name);

    emit AddProduct(id, _name, _price, _quantity);
  }

  function setProductQuantity(uint _id, uint _quantity)
    external
    onlyOwner
    productExists(_id)
  {
    products[_id].quantity = _quantity;
    emit SetProductQuantity(_id, _quantity);
  }

  function buyProduct(uint _id)
    external
    payable
    productExists(_id)
  {
    Product memory product = products[_id];

    require(product.quantity > 0, "product out of stock");
    require(product.price == msg.value, "sent not equal to product price");
    require(!productPurchased[_id][msg.sender], "product already bought");

    products[_id].quantity -= 1;
    productPurchased[_id][msg.sender] = true;

    emit BuyProduct(_id, msg.sender);
  }

  function returnProduct(uint _id)
    external
  {

  }

  function availableProducts() external view returns (uint[] memory) {
    uint count;
    for (uint i; i < productNames.length; i++) {
      if (!productPurchased[i][msg.sender] && products[i].quantity > 0) {
        count++;
      }
    }

    uint currIndex;
    uint[] memory result = new uint[](count);
    for (uint i; i < productNames.length; i++) {
      if (!productPurchased[i][msg.sender] && products[i].quantity > 0) {
        result[currIndex++] = i;
      }
    }

    return result;
  }

  function getProduct(uint _id)
    external
    view
    productExists(_id)
    returns (string memory _name, uint _quantity, uint _price)
  {
    Product memory product = products[_id];
    _name = productNames[_id];
    _quantity = product.quantity;
    _price = product.price;
  }
}
