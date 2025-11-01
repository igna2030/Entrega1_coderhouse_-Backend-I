import CartDao from '../Dao/CartDao.js';
import { Router } from 'express';
const cartsRouter = Router();
const cartDao = new CartDao();


cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartDao.getCartById(cartId);
        res.status(200).json({ status: 'success', payload: cart })

    } catch (error) {
        if (error.message.includes('No existe un carrito')) {
            return res.status(404).json({ status: 'error', message: error.message });
        }
        return res.status(400).json({ status: "error", message: "Formato de ID de carrito inválido." });

    }
})
cartsRouter.post('/', async (req, res) => {
    try {
        const newCart = await cartDao.createCart();
        res.status(201).json({ status: 'success', message: 'Carrito creado exitosamente', payload: newCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al crear el carrito: ' + error.message });
    }
});


cartsRouter.put('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productsArray = req.body.products;

        if (!Array.isArray(productsArray)) {
            return res.status(400).json({ status: 'error', message: 'El cuerpo de la solicitud debe ser un arreglo de productos bajo la llave "products".' });
        }

        const updatedCart = await cartDao.updateCartProducts(cartId, productsArray);
        res.status(200).json({ status: 'success', message: 'Carrito actualizado exitosamente', payload: updatedCart });
    } catch (error) {
        if (error.message.includes('No existe un carrito')) {
            return res.status(404).json({ status: 'error', message: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ status: "error", message: "Formato de ID de carrito o producto en el array inválido." });
        }
        res.status(500).json({ status: 'error', message: 'Error al actualizar el carrito: ' + error.message });
    }
});

cartsRouter.get('/', async (req, res) => {
    try {
        const carts = await cartDao.getAllCarts();
        res.status(200).json({ status: 'success', payload: carts });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener los carritos: ' + error.message });

    }
})

cartsRouter.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const updatedCart = await cartDao.addProductToCart(cid, pid);
        res.status(200).json({ status: 'success', message: 'Producto agregado al carrito exitosamente', payload: updatedCart });
    } catch (error) {
        if (error.message.includes('No existe un carrito') || error.message.includes('Producto con id')) {
            return res.status(404).json({ status: 'error', message: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ status: "error", message: "Formato de ID de carrito o producto inválido." });
        }
        res.status(500).json({ status: 'error', message: 'Error al agregar el producto al carrito: ' + error.message });
    }
});

cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        console.log('✅ ROUTER: Inició la eliminación para Carrito:', cid, 'y Producto:', pid); 
        const updatedCart = await cartDao.removeProductFromCart(cid, pid);
        res.status(200).json({ status: 'success', message: 'Producto eliminado del carrito exitosamente', payload: updatedCart });
    } catch (error) {
        if (error.message.includes('No existe un carrito')) {
            return res.status(404).json({ status: 'error', message: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ status: "error", message: "Formato de ID de carrito o producto inválido." });
        }
        res.status(500).json({ status: 'error', message: 'Error al eliminar producto del carrito: ' + error.message });
    }
});

cartsRouter.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const targetQuantity = Number(req.body.quantity); 

        if (Number.isNaN(targetQuantity) || targetQuantity < 0) {
            return res.status(400).json({ status: 'error', message: 'Se requiere una cantidad numérica positiva en el body (quantity).' });
        }

        if (targetQuantity === 0) {
            const updatedCart = await cartDao.removeProductFromCart(cid, pid);
            return res.status(200).json({ status: 'success', message: 'Cantidad establecida en 0. Producto eliminado del carrito.', payload: updatedCart });
        }

        const updatedCart = await cartDao.updateProductQuantity(cid, pid, targetQuantity);
        
        res.status(200).json({ status: 'success', message: `Cantidad de producto actualizada a ${targetQuantity} exitosamente.`, payload: updatedCart });
    
    } catch (error) {
        if (error.message && error.message.includes('Fallo al ajustar el stock')) { 
             return res.status(400).json({ status: 'error', message: error.message });
        }
        if (error.message && (error.message.includes('No existe un carrito') || error.message.includes('Producto con id'))) {
            return res.status(404).json({ status: 'error', message: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ status: "error", message: "Formato de ID de carrito o producto inválido." });
        }
        res.status(500).json({ status: 'error', message: 'Error al actualizar la cantidad: ' + error.message });
    }
});

cartsRouter.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const updatedCart = await cartDao.clearCart(cartId);

        res.status(200).json({
            status: 'success',
            message: 'Carrito vaciado exitosamente',
            payload: updatedCart
        });
    } catch (error) {
        if (error.message.includes('No existe un carrito')) {
            return res.status(404).json({ status: 'error', message: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ status: "error", message: "Formato de ID de carrito inválido." });
        }
        res.status(500).json({ status: 'error', message: 'Error al vaciar el carrito: ' + error.message });
    }
});

cartsRouter.get('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
                const cart = await cartDao.getCartById(cid); 
        
        const productEntry = cart.products.find(item => {
            const prodId = item.productId ? item.productId._id : item._id; 
            return String(prodId) === String(pid);
        });

        if (!productEntry) {
            return res.status(404).json({ 
                status: 'error', 
                message: `Producto con ID ${pid} no encontrado en el carrito ${cid}.` 
            });
        }
        
        res.status(200).json({ 
            status: 'success', 
            payload: productEntry,
            message: `Detalles del producto ${pid} en el carrito ${cid}.`
        });

    } catch (error) {
        if (error.message.includes('No existe un carrito')) {
            return res.status(404).json({ status: 'error', message: error.message });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ status: "error", message: "Formato de ID de carrito o producto inválido." });
        }
        res.status(500).json({ status: 'error', message: 'Error al obtener el detalle del producto en el carrito: ' + error.message });
    }
});
export default cartsRouter;
