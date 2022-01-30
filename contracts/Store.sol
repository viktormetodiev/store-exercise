//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

interface IStore {
  function addProduct(string memory _name, uint _price, uint _quantity) external;
  function setProductQuantity(uint _id, uint _quantity) external;

  function buyProduct(uint _id) external payable;
  function returnProduct(uint _id) external;

  function availableProducts() external view returns (uint[] memory);
  function getProduct(uint _id) external view returns (string memory _name, uint _quantity, uint _price, bool _available);

  event AddProduct(uint indexed _id, string _name, uint _price, uint _quantity);
  event SetProductQuantity(uint indexed _id, uint _quantity);
  event BuyProduct(uint indexed _id, address _buyer);
  event ReturnProduct(uint indexed _id, address _buyer);
}
