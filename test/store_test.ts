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
      expect(details._name).equal(name);
      expect(details._price).equal(price);
      expect(details._quantity).equal(quantity);
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
      expect(details._quantity).equal(quantity);
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
      expect(details._quantity).equal(0);
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
      const id = 0;
      const price = ethers.utils.parseEther('0.1');
      const initialBuyerBalance = await store.provider.getBalance(owner.address);

      await store.addProduct('scissors', price, 1);
      await store.buyProduct(id, { value: price });
      await store.returnProduct(id);

      const finalBuyerBalance = await store.provider.getBalance(owner.address);

      const details = await store.getProduct(id);

      expect(details._quantity).equal(1);
      expect(initialBuyerBalance).equal(finalBuyerBalance);
    });


    it('refunded products cannot be rebought', async () => {
      const id = 0;
      const price = ethers.utils.parseEther('0.1');

      await store.addProduct('scissors', price, 1);
      await store.buyProduct(id, { value: price });
      await store.returnProduct(id);
      await expect(store.buyProduct(id, { value: price }))
        .revertedWith('cannot be bought after refund');
    });

    it('cannot return product that does not exist', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 1);
      await expect(store.returnProduct(1))
        .revertedWith('product does not exist');
    });

    it('cannot return product not bought', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 1);
      await expect(store.returnProduct(0))
        .revertedWith('product not bought');
    });

    it('cannot return product after 100 blocks', async () => {
      const id = 0;
      const price = ethers.utils.parseEther('0.1');

      await store.addProduct('scissors', price, 1);
      await store.buyProduct(id, { value: price });

      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(ethers.provider.send('evm_mine', []));
      }

      await Promise.all(promises);

      await expect(store.returnProduct(id))
        .revertedWith('return period is over');
    });

    it('emits ReturnProduct event', async () => {
      const id = 0;
      const price = ethers.utils.parseEther('0.1');

      await store.addProduct('scissors', price, 1);
      await store.buyProduct(id, { value: price });
      await expect(store.returnProduct(id))
        .emit(store, 'ReturnProduct')
        .withArgs(id, owner.address);
    });
  });

  describe('availableProducts', () => {
    it('only available product ids are returned', async () => {
      const price = ethers.utils.parseEther('0.1');

      await store.addProduct('scissors', price, 1);
      await store.addProduct('chainsaw', price, 1);
      await store.addProduct('knife', price, 1);
      await store.addProduct('sword', price, 1);

      const products = await store.availableProducts();

      expect(products).length(4);
      expect(products[0]).equal(0);
      expect(products[1]).equal(1);
      expect(products[2]).equal(2);
      expect(products[3]).equal(3);
    });

    it('already bought product ids are not returned', async () => {
      const price = ethers.utils.parseEther('0.1');

      await store.addProduct('scissors', price, 1);
      await store.addProduct('chainsaw', price, 1);
      await store.addProduct('knife', price, 1);
      await store.addProduct('sword', price, 1);

      await store.buyProduct(1, { value: price });

      const products = await store.availableProducts();

      expect(products).length(3);
      expect(products[0]).equal(0);
      expect(products[1]).equal(2);
      expect(products[2]).equal(3);
    });
  });

  describe('getProduct', () => {
    it('returns product details', async () => {
      await store.addProduct('scissors', ethers.utils.parseEther('0.1'), 3);

      const details = await store.getProduct(0);
      expect(details._name).equal('scissors');
      expect(details._price).equal(ethers.utils.parseEther('0.1'));
      expect(details._quantity).equal(3);
    });

    it('reverts for non-existent product', async () => {
      await expect(store.getProduct(0)).revertedWith('product does not exist');
    });
  });
});
