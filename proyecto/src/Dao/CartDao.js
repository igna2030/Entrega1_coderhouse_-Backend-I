import CartModel from '../models/CartModel.js';

import Cart from './models/Cart.js';

class CartDao {
    async createCart() {
        return await Cart.create({});
    }

    async getCartById(cid) {
        const cart = await Cart.findById(cid).lean();
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }
        return cart;
    }

    async addProductToCart(cid, pid) {
        const cart = await Cart.findById(cid);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ productId: pid, quantity: 1 });
        }

        await cart.save();
        return cart;
    }

    async removeProductFromCart(cid, pid) {
        const cart = await Cart.findById(cid);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        cart.products = cart.products.filter(p => p.productId.toString() !== pid);

        await cart.save();
        return cart;
    }

    async updateCartProducts(cid, productsArray) {
        const cart = await Cart.findById(cid);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        cart.products = productsArray;
        await cart.save();
        return cart;
    }

    async updateProductQuantity(cid, pid, quantity) {
        if (typeof quantity !== 'number' || quantity <= 0) {
            throw new Error("La cantidad debe ser un número positivo.");
        }
        
        const cart = await Cart.findById(cid);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);

        if (productIndex === -1) {
            throw new Error(`Producto con id ${pid} no encontrado en el carrito.`);
        }

        cart.products[productIndex].quantity = quantity;

        await cart.save();
        return cart;
    }

    async clearCart(cid) {
        const cart = await Cart.findById(cid);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        cart.products = [];
        await cart.save();
        return cart;
    }
}

export default CartDao;
