import { Router } from 'express';
import ProductDao from '../dao/ProductDao.js';
import CartDao from '../dao/CartDao.js';

const viewsRouter = Router();
const productDao = new ProductDao();
const cartDao = new CartDao();

viewsRouter.get("/products", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        
        const { 
            docs: products, 
            totalPages, 
            prevPage, 
            nextPage, 
            hasPrevPage, 
            hasNextPage, 
            page: currentPage 
        } = await productDao.getProducts({ limit, page, sort, query });
        
        const baseUrl = `/products?limit=${limit}&sort=${sort || ''}&query=${query || ''}`;

        const prevLink = hasPrevPage ? `${baseUrl}&page=${prevPage}` : null;
        const nextLink = hasNextPage ? `${baseUrl}&page=${nextPage}` : null;

        res.render("products", {
            products: products,
            totalPages,
            prevPage,
            nextPage,
            currentPage,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
            currentLimit: limit,
            currentSort: sort,
            currentQuery: query,
        });
    } catch (error) {
        console.error("Error al obtener productos para la vista:", error);
        res.status(500).render("error", { message: "Error al cargar la vista de productos." });
    }
});

viewsRouter.get("/products/:pid", async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productDao.getProductByID(productId); 

        if (!product) {
            return res.status(404).render("error", { message: `Producto con ID ${productId} no encontrado.` });
        }

        res.render("productDetail", { product });
    } catch (error) {
        console.error("Error al obtener detalle del producto:", error);
        res.status(500).render("error", { message: "Error al cargar el detalle del producto." });
    }
});

viewsRouter.get("/carts/:cid", async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartDao.getCartById(cartId);
        
        res.render("cart", {
            cart: cart,
            products: cart.products,
            isNotLogin: true 
        });
    } catch (error) {
        console.error("Error al obtener el carrito para la vista:", error);
        res.status(404).render("error", { message: `Carrito con ID ${req.params.cid} no encontrado.` });
    }
});


viewsRouter.get('/', (req, res) => {
    res.redirect('/products');
});

viewsRouter.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts", { title: "Productos en Tiempo Real" });
});

export default viewsRouter;
