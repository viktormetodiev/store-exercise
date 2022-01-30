describe('Store', () => {
  describe('addProduct', () => {
    it('only owner can add product', async () => {

    });

    it('product is added with quantity', async () => {

    });

    it('emits AddProduct event', () => {

    });

    it('cannot add product with no name', async () => {

    });

    it('cannot add product with 0 quantity', async () => {

    });

    it('cannot add product with 0 price', async () => {

    });

    it('cannot add same product twice', async () => {

    });
  });

  describe('setProductQuantity', () => {
    it('only owner can set product quantity', async () => {

    });

    it('product quantity is updated', async () => {

    });

    it('cannot update non-existent product quantity', async () => {

    });

    it('emits SetProductQuantity event', async () => {

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
  });

  describe('getProduct', () => {
    it('returns product details', async () => {

    });

    it('cannot return non-existent products', async () => {

    });
  });
});
