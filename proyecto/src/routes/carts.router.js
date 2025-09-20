import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import CartManager from '../managers/CartManager.js';


const cartsRouter = Router();
const cartManager = new CartManager('src/json/carts.json');
const productManager = new ProductManager('src/json/productos.json');

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
        res.status(500).json({ error: "Error inesperado." });
    }
});

cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid, 10);
        const cart = await cartManager.getCartById(cartId);
        res.status(200).json(cart.products);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


cartsRouter.post('/:cid/productos/:pid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid, 10);
        const productId = parseInt(req.params.pid, 10);
        
        try {
            await productManager.getProductById(productId);
        } catch (productError) {
            return res.status(404).json({ error: `Producto no encontrado: ${productError.message}` });
        }

        const updatedCart = await cartManager.addProductToCart(cartId, productId);
        res.status(200).json({ message: 'Producto agregado al carrito exitosamente', cart: updatedCart });
    } catch (error) {
        if (error.message.includes('No existe un carrito')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al agregar el producto al carrito.' });
    }
});


 export default cartsRouter;