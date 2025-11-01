import { Router } from 'express';
import ProductDao from '../Dao/ProductDao.js';
import CartDao from '../Dao/CartDao.js';

const viewsRouter = Router();
const productDao = new ProductDao();
const cartDao = new CartDao();

viewsRouter.get("/products", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const options = { limit, page, query };

        if (sort === 'asc' || sort === 'desc') {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        const {
            docs: products,
            totalPages,
            prevPage,
            nextPage,
            hasPrevPage,
            hasNextPage,
            page: currentPage
        } = await productDao.getProducts({ limit, page, sort, query });


        const params = { limit, sort, query };
        let baseUrl = '/products';

        const queryParams = Object.keys(params)
            .filter(key => params[key])
            .map(key => `${key}=${params[key]}`)
            .join('&');

        if (queryParams) {
            baseUrl += `?${queryParams}`;
        }

        const prevLink = hasPrevPage
            ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${prevPage}`
            : null;
        const nextLink = hasNextPage
            ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${nextPage}`
            : null;

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
            currentSort: sort
        });
    } catch (error) {
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
        res.status(500).render("error", { message: `Error interno al cargar la lista de carritos.` });
    }
});
viewsRouter.get("/carts", async (req, res) => {
    try {
        const carts = await cartDao.getAllCarts();

        res.render("all_carts", {
            carts: carts,
            isNotLogin: true
        });
    } catch (error) {
        console.error("Error al obtener los carritos para la vista:", error);
        res.status(404).render("error", { message: `Carros no encontrados.` });
    }
});

viewsRouter.get("/home", (req, res) => {
    res.render("home", { title: "Página Principal" });
});

viewsRouter.post("/home/create-cart", async (req, res) => {
    try {
        const newCart = await cartDao.createCart();

        res.redirect(`/carts/${newCart._id}`);

    } catch (error) {
        console.error("Error al crear carrito desde Home:", error);
        res.status(500).render("error", { message: "No se pudo crear el carrito." });
    }
});


viewsRouter.get('/', (req, res) => {
    res.redirect('/home');
});



export default viewsRouter;
