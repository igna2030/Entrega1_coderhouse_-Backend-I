import { Router } from 'express';
import ProductDao from '../Dao/ProductDao.js'; 
import product from '../Dao/models/ProductModel.js';

const productsRouter = Router();
const productDao = new ProductDao();

productsRouter.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        
        const result = await productDao.getProducts({ limit, page, sort, query }); 

        const params = { limit, sort, query };
        let baseUrl = '/api/products';
        
        const queryParams = Object.keys(params)
            .filter(key => params[key]) 
            .map(key => `${key}=${params[key]}`)
            .join('&');

        if (queryParams) {
            baseUrl += `?${queryParams}`;
        }
        
        const prevLink = result.hasPrevPage 
            ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${result.prevPage}` 
            : null;
        
        const nextLink = result.hasNextPage 
            ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${result.nextPage}` 
            : null;


        const response = {
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink, 
            nextLink,
        };
        
        res.status(200).json(response);
    } catch (error) {
    res.status(500).json({status:"error",message:"Error inseperado al obtener productos: "+error.message}) 
    }
});
productsRouter.get("/:pid", async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productDao.getProductByID(productId);
        
        if (!product) {
            return res.status(404).json({ status: "error", message: `Producto con ID ${productId} no encontrado.` });
        }
        res.status(200).json({ status: "success", payload: product });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ status: "error", message: "Formato de ID de producto inválido." });
        }
        res.status(500).json({ status: "error", message: "Error inesperado al buscar producto: " + error.message });
    }
});

productsRouter.post("/", async (req, res) => {
    try {
        const productData = req.body;

        if (!productData.title || !productData.price || !productData.code) {
             return res.status(400).json({ status: "error", message: "Faltan campos requeridos (title, price, code, etc.)." });
        }

        const nuevo_producto = await productDao.createProduct(productData);
        
        
        res.status(201).json({ status: "success", message: "Producto agregado exitosamente", payload: nuevo_producto });
    }
    catch (error) {
        if (error.code === 11000) { 
             return res.status(409).json({ status: "error", message: "Ya existe un producto con este código." });
        }
        res.status(500).json({ status: "error", message: "Error al añadir el producto: " + error.message });
    }
});

productsRouter.put("/:pid", async (req, res) => {
    try {
        const productId = req.params.pid;
        const updateData = req.body;
        
        const updatedProduct = await productDao.updateProduct(productId, updateData);

        if (!updatedProduct) {
             return res.status(404).json({ status: "error", message: `Producto con ID ${productId} no encontrado para actualizar.` });
        }
        
        
        res.status(200).json({
            status: "success",
            message: `Se actualizó el producto con el id ${productId} exitosamente`,
            payload: updatedProduct,
        });
    } catch (error) {
        if (error.name === 'CastError') {
             return res.status(400).json({ status: "error", message: "Formato de ID de producto o datos de actualización inválidos." });
        }
        if (error.code === 11000) {
             return res.status(409).json({ status: "error", message: "El código de producto ya existe." });
        }
        res.status(500).json({ status: "error", message: "Error inesperado al actualizar el producto: " + error.message });
    }
});

productsRouter.delete("/:pid", async (req, res) => {
    try {
        const productId = req.params.pid;
        
        const deletedProduct = await productDao.deleteProduct(productId); 

        if (!deletedProduct) {
             return res.status(404).json({ status: "error", message: `Producto con ID ${productId} no encontrado para eliminar.` });
        }
        
        
        res.status(200).json({ status: "success", message: `Se eliminó el producto con el ID ${productId}` });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ status: "error", message: "Formato de ID de producto inválido." });
        }
        res.status(500).json({ status: "error", message: "Error inesperado al eliminar el producto: " + error.message });
    }
});

export default productsRouter;

