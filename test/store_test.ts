import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import StoreArtifact from '../artifacts/contracts/Store.sol/Store.json';

import { Store } from '../typechain-types';
const { deployContract } = waffle;

describe('Store', () => {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let store: Store;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();

    store = (await deployContract(owner, StoreArtifact)) as Store;
  });

  describe('addProduct', () => {
    it('only owner can add product', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 1);

      await expect(store.connect(addr1).addProduct('chainsaw', ethers.utils.parseEther('0.1'), 1))
        .revertedWith('owner');
    });

    it('product is added with quantity', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 3);

      const details = await store.getProduct(0);
      expect(details._name).to.equal('scissors');
      expect(details._price).to.equal(ethers.utils.parseEther('0.1'));
      expect(details._quantity).to.equal(3);
    });

    it('cannot add product with no name', async () => {
      await expect(store.addProduct('', ethers.utils.parseEther('0.1'), 1))
        .revertedWith('name cannot be empty');
    });

    it('cannot add product with 0 quantity', async () => {
      await expect(store.addProduct('chainsaw', ethers.utils.parseEther('0.1'), 0))
        .revertedWith('quantity cannot be 0');
    });

    it('cannot add product with 0 price', async () => {
      await expect(store.addProduct('chainsaw', ethers.utils.parseEther('0'), 1))
        .revertedWith('price cannot be 0');
    });

    it('cannot add same product twice', async () => {
      await store.addProduct('chainsaw', ethers.utils.parseEther('0.1'), 3);

      await expect(store.addProduct('chainsaw', ethers.utils.parseEther('0.1'), 1))
        .be.revertedWith('already added');
    });

    it('emits AddProduct event', async () => {
      await expect(store.addProduct('chainsaw', ethers.utils.parseEther('0.1'), 3))
        .emit(store, 'AddProduct')
        .withArgs(0, 'chainsaw', ethers.utils.parseEther('0.1'), 3);
    });
  });

  describe('setProductQuantity', () => {
    it('only owner can set product quantity', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 1);

      await store.setProductQuantity(0, 3);
      await expect(
        store.connect(addr1).setProductQuantity(0, 3),
      ).revertedWith('owner');
    });

    it('product quantity is updated', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 1);
      await store.setProductQuantity(0, 3);

      const details = await store.getProduct(0);
      expect(details._quantity).to.equal(3);
    });

    it('cannot update non-existent product quantity', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 1);
      await expect(store.setProductQuantity(1, 3)).revertedWith('product does not exist');
    });

    it('emits SetProductQuantity event', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 1);

      await expect(store.setProductQuantity(0, 3))
        .emit(store, 'SetProductQuantity')
        .withArgs(0, 3);
    });
  });

  describe('buyProduct', () => {
    it('product is bought', async () => {

    });

    it('cannot buy product if msg.value > price', async () => {

    });

    it('cannot buy product if msg.value < price', async () => {

    });

    it('cannot buy same product twice', async () => {

    });

    it('cannot buy out-of-stock product', async () => {

    });

    it('emits BuyProduct event', async () => {

    });
  });

  describe('returnProduct', () => {
    it('product is returned and price refunded', async () => {

    });

    it('cannot return product not bought', async () => {

    });

    it('cannot return product after 100 blocks', async () => {

    });

    it('emits ReturnProduct event', async () => {

    });
  });

  describe('availableProducts', () => {
    it('only available product ids are returned', async () => {

    });

    it('already bought product ids are not returned', async () => {

    });
  });

  describe('getProduct', () => {
    it('returns product details', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 3);

      const details = await store.getProduct(0);
      expect(details._name).to.equal('scissors');
      expect(details._price).to.equal(ethers.utils.parseEther('0.1'));
      expect(details._quantity).to.equal(3);
    });

    it('reverts for non-existent product', async () => {
      await expect(store.getProduct(0)).revertedWith('product does not exist');
    });
  });
});
