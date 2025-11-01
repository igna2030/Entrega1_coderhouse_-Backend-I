import { Router } from 'express';
import CartDao from '../Dao/CartDao.js';
const cartsRouter = Router();
const cartDao = new CartDao();

cartsRouter.post('/', async (req, res) => {
    try {
        const newCart = await cartDao.createCart();
        res.status(201).json({ status: 'success', message: 'Carrito creado exitosamente', payload: newCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al crear el carrito: ' + error.message });
    }
});

cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartDao.getCartById(cartId); 
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        if (error.message.includes('No existe un carrito')) {
            return res.status(404).json({ status: 'error', message: error.message });
        }
        if (error.name === 'CastError') {
             return res.status(400).json({ status: "error", message: "Formato de ID de carrito inválido." });
        }
        res.status(500).json({ status: 'error', message: 'Error al obtener el carrito: ' + error.message });
    }
});

cartsRouter.get('/',async (req,res)=>{
    try {
        const carts = await cartDao.getAllCarts();
        res.status(200).json({ status: 'success', payload: carts});
        
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
        console.log('✅ ROUTER: Inició la eliminación para Carrito:', cid, 'y Producto:', pid); // <--- NUEVO LOG
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


cartsRouter.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || typeof quantity !== 'number' || quantity < 1) {
             return res.status(400).json({ status: 'error', message: 'Se requiere una cantidad (quantity) numérica y positiva.' });
        }
        
        const updatedCart = await cartDao.updateProductQuantity(cid, pid, quantity);
        res.status(200).json({ status: 'success', message: 'Cantidad de producto actualizada exitosamente', payload: updatedCart });
    } catch (error) {
        if (error.message.includes('No existe un carrito') || error.message.includes('Producto con id')) {
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
        const updatedCart = await cartDao.clearCart(cartId); // Call the new DAO method
        
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
export default cartsRouter;
