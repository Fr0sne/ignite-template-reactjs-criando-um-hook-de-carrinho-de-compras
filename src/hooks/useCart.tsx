import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });
  const addToLocalStorage = (data: any) => {

    return localStorage.setItem("@RocketShoes:cart", JSON.stringify(data))
  }
  const addProduct = async (productId: number) => {
    try {
      const result = await api.get('/products/' + productId);

      const targetProduct = result.data
      console.log('targetProductAqui', targetProduct)
      const alreadyInCart = cart.find(e => e.id === productId)
      if (alreadyInCart) {
        await updateProductAmount({ productId, amount: alreadyInCart.amount + 1 })
        return
      }
      Object.assign(targetProduct, {
        amount: 1
      })
      addToLocalStorage([...cart, targetProduct])
      setCart([...cart, targetProduct])
    } catch (e: any) {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      if (!cart.find(product => product.id === productId)) throw new Error("Erro na remoção do produto")
      const newArray = cart.filter(prod => prod.id !== productId)
      addToLocalStorage([...newArray])
      setCart([...newArray])
    } catch (e: any) {
      return toast.error(e.message)
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const stockResult = await api.get('/stock/' + productId)
      const targetStock = stockResult.data
      if (amount <= 0 || targetStock.amount < amount) throw new Error('Quantidade solicitada fora de estoque')
      const productTargetIndex = cart.findIndex(prod => prod.id === productId)
      if (productTargetIndex < 0) throw new Error('Erro na alteração de quantidade do produto')
      const newArray = [...cart]
      newArray[productTargetIndex].amount = amount
      addToLocalStorage([...newArray])
      setCart([...newArray])
    } catch (e: any) {
      if (e.message === "Request failed with status code 404") {

        toast.error("Erro na alteração de quantidade do produto")
      } else {

        toast.error(e.message)
      }
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
