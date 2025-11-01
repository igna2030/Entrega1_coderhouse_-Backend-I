import moongose from 'mongoose';
import ProductDao from './ProductDao.js';
import CartModel from './models/CartModel.js'; 

const productDao = new ProductDao();

class CartDao {

    async createCart() {
        return await CartModel.create({});
    }

    async getCartById(cid) {
        const cart = await CartModel.findById(cid).lean();
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

        const targetProductId = moongose.Types.ObjectId.createFromHexString(pid);
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
        console.log(`✅ Stock devuelto exitosamente para el producto ${pid}.`);
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

    async updateProductQuantity(cid, pid, quantity) {
        if (typeof quantity !== 'number' || quantity <= 0) {
            throw new Error("La cantidad debe ser un número positivo.");
        }

        const cart = await CartModel.findById(cid);
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
        const cart = await CartModel.findById(cid);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cid}`);
        }

        for (const item of cart.products) {
            const pid = item.productId.toString();
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
}

export default CartDao;