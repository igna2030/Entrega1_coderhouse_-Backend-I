import fs from "fs/promises";

export default class CartManager {
  constructor(path) {
    this.path = path;
  }
  async #readCarts() {
    try {
      const data = await fs.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error leyendo el archivo o encontrandolo", error);
      return [];
    }
  }

  async #writeCarts(carts) {
    try {
      await fs.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8");
    } catch (error) {
      console.error("Error escribiendo en en el archivo:", error);
    }
  }

  async addCart() {
    const carts = await this.#readCarts();
    const id = carts.length > 0 ? Math.max(...carts.map((c) => c.id)) + 1 : 1;
    const newCart = {
      id,
      products: [],
    };
    carts.push(newCart);
    await this.#writeCarts(carts);
    return newCart;
  }

  async getCarts() {
    return await this.#readCarts();
  }

  async getCartById(id) {
    const carts = await this.#readCarts();
    const cart = carts.find((c) => c.id === id);
    if (!cart) {
      throw new Error(`No existe un carrito con el id ${id}`)
    }
    return cart;
  }


  async addProductToCart(cartId, productId) {
    const carts = await this.#readCarts();
    const cartIndex = carts.findIndex(c => c.id === cartId);

    if (cartIndex === -1) {
      throw new Error(`No existe un carrito con ese id: ${cartId}`);
    }

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(p => p.productId === productId);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ productId, quantity: 1 });
    }

    carts[cartIndex] = cart;
    await this.#writeCarts(carts);
    return cart;
  }
}

