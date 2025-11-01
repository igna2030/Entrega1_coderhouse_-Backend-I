import mongoose from 'mongoose';
import ProductDao from './ProductDao.js';
import CartModel from './models/CartModel.js';

const productDao = new ProductDao();

class CartDao {

    async createCart() {
        return await CartModel.create({});
    }

    async getCartById(cid) {
        const cart = await CartModel.findById(cid).populate('products.productId').lean();
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }
        return cart;
    }


    async addProductToCart(cid, pid) {
        const cart = await CartModel.findById(cid);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        const targetProductId = mongoose.Types.ObjectId.createFromHexString(pid);
        const productIndex = cart.products.findIndex(p => p.productId.equals(targetProductId));

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ productId: targetProductId, quantity: 1 });
        }

        try {
            await productDao.decreaseStock(pid, 1);
        } catch (stockError) {
            throw new Error(`No se pudo actualizar el stock del producto ${pid}: ${stockError.message}`);
        }

        await cart.save();
        return cart;
    }

    async removeProductFromCart(cid, pid) {
        const cart = await CartModel.findById(cid);

        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        const productIndex = cart.products.findIndex(p => {
            const currentProductId = p.productId._id.toString();
            return currentProductId === pid;
        });

        if (productIndex === -1) {
            throw new Error(`Producto con id ${pid} no encontrado en el carrito.`);
        }

        const quantityToRemove = cart.products[productIndex].quantity;

        try {
            await productDao.increaseStock(pid, quantityToRemove);
            console.log(` Stock devuelto exitosamente para el producto ${pid}.`);
        } catch (stockError) {
            console.error(`Advertencia: Fallo al devolver stock para el producto ${pid}. Causa:`, stockError.message);
        }

        cart.products.splice(productIndex, 1);
        await cart.save();
        return cart;
    }

    async updateCartProducts(cid, productsArray) {
        const cart = await CartModel.findById(cid);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        cart.products = productsArray;
        await cart.save();
        return cart;
    }


    async updateProductQuantity(cid, pid, newQuantity) {
        if (typeof newQuantity !== 'number' || newQuantity < 0) {
            throw new Error("La cantidad debe ser un número no negativo.");
        }

        const cart = await CartModel.findById(cid);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        const productIndex = cart.products.findIndex(p => {
            const prodId = p.productId._id ? p.productId._id : p.productId;
            return String(prodId) === String(pid);
        });

        if (productIndex === -1) {
            throw new Error(`Producto con id ${pid} no encontrado en el carrito.`);
        }

        const oldQuantity = cart.products[productIndex].quantity;
        const quantityDifference = newQuantity - oldQuantity;

        if (newQuantity === 0) {

            throw new Error("Usa la función removeProductFromCart para eliminar, o envía quantity > 0.");
        }

        try {
            if (quantityDifference > 0) {
                await productDao.decreaseStock(pid, quantityDifference);
            } else if (quantityDifference < 0) {
                await productDao.increaseStock(pid, Math.abs(quantityDifference));
            }
        } catch (stockError) {
            throw new Error(`Fallo al ajustar el stock para el producto ${pid}. Causa: ${stockError.message}`);
        }

        cart.products[productIndex].quantity = newQuantity;

        await cart.save();
        return cart;
    }
    async clearCart(cid) {
        const cart = await CartModel.findById(cid);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        for (const item of cart.products) {
            const productIdRaw = item.productId;
            const pid = (productIdRaw && productIdRaw._id)
                ? productIdRaw._id.toString()
                : productIdRaw.toString();

            const quantity = item.quantity;

            try {
                await productDao.increaseStock(pid, quantity);
            } catch (stockError) {
                console.error(`Advertencia: Fallo al devolver stock en clearCart para ${pid}. Causa:`, stockError.message);
            }
        }

        cart.products = [];

        await cart.save();
        return cart;
    }

    async getAllCarts() {
        return await CartModel.find().lean();
    }
}

export default CartDao;