import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}
const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    console.log(sumAmount, product, 'c');

    return {
      ...sumAmount,
      [product.id]: product.amount + (sumAmount[product.id] || 0)

    }
  }, {} as CartItemsAmount)

  console.log('1111', cartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const result = await api.get('/products')
      const json = result.data
      setProducts(json)
    }

    loadProducts();
  }, []);

  async function handleAddProduct(id: number) {
    await addProduct(id);
  }

  return (
    <>
      {products.map(product => {
        return (
          <ProductList key={product.id}>
            <li>
              <img src={product.image} alt="Tênis de Caminhada Leve Confortável" />
              <strong>{product.title}</strong>
              <span>{formatPrice(product.price)}</span>
              <button
                type="button"
                data-testid="add-product-button"
                onClick={() => handleAddProduct(product.id)}
              >
                <div data-testid="cart-product-quantity">
                  <MdAddShoppingCart size={16} color="#FFF" />
                  {cartItemsAmount[product.id] || 0}
                </div>

                <span>ADICIONAR AO CARRINHO</span>
              </button>
            </li>
          </ProductList>
        )
      })}
    </>
  );
};

export default Home;
