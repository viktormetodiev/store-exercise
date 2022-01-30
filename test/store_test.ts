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
      const id = 0;
      const name = 'scissors';
      const price = ethers.utils.parseEther('0.1');
      const quantity = 3;

      await store.addProduct(name, price, quantity);

      const details = await store.getProduct(id);
      expect(details._name).to.equal(name);
      expect(details._price).to.equal(price);
      expect(details._quantity).to.equal(quantity);
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
      const id = 0;
      const name = 'chainsaw';
      const price = ethers.utils.parseEther('0.1');
      const quantity = 3;

      await expect(store.addProduct(name, price, quantity))
        .emit(store, 'AddProduct')
        .withArgs(id, name, price, quantity);
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
      const id = 0;
      const name = 'chainsaw';
      const price = ethers.utils.parseEther('0.1');
      const quantity = 3;

      await store.addProduct(name, price, 1);
      await store.setProductQuantity(id, quantity);

      const details = await store.getProduct(id);
      expect(details._quantity).to.equal(quantity);
    });

    it('cannot update non-existent product quantity', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 1);
      await expect(store.setProductQuantity(1, 3)).revertedWith('product does not exist');
    });

    it('emits SetProductQuantity event', async () => {
      const id = 0;
      const name = 'chainsaw';
      const price = ethers.utils.parseEther('0.1');
      const quantity = 3;

      await store.addProduct(name, price, 1);

      await expect(store.setProductQuantity(id, quantity))
        .emit(store, 'SetProductQuantity')
        .withArgs(id, quantity);
    });
  });

  describe('buyProduct', () => {
    it('product is bought', async () => {
      const id = 0;
      const price = ethers.utils.parseEther('0.1');

      await store.addProduct('scissors', price, 1);

      await store.buyProduct(id, { value: price });

      const details = await store.getProduct(id);
      expect(details._quantity).to.equal(0);
      expect(await store.provider.getBalance(store.address)).equal(price);
    });

    it('cannot buy product if product does not exist', async () => {
      await expect(store.buyProduct(0, { value: ethers.utils.parseEther('1') }))
        .revertedWith('product does not exist');
    });

    it('cannot buy product if msg.value > price', async () => {
      const id = 0;

      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 1);

      await expect(store.buyProduct(id, { value: ethers.utils.parseEther('1') }))
        .revertedWith('sent not equal to product price');
    });

    it('cannot buy product if msg.value < price', async () => {
      const id = 0;

      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 1);

      await expect(store.buyProduct(id, { value: ethers.utils.parseEther('0.01') }))
        .revertedWith('sent not equal to product price');
    });

    it('cannot buy same product twice', async () => {
      const id = 0;
      const price = ethers.utils.parseEther('0.1');

      await store.addProduct('scissors', price, 2);
      await store.buyProduct(id, { value: price });

      await expect(store.buyProduct(id, { value: price }))
        .revertedWith('product already bought');
    });

    it('cannot buy out-of-stock product', async () => {
      const id = 0;
      const price = ethers.utils.parseEther('0.1');

      await store.addProduct('scissors', price, 1);
      await store.buyProduct(id, { value: price });

      await expect(store.connect(addr1).buyProduct(id, { value: price }))
        .revertedWith('product out of stock');
    });

    it('emits BuyProduct event', async () => {
      const id = 0;
      const price = ethers.utils.parseEther('0.1');

      await store.addProduct('scissors', price, 1);
      await expect(store.buyProduct(id, { value: price }))
        .emit(store, 'BuyProduct')
        .withArgs(id, owner.address);
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
