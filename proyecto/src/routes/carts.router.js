import { Router } from 'express';
import CartManager from '../managers/CartManager.js';
const cartsRouter = Router();
const cartManager = new CartManager('src/json/carts.json'); 



cartsRouter.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.addCart();
        res.status(201).json({ message: 'Carrito creado exitosamente', cart: newCart });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito.' });
    }
});


cartsRouter.get("/", async (req, res) => {
    try {
        let carts = await cartManager.getCarts();
        res.status(200).json({ carts });
    } catch (error) {
        res.status(500).json({ error: "Error inesperado al listar carritos." });
    }
});

cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid, 10);
        if (isNaN(cartId)) {
            return res.status(400).json({ error: 'ID de carrito inválido.' });
        }
        
        const cart = await cartManager.getCartById(cartId);
        res.status(200).json(cart.products);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


cartsRouter.post('/:cid/productos/:pid', async (req, res) => {
    try {
        const productManager = req.productManager; 
        
        const cartId = parseInt(req.params.cid, 10);
        const productId = parseInt(req.params.pid, 10);
        
        if (isNaN(cartId) || isNaN(productId)) {
            return res.status(400).json({ error: 'IDs de carrito o producto inválidos.' });
        }
        
        try {
            await productManager.getProductById(productId);
        } catch (productError) {
            return res.status(404).json({ error: `Producto no encontrado: ${productError.message}` });
        }

        const updatedCart = await cartManager.addProductToCart(cartId, productId);
        res.status(200).json({ message: 'Producto agregado al carrito exitosamente', cart: updatedCart });
    } catch (error) {
        console.error("Error al agregar producto al carrito:", error.message);
        if (error.message.includes('No existe un carrito')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al agregar el producto al carrito.' });
    }
});


export default cartsRouter;
